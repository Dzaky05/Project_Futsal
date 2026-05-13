import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import { formatRupiah, formatDate, BOOKING_STATUS, PAYMENT_STATUS, PAYMENT_METHODS } from '../../utils/auth';

export default function BookingDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/bookings/${id}`)
      .then(res => { setBooking(res.data.data || res.data); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, [id]);

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;
  if (!booking) return (
    <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
      <p style={{ color: 'var(--gray-400)' }}>Booking tidak ditemukan</p>
      <button className="btn btn-primary" onClick={() => navigate('/bookings')} style={{ marginTop: '16px' }}>Kembali</button>
    </div>
  );

  const bs = BOOKING_STATUS[booking.status];
  const ps = booking.payment ? PAYMENT_STATUS[booking.payment.status] : null;

  return (
    <div className="fade-in">
      <button onClick={() => navigate('/bookings')} style={{
        background: 'none', border: 'none', color: 'var(--green-700)', cursor: 'pointer',
        fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px'
      }}>← Kembali ke Riwayat</button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '24px', fontWeight: '700', color: 'var(--green-900)' }}>
          Detail Booking #{booking.id}
        </h1>
        {bs && <span className="badge" style={{ background: bs.bg, color: bs.color, fontSize: '13px', padding: '6px 16px' }}>{bs.label}</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="two-col">
        {/* Booking Info */}
        <div className="card">
          <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '16px', fontWeight: '600', color: 'var(--green-800)', marginBottom: '16px' }}>
            ⚽ Informasi Booking
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
            {[
              ['Lapangan', booking.field?.name || '-'],
              ['Tanggal', formatDate(booking.booking_date)],
              ['Waktu', `${booking.start_time?.slice(0,5)} - ${booking.end_time?.slice(0,5)}`],
              ['Durasi', `${booking.duration_hours} jam`],
              ['Catatan', booking.notes || '-'],
              ['Dibuat', new Date(booking.created_at).toLocaleString('id-ID')],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                <span style={{ color: 'var(--gray-500)', minWidth: '100px' }}>{label}</span>
                <span style={{ fontWeight: '500', textAlign: 'right' }}>{value}</span>
              </div>
            ))}
            <div style={{ borderTop: '2px solid var(--gray-200)', paddingTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '600', fontSize: '15px' }}>Total Harga</span>
                <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: '22px', fontWeight: '700', color: 'var(--green-700)' }}>
                  {formatRupiah(booking.total_price)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="card">
          <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '16px', fontWeight: '600', color: 'var(--green-800)', marginBottom: '16px' }}>
            💳 Informasi Pembayaran
          </h3>
          {booking.payment ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray-500)' }}>Status</span>
                {ps && <span className="badge" style={{ background: ps.bg, color: ps.color }}>{ps.label}</span>}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray-500)' }}>Metode</span>
                <span style={{ fontWeight: '500' }}>{PAYMENT_METHODS[booking.payment.payment_method]?.label || booking.payment.payment_method}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray-500)' }}>Jumlah</span>
                <span style={{ fontWeight: '600', color: 'var(--green-700)' }}>{formatRupiah(booking.payment.amount)}</span>
              </div>
              {booking.payment.payment_date && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-500)' }}>Tanggal Bayar</span>
                  <span style={{ fontWeight: '500' }}>{new Date(booking.payment.payment_date).toLocaleString('id-ID')}</span>
                </div>
              )}
              {booking.payment.verified_at && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-500)' }}>Diverifikasi</span>
                  <span style={{ fontWeight: '500' }}>{new Date(booking.payment.verified_at).toLocaleString('id-ID')}</span>
                </div>
              )}
              {booking.payment.notes && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-500)' }}>Catatan</span>
                  <span style={{ fontWeight: '500' }}>{booking.payment.notes}</span>
                </div>
              )}
              {booking.payment.payment_proof && (
                <div style={{ marginTop: '8px' }}>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--gray-600)', marginBottom: '8px' }}>Bukti Pembayaran:</p>
                  <img
                    src={`http://127.0.0.1:8000/api/payments/${booking.payment.id}/proof`}
                    alt="Bukti Pembayaran"
                    style={{ maxWidth: '100%', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--gray-400)' }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>💳</div>
              <p>Belum ada data pembayaran</p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={() => {
          window.open(`http://127.0.0.1:8000/api/bookings/${booking.id}/pdf`, '_blank');
        }}>📄 Download PDF</button>
        <button className="btn btn-outline" onClick={() => navigate('/schedule')}>📅 Booking Lagi</button>
      </div>
    </div>
  );
}
