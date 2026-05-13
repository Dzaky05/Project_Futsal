import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { clearAuth } from '../utils/auth';

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/bookings', label: 'Kelola Booking', icon: '📋' },
    { path: '/admin/payments', label: 'Verifikasi Pembayaran', icon: '💳' },
    { path: '/admin/fields', label: 'Kelola Lapangan', icon: '⚽' },
    { path: '/admin/block-slots', label: 'Blokir Jadwal', icon: '🚫' },
    { path: '/admin/reports', label: 'Laporan Keuangan', icon: '📈' },
  ];

  const handleLogout = () => {
    clearAuth();
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="mobile-overlay show" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
              <circle cx="18" cy="18" r="17" stroke="#4ade80" strokeWidth="2" fill="none" />
              <circle cx="18" cy="18" r="10" fill="#4ade80" opacity="0.2" />
              <polygon points="18,8 22,13 20,19 16,19 14,13" fill="#4ade80" />
              <polygon points="22,13 28,13 30,19 25,23 20,19" fill="#4ade80" opacity="0.7" />
              <polygon points="14,13 16,19 11,23 6,19 8,13" fill="#4ade80" opacity="0.7" />
              <polygon points="20,19 25,23 23,28 13,28 11,23 16,19" fill="#4ade80" opacity="0.5" />
            </svg>
            <div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: '18px', fontWeight: '700', color: '#4ade80' }}>FutsalGo</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', textTransform: 'uppercase' }}>Admin Panel</div>
            </div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => { navigate(item.path); setSidebarOpen(false); }}
            >
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '16px 0', marginTop: 'auto' }}>
          <button className="nav-item" onClick={handleLogout} style={{ color: '#fca5a5' }}>
            <span style={{ fontSize: '18px' }}>🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-content">
        {/* Mobile header */}
        <div style={{ display: 'none', marginBottom: '20px', alignItems: 'center', gap: '12px' }} className="mobile-header">
          <button className="hamburger" onClick={() => setSidebarOpen(true)} style={{ display: 'block' }}>
            <span></span><span></span><span></span>
          </button>
          <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: '600', color: 'var(--green-800)' }}>FutsalGo Admin</span>
        </div>
        {children}
      </main>
    </div>
  );
}
