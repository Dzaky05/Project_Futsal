import React, { useState, useEffect } from 'react';
import api, { exportReportPdf } from '../../api/axios';
import { formatRupiah, PAYMENT_METHODS } from '../../utils/auth';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, FileText, Banknote, ClipboardList, CheckCircle, XCircle, CreditCard, BarChart3, Receipt } from 'lucide-react';

export default function FinancialReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setLoading(true);
    api.get('/admin/reports/monthly', { params: { month, year } })
      .then(res => {
        const data = res.data.data || res.data;
        setReport(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Report fetch error:', err);
        setReport(null);
        setLoading(false);
      });
  }, [month, year]);

  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const COLORS = ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0'];

  // Parse daily_revenue: could be object {date: amount} or array
  const chartData = (() => {
    if (!report?.daily_revenue) return [];
    const dr = report.daily_revenue;

    if (typeof dr === 'object' && !Array.isArray(dr)) {
      // Object format: { "2026-06-01": 150000, ... }
      return Object.entries(dr)
        .map(([date, val]) => ({
          day: parseInt(date.split('-').pop(), 10),
          revenue: Math.abs(Number(val)) || 0
        }))
        .filter(d => d.revenue !== 0)
        .sort((a, b) => a.day - b.day);
    }

    if (Array.isArray(dr)) {
      return dr.map(item => ({
        day: parseInt((item.date || '').split('-').pop(), 10),
        revenue: Math.abs(Number(item.total || item.revenue || 0))
      })).filter(d => d.revenue !== 0);
    }

    return [];
  })();

  // Parse by_method: could be { method: amount } or { method: { total, count } }
  const methodData = (() => {
    if (!report?.by_method) return [];
    const bm = report.by_method;

    return Object.entries(bm).map(([method, val]) => {
      const amount = Math.abs(typeof val === 'object' ? Number(val.total || 0) : Number(val || 0));
      return {
        name: PAYMENT_METHODS[method]?.label || method,
        value: amount
      };
    }).filter(d => d.value !== 0);
  })();

  const totalRevenue = Number(report?.total_revenue || 0);

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '24px', fontWeight: '700', color: 'var(--green-900)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp color="#2dd4bf" size={28} /> Laporan Keuangan
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
          <button className="btn btn-primary" onClick={() => exportReportPdf(month, year)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileText size={16} /> Export PDF
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner"></div></div>
      ) : !report ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px', color: 'var(--gray-400)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}><BarChart3 size={48} color="#d1d5db" /></div>
          <p>Belum ada data untuk periode ini</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'var(--green-200)' }}><Banknote size={24} color="#15803d" /></div>
              <div className="stat-value">{formatRupiah(Math.abs(totalRevenue))}</div>
              <div className="stat-label">Total Pendapatan</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#bfdbfe' }}><ClipboardList size={24} color="#1d4ed8" /></div>
              <div className="stat-value">{report.total_bookings || 0}</div>
              <div className="stat-label">Total Booking</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#d1fae5' }}><CheckCircle size={24} color="#16a34a" /></div>
              <div className="stat-value">{report.completed_bookings || 0}</div>
              <div className="stat-label">Booking Selesai</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#fecaca' }}><XCircle size={24} color="#dc2626" /></div>
              <div className="stat-value">{report.cancelled_bookings || 0}</div>
              <div className="stat-label">Dibatalkan</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '24px' }} className="two-col">
            {/* Daily Revenue Chart */}
            <div className="card">
              <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '16px', fontWeight: '600', color: 'var(--green-800)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BarChart3 size={18} /> Pendapatan Harian
              </h3>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="day" fontSize={11} stroke="#9ca3af" />
                    <YAxis fontSize={11} stroke="#9ca3af" tickFormatter={v => {
                      if (v >= 1000000) return `${(v / 1000000).toFixed(1)}jt`;
                      if (v >= 1000) return `${(v / 1000).toFixed(0)}rb`;
                      return v;
                    }} />
                    <Tooltip
                      formatter={(value) => [formatRupiah(value), 'Pendapatan']}
                      labelFormatter={(label) => `Tanggal ${label}`}
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
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--gray-400)' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}><BarChart3 size={36} color="#d1d5db" /></div>
                  <p>Belum ada pendapatan bulan ini</p>
                </div>
              )}
            </div>

            {/* Payment Method Pie */}
            <div className="card">
              <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '16px', fontWeight: '600', color: 'var(--green-800)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CreditCard size={18} /> Metode Pembayaran
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
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-400)', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}><CreditCard size={36} color="#d1d5db" /></div>
                  <p>Belum ada data pembayaran</p>
                </div>
              )}
            </div>
          </div>

          {/* Transactions Table */}
          {report.transactions && report.transactions.length > 0 && (
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ padding: '20px 20px 0' }}>
                <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '16px', fontWeight: '600', color: 'var(--green-800)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Receipt size={18} /> Transaksi Bulan Ini ({report.transactions.length} transaksi)
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
                        <td>{t.payment_date || t.booking?.booking_date || '-'}</td>
                        <td>{PAYMENT_METHODS[t.payment_method]?.label || t.payment_method}</td>
                        <td style={{ fontWeight: '600', color: 'var(--green-700)' }}>{formatRupiah(Math.abs(t.amount))}</td>
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
