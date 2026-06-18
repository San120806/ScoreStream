import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext.jsx';

const ACTIONS = [
  {
    id: 'crash-cache',
    icon: '🗄️',
    title: 'Crash Redis Cache',
    desc: 'Simulates Redis pod crash. Cache miss rate spikes. Requests fall back to primary DB.',
    btnClass: 'btn-danger',
    btnLabel: 'Crash Cache',
    node: 'redis',
    status: 'crashed',
    recovery: '↻ Cache failover to replica in ~3s. Hot-standby promoted.',
    recoveryColor: 'var(--accent-green)',
  },
  {
    id: 'crash-ws',
    icon: '🔌',
    title: 'Crash WebSocket Server',
    desc: 'Kills one WS node. Clients automatically reconnect to remaining cluster nodes.',
    btnClass: 'btn-danger',
    btnLabel: 'Crash WS Node',
    node: 'wsCluster',
    status: 'crashed',
    recovery: '↻ Sticky-session routing redistributes 6,140 connections in ~2s.',
    recoveryColor: 'var(--accent-green)',
  },
  {
    id: 'delay-stream',
    icon: '⏱️',
    title: 'Delay Event Stream',
    desc: 'Injects 3-second delay into the Kafka consumer, simulating network congestion.',
    btnClass: 'btn-warning',
    btnLabel: 'Delay Stream',
    node: 'kafka',
    status: 'degraded',
    recovery: '↻ Consumer lag detected. Auto-scaling adds 2 consumer replicas.',
    recoveryColor: 'var(--accent-gold)',
  },
  {
    id: 'crash-gateway',
    icon: '🔀',
    title: 'Crash API Gateway',
    desc: 'Simulates API Gateway overload. Circuit breaker opens and rejects excess requests.',
    btnClass: 'btn-danger',
    btnLabel: 'Crash Gateway',
    node: 'apiGateway',
    status: 'crashed',
    recovery: '↻ Circuit breaker half-opens after 5s. Traffic shifts to backup region.',
    recoveryColor: 'var(--accent-green)',
  },
];

export default function FaultTolerance() {
  const { state, setNodeStatus, recoverAll, setDelay } = useApp();
  const [log, setLog] = useState([]);
  const [recovering, setRecovering] = useState(false);

  const triggerFault = (action) => {
    setNodeStatus(action.node, action.status);
    if (action.id === 'delay-stream') setDelay(true);

    const entry = {
      id: Date.now(),
      time: new Date().toLocaleTimeString('en-IN', { hour12: false }),
      icon: action.icon,
      title: action.title,
      status: action.status,
      recovery: action.recovery,
      recoveryColor: action.recoveryColor,
      node: action.node,
    };
    setLog(l => [entry, ...l].slice(0, 20));
  };

  const handleRecoverAll = () => {
    setRecovering(true);
    recoverAll();
    setDelay(false);
    setLog(l => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString('en-IN', { hour12: false }),
        icon: '✅',
        title: 'All Services Recovered',
        status: 'healthy',
        recovery: 'Full system health restored. All nodes operational.',
        recoveryColor: 'var(--accent-green)',
        node: 'all',
      },
      ...l,
    ]);
    setTimeout(() => setRecovering(false), 1000);
  };

  const anyFault = Object.values(state.nodeStatuses).some(s => s !== 'healthy');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header">
        <h1>Fault Tolerance Simulator</h1>
        <p>Inject failures into the distributed system and observe automatic recovery mechanisms</p>
      </div>

      {/* System health overview */}
      <div className="card" style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>System Health</div>
          <div style={{ fontWeight: 800, fontSize: 24, color: anyFault ? 'var(--accent-red)' : 'var(--accent-green)' }}>
            {anyFault ? '⚠ DEGRADED' : '✓ ALL HEALTHY'}
          </div>
        </div>
        {Object.entries(state.nodeStatuses).map(([key, status]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className={`status-dot ${status}`} />
            <span style={{ fontSize: 12, color: status === 'healthy' ? 'var(--text-secondary)' : status === 'crashed' ? 'var(--accent-red)' : 'var(--accent-gold)', fontWeight: status !== 'healthy' ? 700 : 400 }}>
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </span>
          </div>
        ))}
        <div style={{ marginLeft: 'auto' }}>
          <motion.button
            id="btn-recover-all"
            className="btn btn-success"
            onClick={handleRecoverAll}
            disabled={!anyFault}
            whileTap={{ scale: 0.96 }}
            animate={anyFault ? { boxShadow: ['0 0 10px rgba(0,255,136,0.3)', '0 0 25px rgba(0,255,136,0.5)', '0 0 10px rgba(0,255,136,0.3)'] } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            {recovering ? '⟳ Recovering…' : '✓ Recover All Services'}
          </motion.button>
        </div>
      </div>

      {/* Fault buttons */}
      <div className="fault-grid">
        {ACTIONS.map(action => {
          const nodeStatus = state.nodeStatuses[action.node];
          const isActive = nodeStatus && nodeStatus !== 'healthy';
          return (
            <motion.div
              key={action.id}
              className="fault-btn-card card"
              style={{ borderColor: isActive ? (action.status === 'crashed' ? 'rgba(255,68,68,0.3)' : 'rgba(255,215,0,0.3)') : 'var(--border)' }}
              whileHover={{ scale: 1.02 }}
              animate={isActive ? { boxShadow: action.status === 'crashed' ? 'var(--glow-red)' : 'var(--glow-gold)' } : { boxShadow: 'none' }}
            >
              <div className="fault-btn-card-icon">{action.icon}</div>
              <h3 className="fault-btn-card-title">{action.title}</h3>
              <p className="fault-btn-card-desc" style={{ marginBottom: 16 }}>{action.desc}</p>
              {isActive && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ fontSize: 12, color: action.recoveryColor, marginBottom: 12, fontWeight: 600 }}
                >
                  {action.recovery}
                </motion.div>
              )}
              <button
                id={`btn-${action.id}`}
                className={`btn ${isActive ? 'btn-ghost' : action.btnClass}`}
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => triggerFault(action)}
                disabled={isActive}
              >
                {isActive ? `● ${action.status.toUpperCase()}` : action.btnLabel}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Event log */}
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Fault & Recovery Log</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <AnimatePresence>
            {log.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🛡️</div>
                <div>No faults triggered yet. System is healthy.</div>
              </div>
            )}
            {log.map(entry => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  display: 'flex', gap: 12, padding: '12px 14px',
                  background: 'var(--bg-elevated)', borderRadius: 8,
                  borderLeft: `3px solid ${entry.status === 'healthy' ? 'var(--accent-green)' : entry.status === 'crashed' ? 'var(--accent-red)' : 'var(--accent-gold)'}`,
                }}
              >
                <span style={{ fontSize: 18 }}>{entry.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{entry.title}</div>
                  <div style={{ fontSize: 12, color: entry.recoveryColor, marginTop: 2 }}>{entry.recovery}</div>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{entry.time}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
