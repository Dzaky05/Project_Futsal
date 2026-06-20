import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { downloadPdf } from '../../api/axios';
import { formatRupiah, formatDateShort, BOOKING_STATUS, PAYMENT_STATUS } from '../../utils/auth';
import { ClipboardList, SearchX, Calendar, CircleDot, Clock, Download, Info } from 'lucide-react';

export default function BookingHistory() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/bookings')
      .then(res => {
        // Laravel paginate returns { data: [...], current_page, ... }
        const d = res.data;
        const list = Array.isArray(d) ? d : (d.data || []);
        setBookings(list);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch booking history error:', err);
        setLoading(false);
      });
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
        <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '24px', fontWeight: '700', color: 'var(--green-900)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ClipboardList color="#3b82f6" size={28} /> Riwayat Booking
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
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}><SearchX size={48} color="#d1d5db" /></div>
          <p style={{ fontSize: '16px', fontWeight: '500' }}>Belum ada booking</p>
          <p style={{ fontSize: '13px', marginTop: '8px' }}>Mulai booking lapangan sekarang!</p>
          <button className="btn btn-primary" onClick={() => navigate('/schedule')} style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={16} color="#10b981" /> Lihat Jadwal
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
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CircleDot size={16} color="#22c55e" /> {booking.field?.name || 'Lapangan'}
                  </h3>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--gray-500)', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} color="#6b7280" /> {formatDateShort(booking.booking_date)}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} color="#6b7280" /> {booking.start_time?.slice(0,5)} - {booking.end_time?.slice(0,5)}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} color="#6b7280" /> {booking.duration_hours} jam</span>
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
                    }} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Info size={14} color="#15803d" /> Detail
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={(e) => {
                      e.stopPropagation();
                      downloadPdf(booking.id);
                    }} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Download size={14} color="#ffffff" /> PDF
                    </button>
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
