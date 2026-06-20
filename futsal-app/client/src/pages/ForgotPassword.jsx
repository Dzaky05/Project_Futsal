import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Lock } from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await api.post('/forgot-password', { email });
      setMessage(res.data.message || 'Link reset password telah dikirim. Periksa email Anda.');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim link reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(145deg, #dcfce7 0%, #f0fdf4 30%, #ffffff 60%, #bbf7d0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: "'Inter', sans-serif" }}>
      <div className="auth-card" style={{ width: '100%', maxWidth: '380px', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(24px)', borderRadius: '22px', border: '1.5px solid rgba(134,239,172,0.4)', boxShadow: '0 8px 40px rgba(22,163,74,0.12)', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', borderRadius: '18px', background: 'rgba(22,163,74,0.15)', margin: '0 auto 12px', color: '#16a34a' }}>
            <Lock size={28} />
          </div>
          <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '22px', fontWeight: '700', color: '#14532d' }}>Lupa Password</h1>
          <p style={{ fontSize: '13px', color: '#4b5563', marginTop: '8px' }}>Masukkan email untuk menerima link reset password.</p>
        </div>

        {error && <div style={{ marginBottom: '16px', padding: '12px 14px', borderRadius: '12px', background: '#fee2e2', color: '#b91c1c' }}>{error}</div>}
        {message && <div style={{ marginBottom: '16px', padding: '12px 14px', borderRadius: '12px', background: '#dcfce7', color: '#166534' }}>{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" placeholder="name@gmail.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', marginTop: '12px' }}>
            {loading ? 'Mengirim...' : 'Kirim Link Reset'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', color: '#6b7280', fontSize: '13px' }}>
          <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: '#16a34a', cursor: 'pointer', fontWeight: '600' }}>Kembali ke Login</button>
        </div>
      </div>
    </div>
  );
}
