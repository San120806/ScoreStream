import { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { generateMockEvent } from '../utils/mockData.js';

// Drives fake events in Simulation Mode when Python backend is NOT connected
export function useSimulation() {
  const { state, addEvent } = useApp();
  const timer = useRef(null);
  const active = state.mode === 'simulation' && !state.wsConnected;

  useEffect(() => {
    if (!active) {
      clearInterval(timer.current);
      return;
    }

    // Fire an event immediately then every 2–4 seconds
    const fire = () => {
      const matchIds = state.matches.map(m => m.id);
      const matchId = matchIds[Math.floor(Math.random() * matchIds.length)];
      addEvent(generateMockEvent(matchId));
    };

    fire();
    timer.current = setInterval(fire, 2500 + Math.random() * 1500);

    return () => clearInterval(timer.current);
  }, [active, addEvent, state.matches]);
}
