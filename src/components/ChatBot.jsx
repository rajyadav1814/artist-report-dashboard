import React, { useState, useRef, useEffect, useCallback } from "react";

const getDefaultChatPosition = () => {
  if (typeof window === "undefined") {
    return { x: 24, y: 24 };
  }

  const margin = 24;
  const containerWidth = Math.min(400, window.innerWidth - margin * 2);
  const containerHeight = Math.min(650, window.innerHeight - 140);
  const x = Math.max(margin, window.innerWidth - containerWidth - margin);
  const y = Math.max(margin, window.innerHeight - containerHeight - margin);

  return { x, y };
};

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState(getDefaultChatPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef(null);

  const handleIframeLoad = () => {
    setLoading(false);
  };

  const handleMouseDown = useCallback(
    (e) => {
      if (!open) return;

      setIsDragging(true);
      const rect = containerRef.current.getBoundingClientRect();
      setDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      e.preventDefault();
    },
    [open],
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging || !open) return;

      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      // Constrain to viewport bounds
      const maxX =
        window.innerWidth - (containerRef.current?.offsetWidth || 450);
      const maxY =
        window.innerHeight - (containerRef.current?.offsetHeight || 520);

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    },
    [isDragging, open, dragStart],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Track mobile state for responsive behavior
  useEffect(() => {
    const query = window.matchMedia("(max-width: 480px)");
    const updateMobile = () => setIsMobile(query.matches);

    updateMobile();
    query.addEventListener("change", updateMobile);

    return () => {
      query.removeEventListener("change", updateMobile);
    };
  }, []);

  // Add global mouse event listeners when dragging
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

  // Reset position to bottom-right when chat closes
  useEffect(() => {
    if (!open) {
      setPosition(getDefaultChatPosition());
    }
  }, [open]);

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
              {loading && (
                <div className="chatbot-loading">
                  <div className="chatbot-loading-spinner"></div>
                  <div className="chatbot-loading-text">
                    Loading AI Assistant...
                  </div>
                </div>
              )}
              <iframe
                className="chatbot-iframe"
                src="https://copilotstudio.microsoft.com/environments/4b079cee-b5d6-e253-856d-c427359af206/bots/cr917_agentT1zDET/webchat?__version__=2"
                frameBorder="0"
                style={{
                  opacity: loading ? 0 : 1,
                  transition: "opacity 0.3s ease",
                  width: "100%",
                }}
                title="AI Artist Assistant"
                onLoad={handleIframeLoad}
                allow="microphone; camera"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
