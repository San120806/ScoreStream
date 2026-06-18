import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

const NAV_ITEMS = [
  { to: '/',              icon: '📊', label: 'Live Dashboard',    section: 'main' },
  { to: '/events',        icon: '⚡', label: 'Event Timeline',    section: 'main' },
  { to: '/analytics',     icon: '📈', label: 'Match Analytics',   section: 'main' },
  { to: '/notifications', icon: '🔔', label: 'Notifications',     section: 'main', badge: true },
  { to: '/architecture',  icon: '🏗️', label: 'Architecture',      section: 'distributed' },
  { to: '/metrics',       icon: '💹', label: 'System Metrics',    section: 'distributed' },
  { to: '/cqrs',          icon: '⚙️', label: 'CQRS View',         section: 'distributed' },
  { to: '/fault',         icon: '🔥', label: 'Fault Tolerance',   section: 'distributed' },
];

export default function Sidebar() {
  const { state, unreadCount } = useApp();
  const location = useLocation();

  const mainItems = NAV_ITEMS.filter(i => i.section === 'main');
  const distItems = NAV_ITEMS.filter(i => i.section === 'distributed');

  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <span className="sidebar-logo-icon">🏏</span>
        <span className="sidebar-logo-text">Score<span>Stream</span></span>
      </div>

      <div className="sidebar-nav">
        <div className="sidebar-section-label">Cricket</div>
        {mainItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-item-icon">{item.icon}</span>
            <span>{item.label}</span>
            {item.badge && unreadCount > 0 && (
              <span className="nav-item-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
          </NavLink>
        ))}

        <div className="sidebar-section-label">Distributed Systems</div>
        {distItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-item-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="sidebar-bottom">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px' }}>
          <span className={`status-dot ${state.wsConnected ? 'healthy' : state.mode === 'live' ? 'healthy' : 'offline'}`} />
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {state.mode === 'simulation'
              ? state.wsConnected ? 'WS Connected' : 'Sim Mode (Mock)'
              : 'Live API Mode'
            }
          </span>
        </div>
      </div>
    </nav>
  );
}
