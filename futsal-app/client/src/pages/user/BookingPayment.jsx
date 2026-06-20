import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import QRCode from 'qrcode';
import api, { downloadPdf } from '../../api/axios';
import { formatRupiah, PAYMENT_METHODS } from '../../utils/auth';
import Modal from '../../components/Modal';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Calendar, CreditCard, ClipboardList, CheckCircle, Smartphone, Building, Banknote, Upload, Download, Loader2, PartyPopper, Hourglass } from 'lucide-react';

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
    payment_notes: '',
  });

  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [qrisImage, setQrisImage] = useState(null);
  const [qrisPayload, setQrisPayload] = useState('');

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
  
  // Hanya jika metode adalah cash, maka wajib DP 50% via Midtrans
  const isDeposit = formData.payment_method === 'cash';
  const depositAmount = isDeposit ? Math.round(totalPrice * 0.5) : totalPrice;
  const remainingAmount = Math.max(0, totalPrice - depositAmount);

  useEffect(() => {
    if (formData.payment_method === 'qris' && field && formData.booking_date && formData.start_time && formData.end_time) {
      const payload = `FUTSALGO|LAPANGAN:${field.name}|TANGGAL:${formData.booking_date}|WAKTU:${formData.start_time}-${formData.end_time}|JUMLAH:${Math.round(totalPrice)}`;
      setQrisPayload(payload);
      QRCode.toDataURL(payload, { width: 260, margin: 2 })
        .then(setQrisImage)
        .catch(() => setQrisImage(null));
    } else {
      setQrisImage(null);
      setQrisPayload('');
    }
  }, [formData.payment_method, field, formData.booking_date, formData.start_time, formData.end_time, totalPrice]);

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
    if (!formData.payment_method) return toast.error('Pilih metode pembayaran!');
    if (duration <= 0) return toast.error('Durasi tidak valid!');

    // Mewajibkan upload bukti HANYA JIKA BUKAN CASH
    if (formData.payment_method !== 'cash' && !proofFile) {
      return toast.error('Upload bukti pembayaran terlebih dahulu!');
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('field_id', fieldId);
      payload.append('booking_date', formData.booking_date);
      payload.append('start_time', formData.start_time);
      payload.append('end_time', formData.end_time);
      payload.append('payment_method', formData.payment_method);
      payload.append('notes', formData.notes);
      payload.append('payment_notes', formData.payment_notes);
      payload.append('is_deposit', isDeposit ? '1' : '0');
      
      if (proofFile && formData.payment_method !== 'cash') {
        payload.append('payment_proof', proofFile);
      }

      const res = await api.post('/bookings', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const bookingData = res.data.booking || res.data.data || res.data;
      const snapToken = res.data.snap_token; 
      
      setCreatedBookingId(bookingData.id);

      if (snapToken) {
        // Show Midtrans Snap Popup (Hanya untuk opsi Cash / DP)
        window.snap.pay(snapToken, {
          onSuccess: function(result) {
            setShowSuccess(true);
          },
          onPending: function(result) {
            setShowSuccess(true);
          },
          onError: function(result) {
            toast.error('Pembayaran gagal! Silakan coba lagi nanti.');
            navigate('/bookings');
          },
          onClose: function() {
            toast.error('Anda menutup halaman pembayaran. Pesanan Anda tersimpan sebagai Pending.');
            navigate('/bookings');
          }
        });
      } else {
        // Jika pembayaran manual upload bukti, langsung tampilkan success
        setShowSuccess(true);
      }
      
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuat booking!');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedMethod = PAYMENT_METHODS[formData.payment_method];

  const isSubmitDisabled = () => {
    if (submitting) return true;
    if (!formData.payment_method) return true;
    if (duration <= 0) return true;
    if (formData.payment_method !== 'cash' && !proofFile) return true;
    return false;
  };

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
        }}>
          <ArrowLeft size={16} /> Kembali ke Jadwal
        </button>
        <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '24px', fontWeight: '700', color: 'var(--green-900)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar color="#10b981" size={28} /> Booking & Pembayaran
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }} className="two-col">
          {/* Left Column - Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Booking Details */}
            <div className="card">
              <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '16px', fontWeight: '600', color: 'var(--green-800)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ClipboardList size={18} color="#3b82f6" /> Detail Pemesanan
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
              <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '16px', fontWeight: '600', color: 'var(--green-800)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CreditCard size={18} color="#8b5cf6" /> Metode Pembayaran
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
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
                      color: formData.payment_method === key ? 'var(--green-700)' : 'var(--gray-500)'
                    }}>
                      {key === 'cash' ? <Banknote size={20} /> : key === 'qris' ? <Smartphone size={20} /> : <Building size={20} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--gray-800)' }}>
                        {key === 'cash' ? 'Tunai di Lokasi (Wajib DP 50% via Online)' : method.label}
                      </div>
                      {method.account && key !== 'cash' && (
                        <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '2px' }}>
                          {method.account} a.n. {method.holder}
                        </div>
                      )}
                      {key === 'cash' && (
                        <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '2px' }}>
                          Bayar DP 50% sekarang via Midtrans, sisa dibayar tunai.
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
              {selectedMethod?.account && formData.payment_method !== 'cash' && (
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

              {/* QRIS Info */}
              {formData.payment_method === 'qris' && (
                <div style={{
                  marginTop: '16px', padding: '20px', background: 'var(--green-50)',
                  borderRadius: 'var(--radius-md)', border: '1px solid var(--green-200)', textAlign: 'center'
                }}>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--green-800)', marginBottom: '12px' }}>
                    Scan QR Code untuk pembayaran:
                  </p>
                  <div style={{
                    width: '220px', height: '220px', margin: '0 auto', background: 'white',
                    borderRadius: '18px', border: '2px solid var(--green-200)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '16px'
                  }}>
                    {qrisImage ? (
                      <img src={qrisImage} alt="QRIS" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <Smartphone size={48} color="#86efac" />
                    )}
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--gray-600)', marginTop: '12px' }}>
                    QR Code dihasilkan otomatis. Pastikan scan dan unggah bukti pembayaran.
                  </p>
                  {qrisPayload && (
                    <div style={{ marginTop: '12px', padding: '12px', borderRadius: '12px', background: 'rgba(245, 255, 244, 0.85)', fontSize: '12px', color: 'var(--gray-700)', wordBreak: 'break-word' }}>
                      <strong>Kode QRIS:</strong><br />{qrisPayload}
                    </div>
                  )}
                </div>
              )}

              {/* Cash Info (Midtrans) */}
              {formData.payment_method === 'cash' && (
                <div style={{
                  marginTop: '16px', padding: '14px', background: 'var(--green-50)',
                  borderRadius: 'var(--radius-md)', border: '1px solid var(--green-200)'
                }}>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--green-800)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Banknote size={16} /> DP Otomatis via Midtrans
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--green-700)' }}>
                    Sistem akan memunculkan pop-up Midtrans untuk Anda membayar DP 50% secara instan.
                  </p>
                </div>
              )}

              {/* Payment Proof Upload — hanya untuk transfer manual & qris */}
              {formData.payment_method && formData.payment_method !== 'cash' && (
                <div className="form-group" style={{ marginTop: '16px' }}>
                  <label className="form-label flex items-center gap-2"><Upload size={14} /> Upload Bukti Pembayaran *</label>
                  <div style={{
                    border: '2px dashed var(--green-300)', borderRadius: 'var(--radius-md)',
                    padding: '24px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s',
                    background: proofPreview ? 'var(--green-50)' : 'transparent'
                  }}
                    onClick={() => document.getElementById('proof-input').click()}
                  >
                    <input id="proof-input" type="file" accept="image/*,.pdf" onChange={handleFileChange} style={{ display: 'none' }} />
                    {proofPreview ? (
                      <div>
                        <img src={proofPreview} alt="Bukti" style={{ maxHeight: '200px', maxWidth: '100%', borderRadius: '8px' }} />
                        <p style={{ fontSize: '12px', color: 'var(--green-600)', marginTop: '8px', fontWeight: '500', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle size={14} color="#10b981" /> Bukti terupload — klik untuk ganti
                        </p>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}><Upload size={36} color="#22c55e" style={{ opacity: 0.8 }} /></div>
                        <p style={{ fontSize: '13px', color: 'var(--gray-500)' }}>Klik untuk upload bukti transfer</p>
                        <p style={{ fontSize: '11px', color: 'var(--gray-400)', marginTop: '4px' }}>JPG, PNG, PDF max 5MB</p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Notes */}
              {formData.payment_method && (
                <div className="form-group" style={{ marginTop: '12px' }}>
                  <label className="form-label">Catatan Pembayaran (opsional)</label>
                  <textarea className="form-input form-textarea" placeholder="Catatan pembayaran..."
                    value={formData.payment_notes} onChange={e => setFormData({ ...formData, payment_notes: e.target.value })}
                    style={{ minHeight: '60px' }} />
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Summary */}
          <div>
            <div className="card" style={{ position: 'sticky', top: '88px' }}>
              <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '16px', fontWeight: '600', color: 'var(--green-800)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ClipboardList size={18} color="#f59e0b" /> Ringkasan Pesanan
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
                
                <div style={{ borderTop: '2px solid var(--gray-200)', paddingTop: '12px', marginTop: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600', fontSize: '15px', color: 'var(--gray-700)' }}>Total Harga</span>
                    <span style={{ fontWeight: '600', fontSize: '14px', color: 'var(--gray-700)' }}>{formatRupiah(totalPrice)}</span>
                  </div>
                  {isDeposit && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                        <span style={{ color: 'var(--gray-500)' }}>DP 50% dibayar online</span>
                        <span style={{ fontWeight: '600', color: 'var(--green-700)' }}>{formatRupiah(depositAmount)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                        <span style={{ color: 'var(--gray-500)' }}>Sisa tunai di lokasi</span>
                        <span style={{ fontWeight: '600', color: 'var(--gray-700)' }}>{formatRupiah(remainingAmount)}</span>
                      </div>
                    </>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                    <span style={{ fontWeight: '700', fontSize: '15px', color: 'var(--gray-800)' }}>{isDeposit ? 'Bayar Sekarang (DP)' : 'Total Bayar (Penuh)'}</span>
                    <span style={{ fontWeight: '700', fontSize: '20px', color: 'var(--green-700)', fontFamily: "'Poppins', sans-serif" }}>
                      {formatRupiah(isDeposit ? depositAmount : totalPrice)}
                    </span>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg flex items-center justify-center gap-2"
                disabled={isSubmitDisabled()}
                style={{ width: '100%', marginTop: '24px' }}
              >
                {submitting ? (
                  <><Loader2 className="animate-spin" size={20} /> Memproses...</>
                ) : (
                  <><CheckCircle size={20} color="#ffffff" /> KONFIRMASI PESANAN & BAYAR</>
                )}
              </button>

              {/* Hint about requirements */}
              {formData.payment_method && formData.payment_method !== 'cash' && !proofFile && (
                <p style={{ fontSize: '11px', color: 'var(--red-500)', textAlign: 'center', marginTop: '8px' }}>
                  ⚠️ Upload bukti pembayaran untuk melanjutkan
                </p>
              )}

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
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both'
            }}>
              <PartyPopper size={40} color="#16a34a" />
            </div>
          </div>
          <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '20px', fontWeight: '700', color: 'var(--green-800)', marginBottom: '8px' }}>
            Pesanan Berhasil Dibuat!
          </h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '14px', marginBottom: '8px' }}>
            {formData.payment_method === 'cash' 
              ? 'Midtrans sedang memproses DP Anda.' 
              : 'Pesanan Anda sedang menunggu verifikasi admin.'}
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
            <span className={`badge ${formData.payment_method === 'cash' ? 'badge-pending' : 'badge-menunggu'}`} style={{ fontSize: '12px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {formData.payment_method === 'cash' 
                ? <><CreditCard size={14} color="#92400e" /> Menunggu Pembayaran</> 
                : <><Hourglass size={14} color="#92400e" /> Menunggu Verifikasi</>}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            {createdBookingId && (
              <button className="btn btn-outline" onClick={() => downloadPdf(createdBookingId)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Download size={16} color="#15803d" /> Download PDF Sementara
              </button>
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
