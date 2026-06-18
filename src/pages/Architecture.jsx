import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext.jsx';

const NODES = [
  { id: 'provider',   label: 'Official Data Provider', icon: '📡', desc: 'Cricbuzz / CricAPI live feed', key: null },
  { id: 'gateway',    label: 'API Gateway',             icon: '🔀', desc: 'Rate limiting, auth, routing', key: 'apiGateway' },
  { id: 'kafka',      label: 'Kafka Topic',             icon: '📨', desc: 'scorestream.events — 12 partitions', key: 'kafka' },
  { id: 'processor',  label: 'Match Processor',         icon: '⚙️', desc: 'Business logic, scoring engine', key: 'matchProcessor' },
  { id: 'redis',      label: 'Redis Cache',             icon: '🗄️', desc: 'Hot score cache — 94.7% hit rate', key: 'redis' },
  { id: 'ws',         label: 'WebSocket Cluster',       icon: '🔌', desc: '3 nodes · 18,420 connections', key: 'wsCluster' },
  { id: 'users',      label: 'Connected Users',         icon: '👥', desc: '18,420+ live consumers', key: null },
];

// Unique colours per node
const NODE_COLORS = ['#00d4ff','#a855f7','#ff8c00','#00ff88','#3b82f6','#ffd700','#00d4ff'];

export default function Architecture() {
  const { state } = useApp();
  const [packets, setPackets] = useState([]);
  const lastEventId = useRef(null);

  // Spawn a packet animation whenever a new event arrives
  useEffect(() => {
    if (state.events.length === 0) return;
    const latest = state.events[0];
    if (latest.id === lastEventId.current) return;
    lastEventId.current = latest.id;

    const id = Date.now();
    setPackets(p => [...p, { id, eventType: latest.eventType }]);
    // Remove after animation (7 × 0.6s ≈ 4.2s + buffer)
    setTimeout(() => setPackets(p => p.filter(pk => pk.id !== id)), 5000);
  }, [state.events]);

  const getNodeStatus = (key) => {
    if (!key) return 'healthy';
    return state.nodeStatuses[key] || 'healthy';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header">
        <h1>System Architecture</h1>
        <p>Distributed event pipeline — watch packets flow through each layer in real time</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
        {/* Pipeline */}
        <div className="card" style={{ padding: '32px' }}>
          <div className="arch-container">
            {NODES.map((node, i) => {
              const status = getNodeStatus(node.key);
              return (
                <React.Fragment key={node.id}>
                  <motion.div
                    className={`arch-node ${status !== 'healthy' ? status : ''}`}
                    animate={status === 'healthy' ? {} : { borderColor: status === 'crashed' ? 'var(--accent-red)' : 'var(--accent-gold)' }}
                    whileHover={{ scale: 1.03 }}
                    style={{ position: 'relative' }}
                  >
                    <span className="arch-node-icon">{node.icon}</span>
                    <div className="arch-node-info">
                      <div className="arch-node-name">{node.label}</div>
                      <div className="arch-node-desc">{node.desc}</div>
                    </div>
                    <span className={`status-dot ${status}`} style={{ marginLeft: 'auto' }} />

                    {/* Packet arriving at this node */}
                    <AnimatePresence>
                      {packets.map(pk => (
                        <motion.div
                          key={`${pk.id}-${node.id}`}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{
                            opacity: [0, 1, 1, 0],
                            scale: [0.5, 1, 1, 0.5],
                          }}
                          transition={{
                            delay: i * 0.6,
                            duration: 0.5,
                          }}
                          style={{
                            position: 'absolute',
                            top: '50%', right: -8,
                            transform: 'translateY(-50%)',
                            width: 16, height: 16,
                            borderRadius: '50%',
                            background: NODE_COLORS[i],
                            boxShadow: `0 0 12px ${NODE_COLORS[i]}`,
                            zIndex: 10,
                          }}
                        />
                      ))}
                    </AnimatePresence>
                  </motion.div>

                  {i < NODES.length - 1 && (
                    <div
                      className={`arch-connector ${packets.length > 0 ? 'active' : ''}`}
                      style={{ position: 'relative' }}
                    >
                      <AnimatePresence>
                        {packets.map(pk => (
                          <motion.div
                            key={`line-${pk.id}-${i}`}
                            initial={{ top: 0, opacity: 0 }}
                            animate={{ top: '100%', opacity: [0, 1, 1, 0] }}
                            transition={{ delay: i * 0.6 + 0.25, duration: 0.35 }}
                            style={{
                              position: 'absolute',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              width: 8, height: 8,
                              borderRadius: '50%',
                              background: NODE_COLORS[i],
                              boxShadow: `0 0 8px ${NODE_COLORS[i]}`,
                            }}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Side panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Event count */}
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Events Flowing</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 40, color: 'var(--accent)' }}>
              {state.metrics.eventsProcessed.toLocaleString()}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>total since session start</div>
          </div>

          {/* Node health */}
          <div className="card">
            <div className="section-label">Node Health</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {NODES.filter(n => n.key).map(node => {
                const status = getNodeStatus(node.key);
                return (
                  <div key={node.key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'var(--bg-elevated)', borderRadius: 8 }}>
                    <span style={{ fontSize: 16 }}>{node.icon}</span>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{node.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className={`status-dot ${status}`} />
                      <span style={{ fontSize: 11, color: status === 'healthy' ? 'var(--accent-green)' : status === 'crashed' ? 'var(--accent-red)' : 'var(--accent-gold)', fontWeight: 600, textTransform: 'uppercase' }}>
                        {status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Architecture legend */}
          <div className="card">
            <div className="section-label">Legend</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
              {[
                { color: 'var(--accent-green)', label: 'Healthy — operating normally' },
                { color: 'var(--accent-gold)',  label: 'Degraded — reduced capacity' },
                { color: 'var(--accent-red)',   label: 'Crashed — service unavailable' },
              ].map(({ color, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)', flexShrink: 0 }} />
                <span style={{ color: 'var(--text-secondary)' }}>Event packet travelling through pipeline</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
