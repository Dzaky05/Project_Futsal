import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const actions = [
  { to: '/masuk', label: 'Parkir Masuk', icon: '🅿️', color: '#22C55E' },
  { to: '/keluar', label: 'Parkir Keluar', icon: '🚗', color: '#EF4444' },
  { to: '/riwayat', label: 'Riwayat', icon: '📋', color: '#6B7280' },
];

export default function BottomBar() {
  const location = useLocation();

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(0,0,0,0.08)',
      padding: '8px 16px',
      display: 'flex',
      justifyContent: 'center',
      gap: '8px',
      zIndex: 100,
      boxShadow: '0 -2px 12px rgba(0,0,0,0.04)',
    }}>
      {actions.map(action => {
        const isActive = location.pathname === action.to;
        return (
          <Link
            key={action.to}
            to={action.to}
            style={{
              textDecoration: 'none',
              padding: '10px 20px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
              color: isActive ? '#fff' : action.color,
              background: isActive ? action.color : `${action.color}15`,
              border: `1.5px solid ${action.color}40`,
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: isActive ? `0 4px 12px ${action.color}40` : 'none',
            }}
          >
            <span>{action.icon}</span>
            <span>{action.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
