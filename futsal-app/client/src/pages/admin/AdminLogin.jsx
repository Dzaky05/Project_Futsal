import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { saveAuth } from '../../utils/auth';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/admin/login', { email, password });
      const data = res.data;
      saveAuth(data.token, data.user);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal. Periksa email dan password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #14532d 0%, #166534 40%, #15803d 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', fontFamily: "'Inter', sans-serif"
    }}>
      <div className="auth-card" style={{
        width: '100%', maxWidth: '380px',
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(24px)',
        borderRadius: '22px', border: '1px solid rgba(255,255,255,0.3)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)', padding: '40px 32px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #16a34a, #22c55e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: '28px', boxShadow: '0 8px 24px rgba(22,163,74,0.3)'
          }}>🛡️</div>
          <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '22px', fontWeight: '700', color: 'var(--green-900)', marginBottom: '4px' }}>
            Admin Panel
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--gray-500)' }}>FutsalGo Management System</p>
        </div>

        {error && (
          <div style={{
            padding: '12px 16px', background: 'var(--red-100)', borderRadius: 'var(--radius-md)',
            color: '#991b1b', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" placeholder="admin@futsalgo.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-input" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}
            style={{ width: '100%', marginTop: '8px' }}>
            {loading ? (
              <><div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></div> Masuk...</>
            ) : 'Masuk sebagai Admin'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button onClick={() => navigate('/login')} style={{
            background: 'none', border: 'none', color: 'var(--green-600)',
            cursor: 'pointer', fontSize: '13px', fontWeight: '500'
          }}>← Kembali ke Login User</button>
        </div>
      </div>
    </div>
  );
}
