import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext.jsx';
import { EVENT_TYPES } from '../utils/mockData.js';

// ── Small helpers ─────────────────────────────────────────
function StatusBadge({ connected, mode }) {
  if (mode === 'live') {
    return (
      <span className="badge badge-green" style={{ fontSize: 12 }}>
        🌐 Live API Mode
      </span>
    );
  }
  return connected ? (
    <motion.span
      className="badge badge-live"
      animate={{ opacity: [1, 0.6, 1] }}
      transition={{ repeat: Infinity, duration: 1.5 }}
      style={{ fontSize: 12 }}
    >
      🔌 Python Server Connected
    </motion.span>
  ) : (
    <span className="badge badge-muted" style={{ fontSize: 12 }}>
      ⚡ Simulation Mode (Mock)
    </span>
  );
}

function EventRow({ event, isNew }) {
  const cfg = EVENT_TYPES[event.eventType] || EVENT_TYPES.RUN;
  const time = new Date(event.timestamp).toLocaleTimeString('en-IN', { hour12: false });
  return (
    <motion.div
      initial={{ opacity: 0, x: -16, backgroundColor: 'rgba(0,212,255,0.12)' }}
      animate={{ opacity: 1, x: 0, backgroundColor: 'rgba(0,0,0,0)' }}
      transition={{ duration: 0.4 }}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 14px',
        background: 'var(--bg-elevated)',
        borderRadius: 8,
        borderLeft: `3px solid ${cfg.color}`,
      }}
    >
      <span style={{ fontSize: 20, flexShrink: 0 }}>{cfg.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontWeight: 700, color: cfg.color, fontSize: 13 }}>{cfg.label}</span>
        {event.player && (
          <span style={{ color: 'var(--text-muted)', fontSize: 12, marginLeft: 8 }}>{event.player}</span>
        )}
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 15, color: 'var(--accent-gold)', flexShrink: 0 }}>
        {event.score}
      </span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', flexShrink: 0, minWidth: 48, textAlign: 'right' }}>
        {event.over && `Ov ${event.over}`}
      </span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', flexShrink: 0, minWidth: 58, textAlign: 'right' }}>
        {time}
      </span>
    </motion.div>
  );
}

// ── Main Dashboard ────────────────────────────────────────
export default function Dashboard() {
  const { state } = useApp();
  const { wsConnected, mode, events, metrics } = state;

  // Per-match: get the latest event and score
  const matchIds = ['IND-AUS', 'ENG-PAK', 'SA-NZ'];
  const latestByMatch = {};
  matchIds.forEach(id => {
    latestByMatch[id] = events.find(e => e.matchId === id);
  });

  const recentEvents = events.slice(0, 30);
  const isSimMode = mode === 'simulation';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Connection banner ── */}
      <motion.div
        className="card"
        style={{
          padding: '16px 20px',
          borderColor: wsConnected ? 'rgba(0,255,136,0.3)' : 'var(--border)',
          display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
        }}
        animate={wsConnected ? { boxShadow: '0 0 20px rgba(0,255,136,0.15)' } : {}}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
            WebSocket Connection
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            ws://localhost:8000/live
          </div>
        </div>
        <StatusBadge connected={wsConnected} mode={mode} />
        <div style={{ display: 'flex', gap: 20 }}>
          {[
            { label: 'Events', val: metrics.eventsProcessed.toLocaleString(), color: 'var(--accent)' },
            { label: 'Connections', val: wsConnected ? '1' : '0', color: 'var(--accent-green)' },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 22, color }}>{val}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── How to run Python server (shown only when disconnected in sim mode) ── */}
      <AnimatePresence>
        {isSimMode && !wsConnected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card"
            style={{ borderColor: 'rgba(255,215,0,0.25)', padding: '16px 20px' }}
          >
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>⚡</span>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--accent-gold)', marginBottom: 8 }}>
                  Running in Simulation Mode — Python server not detected
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                  Events are being generated locally. To connect to the real Python WebSocket server:
                </div>
                <div style={{
                  background: 'var(--bg-primary)',
                  borderRadius: 8,
                  padding: '12px 16px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 13,
                  color: 'var(--accent-green)',
                  border: '1px solid var(--border)',
                  display: 'flex', flexDirection: 'column', gap: 6,
                }}>
                  <span style={{ color: 'var(--text-muted)' }}># Install dependency (once)</span>
                  <span>pip install websockets</span>
                  <span style={{ color: 'var(--text-muted)', marginTop: 4 }}># Run the server</span>
                  <span>cd /Users/saniyakapure/Desktop/ScoreStream</span>
                  <span>python server.py</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10 }}>
                  Then refresh the page. The frontend will auto-connect and show real server events.
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Live scores per match ── */}
      <div>
        <div className="section-label">Live Scores</div>
        <div className="match-grid">
          {state.matches.map(match => {
            const latest = latestByMatch[match.id];
            const cfg = latest ? (EVENT_TYPES[latest.eventType] || EVENT_TYPES.RUN) : null;
            return (
              <motion.div
                key={match.id}
                className="card"
                layout
                style={{ position: 'relative', overflow: 'hidden' }}
                animate={latest ? { borderColor: cfg.color + '55' } : {}}
              >
                {/* Top accent line */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${cfg?.color || 'var(--accent)'}, transparent)` }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                      {match.matchType} · {match.series?.split(' ').slice(0,3).join(' ')}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>📍 {match.venue?.split(',')[0]}</div>
                  </div>
                  <span className="badge badge-live">LIVE</span>
                </div>

                {/* Teams */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                  {match.teams.map((team, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 20 }}>{team.flag}</span>
                      <span style={{ fontWeight: 700, flex: 1 }}>{team.name}</span>
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 18,
                        color: team.batting ? 'var(--accent-gold)' : 'var(--text-muted)',
                      }}>
                        {/* Show Python server score if available for batting team */}
                        {team.batting && latest ? latest.score : (team.score || '—')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Latest event from Python server */}
                {latest ? (
                  <motion.div
                    key={latest.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 12px',
                      background: cfg.bg,
                      borderRadius: 8,
                      border: `1px solid ${cfg.color}33`,
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{cfg.icon}</span>
                    <span style={{ fontWeight: 700, color: cfg.color, fontSize: 13 }}>{cfg.label}</span>
                    {latest.over && (
                      <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
                        Over {latest.over}
                      </span>
                    )}
                  </motion.div>
                ) : (
                  <div style={{ padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                    Waiting for events…
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Live event stream ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, alignItems: 'start' }}>
        {/* Event feed */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <h3>Live Event Stream</h3>
            <span className="badge badge-accent">{events.length} events</span>
            {wsConnected && (
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-green)', marginLeft: 'auto' }}
              />
            )}
          </div>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 420, overflowY: 'auto' }}>
            <AnimatePresence initial={false}>
              {recentEvents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>📡</div>
                  <div style={{ fontWeight: 600 }}>Waiting for events from Python server…</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>Events will appear here as the server broadcasts them</div>
                </div>
              ) : (
                recentEvents.map((ev, i) => (
                  <EventRow key={ev.id} event={ev} isNew={i === 0} />
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right panel: stats + raw payload */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Event type breakdown */}
          <div className="card">
            <div className="section-label">Event Breakdown</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['SIX', 'FOUR', 'WICKET', 'WIDE', 'NO_BALL', 'RUN', 'DOT'].map(type => {
                const cfg = EVENT_TYPES[type];
                const count = events.filter(e => e.eventType === type).length;
                const pct = events.length > 0 ? (count / events.length) * 100 : 0;
                return (
                  <div key={type}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span>{cfg.icon} {cfg.label}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: cfg.color, fontWeight: 700 }}>{count}</span>
                    </div>
                    <div style={{ height: 4, background: 'var(--bg-elevated)', borderRadius: 2 }}>
                      <motion.div
                        style={{ height: '100%', background: cfg.color, borderRadius: 2 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Latest raw payload */}
          {recentEvents[0] && (
            <div className="card">
              <div className="section-label">Last Raw Payload</div>
              <pre style={{
                fontFamily: 'var(--font-mono)', fontSize: 11,
                color: 'var(--accent-green)',
                background: 'var(--bg-primary)',
                borderRadius: 8, padding: 12,
                overflow: 'auto', maxHeight: 200,
                border: '1px solid var(--border)',
                margin: 0,
              }}>
                {JSON.stringify({
                  matchId:   recentEvents[0].matchId,
                  eventType: recentEvents[0].eventType,
                  score:     recentEvents[0].score,
                  over:      recentEvents[0].over,
                  timestamp: recentEvents[0].timestamp,
                }, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
