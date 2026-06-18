import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext.jsx';

const TYPE_CFG = {
  WICKET:    { icon: '🏏', color: 'var(--accent-red)',    border: 'rgba(255,68,68,0.2)', label: 'Wicket' },
  SIX:       { icon: '💥', color: 'var(--accent-gold)',   border: 'rgba(255,215,0,0.2)', label: 'Six' },
  MILESTONE: { icon: '🏆', color: 'var(--accent-green)',  border: 'rgba(0,255,136,0.2)', label: 'Milestone' },
  FOUR:      { icon: '🎯', color: 'var(--accent-blue)',   border: 'rgba(59,130,246,0.2)', label: 'Boundary' },
  RESULT:    { icon: '🏁', color: 'var(--accent-purple)', border: 'rgba(168,85,247,0.2)', label: 'Result' },
};

const getTypeCfg = (type) => TYPE_CFG[type] || TYPE_CFG.WICKET;

export default function Notifications() {
  const { state, markRead, clearNotifs } = useApp();
  const unreadCount = state.notifications.filter(n => !n.read).length;

  // Group by type for stats
  const typeCounts = state.notifications.reduce((acc, n) => {
    acc[n.type] = (acc[n.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1>Notification Center</h1>
          <p style={{ marginTop: 4 }}>{unreadCount} unread · {state.notifications.length} total</p>
        </div>
        {state.notifications.length > 0 && (
          <button className="btn btn-ghost" onClick={clearNotifs}>🗑 Clear All</button>
        )}
      </div>

      {/* Type stats */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {Object.entries(TYPE_CFG).map(([type, cfg]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'var(--bg-card)', borderRadius: 10, border: `1px solid ${cfg.border}` }}>
            <span style={{ fontSize: 18 }}>{cfg.icon}</span>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 18, color: cfg.color }}>{typeCounts[type] || 0}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{cfg.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Notification list */}
      <div className="notif-log">
        <AnimatePresence initial={false}>
          {state.notifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔔</div>
              <div style={{ fontWeight: 600, fontSize: 16 }}>All caught up!</div>
              <div style={{ fontSize: 13, marginTop: 8 }}>Notifications will appear here for wickets, sixes, milestones, and more.</div>
            </motion.div>
          ) : (
            state.notifications.map((notif, i) => {
              const cfg = getTypeCfg(notif.type);
              const time = new Date(notif.timestamp).toLocaleTimeString('en-IN', { hour12: false });
              return (
                <motion.div
                  key={notif.id}
                  className={`notif-entry ${!notif.read ? 'unread' : ''}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => markRead(notif.id)}
                  style={{ cursor: 'pointer', borderLeftColor: !notif.read ? cfg.color : 'var(--border)' }}
                >
                  <div className="notif-entry-icon">{cfg.icon}</div>
                  <div className="notif-entry-body">
                    <div className="notif-entry-title" style={{ color: !notif.read ? cfg.color : 'var(--text-primary)' }}>
                      {notif.title}
                      {!notif.read && (
                        <span style={{ marginLeft: 8, width: 7, height: 7, borderRadius: '50%', background: cfg.color, display: 'inline-block', verticalAlign: 'middle' }} />
                      )}
                    </div>
                    <div className="notif-entry-desc">{notif.desc}</div>
                  </div>
                  <div className="notif-entry-time">{time}</div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
