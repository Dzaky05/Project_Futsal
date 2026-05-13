import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { formatRupiah, PAYMENT_METHODS } from '../../utils/auth';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function FinancialReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setLoading(true);
    api.get('/admin/reports/monthly', { params: { month, year } })
      .then(res => { setReport(res.data.data || res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [month, year]);

  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const COLORS = ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0'];

  const chartData = report?.daily_revenue ? Object.entries(report.daily_revenue).map(([day, val]) => ({
    day: day.split('-').pop(),
    revenue: val
  })) : [];

  const methodData = report?.by_method ? Object.entries(report.by_method).map(([method, val]) => ({
    name: PAYMENT_METHODS[method]?.label || method,
    value: val
  })) : [];

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '24px', fontWeight: '700', color: 'var(--green-900)' }}>
            📈 Laporan Keuangan
          </h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '14px', marginTop: '4px' }}>
            Laporan pendapatan {monthNames[month - 1]} {year}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select className="form-input" style={{ width: '140px' }} value={month}
            onChange={e => setMonth(Number(e.target.value))}>
            {monthNames.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
          <select className="form-input" style={{ width: '100px' }} value={year}
            onChange={e => setYear(Number(e.target.value))}>
            {[2024, 2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={() => {
            window.open(`http://127.0.0.1:8000/api/admin/reports/export-pdf?month=${month}&year=${year}`, '_blank');
          }}>📄 Export PDF</button>
        </div>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner"></div></div>
      ) : !report ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px', color: 'var(--gray-400)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          <p>Belum ada data untuk periode ini</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'var(--green-200)' }}>💰</div>
              <div className="stat-value">{formatRupiah(report.total_revenue || 0)}</div>
              <div className="stat-label">Total Pendapatan</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#bfdbfe' }}>📋</div>
              <div className="stat-value">{report.total_bookings || 0}</div>
              <div className="stat-label">Total Booking</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#d1fae5' }}>✅</div>
              <div className="stat-value">{report.completed_bookings || 0}</div>
              <div className="stat-label">Booking Selesai</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#fecaca' }}>❌</div>
              <div className="stat-value">{report.cancelled_bookings || 0}</div>
              <div className="stat-label">Dibatalkan</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '24px' }} className="two-col">
            {/* Daily Revenue Chart */}
            <div className="card">
              <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '16px', fontWeight: '600', color: 'var(--green-800)', marginBottom: '20px' }}>
                📊 Pendapatan Harian
              </h3>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="day" fontSize={11} stroke="#9ca3af" />
                    <YAxis fontSize={11} stroke="#9ca3af" tickFormatter={v => `${(v/1000)}k`} />
                    <Tooltip
                      formatter={(value) => [formatRupiah(value), 'Pendapatan']}
                      contentStyle={{ borderRadius: '10px', border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    />
                    <Bar dataKey="revenue" fill="url(#barGrad)" radius={[4, 4, 0, 0]} />
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" />
                        <stop offset="100%" stopColor="#16a34a" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--gray-400)' }}>Belum ada data</div>
              )}
            </div>

            {/* Payment Method Pie */}
            <div className="card">
              <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '16px', fontWeight: '600', color: 'var(--green-800)', marginBottom: '20px' }}>
                💳 Metode Pembayaran
              </h3>
              {methodData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={methodData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={false}>
                        {methodData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [formatRupiah(value), 'Jumlah']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                    {methodData.map((m, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: COLORS[i % COLORS.length] }}></div>
                        <span style={{ color: 'var(--gray-600)', flex: 1 }}>{m.name}</span>
                        <span style={{ fontWeight: '600', color: 'var(--gray-800)' }}>{formatRupiah(m.value)}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-400)', fontSize: '13px' }}>Belum ada data</div>
              )}
            </div>
          </div>

          {/* Transactions Table */}
          {report.transactions && report.transactions.length > 0 && (
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ padding: '20px 20px 0' }}>
                <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '16px', fontWeight: '600', color: 'var(--green-800)' }}>
                  📝 Transaksi Bulan Ini
                </h3>
              </div>
              <div style={{ overflowX: 'auto', padding: '16px 0 0' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th><th>Pemesan</th><th>Lapangan</th><th>Tanggal</th><th>Metode</th><th>Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.transactions.map(t => (
                      <tr key={t.id}>
                        <td style={{ fontWeight: '600' }}>#{t.id}</td>
                        <td>{t.user?.name || '-'}</td>
                        <td>{t.booking?.field?.name || '-'}</td>
                        <td>{t.payment_date || '-'}</td>
                        <td>{PAYMENT_METHODS[t.payment_method]?.label || t.payment_method}</td>
                        <td style={{ fontWeight: '600', color: 'var(--green-700)' }}>{formatRupiah(t.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
