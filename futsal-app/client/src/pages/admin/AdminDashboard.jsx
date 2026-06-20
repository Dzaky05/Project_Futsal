import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { formatRupiah, formatDateShort, BOOKING_STATUS, PAYMENT_STATUS } from '../../utils/auth';
import { ClipboardList, Clock, CreditCard, Banknote, LayoutDashboard, Zap, Calendar, Ban, FileText } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/bookings/stats'),
      api.get('/admin/bookings')
    ]).then(([statsRes, bookingsRes]) => {
      setStats(statsRes.data);
      // Handle paginated response (Laravel paginate returns { data: [...], ... })
      const bData = bookingsRes.data;
      const bookingsList = Array.isArray(bData) ? bData : (bData.data || []);
      setRecentBookings(bookingsList.slice(0, 5));
      setLoading(false);
    }).catch((err) => {
      console.error('Dashboard load error:', err);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;

  const statCards = [
    { icon: <ClipboardList size={24} color="#15803d" />, label: 'Booking Hari Ini', value: stats?.bookings_today || 0, bg: 'var(--green-100)', iconBg: 'var(--green-200)' },
    { icon: <Clock size={24} color="#a16207" />, label: 'Pending', value: stats?.pending_bookings || 0, bg: 'var(--yellow-100)', iconBg: '#fde68a' },
    { icon: <CreditCard size={24} color="#c2410c" />, label: 'Pembayaran Pending', value: stats?.pending_payments || 0, bg: 'var(--orange-100)', iconBg: '#fed7aa' },
    { icon: <Banknote size={24} color="#1d4ed8" />, label: 'Pendapatan Bulan Ini', value: formatRupiah(stats?.revenue_this_month || 0), bg: 'var(--blue-100)', iconBg: '#bfdbfe' },
  ];

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '24px', fontWeight: '700', color: 'var(--green-900)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LayoutDashboard color="#60a5fa" size={28} /> Dashboard Admin
        </h1>
        <p style={{ color: 'var(--gray-500)', fontSize: '14px', marginTop: '4px' }}>
          Selamat datang di panel admin FutsalGo
        </p>
      </div>

      {/* Stats Grid */}
      <div className="stat-grid">
        {statCards.map((card, i) => (
          <div key={i} className="stat-card" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="stat-icon" style={{ background: card.iconBg }}>{card.icon}</div>
            <div className="stat-value">{card.value}</div>
            <div className="stat-label">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '16px', fontWeight: '600', color: 'var(--green-800)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Zap size={18} /> Aksi Cepat
        </h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => navigate('/admin/payments')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CreditCard size={16} /> Verifikasi Pembayaran {stats?.pending_payments > 0 && `(${stats.pending_payments})`}
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/admin/schedule')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} /> Kelola Jadwal</button>
          <button className="btn btn-outline" onClick={() => navigate('/admin/bookings')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><ClipboardList size={16} /> Kelola Booking</button>
          <button className="btn btn-outline" onClick={() => navigate('/admin/block-slots')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Ban size={16} /> Blokir Jadwal</button>
          <button className="btn btn-outline" onClick={() => navigate('/admin/reports')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FileText size={16} /> Laporan</button>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '16px', fontWeight: '600', color: 'var(--green-800)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ClipboardList size={18} /> Booking Terbaru
          </h3>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/admin/bookings')}>
            Lihat Semua →
          </button>
        </div>
        {recentBookings.length === 0 ? (
          <p style={{ color: 'var(--gray-400)', textAlign: 'center', padding: '30px' }}>Belum ada booking</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Pemesan</th>
                  <th>Lapangan</th>
                  <th>Tanggal</th>
                  <th>Jam</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Bayar</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map(b => {
                  const bs = BOOKING_STATUS[b.status];
                  const ps = b.payment ? PAYMENT_STATUS[b.payment.status] : null;
                  return (
                    <tr key={b.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/admin/bookings`)}>
                      <td style={{ fontWeight: '600' }}>#{b.id}</td>
                      <td>{b.user?.name || '-'}</td>
                      <td>{b.field?.name || '-'}</td>
                      <td>{formatDateShort(b.booking_date)}</td>
                      <td>{b.start_time?.slice(0,5)} - {b.end_time?.slice(0,5)}</td>
                      <td style={{ fontWeight: '600', color: 'var(--green-700)' }}>{formatRupiah(b.total_price)}</td>
                      <td>{bs && <span className="badge" style={{ background: bs.bg, color: bs.color }}>{bs.label}</span>}</td>
                      <td>{ps && <span className="badge" style={{ background: ps.bg, color: ps.color }}>{ps.label}</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
