// ── MetricsContext ─────────────────────────────────────────
// Provides a dedicated context for system metrics with its own
// history buffer for sparklines. Isolates metric re-renders from
// the main AppContext so match cards don't re-render on every tick.

import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { useApp } from './AppContext.jsx';
import { INITIAL_METRICS } from '../utils/mockData.js';

const MAX_HISTORY = 30;

const MetricsContext = createContext(null);

function buildHistory(metrics) {
  return Object.fromEntries(
    Object.keys(metrics).map(k => [k, [{ v: metrics[k], t: Date.now() }]])
  );
}

function metricsReducer(state, action) {
  switch (action.type) {
    case 'TICK': {
      const { metrics } = action;
      const history = {};
      for (const key of Object.keys(metrics)) {
        const prev = state.history[key] || [];
        history[key] = [...prev, { v: metrics[key], t: Date.now() }].slice(-MAX_HISTORY);
      }
      return { metrics, history };
    }
    default:
      return state;
  }
}

export function MetricsProvider({ children }) {
  const { state: appState } = useApp();
  const [state, dispatch] = useReducer(metricsReducer, {
    metrics: INITIAL_METRICS,
    history: buildHistory(INITIAL_METRICS),
  });

  // Sync from AppContext metrics whenever they change
  const lastMetrics = useRef(null);
  useEffect(() => {
    if (JSON.stringify(appState.metrics) !== JSON.stringify(lastMetrics.current)) {
      lastMetrics.current = appState.metrics;
      dispatch({ type: 'TICK', metrics: appState.metrics });
    }
  }, [appState.metrics]);

  return (
    <MetricsContext.Provider value={{ metrics: state.metrics, history: state.history }}>
      {children}
    </MetricsContext.Provider>
  );
}

export function useMetrics() {
  const ctx = useContext(MetricsContext);
  if (!ctx) throw new Error('useMetrics must be used within MetricsProvider');
  return ctx;
}
