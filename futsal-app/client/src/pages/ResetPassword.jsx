import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { Key } from 'lucide-react';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    const emailParam = searchParams.get('email');
    if (tokenParam) setToken(tokenParam);
    if (emailParam) setEmail(emailParam);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Password tidak cocok.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await api.post('/reset-password', {
        token,
        email,
        password,
        password_confirmation: confirmPassword,
      });
      setMessage(res.data.message || 'Password telah diperbarui. Silakan login.');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mereset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(145deg, #dcfce7 0%, #f0fdf4 30%, #ffffff 60%, #bbf7d0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: "'Inter', sans-serif" }}>
      <div className="auth-card" style={{ width: '100%', maxWidth: '420px', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(24px)', borderRadius: '22px', border: '1.5px solid rgba(134,239,172,0.4)', boxShadow: '0 8px 40px rgba(22,163,74,0.12)', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', borderRadius: '18px', background: 'rgba(22,163,74,0.15)', margin: '0 auto 12px', color: '#16a34a' }}>
            <Key size={28} />
          </div>
          <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '22px', fontWeight: '700', color: '#14532d' }}>Reset Password</h1>
          <p style={{ fontSize: '13px', color: '#4b5563', marginTop: '8px' }}>Masukkan password baru untuk akun Anda.</p>
        </div>

        {error && <div style={{ marginBottom: '16px', padding: '12px 14px', borderRadius: '12px', background: '#fee2e2', color: '#b91c1c' }}>{error}</div>}
        {message && <div style={{ marginBottom: '16px', padding: '12px 14px', borderRadius: '12px', background: '#dcfce7', color: '#166534' }}>{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" placeholder="name@gmail.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Token Reset</label>
            <input type="text" className="form-input" placeholder="Token reset" value={token} onChange={e => setToken(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password Baru</label>
            <input type="password" className="form-input" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Konfirmasi Password</label>
            <input type="password" className="form-input" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', marginTop: '12px' }}>
            {loading ? 'Memperbarui...' : 'Reset Password'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', color: '#6b7280', fontSize: '13px' }}>
          <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: '#16a34a', cursor: 'pointer', fontWeight: '600' }}>Kembali ke Login</button>
        </div>
      </div>
    </div>
  );
}
