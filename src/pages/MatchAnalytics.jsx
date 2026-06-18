import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { useApp } from '../context/AppContext.jsx';
import { generateWormData, generateRunRateData, generateProgressionData } from '../utils/mockData.js';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 6 }}>Over {label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color, fontWeight: 600, display: 'flex', gap: 8 }}>
          <span>{p.name}:</span><span style={{ fontFamily: 'var(--font-mono)' }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

const TABS = ['Worm Graph', 'Run Rate', 'Score Progression'];

export default function MatchAnalytics() {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState('Worm Graph');
  const [selectedMatch, setSelectedMatch] = useState(state.matches[0]?.id || '');

  // Generate stable chart data per match
  const wormData      = useMemo(() => generateWormData(20),      [selectedMatch]);
  const runRateData   = useMemo(() => generateRunRateData(20),   [selectedMatch]);
  const progressData  = useMemo(() => generateProgressionData(20), [selectedMatch]);

  const match = state.matches.find(m => m.id === selectedMatch) || state.matches[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1>Match Analytics</h1>
          <p style={{ marginTop: 4 }}>Worm graph, run rate, and score progression charts</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {state.matches.map(m => (
            <button
              key={m.id}
              className={`chip ${selectedMatch === m.id ? 'active' : ''}`}
              onClick={() => setSelectedMatch(m.id)}
            >
              {m.teams[0]?.flag} {m.teams[0]?.shortName} vs {m.teams[1]?.flag} {m.teams[1]?.shortName}
            </button>
          ))}
        </div>
      </div>

      {/* Key stats */}
      {match && (
        <div className="grid-4">
          {[
            { label: 'Run Rate', val: match.runRate?.toFixed(2), color: 'var(--accent-green)', icon: '📈' },
            { label: 'Req. Rate', val: match.reqRate?.toFixed(2) ?? '—', color: 'var(--accent-red)', icon: '🎯' },
            { label: 'Total Runs', val: match.teams[0]?.score?.split('/')[0] ?? '—', color: 'var(--accent-gold)', icon: '🏏' },
            { label: 'Wickets', val: match.teams[0]?.score?.split('/')[1] ?? '—', color: 'var(--accent-purple)', icon: '💥' },
          ].map(({ label, val, color, icon }) => (
            <div key={label} className="card" style={{ textAlign: 'center', padding: '16px' }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 26, color }}>{val}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Chart tabs */}
      <div className="chart-tabs">
        {TABS.map(tab => (
          <button
            key={tab}
            id={`tab-${tab.toLowerCase().replace(/ /g, '-')}`}
            className={`chart-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Charts */}
      {activeTab === 'Worm Graph' && (
        <div className="chart-container">
          <div className="chart-title">🪱 Worm Graph — Cumulative Runs by Over</div>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={wormData} margin={{ top: 8, right: 20, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="worm1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="worm2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffd700" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ffd700" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="over" stroke="var(--text-muted)" fontSize={11} label={{ value: 'Overs', position: 'insideBottom', offset: -2, fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis stroke="var(--text-muted)" fontSize={11} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 16 }} />
              <Area type="monotone" dataKey="team1" name={match?.teams[0]?.shortName || 'Team 1'} stroke="#00d4ff" fill="url(#worm1)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="team2" name={match?.teams[1]?.shortName || 'Team 2'} stroke="#ffd700" fill="url(#worm2)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {activeTab === 'Run Rate' && (
        <div className="chart-container">
          <div className="chart-title">📊 Run Rate Analysis — CRR vs RRR</div>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={runRateData} margin={{ top: 8, right: 20, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="over" stroke="var(--text-muted)" fontSize={11} />
              <YAxis stroke="var(--text-muted)" fontSize={11} domain={[0, 12]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 16 }} />
              <ReferenceLine y={6} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" label={{ value: '6.0 RPO', fill: 'var(--text-muted)', fontSize: 10 }} />
              <Line type="monotone" dataKey="crr" name="Current Run Rate" stroke="var(--accent-green)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="rrr" name="Required Run Rate" stroke="var(--accent-red)" strokeWidth={2} dot={false} strokeDasharray="5 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {activeTab === 'Score Progression' && (
        <div className="chart-container">
          <div className="chart-title">🏏 Score Progression — Runs & Wickets by Over</div>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={progressData} margin={{ top: 8, right: 20, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="over" stroke="var(--text-muted)" fontSize={11} />
              <YAxis yAxisId="runs" stroke="var(--text-muted)" fontSize={11} />
              <YAxis yAxisId="wickets" orientation="right" stroke="var(--text-muted)" fontSize={11} domain={[0, 10]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 16 }} />
              <Area yAxisId="runs" type="monotone" dataKey="runs" name="Runs" stroke="#a855f7" fill="url(#scoreGrad)" strokeWidth={2} dot={false} />
              <Line yAxisId="wickets" type="stepAfter" dataKey="wickets" name="Wickets" stroke="var(--accent-red)" strokeWidth={2} dot={{ fill: 'var(--accent-red)', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
