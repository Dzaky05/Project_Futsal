import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import { formatRupiah, PAYMENT_METHODS } from '../../utils/auth';
import Modal from '../../components/Modal';

export default function BookingPayment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [field, setField] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState(null);

  const fieldId = searchParams.get('field_id');
  const date = searchParams.get('date');
  const startTime = searchParams.get('start');
  const endTime = searchParams.get('end');

  const [formData, setFormData] = useState({
    booking_date: date || '',
    start_time: startTime || '',
    end_time: endTime || '',
    payment_method: '',
    notes: '',
  });
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);

  useEffect(() => {
    if (fieldId) {
      api.get(`/fields/${fieldId}`)
        .then(res => { setField(res.data.data || res.data); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [fieldId]);

  const calcDuration = () => {
    if (!formData.start_time || !formData.end_time) return 0;
    const [sh, sm] = formData.start_time.split(':').map(Number);
    const [eh, em] = formData.end_time.split(':').map(Number);
    return Math.max(0, (eh * 60 + em - sh * 60 - sm) / 60);
  };

  const duration = calcDuration();
  const totalPrice = field ? duration * Number(field.price_per_hour) : 0;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProofFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setProofPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.payment_method) return alert('Pilih metode pembayaran!');
    if (duration <= 0) return alert('Durasi tidak valid!');

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('field_id', fieldId);
      payload.append('booking_date', formData.booking_date);
      payload.append('start_time', formData.start_time);
      payload.append('end_time', formData.end_time);
      payload.append('payment_method', formData.payment_method);
      payload.append('notes', formData.notes);
      if (proofFile) payload.append('payment_proof', proofFile);

      const res = await api.post('/bookings', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setCreatedBookingId(res.data.data?.id || res.data.id);
      setShowSuccess(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal membuat booking!');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedMethod = PAYMENT_METHODS[formData.payment_method];

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;
  if (!field) return (
    <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
      <p style={{ color: 'var(--gray-400)', fontSize: '16px' }}>Lapangan tidak ditemukan</p>
      <button className="btn btn-primary" onClick={() => navigate('/schedule')} style={{ marginTop: '16px' }}>
        Kembali ke Jadwal
      </button>
    </div>
  );

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '24px' }}>
        <button onClick={() => navigate('/schedule')} style={{
          background: 'none', border: 'none', color: 'var(--green-700)', cursor: 'pointer',
          fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px'
        }}>← Kembali ke Jadwal</button>
        <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '24px', fontWeight: '700', color: 'var(--green-900)' }}>
          🎯 Booking & Pembayaran
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }} className="two-col">
          {/* Left Column - Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Booking Details */}
            <div className="card">
              <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '16px', fontWeight: '600', color: 'var(--green-800)', marginBottom: '16px' }}>
                📋 Detail Pemesanan
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Lapangan</label>
                  <input className="form-input" value={field.name} disabled />
                </div>
                <div className="form-group">
                  <label className="form-label">Harga per Jam</label>
                  <input className="form-input" value={formatRupiah(field.price_per_hour)} disabled />
                </div>
                <div className="form-group">
                  <label className="form-label">Tanggal</label>
                  <input type="date" className="form-input" value={formData.booking_date}
                    onChange={e => setFormData({ ...formData, booking_date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Durasi</label>
                  <input className="form-input" value={`${duration} jam`} disabled />
                </div>
                <div className="form-group">
                  <label className="form-label">Jam Mulai</label>
                  <input type="time" className="form-input" value={formData.start_time}
                    onChange={e => setFormData({ ...formData, start_time: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Jam Selesai</label>
                  <input type="time" className="form-input" value={formData.end_time}
                    onChange={e => setFormData({ ...formData, end_time: e.target.value })} required />
                </div>
              </div>
              <div className="form-group" style={{ marginTop: '4px' }}>
                <label className="form-label">Catatan (opsional)</label>
                <textarea className="form-input form-textarea" placeholder="Catatan tambahan..."
                  value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
              </div>
            </div>

            {/* Payment Method */}
            <div className="card">
              <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '16px', fontWeight: '600', color: 'var(--green-800)', marginBottom: '16px' }}>
                💳 Metode Pembayaran
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Object.entries(PAYMENT_METHODS).map(([key, method]) => (
                  <div
                    key={key}
                    className={`payment-card ${formData.payment_method === key ? 'selected' : ''}`}
                    onClick={() => setFormData({ ...formData, payment_method: key })}
                  >
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '10px',
                      background: formData.payment_method === key ? 'var(--green-100)' : 'var(--gray-100)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'
                    }}>
                      {key === 'cash' ? '💵' : key === 'qris' ? '📱' : '🏦'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--gray-800)' }}>{method.label}</div>
                      {method.account && (
                        <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '2px' }}>
                          {method.account} a.n. {method.holder}
                        </div>
                      )}
                    </div>
                    <div style={{
                      width: '20px', height: '20px', borderRadius: '50%',
                      border: `2px solid ${formData.payment_method === key ? 'var(--green-500)' : 'var(--gray-300)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {formData.payment_method === key && (
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--green-500)' }}></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Transfer info */}
              {selectedMethod?.account && (
                <div style={{
                  marginTop: '16px', padding: '14px', background: 'var(--green-50)',
                  borderRadius: 'var(--radius-md)', border: '1px solid var(--green-200)'
                }}>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--green-800)', marginBottom: '6px' }}>
                    Transfer ke rekening:
                  </p>
                  <p style={{ fontSize: '18px', fontWeight: '700', color: 'var(--green-900)', fontFamily: "'Poppins', sans-serif" }}>
                    {selectedMethod.account}
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--green-700)', marginTop: '4px' }}>a.n. {selectedMethod.holder}</p>
                </div>
              )}

              {/* Payment Proof Upload */}
              {formData.payment_method && formData.payment_method !== 'cash' && (
                <div className="form-group" style={{ marginTop: '16px' }}>
                  <label className="form-label">📎 Upload Bukti Pembayaran</label>
                  <div style={{
                    border: '2px dashed var(--green-300)', borderRadius: 'var(--radius-md)',
                    padding: '24px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s',
                    background: proofPreview ? 'var(--green-50)' : 'transparent'
                  }}
                    onClick={() => document.getElementById('proof-input').click()}
                  >
                    <input id="proof-input" type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                    {proofPreview ? (
                      <img src={proofPreview} alt="Bukti" style={{ maxHeight: '200px', maxWidth: '100%', borderRadius: '8px' }} />
                    ) : (
                      <>
                        <div style={{ fontSize: '36px', marginBottom: '8px' }}>📤</div>
                        <p style={{ fontSize: '13px', color: 'var(--gray-500)' }}>Klik untuk upload bukti transfer</p>
                        <p style={{ fontSize: '11px', color: 'var(--gray-400)', marginTop: '4px' }}>JPG, PNG max 2MB</p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Summary */}
          <div>
            <div className="card" style={{ position: 'sticky', top: '88px' }}>
              <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '16px', fontWeight: '600', color: 'var(--green-800)', marginBottom: '16px' }}>
                📝 Ringkasan Pesanan
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-500)' }}>Lapangan</span>
                  <span style={{ fontWeight: '600' }}>{field.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-500)' }}>Tanggal</span>
                  <span style={{ fontWeight: '600' }}>{formData.booking_date || '-'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-500)' }}>Jam</span>
                  <span style={{ fontWeight: '600' }}>{formData.start_time || '-'} - {formData.end_time || '-'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-500)' }}>Durasi</span>
                  <span style={{ fontWeight: '600' }}>{duration} jam</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-500)' }}>Harga/Jam</span>
                  <span style={{ fontWeight: '600' }}>{formatRupiah(field.price_per_hour)}</span>
                </div>
                {formData.payment_method && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--gray-500)' }}>Pembayaran</span>
                    <span style={{ fontWeight: '600' }}>{PAYMENT_METHODS[formData.payment_method]?.label}</span>
                  </div>
                )}
                <div style={{ borderTop: '2px solid var(--gray-200)', paddingTop: '12px', marginTop: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600', fontSize: '15px', color: 'var(--gray-700)' }}>Total</span>
                    <span style={{
                      fontWeight: '700', fontSize: '22px', color: 'var(--green-700)',
                      fontFamily: "'Poppins', sans-serif"
                    }}>
                      {formatRupiah(totalPrice)}
                    </span>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg"
                disabled={submitting || !formData.payment_method || duration <= 0}
                style={{ width: '100%', marginTop: '24px' }}
                onClick={handleSubmit}
              >
                {submitting ? (
                  <><div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></div> Memproses...</>
                ) : (
                  '✅ KONFIRMASI PESANAN & BAYAR'
                )}
              </button>

              <p style={{ fontSize: '11px', color: 'var(--gray-400)', textAlign: 'center', marginTop: '12px' }}>
                Dengan memesan, Anda menyetujui syarat dan ketentuan FutsalGo
              </p>
            </div>
          </div>
        </div>
      </form>

      {/* Success Modal */}
      <Modal isOpen={showSuccess} onClose={() => {}}>
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{ fontSize: '60px', marginBottom: '16px' }}>🎉</div>
          <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '20px', fontWeight: '700', color: 'var(--green-800)', marginBottom: '8px' }}>
            Booking Berhasil!
          </h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '14px', marginBottom: '24px' }}>
            Pesanan Anda telah dikirim. Menunggu verifikasi pembayaran dari admin.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            {createdBookingId && (
              <button className="btn btn-outline" onClick={() => {
                window.open(`http://127.0.0.1:8000/api/bookings/${createdBookingId}/pdf`, '_blank');
              }}>📄 Download PDF</button>
            )}
            <button className="btn btn-primary" onClick={() => navigate('/bookings')}>
              Lihat Riwayat →
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
