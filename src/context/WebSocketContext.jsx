// ── WebSocketContext ───────────────────────────────────────
// Provides a dedicated context for the WebSocket connection state,
// decoupled from AppContext. Consumed by components that only need
// to know if the WS is connected, without re-rendering on every event.

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from './AppContext.jsx';

const WS_URL = 'ws://localhost:8000/live';
const RECONNECT_DELAY = 3000;

const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
  const { state, addEvent, dispatch } = useApp();
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);
  const [connected, setConnected] = useState(false);
  const [reconnectCount, setReconnectCount] = useState(0);
  const active = state.mode === 'simulation';

  const connect = useCallback(() => {
    if (!active) return;
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        dispatch({ type: 'WS_CONNECTED' });
      };

      ws.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data);
          if (state.delay) {
            setTimeout(() => addEvent(event), 3000);
          } else {
            addEvent(event);
          }
        } catch (err) {
          console.warn('[WS] Parse error:', err);
        }
      };

      ws.onerror = () => {
        // Connection errors are handled in onclose
      };

      ws.onclose = () => {
        setConnected(false);
        dispatch({ type: 'WS_DISCONNECTED' });
        if (active) {
          reconnectTimer.current = setTimeout(() => {
            setReconnectCount(c => c + 1);
            connect();
          }, RECONNECT_DELAY);
        }
      };
    } catch (e) {
      console.warn('[WS] Cannot connect — Python backend may not be running');
      setConnected(false);
    }
  }, [active, addEvent, dispatch, state.delay]);

  useEffect(() => {
    if (active) {
      connect();
    } else {
      wsRef.current?.close();
      setConnected(false);
    }
    return () => {
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <WebSocketContext.Provider value={{ connected, reconnectCount, wsUrl: WS_URL }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error('useWebSocketContext must be used within WebSocketProvider');
  return ctx;
}
