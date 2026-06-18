// ── API utilities ─────────────────────────────────────────
// Wraps CricAPI calls with a mock fallback when no key is set.

import { MOCK_MATCHES } from './mockData.js';

const CRICAPI_KEY = import.meta.env.VITE_CRICAPI_KEY || '';
const BASE = 'https://api.cricapi.com/v1';

async function cricapiGet(endpoint, params = {}) {
  const url = new URL(`${BASE}/${endpoint}`);
  url.searchParams.set('apikey', CRICAPI_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`CricAPI error: ${res.status}`);
  const json = await res.json();
  if (json.status !== 'success') throw new Error(json.info || 'API error');
  return json;
}

// ── Normalize CricAPI match → our internal shape ──────────
function normalizeCricMatch(m) {
  return {
    id: m.id,
    matchType: m.matchType || 'T20',
    series: m.series || '',
    venue: m.venue || '',
    status: m.matchStarted && !m.matchEnded ? 'live' : 'scheduled',
    statusText: m.status || 'Match in progress',
    teams: (m.teams || []).map((t, i) => ({
      name: t,
      shortName: t.slice(0, 3).toUpperCase(),
      flag: '🏏',
      score: m.score?.[i]?.r ? `${m.score[i].r}/${m.score[i].w}` : '',
      overs: m.score?.[i]?.o ? String(m.score[i].o) : '',
      batting: i === 0,
    })),
    runRate: 0,
    batsmen: [],
    bowler: null,
    recentBalls: [],
  };
}

// ── Public API ────────────────────────────────────────────

export async function fetchMatches() {
  if (!CRICAPI_KEY) return MOCK_MATCHES;
  try {
    const data = await cricapiGet('currentMatches', { offset: 0 });
    return data.data.map(normalizeCricMatch);
  } catch (e) {
    console.warn('[API] CricAPI failed, using mock data:', e.message);
    return MOCK_MATCHES;
  }
}

export async function fetchScore(matchId) {
  if (!CRICAPI_KEY) {
    return MOCK_MATCHES.find((m) => m.id === matchId) || MOCK_MATCHES[0];
  }
  try {
    const data = await cricapiGet('match_info', { id: matchId });
    return normalizeCricMatch(data.data);
  } catch (e) {
    console.warn('[API] fetchScore failed, using mock:', e.message);
    return MOCK_MATCHES.find((m) => m.id === matchId) || MOCK_MATCHES[0];
  }
}

export async function fetchEvents(matchId) {
  // Always use mock events since no free API provides per-ball events
  return [];
}
