import React, { useState, useRef, useEffect, useCallback } from "react";

const BOT_SRC =
  "https://copilotstudio.microsoft.com/environments/4b079cee-b5d6-e253-856d-c427359af206/bots/cr917_agentT1zDET/webchat?__version__=2";

// How long to wait for the iframe to finish loading before showing an error
const LOAD_TIMEOUT_MS = 20000;

const getDefaultChatPosition = () => {
  if (typeof window === "undefined") return { x: 24, y: 24 };
  const margin = 24;
  const containerWidth = Math.min(400, window.innerWidth - margin * 2);
  const containerHeight = Math.min(650, window.innerHeight - 140);
  return {
    x: Math.max(margin, window.innerWidth - containerWidth - margin),
    y: Math.max(margin, window.innerHeight - containerHeight - margin),
  };
};

export default function ChatBot() {
  // status: 'idle' | 'loading' | 'ready' | 'error'
  const [status, setStatus] = useState("idle");
  const [iframeKey, setIframeKey] = useState(0);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(getDefaultChatPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef(null);
  const timerRef = useRef(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const startBotLoad = useCallback(() => {
    setStatus("loading");
    clearTimer();
    timerRef.current = setTimeout(() => {
      setStatus("error");
    }, LOAD_TIMEOUT_MS);
  }, []);

  const initBot = useCallback(() => {
    clearTimer();
    startBotLoad();
  }, [startBotLoad]);

  const handleIframeLoad = useCallback(() => {
    clearTimer();
    setStatus("ready");
  }, []);

  const handleRetry = useCallback(() => {
    setIframeKey((k) => k + 1);
  }, []);

  // Start / restart bot when chat opens or iframeKey changes (retry)
  useEffect(() => {
    if (open) {
      initBot();
    }
    return () => {
      clearTimer();
    };
  }, [open, iframeKey, initBot]);

  // Reset position when chat closes
  useEffect(() => {
    if (!open) {
      setStatus("idle");
      setPosition(getDefaultChatPosition());
    }
  }, [open]);

  // ── Drag handlers ──────────────────────────────────────────────────────────

  const handleMouseDown = useCallback(
    (e) => {
      if (!open) return;
      setIsDragging(true);
      const rect = containerRef.current.getBoundingClientRect();
      setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      e.preventDefault();
    },
    [open],
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging || !open) return;
      const maxX = window.innerWidth - (containerRef.current?.offsetWidth || 450);
      const maxY = window.innerHeight - (containerRef.current?.offsetHeight || 520);
      setPosition({
        x: Math.max(0, Math.min(e.clientX - dragStart.x, maxX)),
        y: Math.max(0, Math.min(e.clientY - dragStart.y, maxY)),
      });
    },
    [isDragging, open, dragStart],
  );

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 480px)");
    const update = () => setIsMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "none";
      document.body.style.cursor = "grabbing";
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // ── Derived booleans for JSX ───────────────────────────────────────────────
  const isLoading = status === "loading";
  const isError = status === "error";
  const showIframe = status === "loading" || status === "ready";

  return (
    <div className="chatbot-root">
      {!open && (
        <button
          className="chatbot-toggle"
          aria-label="Open Artist Bot"
          onClick={() => setOpen(true)}
          title="Chat with our AI assistant"
        >
          <span className="chatbot-icon">🤖</span>
        </button>
      )}

      {open && (
        <div
          ref={containerRef}
          className={`chatbot-container ${isDragging ? "dragging" : ""} ${isMobile ? "chatbot-mobile" : ""}`}
          style={{
            position: "fixed",
            ...(isMobile
              ? { left: "16px", right: "16px", top: "80px", bottom: "16px" }
              : { left: `${position.x}px`, top: `${position.y}px` }),
            cursor: isDragging ? "grabbing" : "grab",
            zIndex: 1000,
          }}
        >
          <div
            className="chatbot-header"
            onMouseDown={handleMouseDown}
            style={{ cursor: isDragging ? "grabbing" : "grab" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="chatbot-icon header">🤖</div>
              <div className="chatbot-header-text">AI Artist Assistant</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="chatbot-circle-btn"
                onClick={handleRetry}
                aria-label="Reload chat"
                title="Reload chat"
              >
                ↺
              </button>
              <button
                className="chatbot-circle-close"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                title="Close chat"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="chatbot-window">
            <div className="chatbot-iframe-container">

              {isLoading && (
                <div className="chatbot-loading">
                  <div className="chatbot-loading-spinner" />
                  <div className="chatbot-loading-text">Loading AI Assistant...</div>
                </div>
              )}

              {isError && (
                <div className="chatbot-error">
                  <div className="chatbot-error-icon">⚠️</div>
                  <div className="chatbot-error-text">
                    Unable to connect to the AI Assistant. The service may be
                    temporarily unavailable or the session has expired.
                  </div>
                  <button className="chatbot-retry-btn" onClick={handleRetry}>
                    Try Again
                  </button>
                </div>
              )}

              {showIframe && (
                <iframe
                  key={iframeKey}
                  className="chatbot-iframe"
                  src={BOT_SRC}
                  frameBorder="0"
                  style={{
                    opacity: status === "ready" ? 1 : 0,
                    transition: "opacity 0.3s ease",
                    width: "100%",
                  }}
                  title="AI Artist Assistant"
                  onLoad={handleIframeLoad}
                  allow="microphone; camera"
                />
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
