import React from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function ModeToggle() {
  const { state, setMode } = useApp();

  return (
    <div className="mode-toggle">
      <button
        id="mode-live"
        className={`mode-btn ${state.mode === 'live' ? 'active' : ''}`}
        onClick={() => setMode('live')}
      >
        🌐 Live
      </button>
      <button
        id="mode-simulation"
        className={`mode-btn ${state.mode === 'simulation' ? 'active' : ''}`}
        onClick={() => setMode('simulation')}
      >
        ⚡ Simulation
      </button>
    </div>
  );
}
