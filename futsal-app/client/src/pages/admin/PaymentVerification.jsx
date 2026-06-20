import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { formatRupiah, formatDateShort, PAYMENT_STATUS, PAYMENT_METHODS } from '../../utils/auth';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { toast } from 'react-hot-toast';
import { CreditCard, CheckCircle, XCircle, Clock, Loader2, Paperclip } from 'lucide-react';

export default function PaymentVerification() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('menunggu_verifikasi');
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');
  const [proofUrl, setProofUrl] = useState(null);
  const [confirmData, setConfirmData] = useState({ isOpen: false, id: null, status: null });
  const [isVerifying, setIsVerifying] = useState(false);

  const fetchPayments = () => {
    setLoading(true);
    const params = {};
    if (filter !== 'all') params.status = filter;
    api.get('/admin/payments', { params })
      .then(res => {
        const d = res.data.data || res.data;
        setPayments(Array.isArray(d) ? d : d.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchPayments(); }, [filter]);

  useEffect(() => {
    if (!showModal || !selected) {
      setProofUrl(null);
      return;
    }

    let active = true;
    api.get(`/admin/payments/${selected.id}/proof`, { responseType: 'blob' })
      .then(res => {
        if (!active) return;
        const url = URL.createObjectURL(res.data);
        setProofUrl(url);
      })
      .catch(() => { if (active) setProofUrl(null); });

    return () => {
      active = false;
      if (proofUrl) {
        URL.revokeObjectURL(proofUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal, selected]);

  const handleVerifyClick = (id, status) => {
    setConfirmData({ isOpen: true, id, status });
  };

  const executeVerify = async () => {
    const { id, status } = confirmData;
    setIsVerifying(true);
    try {
      await api.put(`/admin/payments/${id}/verify`, {
        status,
        notes: status === 'ditolak' ? rejectNotes : ''
      });
      toast.success(status === 'lunas' ? 'Pembayaran diterima' : 'Pembayaran ditolak');
      fetchPayments();
      setShowModal(false);
      setSelected(null);
      setRejectNotes('');
      setConfirmData({ isOpen: false, id: null, status: null });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memverifikasi');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '24px', fontWeight: '700', color: 'var(--green-900)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CreditCard color="#a78bfa" size={28} /> Verifikasi Pembayaran
        </h1>
        <p style={{ color: 'var(--gray-500)', fontSize: '14px', marginTop: '4px' }}>Verifikasi bukti pembayaran dari pengguna</p>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { key: 'menunggu_verifikasi', label: 'Menunggu', icon: <Clock size={14} /> },
          { key: 'lunas', label: 'Lunas', icon: <CheckCircle size={14} /> },
          { key: 'ditolak', label: 'Ditolak', icon: <XCircle size={14} /> },
          { key: 'all', label: 'Semua', icon: null },
        ].map(f => (
          <button key={f.key}
            className={filter === f.key ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
            onClick={() => setFilter(f.key)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {f.icon} {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-center"><Loader2 className="animate-spin text-green-600" size={40} /></div>
      ) : payments.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px', color: 'var(--gray-400)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <CheckCircle size={48} color="#22c55e" style={{ opacity: 0.5 }} />
          </div>
          <p style={{ fontSize: '16px' }}>Tidak ada pembayaran yang perlu diverifikasi</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
          {payments.map(p => {
            const ps = PAYMENT_STATUS[p.status];
            const isDeposit = Boolean(p.is_deposit);
            return (
              <div key={p.id} className="card" style={{ padding: '20px', cursor: 'pointer' }}
                onClick={() => { setSelected(p); setShowModal(true); }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontWeight: '600', color: 'var(--gray-400)', fontSize: '13px' }}>
                    Booking #{p.booking_id}
                  </span>
                  {ps && <span className="badge" style={{ background: ps.bg, color: ps.color }}>{ps.label}</span>}
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontWeight: '600', fontSize: '15px', color: 'var(--gray-800)', marginBottom: '4px' }}>
                    {p.user?.name || 'User'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{p.user?.email}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--gray-500)' }}>
                  <span>{PAYMENT_METHODS[p.payment_method]?.label || p.payment_method}</span>
                  <span style={{ fontWeight: '700', fontSize: '16px', color: 'var(--green-700)', fontFamily: "'Poppins', sans-serif" }}>
                    {formatRupiah(p.amount)}
                  </span>
                </div>
                {isDeposit && (
                  <div style={{ marginTop: '8px', padding: '8px 10px', background: 'var(--green-50)', borderRadius: 'var(--radius-sm)', color: 'var(--green-700)', fontSize: '12px', fontWeight: '600' }}>
                    DP 50% • Sisa tagihan {formatRupiah(p.remaining_amount || 0)}
                  </div>
                )}
                {p.payment_proof && (
                  <div style={{ marginTop: '12px', padding: '8px', background: 'var(--green-50)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', color: 'var(--green-700)' }}>
                    <Paperclip size={14} /> Ada bukti pembayaran
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Verification Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setSelected(null); setRejectNotes(''); }} title="Detail Pembayaran">
        {selected && (
          <div style={{ fontSize: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              {[
                ['Booking ID', `#${selected.booking_id}`],
                ['Pemesan', selected.user?.name],
                ['Metode', PAYMENT_METHODS[selected.payment_method]?.label || selected.payment_method],
                ['Jumlah', formatRupiah(selected.amount)],
                ['Jenis Bayar', selected.is_deposit ? 'DP 50%' : 'Pembayaran penuh'],
                ['Sisa Tagihan', formatRupiah(selected.remaining_amount || 0)],
                ['Tanggal', selected.payment_date ? formatDateShort(selected.payment_date) : '-'],
                ['Status', PAYMENT_STATUS[selected.status]?.label || selected.status],
                ['Catatan', selected.notes || '-'],
              ].map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontSize: '11px', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{l}</div>
                  <div style={{ fontWeight: '500', marginTop: '2px' }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Payment Proof Image */}
            {selected.payment_proof && proofUrl && (
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Paperclip size={14} /> Bukti Pembayaran:
                </p>
                <img
                  src={proofUrl}
                  alt="Bukti Pembayaran"
                  style={{ width: '100%', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}
                  onError={e => { e.target.src = ''; e.target.alt = 'Gagal memuat gambar'; }}
                />
              </div>
            )}

            {/* Actions */}
            {selected.status === 'menunggu_verifikasi' && (
              <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '16px' }}>
                <div style={{ marginBottom: '12px' }}>
                  <label className="form-label">Catatan (untuk penolakan):</label>
                  <textarea className="form-input form-textarea" placeholder="Alasan penolakan..."
                    value={rejectNotes} onChange={e => setRejectNotes(e.target.value)}
                    style={{ minHeight: '60px' }} />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    onClick={() => handleVerifyClick(selected.id, 'lunas')}>
                    <CheckCircle size={16} /> Terima (Lunas)
                  </button>
                  <button className="btn btn-danger" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    onClick={() => handleVerifyClick(selected.id, 'ditolak')}>
                    <XCircle size={16} /> Tolak
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={confirmData.isOpen}
        title={confirmData.status === 'lunas' ? 'Terima Pembayaran?' : 'Tolak Pembayaran?'}
        description={confirmData.status === 'lunas' ? 'Apakah Anda yakin ingin menyetujui pembayaran ini? Status booking akan otomatis berubah menjadi Dikonfirmasi.' : 'Apakah Anda yakin ingin menolak pembayaran ini? Booking dapat dibatalkan otomatis.'}
        onConfirm={executeVerify}
        onCancel={() => setConfirmData({ isOpen: false, id: null, status: null })}
        type={confirmData.status === 'lunas' ? 'success' : 'danger'}
        isLoading={isVerifying}
      />
    </div>
  );
}
