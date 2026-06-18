import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext.jsx';

const COMMAND_TEMPLATES = [
  (ev) => ({ type: 'command', op: 'WRITE_SCORE', body: `UPDATE scores SET score="${ev.score}" WHERE matchId="${ev.matchId}"` }),
  (ev) => ({ type: 'command', op: 'INSERT_EVENT', body: `INSERT INTO events (matchId, type, over) VALUES ("${ev.matchId}", "${ev.eventType}", "${ev.over}")` }),
  (ev) => ({ type: 'command', op: 'PUBLISH_KAFKA', body: `kafka.produce("scorestream.events", key="${ev.matchId}", val={type:"${ev.eventType}"})` }),
  (ev) => ({ type: 'command', op: 'INVALIDATE_CACHE', body: `redis.del("score:${ev.matchId}")` }),
];

const QUERY_TEMPLATES = [
  (ev) => ({ type: 'query', op: 'GET_SCORE',  body: `GET /score/${ev.matchId}  →  Redis HIT [2ms]` }),
  (ev) => ({ type: 'query', op: 'GET_EVENTS', body: `GET /events/${ev.matchId}?limit=50  →  DB [8ms]` }),
  (ev) => ({ type: 'query', op: 'LIST_MATCHES',body: 'GET /matches  →  Redis HIT [1ms]' }),
  (ev) => ({ type: 'query', op: 'WS_PUSH',    body: `ws.broadcast("score:${ev.matchId}", clients=18420)` }),
];

function LogEntry({ entry }) {
  const isCmd = entry.type === 'command';
  return (
    <motion.div
      className={`cqrs-entry ${entry.type}`}
      initial={{ opacity: 0, x: isCmd ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      layout
    >
      <span className="cqrs-entry-time">{entry.time}</span>
      <div className="cqrs-entry-body">
        <span className="cqrs-entry-type" style={{ color: isCmd ? 'var(--accent-orange)' : 'var(--accent-blue)' }}>
          {entry.op}
        </span>
        <div style={{ color: 'var(--text-muted)', marginTop: 3, wordBreak: 'break-all' }}>{entry.body}</div>
      </div>
    </motion.div>
  );
}

export default function CQRS() {
  const { state } = useApp();
  const [commands, setCommands] = useState([]);
  const [queries, setQueries] = useState([]);
  const [cmdCount, setCmdCount] = useState(0);
  const [qryCount, setQryCount] = useState(0);
  const lastId = useRef(null);

  useEffect(() => {
    if (state.events.length === 0) return;
    const ev = state.events[0];
    if (ev.id === lastId.current) return;
    lastId.current = ev.id;

    const time = new Date().toLocaleTimeString('en-IN', { hour12: false });

    const cmd = COMMAND_TEMPLATES[Math.floor(Math.random() * COMMAND_TEMPLATES.length)](ev);
    const qry = QUERY_TEMPLATES[Math.floor(Math.random() * QUERY_TEMPLATES.length)](ev);

    setCommands(prev => [{ ...cmd, time, id: `${Date.now()}-c` }, ...prev].slice(0, 50));
    setCmdCount(c => c + 1);

    setTimeout(() => {
      setQueries(prev => [{ ...qry, time, id: `${Date.now()}-q` }, ...prev].slice(0, 50));
      setQryCount(c => c + 1);
    }, 200);
  }, [state.events]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header">
        <h1>CQRS View</h1>
        <p>Command/Query Responsibility Segregation — write and read sides operate independently</p>
      </div>

      {/* Explanation */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {[
          {
            icon: '⚙️',
            title: 'Command Side',
            color: 'var(--accent-orange)',
            border: 'rgba(255,140,0,0.2)',
            points: ['Processes writes: score updates, event inserts', 'Publishes to Kafka for fan-out', 'Invalidates stale Redis entries', 'Never performs reads'],
          },
          {
            icon: '🔍',
            title: 'Query Side',
            color: 'var(--accent-blue)',
            border: 'rgba(59,130,246,0.2)',
            points: ['Serves read requests via Redis cache', 'Subscribes to Kafka for cache warming', 'Broadcasts updates over WebSocket', 'Never modifies source data'],
          },
        ].map(({ icon, title, color, border, points }) => (
          <div key={title} className="card" style={{ borderColor: border }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 22 }}>{icon}</span>
              <h3 style={{ color }}>{title}</h3>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {points.map(p => (
                <li key={p} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                  <span style={{ color }}>→</span> {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid-4">
        {[
          { label: 'Commands Issued', value: cmdCount, color: 'var(--accent-orange)' },
          { label: 'Queries Served', value: qryCount, color: 'var(--accent-blue)' },
          { label: 'Cmd Throughput', value: `${(cmdCount / Math.max(1, state.metrics.eventsProcessed / 1000)).toFixed(0)}k/s`, color: 'var(--accent-orange)' },
          { label: 'Qry Throughput', value: `${state.metrics.throughput.toLocaleString()}/s`, color: 'var(--accent-blue)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ textAlign: 'center', padding: '16px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 28, color }}>{value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Dual log panels */}
      <div className="cqrs-container card" style={{ padding: 0 }}>
        {/* Command side */}
        <div className="cqrs-panel">
          <div className="cqrs-header">
            <span style={{ fontSize: 20 }}>⚙️</span>
            <h3 className="cqrs-title" style={{ color: 'var(--accent-orange)' }}>Command Side</h3>
            <span className="badge" style={{ background: 'rgba(255,140,0,0.12)', color: 'var(--accent-orange)', marginLeft: 'auto' }}>{cmdCount} ops</span>
          </div>
          <div className="cqrs-log">
            <AnimatePresence initial={false}>
              {commands.map(entry => <LogEntry key={entry.id} entry={entry} />)}
            </AnimatePresence>
            {commands.length === 0 && (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0', fontSize: 13 }}>Waiting for events…</div>
            )}
          </div>
        </div>

        {/* Vertical divider */}
        <div className="divider-v" />

        {/* Query side */}
        <div className="cqrs-panel">
          <div className="cqrs-header">
            <span style={{ fontSize: 20 }}>🔍</span>
            <h3 className="cqrs-title" style={{ color: 'var(--accent-blue)' }}>Query Side</h3>
            <span className="badge" style={{ background: 'rgba(59,130,246,0.12)', color: 'var(--accent-blue)', marginLeft: 'auto' }}>{qryCount} ops</span>
          </div>
          <div className="cqrs-log">
            <AnimatePresence initial={false}>
              {queries.map(entry => <LogEntry key={entry.id} entry={entry} />)}
            </AnimatePresence>
            {queries.length === 0 && (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0', fontSize: 13 }}>Waiting for events…</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
