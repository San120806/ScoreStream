import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext.jsx';
import { MetricsProvider } from './context/MetricsContext.jsx';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';

import { useWebSocket } from './hooks/useWebSocket.js';
import { useSimulation } from './hooks/useSimulation.js';
import { useLiveMatches } from './hooks/useLiveMatches.js';

// Pages — lazy loaded
const Dashboard     = lazy(() => import('./pages/Dashboard.jsx'));
const Events        = lazy(() => import('./pages/Events.jsx'));
const Architecture  = lazy(() => import('./pages/Architecture.jsx'));
const Metrics       = lazy(() => import('./pages/Metrics.jsx'));
const CQRS          = lazy(() => import('./pages/CQRS.jsx'));
const FaultTolerance= lazy(() => import('./pages/FaultTolerance.jsx'));
const MatchAnalytics= lazy(() => import('./pages/MatchAnalytics.jsx'));
const Notifications = lazy(() => import('./pages/Notifications.jsx'));

function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading…</div>
    </div>
  );
}

function AppInner() {
  useWebSocket();
  useSimulation();
  useLiveMatches();

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="page-content">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/"             element={<Dashboard />} />
              <Route path="/events"       element={<Events />} />
              <Route path="/architecture" element={<Architecture />} />
              <Route path="/metrics"      element={<Metrics />} />
              <Route path="/cqrs"         element={<CQRS />} />
              <Route path="/fault"        element={<FaultTolerance />} />
              <Route path="/analytics"    element={<MatchAnalytics />} />
              <Route path="/notifications"element={<Notifications />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <MetricsProvider>
          <AppInner />
        </MetricsProvider>
      </AppProvider>
    </BrowserRouter>
  );
}
