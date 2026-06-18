// ── Mock Cricket Data ─────────────────────────────────────
// Realistic data for Simulation Mode and Live Mode fallback

export const MOCK_MATCHES = [
  {
    id: 'IND-AUS',
    matchType: 'Test',
    series: 'Border-Gavaskar Trophy 2026',
    venue: 'Melbourne Cricket Ground',
    status: 'live',
    teams: [
      {
        name: 'India',
        shortName: 'IND',
        flag: '🇮🇳',
        score: '287/6',
        overs: '72.3',
        batting: true,
      },
      {
        name: 'Australia',
        shortName: 'AUS',
        flag: '🇦🇺',
        score: '341/10',
        overs: '98.2',
        batting: false,
      },
    ],
    runRate: 3.96,
    reqRate: 4.21,
    statusText: 'India trail by 54 runs',
    batsmen: [
      { name: 'Virat Kohli', runs: 87, balls: 134, fours: 9, sixes: 1, sr: 64.9 },
      { name: 'Rishabh Pant', runs: 34, balls: 42, fours: 4, sixes: 2, sr: 80.9 },
    ],
    bowler: { name: 'Pat Cummins', overs: '18.3', maidens: 2, runs: 54, wickets: 3, economy: 2.92 },
    recentBalls: ['1', '0', '4', 'W', '0', '1'],
  },
  {
    id: 'ENG-PAK',
    matchType: 'T20I',
    series: 'England vs Pakistan 2026',
    venue: "Lord's Cricket Ground, London",
    status: 'live',
    teams: [
      {
        name: 'England',
        shortName: 'ENG',
        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
        score: '126/3',
        overs: '15.4',
        batting: true,
      },
      {
        name: 'Pakistan',
        shortName: 'PAK',
        flag: '🇵🇰',
        score: '',
        overs: '',
        batting: false,
      },
    ],
    runRate: 8.04,
    reqRate: null,
    statusText: 'England innings in progress',
    batsmen: [
      { name: 'Jos Buttler', runs: 62, balls: 41, fours: 7, sixes: 3, sr: 151.2 },
      { name: 'Liam Livingstone', runs: 28, balls: 19, fours: 2, sixes: 2, sr: 147.4 },
    ],
    bowler: { name: 'Shaheen Afridi', overs: '3.4', maidens: 0, runs: 28, wickets: 2, economy: 7.64 },
    recentBalls: ['6', '0', '4', '1', 'W', '6'],
  },
  {
    id: 'SA-NZ',
    matchType: 'ODI',
    series: 'South Africa vs New Zealand 2026',
    venue: 'Newlands, Cape Town',
    status: 'live',
    teams: [
      {
        name: 'South Africa',
        shortName: 'SA',
        flag: '🇿🇦',
        score: '198/4',
        overs: '38.1',
        batting: true,
      },
      {
        name: 'New Zealand',
        shortName: 'NZ',
        flag: '🇳🇿',
        score: '183/10',
        overs: '44.3',
        batting: false,
      },
    ],
    runRate: 5.19,
    reqRate: null,
    statusText: 'South Africa need 16 more to win',
    batsmen: [
      { name: 'Temba Bavuma', runs: 71, balls: 89, fours: 6, sixes: 0, sr: 79.8 },
      { name: 'David Miller', runs: 45, balls: 38, fours: 3, sixes: 2, sr: 118.4 },
    ],
    bowler: { name: 'Trent Boult', overs: '7.1', maidens: 0, runs: 42, wickets: 1, economy: 5.86 },
    recentBalls: ['1', '2', '0', '4', '1', '0'],
  },
];

export const EVENT_TYPES = {
  SIX:       { label: 'Six!',      icon: '💥', color: 'var(--accent-gold)',   bg: 'var(--accent-gold-dim)',   desc: 'Maximum! Ball sent over the boundary' },
  FOUR:      { label: 'Four!',     icon: '🎯', color: 'var(--accent-blue)',   bg: 'var(--accent-blue-dim)',   desc: 'Boundary! Four runs scored' },
  WICKET:    { label: 'Wicket!',   icon: '🏏', color: 'var(--accent-red)',    bg: 'var(--accent-red-dim)',    desc: 'OUT! Wicket falls' },
  WIDE:      { label: 'Wide',      icon: '➡️', color: 'var(--accent-orange)', bg: 'rgba(255,140,0,0.12)',     desc: 'Wide delivery, extra run awarded' },
  NO_BALL:   { label: 'No Ball',   icon: '⚠️', color: 'var(--accent-purple)', bg: 'var(--accent-purple-dim)', desc: 'No ball bowled, extra run + free hit' },
  MILESTONE: { label: 'Milestone', icon: '🏆', color: 'var(--accent-green)',  bg: 'var(--accent-green-dim)',  desc: 'Player reaches personal milestone' },
  DOT:       { label: 'Dot Ball',  icon: '⚫', color: 'var(--text-muted)',    bg: 'var(--bg-elevated)',       desc: 'No run scored off this delivery' },
  RUN:       { label: 'Run',       icon: '🏃', color: 'var(--accent)',         bg: 'var(--accent-dim)',         desc: 'Runs scored off the bat' },
};

// Generate a stream of realistic events
export function generateMockEvent(matchId = 'IND-AUS') {
  const types = ['RUN', 'RUN', 'RUN', 'DOT', 'FOUR', 'SIX', 'WIDE', 'NO_BALL', 'WICKET', 'MILESTONE'];
  const weights = [30, 20, 15, 20, 8, 4, 5, 3, 4, 1];
  const total = weights.reduce((a, b) => a + b, 0);
  let rand = Math.random() * total;
  let type = types[0];
  for (let i = 0; i < types.length; i++) {
    rand -= weights[i];
    if (rand <= 0) { type = types[i]; break; }
  }

  const runMap = { FOUR: 4, SIX: 6, WIDE: 1, NO_BALL: 1, DOT: 0, RUN: Math.ceil(Math.random() * 3), WICKET: 0, MILESTONE: 0 };
  const over = `${Math.floor(Math.random() * 50)}.${Math.floor(Math.random() * 6)}`;
  const runs = `${Math.floor(Math.random() * 200 + 50)}/${Math.floor(Math.random() * 8)}`;

  return {
    matchId,
    eventType: type,
    score: runs,
    over,
    runs: runMap[type],
    timestamp: new Date().toISOString(),
    player: type === 'WICKET' ? 'Virat Kohli' : type === 'MILESTONE' ? 'Jos Buttler reaches 50!' : undefined,
  };
}

// Worm graph data — cumulative runs per over
export function generateWormData(overs = 20) {
  const data = [];
  let team1 = 0, team2 = 0;
  for (let i = 1; i <= overs; i++) {
    team1 += Math.floor(Math.random() * 12 + 3);
    team2 += Math.floor(Math.random() * 10 + 4);
    data.push({ over: i, team1, team2 });
  }
  return data;
}

export function generateRunRateData(overs = 20) {
  const data = [];
  for (let i = 1; i <= overs; i++) {
    data.push({
      over: i,
      crr: +(Math.random() * 5 + 4).toFixed(2),
      rrr: +(Math.random() * 5 + 5).toFixed(2),
    });
  }
  return data;
}

export function generateProgressionData(overs = 20) {
  const data = [];
  let runs = 0;
  let wickets = 0;
  for (let i = 1; i <= overs; i++) {
    runs += Math.floor(Math.random() * 15 + 3);
    if (Math.random() < 0.1 && wickets < 9) wickets++;
    data.push({ over: i, runs, wickets });
  }
  return data;
}

// Initial metrics
export const INITIAL_METRICS = {
  latency: 12,
  throughput: 2340,
  activeConnections: 18420,
  cacheHitRate: 94.7,
  eventsProcessed: 48291,
  queueLength: 3,
};
