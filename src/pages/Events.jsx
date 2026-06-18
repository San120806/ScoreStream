import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext.jsx';
import EventPill from '../components/EventPill.jsx';
import { EVENT_TYPES } from '../utils/mockData.js';

const ALL_TYPES = Object.keys(EVENT_TYPES);

export default function Events() {
  const { state } = useApp();
  const [filter, setFilter] = useState([]);
  const [matchFilter, setMatchFilter] = useState('ALL');

  const matchIds = ['ALL', ...new Set(state.events.map(e => e.matchId).filter(Boolean))];

  const filtered = state.events.filter(e => {
    if (filter.length > 0 && !filter.includes(e.eventType)) return false;
    if (matchFilter !== 'ALL' && e.matchId !== matchFilter) return false;
    return true;
  });

  const toggleFilter = (type) =>
    setFilter(f => f.includes(type) ? f.filter(t => t !== type) : [...f, type]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="page-header">
        <h1>Event Timeline</h1>
        <p>Live ball-by-ball event stream — {state.events.length} events received</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Filter:</span>
        {ALL_TYPES.map(type => {
          const cfg = EVENT_TYPES[type];
          const active = filter.includes(type);
          return (
            <button
              key={type}
              id={`filter-${type.toLowerCase()}`}
              className={`chip ${active ? 'active' : ''}`}
              onClick={() => toggleFilter(type)}
              style={active ? { borderColor: cfg.color, color: cfg.color, background: cfg.bg } : {}}
            >
              {cfg.icon} {cfg.label}
            </button>
          );
        })}
        {filter.length > 0 && (
          <button className="chip" onClick={() => setFilter([])} style={{ color: 'var(--accent-red)' }}>
            ✕ Clear
          </button>
        )}
      </div>

      {/* Match filter */}
      <div style={{ display: 'flex', gap: 8 }}>
        {matchIds.map(id => (
          <button
            key={id}
            className={`chip ${matchFilter === id ? 'active' : ''}`}
            onClick={() => setMatchFilter(id)}
          >
            {id}
          </button>
        ))}
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {['SIX', 'FOUR', 'WICKET', 'WIDE'].map(type => {
          const cfg = EVENT_TYPES[type];
          const count = state.events.filter(e => e.eventType === type).length;
          return (
            <div key={type} className="card" style={{ padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 24 }}>{cfg.icon}</span>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 22, color: cfg.color }}>{count}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{cfg.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Event list */}
      <div className="event-timeline">
        <AnimatePresence initial={false}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⚡</div>
              <div style={{ fontWeight: 600 }}>Waiting for events…</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Events will appear here in real time</div>
            </div>
          ) : (
            filtered.map((event, i) => (
              <EventPill key={event.id} event={event} index={i} />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
