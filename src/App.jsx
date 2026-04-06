import React, { useState, useEffect } from 'react';
import { transformArtists, computeRosterStats } from './utils/transformArtists';
import MetricCard from './components/MetricCard';
import ArtistCard from './components/ArtistCard';
import ArtistDetail from './components/ArtistDetail';
import { ListenersChart, GenreDonut, AlbumStreamsChart } from './components/RosterCharts';
import './App.css';
import ChatBot from './components/ChatBot';

const AwardsBadge = ({ award, artist }) => {
  const won = award.status === 'won' || award.status === 'honored';
  return (
    <div style={{
      display: 'flex', gap: '12px', padding: '11px 0',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
      alignItems: 'flex-start',
    }}>
      <div style={{ fontSize: '18px', flexShrink: 0 }}>{won ? '🏆' : '🎯'}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '12px', color: '#fff' }}>{award.title}</div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>
          {award.event} · {award.year} ·{' '}
          <span style={{ color: won ? '#F5A623' : 'rgba(255,255,255,0.35)' }}>{award.status}</span>
        </div>
      </div>
      <div style={{
        width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
        background: `${artist.color}22`, border: `1px solid ${artist.color}44`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '9px', color: artist.color, fontWeight: '600',
      }}>{artist.initials}</div>
    </div>
  );
};

const TourEvent = ({ event, artist }) => (
  <div style={{
    display: 'flex', gap: '10px', padding: '10px 0',
    borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'flex-start',
  }}>
    <div style={{
      background: `${artist.color}18`, border: `1px solid ${artist.color}33`,
      borderRadius: '8px', padding: '6px 10px', textAlign: 'center', flexShrink: 0, minWidth: '52px',
    }}>
      <div style={{ fontSize: '9px', color: `${artist.color}99` }}>
        {new Date(event.date).toLocaleDateString('en', { month: 'short' }).toUpperCase()}
      </div>
      <div style={{ fontSize: '15px', fontWeight: '500', color: artist.color, lineHeight: 1 }}>
        {new Date(event.date).getDate()}
      </div>
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '12px', color: '#fff' }}>{event.venue}</div>
      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '1px' }}>
        {event.city}, {event.country}
      </div>
    </div>
    <div style={{ width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0, background: `${artist.color}22`, border: `1px solid ${artist.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', color: artist.color }}>{artist.initials}</div>
  </div>
);

const API_URL = 'https://4b079ceeb5d6e253856dc427359af2.06.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/6b820f1b9c824635beb4270044939e5a/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=3it6psxJy6zB3IgLauPsi8Nwp2tcKCku73VYAOkQgjs';

function fmtNum(n) {
  if (!n) return '—';
  if (n >= 1e12) return (n / 1e12).toFixed(1).replace(/\.0$/, '') + 'T';
  if (n >= 1e9)  return (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
  if (n >= 1e6)  return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1e3)  return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

function App() {
  const [artists, setArtists]           = useState([]);
  const [rosterStats, setRosterStats]   = useState({});
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [activeSection, setActiveSection]   = useState('roster');
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const scrollContainerRef = React.useRef(null);

  useEffect(() => {
    fetch(API_URL, { method: 'GET', headers: { 'Content-Type': 'application/json' } })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        const rawItems   = Array.isArray(data) ? data : (data.value || []);
        const transformed = transformArtists(rawItems);
        const sorted = [...transformed].sort((a, b) => {
          if (a.rank == null && b.rank == null) return 0;
          if (a.rank == null) return 1;
          if (b.rank == null) return -1;
          return a.rank - b.rank;
        });
        setArtists(sorted);
        setRosterStats(computeRosterStats(transformed));
        setSelectedArtist(transformed[0] || null);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth / 3; // scroll by ~1 card width
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      window.addEventListener('resize', checkScrollButtons);
      return () => {
        container.removeEventListener('scroll', checkScrollButtons);
        window.removeEventListener('resize', checkScrollButtons);
      };
    }
  }, [artists]);

  const filteredArtists = artists.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const allAwards = artists.flatMap(a => a.awards.map(aw => ({ ...aw, artist: a }))).slice(0, 8);
  const allTours = artists
    .flatMap(a => a.tours.filter(t => t.status === 'announced').map(t => ({ ...t, artist: a })))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 8);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f0f19', color: 'rgba(255,255,255,0.5)', flexDirection: 'column', gap: '16px' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#4F8EF7', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <div style={{ fontSize: '13px' }}>Loading artist data…</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f0f19', color: '#E85D8A', flexDirection: 'column', gap: '10px' }}>
      <div style={{ fontSize: '16px' }}>Failed to load data</div>
      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{error}</div>
    </div>
  );

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ padding: '28px 20px 20px' }}>
          <div style={{ fontSize: '20px', color: '#fff', fontFamily: "'DM Serif Display', serif", lineHeight: 1.2 }}>
            Artist 360° intelligence
          </div>
        </div>

        <nav style={{ padding: '0 12px', marginBottom: '20px' }}>
          {[{ id: 'roster', label: '⊞  Roster Overview' }, { id: 'artist', label: '◎  Artist Detail' }].map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
              display: 'block', width: '100%', textAlign: 'left',
              background: activeSection === s.id ? 'rgba(255,255,255,0.07)' : 'none',
              border: 'none', cursor: 'pointer', padding: '10px 12px', borderRadius: '8px',
              fontSize: '12px', color: activeSection === s.id ? '#fff' : 'rgba(255,255,255,0.45)',
              marginBottom: '2px', transition: 'all 0.15s',
            }}>{s.label}</button>
          ))}
        </nav>

        <div style={{ padding: '0 12px', marginBottom: '8px' }}>
          <div style={{ padding: '0 12px', marginBottom: '10px' }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }}>🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search artists…"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px', padding: '7px 10px 7px 30px',
                  fontSize: '11px', color: '#fff', outline: 'none',
                }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', marginBottom: '8px' }}>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.92)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Artists
            </div>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>{filteredArtists.length} / {artists.length}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {filteredArtists.length === 0 && <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', padding: '8px 12px' }}>No artists found</div>}
            {filteredArtists.map(a => (
              <button key={a.id} onClick={() => { setSelectedArtist(a); setActiveSection('artist'); }} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                background: selectedArtist?.id === a.id && activeSection === 'artist' ? `${a.color}18` : 'none',
                border: `1px solid ${selectedArtist?.id === a.id && activeSection === 'artist' ? a.color + '44' : 'transparent'}`,
                borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', width: '100%', textAlign: 'left',
                transition: 'all 0.15s',
              }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                  background: `${a.color}33`, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '10px', fontWeight: '600', color: a.color,
                }}>{a.initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '12px', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {a.name}
                  </div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>{a.country}</div>
                </div>
                {a.rank && (
                  <div style={{
                    fontSize: '9px', fontWeight: '700', minWidth: '22px', height: '18px',
                    borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `${a.color}20`, color: a.color, border: `1px solid ${a.color}44`,
                    flexShrink: 0,
                  }}>#{a.rank}</div>
                )}
              </button>
            ))}
          </div>
        </div>

      </aside>

      {/* Main */}
      <main className="main">
        {activeSection === 'roster' && (
          <div>
            <div className="page-header">
              <div>
                 <h1>Artists 360° intelligence Overview</h1>
                <p>The Artists 360° Intelligence Overview dashboard highlights {rosterStats.totalArtists} active artists with key metrics like monthly listeners, YouTube views, awards, and tours. It compares artist performance, showcases genre distribution, and tracks streaming milestones. Overall, it provides a clear, data-driven view of audience reach, popularity trends, and music industry impact.</p>
              </div>
              <div style={{
                fontSize: '11px', padding: '5px 14px', borderRadius: '20px',
                background: '#2EC4A015', color: '#2EC4A0', border: '1px solid #2EC4A033',
              }}>
                {rosterStats.totalArtists} Artists · Live data
              </div>
            </div>

            {/* KPIs */}
            <div className="metrics-grid" style={{ marginBottom: '28px' }}>
              <MetricCard label="Total artists" value={String(rosterStats.totalArtists || 0)} sub="All active" />
              <MetricCard label="Monthly listeners" value={fmtNum(rosterStats.totalMonthlyListeners)} sub="Spotify aggregate" />
              <MetricCard label="YouTube views" value={fmtNum(rosterStats.totalYoutubeViews)} sub="Combined total" />
              <MetricCard label="Awards won" value={String(rosterStats.totalAwardsWon || 0)} sub="Grammy & Latin Grammy" />
              <MetricCard label="Active tours" value={String(rosterStats.activeTours || 0)} sub="Announced events" />
              <MetricCard label="Last updated" value={rosterStats.scrapedAt || '—'} sub="Data refresh time" />
            </div>

            {/* Artist cards */}
            <div style={{ position: 'relative', marginBottom: '28px' }}>
              <button
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                style={{
                  position: 'absolute',
                  left: '-12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 10,
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: 'none',
                  background: canScrollLeft ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                  color: canScrollLeft ? '#fff' : 'rgba(255,255,255,0.2)',
                  cursor: canScrollLeft ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  transition: 'all 0.2s',
                  backdropFilter: 'blur(8px)',
                  boxShadow: canScrollLeft ? '0 4px 12px rgba(0,0,0,0.3)' : 'none',
                }}
              >
                ‹
              </button>
              
              <div 
                ref={scrollContainerRef}
                style={{ 
                  display: 'flex',
                  gap: '12px',
                  overflowX: 'auto',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  paddingBottom: '4px',
                }}
                onScroll={checkScrollButtons}
              >
                <style>{`
                  div::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
                {filteredArtists.map(a => (
                  <div key={a.id} style={{ flex: '1 0 auto', minWidth: 'calc(33.333% - 8px)' }}>
                    <ArtistCard artist={a} isSelected={false}
                      onClick={() => { setSelectedArtist(a); setActiveSection('artist'); }} />
                  </div>
                ))}
              </div>

              <button
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                style={{
                  position: 'absolute',
                  right: '-12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 10,
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: 'none',
                  background: canScrollRight ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                  color: canScrollRight ? '#fff' : 'rgba(255,255,255,0.2)',
                  cursor: canScrollRight ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  transition: 'all 0.2s',
                  backdropFilter: 'blur(8px)',
                  boxShadow: canScrollRight ? '0 4px 12px rgba(0,0,0,0.3)' : 'none',
                }}
              >
                ›
              </button>
            </div>

            {/* Charts */}
            <div className="grid-2" style={{ marginBottom: '20px' }}>
              <div className="card">
                <div className="card-label">Monthly listeners comparison</div>
                <ListenersChart artists={artists} />
              </div>
              <div className="card">
                <div className="card-label">Genre distribution — Artists</div>
                <GenreDonut artists={artists} />
              </div>
            </div>

            <div className="card" style={{ marginBottom: '20px' }}>
              <div className="card-label">Top album streaming milestones (Spotify billions)</div>
              <AlbumStreamsChart artists={artists} />
            </div>

            {/* Awards + Tours */}
            <div className="grid-2">
              <div className="card">
                <div className="card-label">Awards & recognition</div>
                {allAwards.map((aw, i) => (
                  <AwardsBadge key={i} award={aw} artist={aw.artist} />
                ))}
              </div>
              <div className="card">
                <div className="card-label">Upcoming tour events</div>
                {allTours.length === 0 && <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', padding: '20px 0' }}>No upcoming events</div>}
                {allTours.map((t, i) => <TourEvent key={i} event={t} artist={t.artist} />)}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'artist' && selectedArtist && (
          <div>
            <div className="page-header">
              <div>
                <h1>Artist 360° Intelligence Detail</h1>
                <p>Deep-dive intelligence for {selectedArtist.name}</p>
              </div>
            </div>

            <ArtistDetail artist={selectedArtist} />
          </div>
        )}
        <ChatBot />
        <footer style={{
          marginTop: '40px',
          paddingTop: '24px',
          paddingBottom: '24px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          textAlign: 'center',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
              info@chromadata.com
            </div>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.25)' }}>
              © 2026 - Chromadata. All rights reserved.
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;
