// ── Event color map ────────────────────────────────────────
// Central reference for all event type visual identities.
// Imported by EventPill, Events page, and any component
// that needs to style per-event-type UI.

export const EVENT_COLORS = {
  SIX:       { color: 'var(--accent-gold)',    bg: 'var(--accent-gold-dim)',    border: 'rgba(255,215,0,0.3)',   icon: '💥', label: 'Six!'      },
  FOUR:      { color: 'var(--accent-blue)',    bg: 'var(--accent-blue-dim)',    border: 'rgba(59,130,246,0.3)', icon: '🎯', label: 'Four!'     },
  WICKET:    { color: 'var(--accent-red)',     bg: 'var(--accent-red-dim)',     border: 'rgba(255,68,68,0.3)',  icon: '🏏', label: 'Wicket!'   },
  WIDE:      { color: 'var(--accent-orange)',  bg: 'rgba(255,140,0,0.12)',      border: 'rgba(255,140,0,0.3)', icon: '➡️', label: 'Wide'      },
  NO_BALL:   { color: 'var(--accent-purple)',  bg: 'var(--accent-purple-dim)',  border: 'rgba(168,85,247,0.3)',icon: '⚠️', label: 'No Ball'   },
  MILESTONE: { color: 'var(--accent-green)',   bg: 'var(--accent-green-dim)',   border: 'rgba(0,255,136,0.3)', icon: '🏆', label: 'Milestone' },
  DOT:       { color: 'var(--text-muted)',     bg: 'var(--bg-elevated)',        border: 'var(--border)',        icon: '⚫', label: 'Dot Ball'  },
  RUN:       { color: 'var(--accent)',         bg: 'var(--accent-dim)',         border: 'rgba(0,212,255,0.2)', icon: '🏃', label: 'Run'       },
};

/**
 * Get colour config for an event type.
 * Falls back to RUN styling for unknown types.
 */
export function getEventColor(eventType) {
  return EVENT_COLORS[eventType] || EVENT_COLORS.RUN;
}
