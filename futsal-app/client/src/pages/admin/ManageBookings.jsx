import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { formatRupiah, formatDateShort, BOOKING_STATUS, PAYMENT_STATUS } from '../../utils/auth';
import Modal from '../../components/Modal';

export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchBookings = () => {
    setLoading(true);
    const params = {};
    if (filter !== 'all') params.status = filter;
    api.get('/admin/bookings', { params })
      .then(res => {
        const d = res.data.data || res.data;
        setBookings(Array.isArray(d) ? d : d.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, [filter]);

  const updateStatus = async (id, status) => {
    if (!window.confirm(`Ubah status ke "${BOOKING_STATUS[status]?.label || status}"?`)) return;
    try {
      await api.put(`/admin/bookings/${id}/status`, { status });
      fetchBookings();
      setShowModal(false);
      setSelected(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal update status');
    }
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '24px', fontWeight: '700', color: 'var(--green-900)' }}>
          📋 Kelola Booking
        </h1>
        <p style={{ color: 'var(--gray-500)', fontSize: '14px', marginTop: '4px' }}>Kelola semua pemesanan lapangan</p>
      </div>

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
          >{f.label}</button>
        ))}
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner"></div></div>
      ) : (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th><th>Pemesan</th><th>Lapangan</th><th>Tanggal</th>
                  <th>Jam</th><th>Total</th><th>Status</th><th>Bayar</th><th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr><td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-400)' }}>Tidak ada booking</td></tr>
                ) : bookings.map(b => {
                  const bs = BOOKING_STATUS[b.status];
                  const ps = b.payment ? PAYMENT_STATUS[b.payment.status] : null;
                  return (
                    <tr key={b.id}>
                      <td style={{ fontWeight: '600' }}>#{b.id}</td>
                      <td>
                        <div style={{ fontWeight: '500' }}>{b.user?.name || '-'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>{b.user?.email}</div>
                      </td>
                      <td>{b.field?.name || '-'}</td>
                      <td>{formatDateShort(b.booking_date)}</td>
                      <td>{b.start_time?.slice(0,5)} - {b.end_time?.slice(0,5)}</td>
                      <td style={{ fontWeight: '600', color: 'var(--green-700)' }}>{formatRupiah(b.total_price)}</td>
                      <td>{bs && <span className="badge" style={{ background: bs.bg, color: bs.color }}>{bs.label}</span>}</td>
                      <td>{ps && <span className="badge" style={{ background: ps.bg, color: ps.color }}>{ps.label}</span>}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button className="btn btn-outline btn-sm" onClick={() => { setSelected(b); setShowModal(true); }}>Detail</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setSelected(null); }} title={`Booking #${selected?.id}`}>
        {selected && (
          <div style={{ fontSize: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              {[
                ['Pemesan', selected.user?.name],
                ['Email', selected.user?.email],
                ['Lapangan', selected.field?.name],
                ['Tanggal', formatDateShort(selected.booking_date)],
                ['Jam', `${selected.start_time?.slice(0,5)} - ${selected.end_time?.slice(0,5)}`],
                ['Durasi', `${selected.duration_hours} jam`],
                ['Total', formatRupiah(selected.total_price)],
                ['Catatan', selected.notes || '-'],
              ].map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontSize: '11px', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{l}</div>
                  <div style={{ fontWeight: '500', marginTop: '2px' }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '16px' }}>
              <p style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px' }}>Ubah Status:</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {selected.status === 'pending' && (
                  <>
                    <button className="btn btn-primary btn-sm" onClick={() => updateStatus(selected.id, 'confirmed')}>✅ Konfirmasi</button>
                    <button className="btn btn-danger btn-sm" onClick={() => updateStatus(selected.id, 'cancelled')}>❌ Batalkan</button>
                  </>
                )}
                {selected.status === 'confirmed' && (
                  <>
                    <button className="btn btn-primary btn-sm" onClick={() => updateStatus(selected.id, 'completed')}>✅ Selesai</button>
                    <button className="btn btn-danger btn-sm" onClick={() => updateStatus(selected.id, 'cancelled')}>❌ Batalkan</button>
                  </>
                )}
                {(selected.status === 'completed' || selected.status === 'cancelled') && (
                  <p style={{ color: 'var(--gray-400)', fontSize: '13px' }}>Status final — tidak dapat diubah</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
