import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getUser, clearAuth } from '../utils/auth';

export default function UserLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navLinks = [
    { path: '/schedule', label: '📅 Jadwal', icon: '📅' },
    { path: '/bookings', label: '📋 Riwayat Booking', icon: '📋' },
  ];

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <div className="page-container">
      {/* Navbar */}
      <nav className="user-navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span></span><span></span><span></span>
          </button>
          <div
            onClick={() => navigate('/schedule')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
            }}
          >
            <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
              <circle cx="18" cy="18" r="17" stroke="url(#navGrad)" strokeWidth="2" fill="none" />
              <circle cx="18" cy="18" r="10" fill="url(#navGrad)" opacity="0.15" />
              <polygon points="18,8 22,13 20,19 16,19 14,13" fill="url(#navGrad)" />
              <polygon points="22,13 28,13 30,19 25,23 20,19" fill="url(#navGrad)" opacity="0.7" />
              <polygon points="14,13 16,19 11,23 6,19 8,13" fill="url(#navGrad)" opacity="0.7" />
              <polygon points="20,19 25,23 23,28 13,28 11,23 16,19" fill="url(#navGrad)" opacity="0.5" />
              <defs>
                <linearGradient id="navGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#16a34a" />
                </linearGradient>
              </defs>
            </svg>
            <span style={{
              fontFamily: "'Poppins', sans-serif", fontSize: '18px', fontWeight: '700',
              background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 60%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>FutsalGo</span>
          </div>
        </div>

        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {navLinks.map(link => (
            <button
              key={link.path}
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
              onClick={() => { navigate(link.path); setMenuOpen(false); }}
            >
              {link.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', background: 'none',
              border: '1.5px solid var(--green-200)', borderRadius: '12px', padding: '6px 14px',
              cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: 'var(--gray-700)',
              transition: 'all 0.2s'
            }}
          >
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--green-500), var(--green-700))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: '12px', fontWeight: '700'
            }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || 'User'}
            </span>
            <span style={{ fontSize: '10px' }}>▼</span>
          </button>

          {profileOpen && (
            <div style={{
              position: 'absolute', top: '48px', right: 0, background: 'var(--white)',
              border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)', padding: '8px', minWidth: '180px', zIndex: 60,
              animation: 'fadeIn 0.2s ease'
            }}>
              <div style={{ padding: '10px 14px', fontSize: '13px', color: 'var(--gray-500)', borderBottom: '1px solid var(--gray-100)' }}>
                {user?.email}
              </div>
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                  padding: '10px 14px', background: 'none', border: 'none',
                  fontSize: '13px', color: 'var(--red-500)', cursor: 'pointer',
                  borderRadius: 'var(--radius-sm)', transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--red-100)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Overlay for mobile menu */}
      {menuOpen && <div className="mobile-overlay show" onClick={() => setMenuOpen(false)} />}

      {/* Content */}
      <div className="content-area">
        {children}
      </div>
    </div>
  );
}
