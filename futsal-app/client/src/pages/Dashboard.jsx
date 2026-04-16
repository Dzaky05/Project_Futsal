import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../api/parking';
import StatCard from '../components/StatCard';
import VehicleBadge from '../components/VehicleBadge';
import BottomBar from '../components/BottomBar';
import { formatDurasi, formatWaktu } from '../utils/format';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [clock, setClock] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      const res = await getDashboard();
      setData(res.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengambil data dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatClock = (d) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{
          width: '40px', height: '40px', border: '4px solid rgba(249,115,22,0.2)',
          borderTopColor: '#F97316', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '12px', padding: '16px', color: '#DC2626',
          fontFamily: "'Inter', sans-serif", fontSize: '14px',
        }}>⚠️ {error}</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px', paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '24px', flexWrap: 'wrap', gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #F97316, #FB923C)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: '20px',
            fontFamily: "'Poppins', sans-serif",
            boxShadow: '0 4px 16px rgba(249,115,22,0.35)',
          }}>P</div>
          <div>
            <h1 style={{
              fontFamily: "'Poppins', sans-serif", fontSize: '22px', fontWeight: 700,
              color: '#111827', margin: 0,
            }}>Dashboard Parkir</h1>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#9CA3AF', margin: 0 }}>
              Monitoring real-time area parkir
            </p>
          </div>
        </div>
        <div style={{
          background: 'rgba(249,115,22,0.08)', borderRadius: '12px',
          padding: '10px 20px', fontFamily: "'Poppins', sans-serif",
          fontSize: '22px', fontWeight: 600, color: '#F97316',
          letterSpacing: '2px', border: '1px solid rgba(249,115,22,0.2)',
        }}>
          🕐 {formatClock(clock)}
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px', marginBottom: '28px',
      }}>
        <StatCard label="Kendaraan Aktif" value={data?.kendaraan_aktif || 0} icon="🚘" color="orange" />
        <StatCard label="Mobil" value={data?.jumlah_mobil || 0} icon="🚗" color="blue" />
        <StatCard label="Motor" value={data?.jumlah_motor || 0} icon="🏍️" color="green" />
        <StatCard label="Kapasitas Tersedia" value={data?.kapasitas_tersedia || 0} icon="📍" color="purple" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start' }}>
        {/* Table */}
        <div style={{
          background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(16px)',
          borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)',
          overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        }}>
          <div style={{
            padding: '18px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <h2 style={{
              fontFamily: "'Poppins', sans-serif", fontSize: '16px', fontWeight: 600,
              color: '#111827', margin: 0,
            }}>Kendaraan di Area Parkir</h2>
            <span style={{
              background: 'rgba(249,115,22,0.1)', color: '#F97316',
              padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
            }}>{data?.kendaraan_aktif || 0} kendaraan</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Inter', sans-serif" }}>
              <thead>
                <tr style={{ background: 'rgba(249,115,22,0.05)' }}>
                  {['Plat Nomor', 'Jenis', 'Waktu Masuk', 'Durasi', 'Status'].map(h => (
                    <th key={h} style={{
                      padding: '12px 16px', textAlign: 'left', fontSize: '12px',
                      fontWeight: 600, color: '#6B7280', textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data?.list_aktif?.length > 0 ? data.list_aktif.map((item, i) => (
                  <tr key={item.id} style={{
                    borderBottom: '1px solid rgba(0,0,0,0.04)',
                    transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(249,115,22,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 16px', fontWeight: 600, fontSize: '14px', color: '#111827' }}>
                      {item.plat_nomor}
                    </td>
                    <td style={{ padding: '14px 16px' }}><VehicleBadge jenis={item.jenis} /></td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#6B7280' }}>
                      {formatWaktu(item.waktu_masuk)}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#374151', fontWeight: 500 }}>
                      {formatDurasi(item.durasi_menit)}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '4px 12px', borderRadius: '20px', fontSize: '11px',
                        fontWeight: 600, background: 'rgba(249,115,22,0.1)',
                        color: '#F97316', border: '1px solid rgba(249,115,22,0.25)',
                      }}>Aktif</span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} style={{
                      padding: '40px', textAlign: 'center', color: '#9CA3AF',
                      fontFamily: "'Inter', sans-serif", fontSize: '14px',
                    }}>
                      🅿️ Tidak ada kendaraan di area parkir
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar - Aksi Cepat */}
        <div style={{
          background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(16px)',
          borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)',
          padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        }}>
          <h3 style={{
            fontFamily: "'Poppins', sans-serif", fontSize: '15px', fontWeight: 600,
            color: '#111827', marginBottom: '16px',
          }}>⚡ Aksi Cepat</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { to: '/masuk', label: 'Parkir Masuk', icon: '🅿️', color: '#22C55E', desc: 'Input kendaraan baru' },
              { to: '/keluar', label: 'Parkir Keluar', icon: '🚗', color: '#EF4444', desc: 'Proses keluar & bayar' },
              { to: '/riwayat', label: 'Riwayat Parkir', icon: '📋', color: '#3B82F6', desc: 'Lihat histori transaksi' },
            ].map(item => (
              <Link key={item.to} to={item.to} style={{
                textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '14px',
                borderRadius: '12px',
                background: `${item.color}08`,
                border: `1.5px solid ${item.color}25`,
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateX(4px)';
                  e.currentTarget.style.borderColor = `${item.color}60`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.borderColor = `${item.color}25`;
                }}
              >
                <span style={{ fontSize: '20px' }}>{item.icon}</span>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '13px', color: '#111827', margin: 0 }}>{item.label}</p>
                  <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0 }}>{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <BottomBar />
    </div>
  );
}
