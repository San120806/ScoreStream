import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

export default function MetricCard({ label, value, unit = '', delta, deltaDir, color, glowColor, sparkData, sparkKey = 'v', icon }) {
  return (
    <motion.div
      className="metric-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
    >
      <div className="metric-card-glow" style={{ background: glowColor || color }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div className="metric-label">{label}</div>
        {icon && <span style={{ fontSize: 18 }}>{icon}</span>}
      </div>

      <div className="metric-value" style={{ color: color || 'var(--text-primary)' }}>
        {typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 1 }) : value}
        {unit && <span style={{ fontSize: 16, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 4 }}>{unit}</span>}
      </div>

      {delta !== undefined && (
        <div className={`metric-delta ${deltaDir || 'up'}`}>
          {deltaDir === 'up' ? '▲' : '▼'} {delta}
        </div>
      )}

      {sparkData && (
        <div className="metric-chart">
          <ResponsiveContainer width="100%" height={48}>
            <AreaChart data={sparkData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color || 'var(--accent)'} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color || 'var(--accent)'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip
                contentStyle={{ background: 'var(--bg-elevated)', border: 'none', borderRadius: 6, fontSize: 11 }}
                labelStyle={{ display: 'none' }}
                itemStyle={{ color: color || 'var(--accent)' }}
              />
              <Area
                type="monotone"
                dataKey={sparkKey}
                stroke={color || 'var(--accent)'}
                strokeWidth={1.5}
                fill={`url(#grad-${label})`}
                dot={false}
                isAnimationActive
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}
