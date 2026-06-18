import { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext.jsx';

const WS_URL = 'ws://localhost:8000/live';
const RECONNECT_DELAY = 3000;

/**
 * Normalises any event shape the Python server might send into
 * the internal format the frontend uses.
 *
 * Python server sends:
 *   { matchId, eventType, score, over, runs, timestamp, player? }
 *
 * Legacy / alternate shape:
 *   { match, event, score (number) }
 */
function normalise(raw) {
  // Handle legacy Python shape: { match, event, score }
  if (raw.match && !raw.matchId) {
    return {
      matchId:   raw.match,
      eventType: raw.event || 'RUN',
      score:     typeof raw.score === 'number' ? `${raw.score}/0` : raw.score,
      over:      raw.over || '0.0',
      runs:      raw.runs || 0,
      timestamp: raw.timestamp || new Date().toISOString(),
      player:    raw.player || undefined,
    };
  }
  // Already in correct format
  return {
    matchId:   raw.matchId,
    eventType: raw.eventType || raw.event || 'RUN',
    score:     raw.score,
    over:      raw.over || '0.0',
    runs:      raw.runs || 0,
    timestamp: raw.timestamp || new Date().toISOString(),
    player:    raw.player || undefined,
  };
}

export function useWebSocket() {
  const { state, dispatch, addEvent } = useApp();
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);
  const active = state.mode === 'simulation';

  const connect = () => {
    if (!active) return;
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WS] Connected to', WS_URL);
        dispatch({ type: 'WS_CONNECTED' });
      };

      ws.onmessage = (e) => {
        try {
          const raw = JSON.parse(e.data);
          const event = normalise(raw);
          if (state.delay) {
            setTimeout(() => addEvent(event), 3000);
          } else {
            addEvent(event);
          }
        } catch (err) {
          console.warn('[WS] Failed to parse message:', err);
        }
      };

      ws.onerror = () => {};

      ws.onclose = () => {
        dispatch({ type: 'WS_DISCONNECTED' });
        if (active) {
          reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY);
        }
      };
    } catch (e) {
      console.warn('[WS] Could not connect — is server.py running?');
      dispatch({ type: 'WS_DISCONNECTED' });
    }
  };

  useEffect(() => {
    if (active) {
      connect();
    } else {
      wsRef.current?.close();
      dispatch({ type: 'WS_DISCONNECTED' });
    }
    return () => {
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  return { connected: state.wsConnected };
}
