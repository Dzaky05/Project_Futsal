import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRiwayat, getExportCSVUrl } from '../api/parking';
import StatCard from '../components/StatCard';
import VehicleBadge from '../components/VehicleBadge';
import BottomBar from '../components/BottomBar';
import { formatRupiah, formatDurasi, formatWaktu } from '../utils/format';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function History() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter state
  const [tanggal, setTanggal] = useState('');
  const [jenis, setJenis] = useState('');
  const [platNomor, setPlatNomor] = useState('');

  const fetchRiwayat = async (params = {}) => {
    setLoading(true);
    try {
      const res = await getRiwayat(params);
      setData(res.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengambil data riwayat');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiwayat();
  }, []);

  const handleFilter = () => {
    const params = {};
    if (tanggal) params.tanggal = tanggal;
    if (jenis) params.jenis = jenis;
    if (platNomor) params.plat_nomor = platNomor;
    fetchRiwayat(params);
  };

  const handleReset = () => {
    setTanggal('');
    setJenis('');
    setPlatNomor('');
    fetchRiwayat();
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: '#fff', borderRadius: '10px', padding: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)', border: '1px solid rgba(0,0,0,0.06)',
          fontFamily: "'Inter', sans-serif", fontSize: '12px',
        }}>
          <p style={{ fontWeight: 600, color: '#111827', margin: '0 0 4px' }}>{label}</p>
          <p style={{ color: '#F97316', margin: '0 0 2px' }}>Transaksi: {payload[0]?.value}</p>
          {payload[1] && <p style={{ color: '#3B82F6', margin: 0 }}>Pendapatan: {formatRupiah(payload[1]?.value)}</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px', paddingBottom: '80px' }}>
      <Link to="/dashboard" style={{
        textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px',
        color: '#6B7280', fontSize: '13px', fontFamily: "'Inter', sans-serif", fontWeight: 500,
        marginBottom: '20px',
      }}>← Kembali ke Dashboard</Link>

      <h1 style={{
        fontFamily: "'Poppins', sans-serif", fontSize: '22px', fontWeight: 700,
        color: '#111827', marginBottom: '24px',
      }}>📋 Riwayat Parkir</h1>

      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: '12px', padding: '12px 16px', marginBottom: '20px',
          color: '#DC2626', fontSize: '13px', fontFamily: "'Inter', sans-serif",
        }}>⚠️ {error}</div>
      )}

      {/* Stat Cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px', marginBottom: '28px',
      }}>
        <StatCard label="Total Transaksi" value={data?.total_transaksi || 0} icon="📊" color="orange" />
        <StatCard label="Total Pendapatan" value={formatRupiah(data?.total_pendapatan || 0)} icon="💰" color="green" />
        <StatCard label="Rata-rata/Transaksi" value={formatRupiah(data?.rata_rata_per_transaksi || 0)} icon="📈" color="blue" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start' }}>
        <div>
          {/* Filter */}
          <div style={{
            background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(16px)', borderRadius: '16px',
            border: '1px solid rgba(0,0,0,0.06)', padding: '20px', marginBottom: '20px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          }}>
            <h3 style={{
              fontFamily: "'Poppins', sans-serif", fontSize: '14px', fontWeight: 600,
              color: '#111827', marginBottom: '16px',
            }}>🔍 Filter</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#6B7280', marginBottom: '4px' }}>Tanggal</label>
                <input
                  type="date"
                  value={tanggal}
                  onChange={e => setTanggal(e.target.value)}
                  style={{
                    padding: '10px 12px', borderRadius: '10px', border: '1.5px solid rgba(0,0,0,0.1)',
                    fontSize: '13px', fontFamily: "'Inter', sans-serif", outline: 'none',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#6B7280', marginBottom: '4px' }}>Jenis</label>
                <select
                  value={jenis}
                  onChange={e => setJenis(e.target.value)}
                  style={{
                    padding: '10px 12px', borderRadius: '10px', border: '1.5px solid rgba(0,0,0,0.1)',
                    fontSize: '13px', fontFamily: "'Inter', sans-serif", outline: 'none', background: '#fff',
                  }}
                >
                  <option value="">Semua</option>
                  <option value="Motor">Motor</option>
                  <option value="Mobil">Mobil</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#6B7280', marginBottom: '4px' }}>Plat Nomor</label>
                <input
                  type="text"
                  value={platNomor}
                  onChange={e => setPlatNomor(e.target.value.toUpperCase())}
                  placeholder="Cari plat..."
                  style={{
                    padding: '10px 12px', borderRadius: '10px', border: '1.5px solid rgba(0,0,0,0.1)',
                    fontSize: '13px', fontFamily: "'Inter', sans-serif", outline: 'none',
                  }}
                />
              </div>
              <button onClick={handleFilter} style={{
                padding: '10px 20px', borderRadius: '10px', border: 'none',
                background: '#F97316', color: '#fff', fontWeight: 600, fontSize: '13px',
                cursor: 'pointer', fontFamily: "'Inter', sans-serif",
              }}>Terapkan</button>
              <button onClick={handleReset} style={{
                padding: '10px 20px', borderRadius: '10px', border: '1.5px solid rgba(0,0,0,0.1)',
                background: '#fff', color: '#6B7280', fontWeight: 600, fontSize: '13px',
                cursor: 'pointer', fontFamily: "'Inter', sans-serif",
              }}>Reset</button>
            </div>
          </div>

          {/* Chart */}
          {data?.chart_7hari && data.chart_7hari.length > 0 && (
            <div style={{
              background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(16px)', borderRadius: '16px',
              border: '1px solid rgba(0,0,0,0.06)', padding: '20px', marginBottom: '20px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            }}>
              <h3 style={{
                fontFamily: "'Poppins', sans-serif", fontSize: '14px', fontWeight: 600,
                color: '#111827', marginBottom: '16px',
              }}>📊 Statistik 7 Hari Terakhir</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.chart_7hari}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="tanggal" fontSize={11} tick={{ fill: '#9CA3AF' }}
                    tickFormatter={v => { const d = new Date(v); return `${d.getDate()}/${d.getMonth()+1}`; }} />
                  <YAxis fontSize={11} tick={{ fill: '#9CA3AF' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="jumlah" fill="#F97316" radius={[6,6,0,0]} name="Transaksi" />
                  <Bar dataKey="pendapatan" fill="#3B82F6" radius={[6,6,0,0]} name="Pendapatan" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Table */}
          <div style={{
            background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(16px)', borderRadius: '16px',
            border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden',
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          }}>
            <div style={{
              padding: '18px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <h3 style={{
                fontFamily: "'Poppins', sans-serif", fontSize: '15px', fontWeight: 600,
                color: '#111827', margin: 0,
              }}>Daftar Riwayat</h3>
              <a href={getExportCSVUrl()} style={{
                padding: '8px 16px', borderRadius: '10px', border: '1.5px solid rgba(34,197,94,0.3)',
                background: 'rgba(34,197,94,0.06)', color: '#16A34A', fontWeight: 600,
                fontSize: '12px', textDecoration: 'none', fontFamily: "'Inter', sans-serif",
              }}>📥 Export CSV</a>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Inter', sans-serif" }}>
                <thead>
                  <tr style={{ background: 'rgba(249,115,22,0.05)' }}>
                    {['Plat', 'Jenis', 'Masuk', 'Keluar', 'Durasi', 'Total Bayar'].map(h => (
                      <th key={h} style={{
                        padding: '12px 14px', textAlign: 'left', fontSize: '11px',
                        fontWeight: 600, color: '#6B7280', textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>
                        Memuat data...
                      </td>
                    </tr>
                  ) : data?.data?.length > 0 ? data.data.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(249,115,22,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '12px 14px', fontWeight: 600, fontSize: '13px' }}>{item.plat_nomor}</td>
                      <td style={{ padding: '12px 14px' }}><VehicleBadge jenis={item.jenis} /></td>
                      <td style={{ padding: '12px 14px', fontSize: '12px', color: '#6B7280' }}>{formatWaktu(item.waktu_masuk)}</td>
                      <td style={{ padding: '12px 14px', fontSize: '12px', color: '#6B7280' }}>{formatWaktu(item.waktu_keluar)}</td>
                      <td style={{ padding: '12px 14px', fontSize: '12px', color: '#374151' }}>{formatDurasi(item.durasi_menit)}</td>
                      <td style={{ padding: '12px 14px', fontSize: '13px', fontWeight: 600, color: '#F97316' }}>
                        {formatRupiah(item.total_bayar)}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} style={{
                        padding: '40px', textAlign: 'center', color: '#9CA3AF',
                        fontFamily: "'Inter', sans-serif", fontSize: '14px',
                      }}>📋 Belum ada riwayat parkir</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            background: 'rgba(59,130,246,0.06)', borderRadius: '16px',
            border: '1px solid rgba(59,130,246,0.15)', padding: '20px',
          }}>
            <h3 style={{
              fontFamily: "'Poppins', sans-serif", fontSize: '14px', fontWeight: 600,
              color: '#3B82F6', marginBottom: '12px',
            }}>📌 Info</h3>
            <ul style={{
              listStyle: 'none', padding: 0, margin: 0,
              fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#6B7280',
              display: 'flex', flexDirection: 'column', gap: '8px',
            }}>
              <li>• Gunakan filter untuk mencari transaksi</li>
              <li>• Export CSV untuk laporan</li>
              <li>• Chart menampilkan 7 hari terakhir</li>
            </ul>
          </div>

          {/* Aksi Cepat */}
          <div style={{
            background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(16px)', borderRadius: '16px',
            border: '1px solid rgba(0,0,0,0.06)', padding: '20px',
          }}>
            <h3 style={{
              fontFamily: "'Poppins', sans-serif", fontSize: '14px', fontWeight: 600,
              color: '#111827', marginBottom: '12px',
            }}>⚡ Aksi Cepat</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link to="/masuk" style={{
                textDecoration: 'none', padding: '12px', borderRadius: '10px',
                background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
                color: '#16A34A', fontWeight: 600, fontSize: '13px', textAlign: 'center',
              }}>🅿️ Parkir Masuk</Link>
              <Link to="/keluar" style={{
                textDecoration: 'none', padding: '12px', borderRadius: '10px',
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                color: '#EF4444', fontWeight: 600, fontSize: '13px', textAlign: 'center',
              }}>🚗 Parkir Keluar</Link>
            </div>
          </div>
        </div>
      </div>

      <BottomBar />
    </div>
  );
}
