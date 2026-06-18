import { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { fetchMatches } from '../utils/api.js';

const POLL_INTERVAL = 30_000;

export function useLiveMatches() {
  const { state, dispatch } = useApp();
  const timer = useRef(null);
  const active = state.mode === 'live';

  useEffect(() => {
    if (!active) return;

    const load = async () => {
      try {
        const matches = await fetchMatches();
        dispatch({ type: 'SET_MATCHES', payload: matches });
      } catch (e) {
        console.warn('[API] Failed to fetch live matches:', e.message);
      }
    };

    load();
    timer.current = setInterval(load, POLL_INTERVAL);
    return () => clearInterval(timer.current);
  }, [active, dispatch]);
}
