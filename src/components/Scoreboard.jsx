import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext.jsx';

export default function Scoreboard({ matchId }) {
  const { state } = useApp();
  const match = state.matches.find(m => m.id === matchId) || state.matches[0];
  if (!match) return null;

  const { batsmen = [], bowler } = match;

  return (
    <motion.div
      className="scoreboard"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      {/* Match header */}
      <div className="scoreboard-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginBottom: 8 }}>
              {match.matchType} · {match.series}
            </div>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              {match.teams.map((team, i) => (
                <div key={i} style={{ textAlign: i === 1 ? 'right' : 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 22 }}>{team.flag}</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 20 }}>{team.shortName}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 22, color: team.batting ? 'var(--accent-gold)' : 'var(--text-secondary)' }}>
                        {team.score || '—'}
                      </div>
                      {team.overs && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{team.overs} overs</div>}
                    </div>
                  </div>
                </div>
              ))}
              <div style={{ flex: 1, textAlign: 'center', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)', padding: '0 20px' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>CURRENT RUN RATE</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 24, color: 'var(--accent-green)' }}>{match.runRate?.toFixed(2)}</div>
                {match.reqRate && (
                  <>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, marginBottom: 4 }}>REQ. RUN RATE</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 18, color: 'var(--accent-red)' }}>{match.reqRate?.toFixed(2)}</div>
                  </>
                )}
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="badge badge-live" style={{ marginBottom: 8 }}>LIVE</span>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 180, marginTop: 8 }}>{match.statusText}</div>
          </div>
        </div>
      </div>

      {/* Batting */}
      <div className="scoreboard-body">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Batsmen */}
          <div>
            <div className="section-label">⚔️ At the Crease</div>
            <table className="batting-table">
              <thead>
                <tr>
                  <th>Batsman</th>
                  <th style={{ textAlign: 'right' }}>R</th>
                  <th style={{ textAlign: 'right' }}>B</th>
                  <th style={{ textAlign: 'right' }}>4s</th>
                  <th style={{ textAlign: 'right' }}>6s</th>
                  <th style={{ textAlign: 'right' }}>SR</th>
                </tr>
              </thead>
              <tbody>
                {batsmen.length > 0 ? batsmen.map((b, i) => (
                  <tr key={i} className="batting-now">
                    <td>
                      <div style={{ fontWeight: 600 }}>{b.name}</div>
                      {i === 0 && <span style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 700 }}>★ STRIKER</span>}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 16, color: 'var(--accent-gold)' }}>{b.runs}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{b.balls}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--accent-blue)' }}>{b.fours}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--accent-gold)' }}>{b.sixes}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{b.sr}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} style={{ color: 'var(--text-muted)', padding: '16px 12px' }}>No batting data</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Bowler */}
          <div>
            <div className="section-label">🎳 Current Bowler</div>
            {bowler ? (
              <div className="card" style={{ padding: '16px', marginBottom: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>{bowler.name}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                  {[
                    { label: 'Overs', val: bowler.overs },
                    { label: 'Wickets', val: bowler.wickets, color: 'var(--accent-red)' },
                    { label: 'Runs', val: bowler.runs },
                    { label: 'Economy', val: bowler.economy, color: 'var(--accent-green)' },
                  ].map(({ label, val, color }) => (
                    <div key={label} style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 20, color: color || 'var(--text-primary)' }}>{val}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', padding: '16px 0' }}>No bowler data</div>
            )}

            {/* Recent balls */}
            {match.recentBalls?.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div className="section-label">🎱 This Over</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {match.recentBalls.map((ball, i) => (
                    <motion.span
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      style={{
                        width: 32, height: 32, borderRadius: '50%',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)',
                        background: ball === 'W' ? 'var(--accent-red-dim)' : ball === '6' ? 'var(--accent-gold-dim)' : ball === '4' ? 'var(--accent-blue-dim)' : 'var(--bg-elevated)',
                        color: ball === 'W' ? 'var(--accent-red)' : ball === '6' ? 'var(--accent-gold)' : ball === '4' ? 'var(--accent-blue)' : 'var(--text-secondary)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      {ball}
                    </motion.span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
