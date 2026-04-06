import React, { useState } from 'react';
import { artists, rosterStats } from './data/artistData';
import MetricCard from './components/MetricCard';
import ArtistCard from './components/ArtistCard';
import ArtistDetail from './components/ArtistDetail';
import { ListenersChart, GenreDonut, AlbumStreamsChart } from './components/RosterCharts';
import './App.css';

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

function App() {
  const [selectedArtist, setSelectedArtist] = useState(artists[0]);
  const [activeSection, setActiveSection] = useState('roster');

  const allAwards = artists.flatMap(a => a.awards.map(aw => ({ ...aw, artist: a }))).slice(0, 8);
  const allTours = artists
    .flatMap(a => a.tours.filter(t => t.status === 'announced').map(t => ({ ...t, artist: a })))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 8);

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ padding: '28px 20px 20px' }}>
          <div style={{ fontSize: '20px', color: '#fff', fontFamily: "'DM Serif Display', serif", lineHeight: 1.2 }}>
            Artist Report
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
          <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.92)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 12px', marginBottom: '8px' }}>
            Artists
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {artists.map(a => (
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
                <div>
                  <div style={{ fontSize: '12px', color: '#fff' }}>{a.name}</div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>{a.country}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 'auto', padding: '20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)' }}>
            Source: {rosterStats.dataSource}
          </div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.15)', marginTop: '2px' }}>
            Scraped: {rosterStats.scrapedAt}
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        {activeSection === 'roster' && (
          <div>
            <div className="page-header">
              <div>
                <h1>Artists Overview</h1>
                <p>Aggregated intelligence across {rosterStats.totalArtists} tracked artists</p>
              </div>
              <div style={{
                fontSize: '11px', padding: '5px 14px', borderRadius: '20px',
                background: '#2EC4A015', color: '#2EC4A0', border: '1px solid #2EC4A033',
              }}>
                {rosterStats.totalArtists} artists · Live data
              </div>
            </div>

            {/* KPIs */}
            <div className="metrics-grid" style={{ marginBottom: '28px' }}>
              <MetricCard label="Total artists" value="4" sub="All active" />
              <MetricCard label="Combined streams" value="85B+" sub="Spotify catalog" />
              <MetricCard label="Monthly listeners" value="207M" sub="Spotify aggregate" />
              <MetricCard label="YouTube views" value="64B+" sub="Combined total" />
              <MetricCard label="Awards won" value="7+" sub="Grammy & Latin Grammy" />
              <MetricCard label="Active tours" value="4" sub="2025–2026" />
            </div>

            {/* Artist cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '28px' }}>
              {artists.map(a => (
                <ArtistCard key={a.id} artist={a} isSelected={false}
                  onClick={() => { setSelectedArtist(a); setActiveSection('artist'); }} />
              ))}
            </div>

            {/* Charts */}
            <div className="grid-2" style={{ marginBottom: '20px' }}>
              <div className="card">
                <div className="card-label">Monthly listeners comparison</div>
                <ListenersChart artists={artists} />
              </div>
              <div className="card">
                <div className="card-label">Genre distribution — roster</div>
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
                <h1>Artist Detail</h1>
                <p>Deep-dive intelligence for {selectedArtist.name}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginBottom: '24px' }}>
              {artists.map(a => (
                <ArtistCard key={a.id} artist={a} isSelected={selectedArtist.id === a.id}
                  onClick={() => setSelectedArtist(a)} />
              ))}
            </div>

            <ArtistDetail artist={selectedArtist} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
