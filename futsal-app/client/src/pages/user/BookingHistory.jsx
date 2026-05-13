import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { formatRupiah, formatDateShort, BOOKING_STATUS, PAYMENT_STATUS } from '../../utils/auth';

export default function BookingHistory() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/bookings')
      .then(res => { setBookings(res.data.data || res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const getStatusBadge = (status) => {
    const s = BOOKING_STATUS[status];
    return s ? (
      <span className="badge" style={{ background: s.bg, color: s.color }}>{s.label}</span>
    ) : (
      <span className="badge badge-pending">{status}</span>
    );
  };

  const getPaymentBadge = (status) => {
    const s = PAYMENT_STATUS[status];
    return s ? (
      <span className="badge" style={{ background: s.bg, color: s.color }}>{s.label}</span>
    ) : null;
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '24px', fontWeight: '700', color: 'var(--green-900)' }}>
          📋 Riwayat Booking
        </h1>
        <p style={{ color: 'var(--gray-500)', fontSize: '14px', marginTop: '4px' }}>
          Lihat semua riwayat pemesanan lapangan Anda
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: 'Semua' },
          { key: 'pending', label: 'Pending' },
          { key: 'confirmed', label: 'Dikonfirmasi' },
          { key: 'completed', label: 'Selesai' },
          { key: 'cancelled', label: 'Dibatalkan' },
        ].map(f => (
          <button key={f.key}
            className={filter === f.key ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
            onClick={() => setFilter(f.key)}
          >
            {f.label} {f.key === 'all' ? `(${bookings.length})` : `(${bookings.filter(b => b.status === f.key).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner"></div></div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--gray-400)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
          <p style={{ fontSize: '16px', fontWeight: '500' }}>Belum ada booking</p>
          <p style={{ fontSize: '13px', marginTop: '8px' }}>Mulai booking lapangan sekarang!</p>
          <button className="btn btn-primary" onClick={() => navigate('/schedule')} style={{ marginTop: '16px' }}>
            📅 Lihat Jadwal
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((booking, idx) => (
            <div key={booking.id} className="card" style={{
              padding: '20px', cursor: 'pointer', animationDelay: `${idx * 0.05}s`
            }}
              onClick={() => navigate(`/bookings/${booking.id}`)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--gray-400)' }}>
                      #{booking.id}
                    </span>
                    {getStatusBadge(booking.status)}
                    {booking.payment && getPaymentBadge(booking.payment.status)}
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '6px' }}>
                    ⚽ {booking.field?.name || 'Lapangan'}
                  </h3>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--gray-500)', flexWrap: 'wrap' }}>
                    <span>📅 {formatDateShort(booking.booking_date)}</span>
                    <span>🕐 {booking.start_time?.slice(0,5)} - {booking.end_time?.slice(0,5)}</span>
                    <span>⏱ {booking.duration_hours} jam</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: '18px', fontWeight: '700', color: 'var(--green-700)' }}>
                    {formatRupiah(booking.total_price)}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px', justifyContent: 'flex-end' }}>
                    <button className="btn btn-outline btn-sm" onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/bookings/${booking.id}`);
                    }}>Detail</button>
                    <button className="btn btn-primary btn-sm" onClick={(e) => {
                      e.stopPropagation();
                      window.open(`http://127.0.0.1:8000/api/bookings/${booking.id}/pdf`, '_blank');
                    }}>📄 PDF</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
