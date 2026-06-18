import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext.jsx';

export default function MatchCard({ match }) {
  const { state, selectMatch } = useApp();
  const selected = state.selectedMatchId === match.id;
  const latestEvent = state.events.find(e => e.matchId === match.id);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`match-card ${selected ? 'selected' : ''}`}
      onClick={() => selectMatch(match.id)}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Header */}
      <div className="match-card-header">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
            {match.matchType} · {match.series?.split(' ').slice(0, 4).join(' ')}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>📍 {match.venue?.split(',')[0]}</span>
        </div>
        {match.status === 'live' && <span className="badge badge-live">LIVE</span>}
        {match.status === 'scheduled' && <span className="badge badge-muted">SOON</span>}
      </div>

      {/* Teams */}
      <div className="match-teams">
        {match.teams.map((team, i) => (
          <div key={i} className="team-row">
            <span className="team-flag">{team.flag}</span>
            <span className="team-name">{team.name}</span>
            {team.score && (
              <span className={`team-score ${team.batting ? 'batting' : ''}`}>
                {team.score}
              </span>
            )}
            {team.overs && (
              <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 6 }}>({team.overs})</span>
            )}
          </div>
        ))}
      </div>

      {/* Recent balls */}
      {match.recentBalls?.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginTop: 14, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginRight: 4 }}>This over:</span>
          {match.recentBalls.map((ball, i) => (
            <span key={i} style={{
              width: 24, height: 24, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700,
              background: ball === 'W' ? 'var(--accent-red-dim)' : ball === '6' ? 'var(--accent-gold-dim)' : ball === '4' ? 'var(--accent-blue-dim)' : 'var(--bg-elevated)',
              color: ball === 'W' ? 'var(--accent-red)' : ball === '6' ? 'var(--accent-gold)' : ball === '4' ? 'var(--accent-blue)' : 'var(--text-secondary)',
              border: '1px solid var(--border)',
            }}>
              {ball}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="match-card-footer">
        <div className="match-rr">
          CRR: <strong>{match.runRate?.toFixed(2)}</strong>
          {match.reqRate && <span style={{ marginLeft: 10 }}>RRR: <strong style={{ color: 'var(--accent-red)' }}>{match.reqRate?.toFixed(2)}</strong></span>}
        </div>
        <div className="match-status-text">{match.statusText}</div>
      </div>

      {/* Live update indicator */}
      {latestEvent && (
        <motion.div
          key={latestEvent.id}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'absolute', top: 12, right: 12,
            fontSize: 10, color: 'var(--accent)', fontWeight: 700,
            fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 1s infinite' }} />
          {latestEvent.eventType}
        </motion.div>
      )}
    </motion.div>
  );
}
