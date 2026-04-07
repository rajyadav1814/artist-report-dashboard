import React, { useState, useRef, useEffect } from 'react';
import { artists } from '../data/artistData';

function fmt(n) { return n ? n.toLocaleString() : 'N/A'; }

function getReply(text) {
  const lower = text.toLowerCase().trim();

  // ── Greetings ────────────────────────────────────────────────────────────
  if (/^(hi|hello|hey|sup|yo)\b/.test(lower))
    return 'Hey! Ask me anything about the artists — streams, tours, awards, bio, and more.';

  if (/\bhelp\b/.test(lower))
    return "Try asking:\n• 'Tell me about Bad Bunny'\n• 'Bad Bunny streams'\n• 'Rauw Alejandro tours'\n• 'Carlos Vives awards'\n• 'Becky G genre'\n• 'list artists'";

  if (/list artists/.test(lower) || lower === 'artists')
    return 'Roster: ' + artists.map(a => `${a.name} (${a.country})`).join(', ');

  // ── Match artist ─────────────────────────────────────────────────────────
  const artist = artists.find(a =>
    a.name.toLowerCase().split(' ').some(w => lower.includes(w)) ||
    (a.realName && a.realName.toLowerCase().split(' ').some(w => lower.includes(w)))
  );

  if (!artist) {
    // Global roster questions
    if (/tour|concert|show|upcoming/.test(lower)) {
      const events = artists
        .flatMap(a => a.tours.filter(t => t.status === 'announced').map(t => `${a.name}: ${t.date} — ${t.venue}, ${t.city}`))
        .slice(0, 6);
      return events.length ? 'Upcoming shows:\n' + events.join('\n') : 'No upcoming shows found.';
    }
    if (/award|grammy/.test(lower)) {
      const won = artists.flatMap(a => a.awards.filter(aw => aw.status === 'won' || aw.status === 'honored').map(aw => `${a.name}: ${aw.title} (${aw.event} ${aw.year})`));
      return won.length ? 'Awards won:\n' + won.join('\n') : 'No awards found.';
    }
    if (/stream/.test(lower)) {
      return artists.map(a => `${a.name}: ${a.albums[0]?.streams || 'N/A'} (latest album)`).join('\n');
    }
    return "I didn't recognise that artist. Type 'list artists' to see who I know, or 'help' for examples.";
  }

  // ── Artist-specific questions ─────────────────────────────────────────
  // Bio / general
  if (/bio|about|who is|tell me|overview/.test(lower))
    return `${artist.name} (${artist.realName}) is from ${artist.city}, ${artist.country}. Active since ${artist.activeFrom}. ${artist.bio}`;

  // Monthly listeners
  if (/listener|monthly/.test(lower))
    return `${artist.name} has ${fmt(artist.monthlyListeners)} monthly listeners on Spotify.`;

  // Streams / albums
  if (/stream|album/.test(lower)) {
    const lines = artist.albums.map(al => `• ${al.title} (${al.year}) — ${al.streams}`);
    return `${artist.name}'s albums:\n` + lines.join('\n');
  }

  // Top tracks / songs
  if (/track|song|hit/.test(lower)) {
    const lines = artist.topTracks.slice(0, 5).map(t => `• ${t.title} — ${fmt(t.streams)} streams`);
    return `${artist.name}'s top tracks:\n` + lines.join('\n');
  }

  // Tours / concerts
  if (/tour|concert|show|upcoming/.test(lower)) {
    const upcoming = artist.tours.filter(t => t.status === 'announced');
    if (!upcoming.length) return `No upcoming tour dates found for ${artist.name}.`;
    return `${artist.name}'s upcoming shows:\n` + upcoming.map(t => `• ${t.date} — ${t.venue}, ${t.city}, ${t.country}`).join('\n');
  }

  // Awards
  if (/award|grammy|honor|nominat/.test(lower)) {
    if (!artist.awards.length) return `No awards on record for ${artist.name}.`;
    return `${artist.name}'s awards:\n` + artist.awards.map(aw => `• ${aw.title} — ${aw.event} ${aw.year} (${aw.status})`).join('\n');
  }

  // Genre
  if (/genre|style|type of music|music style/.test(lower))
    return `${artist.name} genres: ${artist.genres.join(', ')}.`;

  // Label
  if (/label|record|signed/.test(lower))
    return `${artist.name} is on ${artist.label}.`;

  // Country / origin
  if (/country|from|origin|where/.test(lower))
    return `${artist.name} is from ${artist.city}, ${artist.country}.`;

  // Age
  if (/age|old|born/.test(lower))
    return `${artist.name} is ${artist.age} years old (active since ${artist.activeFrom}).`;

  // YouTube
  if (/youtube|views/.test(lower))
    return artist.youtubeViews ? `${artist.name} has ${fmt(artist.youtubeViews)} YouTube views.` : `YouTube data not available for ${artist.name}.`;

  // Collabs / associated acts
  if (/collab|feature|associ|worked with/.test(lower))
    return `${artist.name} has worked with: ${artist.associatedActs.join(', ')}.`;

  // News
  if (/news|recent|latest/.test(lower)) {
    if (!artist.recentNews?.length) return `No recent news for ${artist.name}.`;
    return `Recent news for ${artist.name}:\n` + artist.recentNews.slice(0, 3).map(n => `• ${n.headline} (${n.source}, ${n.date})`).join('\n');
  }

  // Trend / score
  if (/trend|score|rating|critical/.test(lower))
    return `${artist.name} — Critical score: ${artist.criticalScore}/100, trend: ${artist.trendDirection}.`;

  // Social posts
  if (/post|social|instagram|twitter|youtube post/.test(lower)) {
    if (!artist.socialPosts?.length) return `No recent social posts for ${artist.name}.`;
    return `${artist.name}'s recent posts:\n` + artist.socialPosts.slice(0, 3).map(p => `• ${p.platform} (${p.date}): ${p.summary}`).join('\n');
  }

  // Catch-all: overview
  const listeners = fmt(artist.monthlyListeners);
  const topAlbum = artist.albums[0] ? `${artist.albums[0].title} (${artist.albums[0].year}, ${artist.albums[0].streams})` : 'N/A';
  const awardsWon = artist.awards.filter(a => a.status === 'won' || a.status === 'honored').length;
  return `${artist.name} — ${artist.country}. ${listeners} monthly listeners. Latest album: ${topAlbum}. Awards won: ${awardsWon}. Ask about streams, tours, awards, genre, news, and more!`;
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { from: 'bot', text: "Hi — I'm the Artist Bot. Ask me about any artist" },
  ]);
  const messagesRef = useRef(null);

  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages, open]);

  function send(text) {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { from: 'user', text }]);
    setInput('');
    const reply = getReply(text);
    setTimeout(() => setMessages(prev => [...prev, { from: 'bot', text: reply }]), 350);
  }

  return (
    <div className="chatbot-root">
      {!open && (
        <button className="chatbot-toggle" aria-label="Open Artist Bot" onClick={() => setOpen(true)}>
          <span className="chatbot-icon">🤖</span>
        </button>
      )}

      {open && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="chatbot-icon header">🤖</div>
              <div style={{ fontWeight: 700 }}>Artist Bot</div>
            </div>
            <button className="chatbot-circle-close" onClick={() => setOpen(false)} aria-label="Close">✕</button>
          </div>

          <div className="chatbot-window">
            <div className="chatbot-messages" ref={messagesRef}>
              {messages.map((m, i) => (
                <div key={i} className={"chatbot-message " + (m.from === 'bot' ? 'bot' : 'user')}>
                  <div className="chatbot-text" style={{ whiteSpace: 'pre-line' }}>{m.text}</div>
                </div>
              ))}
            </div>
            <form className="chatbot-input" onSubmit={e => { e.preventDefault(); send(input); }}>
              <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about an artist..." />
              <button type="submit">Send</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
