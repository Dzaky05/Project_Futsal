import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getKendaraanAktif, postParkingKeluar, getDashboard } from '../api/parking';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import BottomBar from '../components/BottomBar';
import { formatRupiah, formatDurasi, formatWaktu } from '../utils/format';

export default function ParkingOut() {
  const [kendaraanList, setKendaraanList] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [estimasi, setEstimasi] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [struk, setStruk] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dashData, setDashData] = useState(null);

  useEffect(() => {
    getKendaraanAktif()
      .then(res => setKendaraanList(res.data.data || []))
      .catch(() => setError('Gagal mengambil data kendaraan aktif'));
    getDashboard().then(res => setDashData(res.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedId) { setEstimasi(null); return; }
    const kd = kendaraanList.find(k => k.id === Number(selectedId));
    if (!kd) return;

    const now = new Date();
    const masuk = new Date(kd.waktu_masuk);
    const durasiMenit = Math.max(1, Math.floor((now - masuk) / 60000));
    const lamaJam = Math.max(1, Math.ceil(durasiMenit / 60));
    const tarif = kd.jenis === 'Motor' ? 2000 : 5000;
    const total = lamaJam * tarif;

    setEstimasi({ ...kd, durasi_menit: durasiMenit, lama_jam: lamaJam, tarif_per_jam: tarif, total_bayar: total });
  }, [selectedId, kendaraanList]);

  const handleKeluar = async () => {
    setShowModal(false);
    setLoading(true);
    setError('');
    try {
      const res = await postParkingKeluar(Number(selectedId));
      setStruk(res.data.data.struk);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memproses parkir keluar');
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setSelectedId('');
    setEstimasi(null);
    setStruk(null);
    setError('');
    getKendaraanAktif()
      .then(res => setKendaraanList(res.data.data || []))
      .catch(() => {});
  };

  const handleCetakStruk = () => window.print();
  const handleSalinStruk = () => {
    if (!struk) return;
    const text = [
      '=== STRUK PARKIR ===',
      `Plat: ${struk.plat_nomor}`,
      `Jenis: ${struk.jenis}`,
      `Masuk: ${formatWaktu(struk.waktu_masuk)}`,
      `Keluar: ${formatWaktu(struk.waktu_keluar)}`,
      `Durasi: ${formatDurasi(struk.durasi_menit)}`,
      `Tarif: ${formatRupiah(struk.tarif_per_jam)}/jam`,
      `Lama: ${struk.lama_parkir_jam} jam`,
      `TOTAL: ${formatRupiah(struk.total_bayar)}`,
      '==================',
    ].join('\n');
    navigator.clipboard.writeText(text).then(() => alert('Struk berhasil disalin!')).catch(() => {});
  };

  // ===== STRUK VIEW =====
  if (struk) {
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '24px' }}>
        <div style={{
          background: '#fff', borderRadius: '20px', overflow: 'hidden',
          boxShadow: '0 8px 40px rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.06)',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #22C55E, #16A34A)',
            padding: '28px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>✅</div>
            <h2 style={{
              fontFamily: "'Poppins', sans-serif", fontSize: '20px', fontWeight: 700,
              color: '#fff', margin: 0,
            }}>Parkir Keluar Berhasil!</h2>
          </div>

          <div style={{ padding: '28px' }}>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                fontFamily: "'Poppins', sans-serif", fontSize: '14px', fontWeight: 600,
                color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px',
                marginBottom: '16px',
              }}>Detail Struk</h3>

              {[
                { label: 'Plat Nomor', value: struk.plat_nomor },
                { label: 'Jenis', value: struk.jenis },
                { label: 'Waktu Masuk', value: formatWaktu(struk.waktu_masuk) },
                { label: 'Waktu Keluar', value: formatWaktu(struk.waktu_keluar) },
                { label: 'Durasi', value: formatDurasi(struk.durasi_menit) },
                { label: 'Tarif', value: `${formatRupiah(struk.tarif_per_jam)}/jam` },
                { label: 'Lama Parkir', value: `${struk.lama_parkir_jam} jam` },
              ].map(row => (
                <div key={row.label} style={{
                  display: 'flex', justifyContent: 'space-between', padding: '10px 0',
                  borderBottom: '1px dashed rgba(0,0,0,0.06)', fontFamily: "'Inter', sans-serif",
                }}>
                  <span style={{ fontSize: '13px', color: '#6B7280' }}>{row.label}</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{row.value}</span>
                </div>
              ))}

              <div style={{
                display: 'flex', justifyContent: 'space-between', padding: '16px 0',
                marginTop: '8px', borderTop: '2px solid #111827',
              }}>
                <span style={{
                  fontSize: '16px', fontWeight: 700, color: '#111827',
                  fontFamily: "'Poppins', sans-serif",
                }}>TOTAL BAYAR</span>
                <span style={{
                  fontSize: '22px', fontWeight: 700, color: '#F97316',
                  fontFamily: "'Poppins', sans-serif",
                }}>{formatRupiah(struk.total_bayar)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={handleCetakStruk} style={{
                padding: '12px', borderRadius: '12px', border: 'none',
                background: 'linear-gradient(135deg, #F97316, #EA580C)', color: '#fff',
                fontWeight: 600, fontSize: '14px', fontFamily: "'Poppins', sans-serif",
                cursor: 'pointer', boxShadow: '0 4px 16px rgba(249,115,22,0.35)',
              }}>🖨️ Cetak Struk</button>
              <button onClick={handleSalinStruk} style={{
                padding: '12px', borderRadius: '12px',
                border: '1.5px solid rgba(0,0,0,0.1)', background: '#fff',
                color: '#374151', fontWeight: 600, fontSize: '14px',
                fontFamily: "'Inter', sans-serif", cursor: 'pointer',
              }}>📋 Salin Struk</button>
              <button onClick={resetState} style={{
                padding: '12px', borderRadius: '12px',
                border: '1.5px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.06)',
                color: '#16A34A', fontWeight: 600, fontSize: '14px',
                fontFamily: "'Inter', sans-serif", cursor: 'pointer',
              }}>🔄 Transaksi Baru</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== MAIN VIEW =====
  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px', paddingBottom: '80px' }}>
      <Link to="/dashboard" style={{
        textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px',
        color: '#6B7280', fontSize: '13px', fontFamily: "'Inter', sans-serif", fontWeight: 500,
        marginBottom: '20px',
      }}>← Kembali ke Dashboard</Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' }}>
        <div style={{
          background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(16px)', borderRadius: '20px',
          overflow: 'hidden', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #EF4444, #DC2626)', padding: '24px 28px',
          }}>
            <h1 style={{
              fontFamily: "'Poppins', sans-serif", fontSize: '20px', fontWeight: 700,
              color: '#fff', margin: 0,
            }}>🚗 Parkir Keluar</h1>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', margin: '4px 0 0' }}>
              Proses kendaraan keluar dan pembayaran
            </p>
          </div>

          <div style={{ padding: '28px' }}>
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: '12px', padding: '12px 16px', marginBottom: '20px',
                color: '#DC2626', fontSize: '13px', fontFamily: "'Inter', sans-serif",
              }}>⚠️ {error}</div>
            )}

            {/* Dropdown Kendaraan */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block', fontFamily: "'Inter', sans-serif", fontWeight: 600,
                fontSize: '13px', color: '#374151', marginBottom: '8px',
              }}>Pilih Kendaraan</label>
              <select
                value={selectedId}
                onChange={e => setSelectedId(e.target.value)}
                style={{
                  width: '100%', padding: '14px 16px', borderRadius: '12px',
                  border: '1.5px solid rgba(0,0,0,0.1)', fontSize: '14px',
                  fontFamily: "'Inter', sans-serif", outline: 'none',
                  background: '#fff', cursor: 'pointer', boxSizing: 'border-box',
                }}
              >
                <option value="">-- Pilih kendaraan --</option>
                {kendaraanList.map(kd => {
                  const masuk = new Date(kd.waktu_masuk);
                  const pad = n => String(n).padStart(2, '0');
                  const jam = `${pad(masuk.getHours())}:${pad(masuk.getMinutes())}`;
                  return (
                    <option key={kd.id} value={kd.id}>
                      {kd.plat_nomor} ({kd.jenis}) - Masuk: {jam}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Estimasi */}
            {estimasi && (
              <div style={{
                background: 'rgba(249,115,22,0.05)', borderRadius: '16px',
                border: '1.5px solid rgba(249,115,22,0.2)', padding: '20px',
                marginBottom: '24px',
              }}>
                <h3 style={{
                  fontFamily: "'Poppins', sans-serif", fontSize: '15px', fontWeight: 600,
                  color: '#F97316', marginBottom: '16px',
                }}>💰 Estimasi Pembayaran</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {[
                    { label: 'Plat Nomor', value: estimasi.plat_nomor },
                    { label: 'Jenis', value: estimasi.jenis },
                    { label: 'Durasi', value: formatDurasi(estimasi.durasi_menit) },
                    { label: 'Tarif', value: `${formatRupiah(estimasi.tarif_per_jam)}/jam` },
                  ].map(item => (
                    <div key={item.label}>
                      <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '0 0 2px' }}>{item.label}</p>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0 }}>{item.value}</p>
                    </div>
                  ))}
                </div>
                <div style={{
                  marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed rgba(249,115,22,0.3)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ fontWeight: 600, color: '#374151', fontSize: '14px' }}>Estimasi Total</span>
                  <span style={{
                    fontSize: '22px', fontWeight: 700, color: '#F97316',
                    fontFamily: "'Poppins', sans-serif",
                  }}>{formatRupiah(estimasi.total_bayar)}</span>
                </div>
              </div>
            )}

            {/* Button */}
            <button
              onClick={() => setShowModal(true)}
              disabled={loading || !selectedId}
              style={{
                width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                background: (!selectedId || loading) ? '#D1D5DB' : 'linear-gradient(135deg, #EF4444, #DC2626)',
                color: '#fff', fontWeight: 600, fontSize: '14px',
                fontFamily: "'Poppins', sans-serif",
                cursor: (!selectedId || loading) ? 'not-allowed' : 'pointer',
                boxShadow: (!selectedId || loading) ? 'none' : '0 4px 16px rgba(239,68,68,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                  }} />
                  Memproses...
                </>
              ) : '🚗 Proses Parkir Keluar'}
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            background: 'rgba(239,68,68,0.06)', borderRadius: '16px',
            border: '1px solid rgba(239,68,68,0.15)', padding: '20px',
          }}>
            <h3 style={{
              fontFamily: "'Poppins', sans-serif", fontSize: '14px', fontWeight: 600,
              color: '#EF4444', marginBottom: '12px',
            }}>📋 Info Tarif</h3>
            <ul style={{
              listStyle: 'none', padding: 0, margin: 0,
              fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#6B7280',
              display: 'flex', flexDirection: 'column', gap: '8px',
            }}>
              <li>• Motor: Rp 2.000/jam</li>
              <li>• Mobil: Rp 5.000/jam</li>
              <li>• Minimum 1 jam</li>
              <li>• Pembulatan ke atas per jam</li>
            </ul>
          </div>
          {dashData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <StatCard label="Kendaraan Aktif" value={dashData.kendaraan_aktif} icon="🚘" color="orange" />
              <StatCard label="Motor" value={dashData.jumlah_motor} icon="🏍️" color="green" />
              <StatCard label="Mobil" value={dashData.jumlah_mobil} icon="🚗" color="blue" />
            </div>
          )}
        </div>
      </div>

      {/* Modal Konfirmasi */}
      <Modal
        show={showModal}
        title="Konfirmasi Parkir Keluar"
        onConfirm={handleKeluar}
        onCancel={() => setShowModal(false)}
        confirmText="Ya, Proses Keluar"
        confirmColor="#EF4444"
      >
        {estimasi && (
          <div>
            <p style={{ marginBottom: '12px' }}>Apakah Anda yakin ingin memproses keluar kendaraan ini?</p>
            <div style={{
              background: 'rgba(0,0,0,0.03)', borderRadius: '10px', padding: '14px',
            }}>
              <p><strong>Plat:</strong> {estimasi.plat_nomor}</p>
              <p><strong>Jenis:</strong> {estimasi.jenis}</p>
              <p><strong>Durasi:</strong> {formatDurasi(estimasi.durasi_menit)}</p>
              <p><strong>Estimasi Bayar:</strong> <span style={{ color: '#F97316', fontWeight: 700 }}>{formatRupiah(estimasi.total_bayar)}</span></p>
            </div>
          </div>
        )}
      </Modal>

      <BottomBar />
    </div>
  );
}
