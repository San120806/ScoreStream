import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { MOCK_MATCHES, INITIAL_METRICS } from '../utils/mockData.js';

// ── State shape ───────────────────────────────────────────
const initialState = {
  mode: 'simulation',          // 'live' | 'simulation'
  matches: MOCK_MATCHES,
  selectedMatchId: MOCK_MATCHES[0].id,
  events: [],                  // [{matchId, eventType, score, over, timestamp, …}]
  notifications: [],           // [{id, type, title, desc, timestamp, read}]
  metrics: INITIAL_METRICS,
  wsConnected: false,
  nodeStatuses: {              // for fault tolerance
    apiGateway: 'healthy',
    kafka: 'healthy',
    matchProcessor: 'healthy',
    redis: 'healthy',
    wsCluster: 'healthy',
  },
  delay: false,
};

// ── Reducer ───────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.payload, events: [] };

    case 'SET_MATCHES':
      return { ...state, matches: action.payload };

    case 'SELECT_MATCH':
      return { ...state, selectedMatchId: action.payload };

    case 'WS_CONNECTED':
      return { ...state, wsConnected: true };

    case 'WS_DISCONNECTED':
      return { ...state, wsConnected: false };

    case 'ADD_EVENT': {
      const event = { ...action.payload, id: `${Date.now()}-${Math.random()}` };
      const newEvents = [event, ...state.events].slice(0, 200);

      // Derive notifications
      let notifs = [...state.notifications];
      if (event.eventType === 'WICKET') {
        notifs = [mkNotif('WICKET', '🏏 Wicket!', `${event.player || 'Batsman'} is OUT! Score: ${event.score}`, event.timestamp), ...notifs].slice(0, 50);
      } else if (event.eventType === 'SIX') {
        notifs = [mkNotif('SIX', '💥 Massive Six!', `Six hit! Score: ${event.score} (Over ${event.over})`, event.timestamp), ...notifs].slice(0, 50);
      } else if (event.eventType === 'MILESTONE') {
        notifs = [mkNotif('MILESTONE', '🏆 Milestone!', event.player || 'Player milestone reached', event.timestamp), ...notifs].slice(0, 50);
      }

      // Update metrics
      const metrics = {
        ...state.metrics,
        eventsProcessed: state.metrics.eventsProcessed + 1,
        throughput: state.metrics.throughput + Math.floor(Math.random() * 3),
        latency: Math.max(5, state.metrics.latency + (Math.random() - 0.5) * 4),
        activeConnections: state.metrics.activeConnections + Math.floor(Math.random() * 10 - 4),
        cacheHitRate: Math.min(99.9, Math.max(80, state.metrics.cacheHitRate + (Math.random() - 0.5) * 0.5)),
        queueLength: Math.max(0, state.metrics.queueLength + Math.floor(Math.random() * 5 - 2)),
      };

      // Update the match score
      const matches = state.matches.map(m => {
        if (m.id !== event.matchId) return m;
        return { ...m, teams: m.teams.map((t, i) => i === 0 ? { ...t, score: event.score, overs: event.over } : t) };
      });

      return { ...state, events: newEvents, notifications: notifs, metrics, matches };
    }

    case 'MARK_NOTIF_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => n.id === action.payload ? { ...n, read: true } : n),
      };

    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };

    case 'UPDATE_METRICS':
      return { ...state, metrics: { ...state.metrics, ...action.payload } };

    case 'SET_NODE_STATUS':
      return {
        ...state,
        nodeStatuses: { ...state.nodeStatuses, [action.payload.node]: action.payload.status },
      };

    case 'RECOVER_ALL':
      return {
        ...state,
        nodeStatuses: Object.fromEntries(Object.keys(state.nodeStatuses).map(k => [k, 'healthy'])),
        delay: false,
      };

    case 'SET_DELAY':
      return { ...state, delay: action.payload };

    default:
      return state;
  }
}

function mkNotif(type, title, desc, timestamp) {
  return { id: `${Date.now()}-${Math.random()}`, type, title, desc, timestamp, read: false };
}

// ── Context ───────────────────────────────────────────────
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setMode = useCallback((m) => dispatch({ type: 'SET_MODE', payload: m }), []);
  const selectMatch = useCallback((id) => dispatch({ type: 'SELECT_MATCH', payload: id }), []);
  const addEvent = useCallback((ev) => dispatch({ type: 'ADD_EVENT', payload: ev }), []);
  const setNodeStatus = useCallback((node, status) => dispatch({ type: 'SET_NODE_STATUS', payload: { node, status } }), []);
  const recoverAll = useCallback(() => dispatch({ type: 'RECOVER_ALL' }), []);
  const setDelay = useCallback((v) => dispatch({ type: 'SET_DELAY', payload: v }), []);
  const markRead = useCallback((id) => dispatch({ type: 'MARK_NOTIF_READ', payload: id }), []);
  const clearNotifs = useCallback(() => dispatch({ type: 'CLEAR_NOTIFICATIONS' }), []);

  const unreadCount = state.notifications.filter(n => !n.read).length;

  return (
    <AppContext.Provider value={{ state, dispatch, setMode, selectMatch, addEvent, setNodeStatus, recoverAll, setDelay, markRead, clearNotifs, unreadCount }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
