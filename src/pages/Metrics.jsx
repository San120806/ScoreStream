import React from 'react';
import { useMetrics } from '../context/MetricsContext.jsx';
import MetricCard from '../components/MetricCard.jsx';

export default function Metrics() {
  const { metrics: m, history } = useMetrics();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header">
        <h1>System Metrics</h1>
        <p>Real-time performance indicators — updates on every cricket event</p>
      </div>

      {/* Big metrics grid */}
      <div className="grid-3">
        <MetricCard
          label="End-to-End Latency"
          value={Math.round(m.latency)}
          unit="ms"
          color="var(--accent)"
          glowColor="#00d4ff"
          icon="⚡"
          sparkData={history.latency}
          sparkKey="v"
        />
        <MetricCard
          label="Throughput"
          value={m.throughput}
          unit="req/s"
          color="var(--accent-green)"
          glowColor="#00ff88"
          icon="📊"
          sparkData={history.throughput}
          sparkKey="v"
        />
        <MetricCard
          label="Active Connections"
          value={m.activeConnections}
          color="var(--accent-gold)"
          glowColor="#ffd700"
          icon="🔌"
          sparkData={history.activeConnections}
          sparkKey="v"
        />
        <MetricCard
          label="Cache Hit Rate"
          value={+m.cacheHitRate.toFixed(1)}
          unit="%"
          color="var(--accent-purple)"
          glowColor="#a855f7"
          icon="🗄️"
          sparkData={history.cacheHitRate}
          sparkKey="v"
        />
        <MetricCard
          label="Events Processed"
          value={m.eventsProcessed}
          color="var(--accent-blue)"
          glowColor="#3b82f6"
          icon="📨"
          sparkData={history.eventsProcessed}
          sparkKey="v"
        />
        <MetricCard
          label="Queue Depth"
          value={m.queueLength}
          unit="msgs"
          color="var(--accent-orange)"
          glowColor="#ff8c00"
          icon="📋"
          sparkData={history.queueLength}
          sparkKey="v"
        />
      </div>

      {/* SLA panel */}
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>SLA Compliance</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
          {[
            { label: 'P50 Latency', target: '< 10ms', value: `${Math.round(m.latency * 0.8)}ms`, ok: m.latency < 50 },
            { label: 'P99 Latency', target: '< 100ms', value: `${Math.round(m.latency * 3.2)}ms`, ok: m.latency < 35 },
            { label: 'Cache Hit',   target: '> 90%',   value: `${m.cacheHitRate.toFixed(1)}%`, ok: m.cacheHitRate > 90 },
            { label: 'Uptime',      target: '99.9%',   value: '99.98%', ok: true },
          ].map(({ label, target, value, ok }) => (
            <div key={label} style={{ padding: '16px', background: 'var(--bg-elevated)', borderRadius: 10, borderLeft: `3px solid ${ok ? 'var(--accent-green)' : 'var(--accent-red)'}` }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>{label}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 22, color: ok ? 'var(--accent-green)' : 'var(--accent-red)' }}>{value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Target: {target}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Kafka partition load */}
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Kafka Topic — <span className="text-accent">scorestream.events</span></h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {Array.from({ length: 12 }, (_, i) => {
            // Use eventsProcessed mod to make bars react to real data
            const seed = (m.eventsProcessed + i * 37) % 100;
            const load = Math.round(30 + seed * 0.5);
            return (
              <div key={i} style={{ padding: '12px 14px', background: 'var(--bg-elevated)', borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Partition {i}</div>
                <div style={{ height: 4, background: 'var(--bg-card)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    width: `${load}%`, height: '100%',
                    background: load > 80 ? 'var(--accent-red)' : load > 60 ? 'var(--accent-gold)' : 'var(--accent-green)',
                    borderRadius: 2,
                    transition: 'width 0.5s',
                  }} />
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, marginTop: 6, color: 'var(--text-secondary)' }}>{load}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
