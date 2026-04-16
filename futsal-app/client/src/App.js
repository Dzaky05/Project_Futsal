import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';



axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://127.0.0.1:8000';

// =============================================
// LOGIN / REGISTER COMPONENT (preserved from original)
// =============================================

const Logo = () => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="18" r="17" stroke="url(#logoGrad)" strokeWidth="2" fill="none" />
        <circle cx="18" cy="18" r="10" fill="url(#logoGrad)" opacity="0.15" />
        <polygon points="18,8 22,13 20,19 16,19 14,13" fill="url(#logoGrad)" />
        <polygon points="22,13 28,13 30,19 25,23 20,19" fill="url(#logoGrad)" opacity="0.7" />
        <polygon points="14,13 16,19 11,23 6,19 8,13" fill="url(#logoGrad)" opacity="0.7" />
        <polygon points="20,19 25,23 23,28 13,28 11,23 16,19" fill="url(#logoGrad)" opacity="0.5" />
        <defs>
          <linearGradient id="logoGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
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
      Book Your Arena
    </span>
  </div>
);

const SocialButton = ({ icon, label }) => (
  <button style={{
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "7px",
    background: "rgba(255,255,255,0.9)",
    border: "1.5px solid rgba(134,239,172,0.4)",
    borderRadius: "9px",
    cursor: "pointer",
    fontSize: "11px",
    color: "#374151",
    fontFamily: "'Inter', sans-serif",
    fontWeight: "500",
    transition: "all 0.2s ease",
    backdropFilter: "blur(8px)"
  }}
    onMouseEnter={e => {
      e.currentTarget.style.background = "rgba(255,255,255,1)";
      e.currentTarget.style.borderColor = "#22c55e";
      e.currentTarget.style.transform = "translateY(-1px)";
      e.currentTarget.style.boxShadow = "0 4px 12px rgba(34,197,94,0.2)";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = "rgba(255,255,255,0.9)";
      e.currentTarget.style.borderColor = "rgba(134,239,172,0.4)";
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "none";
    }}
  >
    {icon}
  </button>
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

function FutsalLogin() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    try {
      if (mode === "login") {
        const res = await axios.post("/api/login", { email, password });
        localStorage.setItem("user", JSON.stringify(res.data));
        alert("Login berhasil! ✅");
      } else {
        if (password !== confirmPassword) return alert("Password tidak cocok!");

        await axios.post("/api/register", {
          name: name,
          email: email,
          password: password,
          password_confirmation: confirmPassword
        });
        alert("Registrasi berhasil! Silakan login ✅");
        setMode("login");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Koneksi Error: Periksa terminal Laravel!");
    }
  };

  const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );

  const FacebookIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );

  const TwitterIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1DA1F2">
      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
    </svg>
  );

  return (
    <>
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

          {mode === "register" && (
            <button
              onClick={() => setMode("login")}
              style={{
                position: "absolute", top: "20px", left: "20px",
                background: "rgba(134,239,172,0.2)",
                border: "none", borderRadius: "10px",
                width: "32px", height: "32px",
                cursor: "pointer", color: "#16a34a"
              }}
            >
              ←
            </button>
          )}

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
            {mode === "login" ? "Login to your Account" : "Create your Account"}
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {mode === "register" && (
              <div className="field-row">
                <InputField type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />
              </div>
            )}
            <div className="field-row">
              <InputField type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="field-row">
              <InputField type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            {mode === "register" && (
              <div className="field-row">
                <InputField
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            onClick={handleSubmit}
            style={{
              width: "100%",
              marginTop: "20px",
              padding: "12px",
              background: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
              border: "none",
              borderRadius: "10px",
              color: "white",
              fontSize: "14px",
              fontWeight: "600",
              fontFamily: "'Poppins', sans-serif",
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(22,163,74,0.35)",
              transition: "0.3s"
            }}
          >
            {mode === "login" ? "Sign in" : "Sign up"}
          </button>

          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            margin: "20px 0", color: "#9ca3af",
            fontSize: "11px", fontWeight: "500"
          }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(134,239,172,0.5)" }} />
            <span>Or continue with</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(134,239,172,0.5)" }} />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <SocialButton icon={<GoogleIcon />} />
            <SocialButton icon={<FacebookIcon />} />
            <SocialButton icon={<TwitterIcon />} />
          </div>

          <p style={{
            textAlign: "center",
            marginTop: "20px",
            fontSize: "12px",
            color: "#6b7280"
          }}>
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              style={{
                background: "none", border: "none",
                color: "#16a34a", fontWeight: "450",
                cursor: "pointer"
              }}
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </>
  );
}



// =============================================
// APP ROUTER
// =============================================

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login / Register */}
        <Route path="/" element={<FutsalLogin />} />
        <Route path="/login" element={<FutsalLogin />} />



        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}