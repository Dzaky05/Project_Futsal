import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/masuk', label: 'Parkir Masuk', icon: '🅿️' },
  { to: '/keluar', label: 'Parkir Keluar', icon: '🚗' },
  { to: '/riwayat', label: 'Riwayat', icon: '📋' },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <nav style={{
      background: 'rgba(255,255,255,0.9)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(249,115,22,0.15)',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
      }}>
        {/* Logo */}
        <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #F97316, #FB923C)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: '18px',
            fontFamily: "'Poppins', sans-serif",
            boxShadow: '0 4px 12px rgba(249,115,22,0.35)',
          }}>P</div>
          <span style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            fontSize: '18px',
            background: 'linear-gradient(135deg, #F97316, #EA580C)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>Smart Parking</span>
        </Link>

        {/* Nav Links */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {navLinks.map(link => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  textDecoration: 'none',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 500,
                  fontFamily: "'Inter', sans-serif",
                  color: isActive ? '#F97316' : '#6B7280',
                  background: isActive ? 'rgba(249,115,22,0.1)' : 'transparent',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>{link.icon}</span>
                <span className="nav-link-text">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
