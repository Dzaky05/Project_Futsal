import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { saveAuth } from '../../utils/auth';
import { ShieldCheck } from 'lucide-react';

const Logo = () => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="18" r="17" stroke="url(#logoGradAdmin)" strokeWidth="2" fill="none" />
        <circle cx="18" cy="18" r="10" fill="url(#logoGradAdmin)" opacity="0.15" />
        <polygon points="18,8 22,13 20,19 16,19 14,13" fill="url(#logoGradAdmin)" />
        <polygon points="22,13 28,13 30,19 25,23 20,19" fill="url(#logoGradAdmin)" opacity="0.7" />
        <polygon points="14,13 16,19 11,23 6,19 8,13" fill="url(#logoGradAdmin)" opacity="0.7" />
        <polygon points="20,19 25,23 23,28 13,28 11,23 16,19" fill="url(#logoGradAdmin)" opacity="0.5" />
        <defs>
          <linearGradient id="logoGradAdmin" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
        </defs>
      </svg>
      <span style={{
        fontFamily: "'Poppins', sans-serif",
        fontSize: "26px",
        fontWeight: "700",
        background: "linear-gradient(135deg, #16a34a 0%, #22c55e 60%, #4ade80 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        letterSpacing: "-0.5px"
      }}>
        FutsalGo
      </span>
    </div>
    <span style={{
      fontFamily: "'Inter', sans-serif",
      fontSize: "11px",
      letterSpacing: "3px",
      textTransform: "uppercase",
      color: "#16a34a",
      fontWeight: "600"
    }}>
      Admin Panel
    </span>
  </div>
);

const InputField = ({ type, placeholder, value, onChange }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          padding: "10px 12px",
          background: focused ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.75)",
          border: `1.5px solid ${focused ? "#22c55e" : "rgba(134,239,172,0.35)"}`,
          borderRadius: "8px",
          fontSize: "13px",
          fontFamily: "'Inter', sans-serif",
          color: "#1a2e1a",
          outline: "none",
          transition: "all 0.25s ease",
          boxSizing: "border-box",
          boxShadow: focused ? "0 0 0 3px rgba(34,197,94,0.12)" : "none",
          backdropFilter: "blur(8px)"
        }}
      />
    </div>
  );
};

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
      minHeight: "100vh",
      background: "linear-gradient(145deg, #dcfce7 0%, #f0fdf4 30%, #ffffff 60%, #bbf7d0 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      fontFamily: "'Inter', sans-serif",
      position: "relative",
      overflow: "hidden"
    }}>

      {/* Pitch lines background - same as user login */}
      <div className="pitch-lines">
        <svg width="100%" height="100%" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" style={{ opacity: 0.06 }}>
          <rect x="100" y="100" width="1000" height="600" rx="40" fill="none" stroke="#16a34a" strokeWidth="3" />
          <line x1="600" y1="100" x2="600" y2="700" stroke="#16a34a" strokeWidth="2" />
          <circle cx="600" cy="400" r="100" fill="none" stroke="#16a34a" strokeWidth="2" />
          <circle cx="600" cy="400" r="5" fill="#16a34a" />
          <rect x="100" y="275" width="120" height="250" rx="8" fill="none" stroke="#16a34a" strokeWidth="2" />
          <rect x="980" y="275" width="120" height="250" rx="8" fill="none" stroke="#16a34a" strokeWidth="2" />
        </svg>
      </div>

      <div className="auth-card" style={{
        width: "100%",
        maxWidth: "340px",
        background: "rgba(255,255,255,0.72)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderRadius: "22px",
        border: "1.5px solid rgba(134,239,172,0.4)",
        boxShadow: "0 8px 40px rgba(22,163,74,0.12), 0 2px 8px rgba(0,0,0,0.05)",
        padding: "32px 28px",
        position: "relative",
        zIndex: 1
      }}>

        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <Logo />
        </div>

        <h2 style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: "16px",
          fontWeight: "600",
          color: "#14532d",
          marginBottom: "16px",
          textAlign: "center"
        }}>
          Login sebagai Admin
        </h2>

        {error && (
          <div style={{
            padding: '12px 16px', background: 'var(--red-100)', borderRadius: 'var(--radius-md)',
            color: '#991b1b', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div className="field-row">
              <InputField type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="field-row">
              <InputField type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              marginTop: "20px",
              padding: "12px",
              background: loading ? "#86efac" : "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
              border: "none",
              borderRadius: "10px",
              color: "white",
              fontSize: "14px",
              fontWeight: "600",
              fontFamily: "'Poppins', sans-serif",
              cursor: loading ? "wait" : "pointer",
              boxShadow: "0 4px 16px rgba(22,163,74,0.35)",
              transition: "0.3s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}
          >
            {loading && <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>}
            <ShieldCheck size={18} /> Masuk sebagai Admin
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: "none", border: "none",
              color: "#16a34a", fontSize: "12px",
              cursor: "pointer", fontWeight: "500"
            }}
          >
            ← Kembali ke Login User
          </button>
        </div>
      </div>
    </div>
  );
}
