import React from 'react';
import { motion } from 'framer-motion';
import { EVENT_TYPES } from '../utils/mockData.js';

export default function EventPill({ event, index = 0 }) {
  const cfg = EVENT_TYPES[event.eventType] || EVENT_TYPES.RUN;
  const time = new Date(event.timestamp).toLocaleTimeString('en-IN', { hour12: false });

  return (
    <motion.div
      className="event-pill"
      initial={{ opacity: 0, x: -20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      style={{ borderLeftColor: cfg.color, borderLeftWidth: 3 }}
      layout
    >
      <div
        className="event-pill-icon"
        style={{ background: cfg.bg, border: `1px solid ${cfg.color}33` }}
      >
        {cfg.icon}
      </div>

      <div className="event-pill-body">
        <div className="event-pill-type" style={{ color: cfg.color }}>{cfg.label}</div>
        <div className="event-pill-desc">
          {event.player || cfg.desc}
          {event.matchId && (
            <span style={{ color: 'var(--text-muted)', marginLeft: 6 }}>· {event.matchId}</span>
          )}
        </div>
      </div>

      <div className="event-pill-meta">
        <div className="event-pill-score">{event.score}</div>
        <div className="event-pill-over">Over {event.over}</div>
        <div className="event-pill-time">{time}</div>
      </div>
    </motion.div>
  );
}
