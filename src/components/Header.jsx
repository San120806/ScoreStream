import React from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import ModeToggle from './ModeToggle.jsx';

const PAGE_TITLES = {
  '/':              { title: 'Live Match Dashboard', subtitle: 'Real-time cricket scores and match details' },
  '/events':        { title: 'Event Timeline',       subtitle: 'Ball-by-ball event stream with live animations' },
  '/analytics':     { title: 'Match Analytics',      subtitle: 'Worm graph, run rate, and score progression' },
  '/notifications': { title: 'Notification Center',  subtitle: 'Wickets, milestones, and match alerts' },
  '/architecture':  { title: 'System Architecture',  subtitle: 'Distributed pipeline visualization — Kafka → Redis → WebSocket' },
  '/metrics':       { title: 'System Metrics',       subtitle: 'Latency, throughput, connections, and queue depth' },
  '/cqrs':          { title: 'CQRS View',            subtitle: 'Command/Query separation — write vs read sides' },
  '/fault':         { title: 'Fault Tolerance',      subtitle: 'Simulate failures and observe system recovery' },
};

export default function Header() {
  const location = useLocation();
  const { state } = useApp();
  const page = PAGE_TITLES[location.pathname] || { title: 'ScoreStream', subtitle: '' };
  const now = new Date().toLocaleTimeString('en-IN', { hour12: false });

  return (
    <header className="header">
      <div>
        <div className="header-title">{page.title}</div>
        <div className="header-meta">{page.subtitle}</div>
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div className="header-meta" style={{ fontFamily: 'var(--font-mono)' }}>
          🕐 {now}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {state.metrics.eventsProcessed.toLocaleString()} events
          </span>
        </div>
        <ModeToggle />
      </div>
    </header>
  );
}
