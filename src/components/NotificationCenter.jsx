import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../context/AppContext.jsx';

const TYPE_ICONS = {
  WICKET:    { icon: '🏏', color: 'var(--accent-red)', border: 'rgba(255,68,68,0.3)' },
  SIX:       { icon: '💥', color: 'var(--accent-gold)', border: 'rgba(255,215,0,0.3)' },
  MILESTONE: { icon: '🏆', color: 'var(--accent-green)', border: 'rgba(0,255,136,0.3)' },
  FOUR:      { icon: '🎯', color: 'var(--accent-blue)', border: 'rgba(59,130,246,0.3)' },
  RESULT:    { icon: '🏁', color: 'var(--accent-purple)', border: 'rgba(168,85,247,0.3)' },
};

export default function NotificationCenter() {
  const { state, markRead } = useApp();
  const unread = state.notifications.filter(n => !n.read).slice(0, 5);

  return (
    <div className="toast-stack">
      <AnimatePresence>
        {unread.map((notif) => {
          const cfg = TYPE_ICONS[notif.type] || TYPE_ICONS.WICKET;
          return (
            <motion.div
              key={notif.id}
              className="toast"
              style={{ borderColor: cfg.border }}
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={() => markRead(notif.id)}
              layout
            >
              <span className="toast-icon">{cfg.icon}</span>
              <div className="toast-body">
                <div className="toast-title" style={{ color: cfg.color }}>{notif.title}</div>
                <div className="toast-desc">{notif.desc}</div>
              </div>
              <span className="toast-close">✕</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
