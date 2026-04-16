import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { postParkingMasuk, getDashboard } from '../api/parking';
import StatCard from '../components/StatCard';
import BottomBar from '../components/BottomBar';

export default function ParkingIn() {
  const navigate = useNavigate();
  const [platNomor, setPlatNomor] = useState('');
  const [jenis, setJenis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dashData, setDashData] = useState(null);

  useEffect(() => {
    getDashboard().then(res => setDashData(res.data.data)).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!platNomor.trim()) return setError('Plat nomor wajib diisi');
    if (!jenis) return setError('Pilih jenis kendaraan');

    setLoading(true);
    try {
      await postParkingMasuk(platNomor.toUpperCase(), jenis);
      setSuccess('Kendaraan berhasil masuk! Mengalihkan ke Dashboard...');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menyimpan data';
      const errors = err.response?.data?.errors;
      if (errors) {
        const firstError = Object.values(errors).flat()[0];
        setError(firstError || msg);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPlatNomor('');
    setJenis(null);
    setError('');
    setSuccess('');
  };

  const jenisOptions = [
    { value: 'Motor', icon: '🏍️', label: 'Motor', tarif: 'Rp 2.000/jam' },
    { value: 'Mobil', icon: '🚗', label: 'Mobil', tarif: 'Rp 5.000/jam' },
  ];

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px', paddingBottom: '80px' }}>
      {/* Back */}
      <Link to="/dashboard" style={{
        textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px',
        color: '#6B7280', fontSize: '13px', fontFamily: "'Inter', sans-serif", fontWeight: 500,
        marginBottom: '20px',
      }}>← Kembali ke Dashboard</Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' }}>
        {/* Form Card */}
        <div style={{
          background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(16px)',
          borderRadius: '20px', overflow: 'hidden',
          border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #F97316, #FB923C)',
            padding: '24px 28px',
          }}>
            <h1 style={{
              fontFamily: "'Poppins', sans-serif", fontSize: '20px', fontWeight: 700,
              color: '#fff', margin: 0,
            }}>🅿️ Parkir Masuk</h1>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', margin: '4px 0 0' }}>
              Input data kendaraan yang masuk area parkir
            </p>
          </div>

          <div style={{ padding: '28px' }}>
            {/* Error / Success */}
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: '12px', padding: '12px 16px', marginBottom: '20px',
                color: '#DC2626', fontSize: '13px', fontFamily: "'Inter', sans-serif",
              }}>⚠️ {error}</div>
            )}
            {success && (
              <div style={{
                background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)',
                borderRadius: '12px', padding: '12px 16px', marginBottom: '20px',
                color: '#16A34A', fontSize: '13px', fontFamily: "'Inter', sans-serif",
              }}>✅ {success}</div>
            )}

            {/* Input Plat Nomor */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block', fontFamily: "'Inter', sans-serif", fontWeight: 600,
                fontSize: '13px', color: '#374151', marginBottom: '8px',
              }}>Plat Nomor Kendaraan</label>
              <input
                type="text"
                value={platNomor}
                onChange={e => setPlatNomor(e.target.value.toUpperCase())}
                placeholder="Contoh: BA 1234 AB"
                maxLength={20}
                style={{
                  width: '100%', padding: '14px 16px', borderRadius: '12px',
                  border: '1.5px solid rgba(0,0,0,0.1)', fontSize: '16px',
                  fontFamily: "'Inter', sans-serif", fontWeight: 600,
                  letterSpacing: '1px', outline: 'none', transition: 'border 0.2s',
                  boxSizing: 'border-box', textTransform: 'uppercase',
                }}
                onFocus={e => e.target.style.borderColor = '#F97316'}
                onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.1)'}
              />
            </div>

            {/* Jenis Kendaraan */}
            <div style={{ marginBottom: '28px' }}>
              <label style={{
                display: 'block', fontFamily: "'Inter', sans-serif", fontWeight: 600,
                fontSize: '13px', color: '#374151', marginBottom: '12px',
              }}>Jenis Kendaraan</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {jenisOptions.map(opt => {
                  const isActive = jenis === opt.value;
                  return (
                    <div
                      key={opt.value}
                      onClick={() => setJenis(opt.value)}
                      style={{
                        padding: '20px',
                        borderRadius: '14px',
                        border: `2px solid ${isActive ? '#F97316' : 'rgba(0,0,0,0.08)'}`,
                        background: isActive ? 'rgba(249,115,22,0.06)' : '#fff',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s',
                        boxShadow: isActive ? '0 4px 12px rgba(249,115,22,0.15)' : 'none',
                      }}
                    >
                      <div style={{ fontSize: '36px', marginBottom: '8px' }}>{opt.icon}</div>
                      <p style={{
                        fontFamily: "'Poppins', sans-serif", fontWeight: 600,
                        fontSize: '15px', color: '#111827', margin: 0,
                      }}>{opt.label}</p>
                      <p style={{
                        fontFamily: "'Inter', sans-serif", fontSize: '12px',
                        color: '#9CA3AF', margin: '4px 0 0',
                      }}>{opt.tarif}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  flex: 1, padding: '14px',
                  borderRadius: '12px', border: 'none',
                  background: loading ? '#D1D5DB' : 'linear-gradient(135deg, #F97316, #EA580C)',
                  color: '#fff', fontWeight: 600, fontSize: '14px',
                  fontFamily: "'Poppins', sans-serif", cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 4px 16px rgba(249,115,22,0.35)',
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)',
                      borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                    }} />
                    Menyimpan...
                  </>
                ) : '💾 Simpan Data Masuk'}
              </button>
              <button
                onClick={resetForm}
                style={{
                  padding: '14px 24px', borderRadius: '12px',
                  border: '1.5px solid rgba(0,0,0,0.1)', background: '#fff',
                  color: '#6B7280', fontWeight: 600, fontSize: '14px',
                  fontFamily: "'Inter', sans-serif", cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >🔄 Reset</button>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Tips */}
          <div style={{
            background: 'rgba(249,115,22,0.06)', borderRadius: '16px',
            border: '1px solid rgba(249,115,22,0.15)', padding: '20px',
          }}>
            <h3 style={{
              fontFamily: "'Poppins', sans-serif", fontSize: '14px', fontWeight: 600,
              color: '#F97316', marginBottom: '12px',
            }}>💡 Tips</h3>
            <ul style={{
              listStyle: 'none', padding: 0, margin: 0,
              fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#6B7280',
              display: 'flex', flexDirection: 'column', gap: '8px',
            }}>
              <li>• Plat nomor otomatis di-uppercase</li>
              <li>• Satu plat hanya bisa parkir 1x</li>
              <li>• Tarif Motor: Rp 2.000/jam</li>
              <li>• Tarif Mobil: Rp 5.000/jam</li>
              <li>• Minimum tarif: 1 jam</li>
            </ul>
          </div>

          {/* Statistik Hari Ini */}
          {dashData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <StatCard label="Kendaraan Aktif" value={dashData.kendaraan_aktif} icon="🚘" color="orange" />
              <StatCard label="Kapasitas Tersedia" value={dashData.kapasitas_tersedia} icon="📍" color="green" />
            </div>
          )}
        </div>
      </div>

      <BottomBar />
    </div>
  );
}
