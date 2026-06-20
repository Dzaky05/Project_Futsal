import React, { useState } from 'react';
import { User, Mail, Phone, Lock, Save, Loader2, ShieldCheck } from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

export default function Profile() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    current_password: '',
    password: '',
    password_confirmation: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const response = await api.put('/profile', formData);
      toast.success('Profil berhasil diperbarui!');
      
      // Update local storage and user state
      const updatedUser = response.data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      // Clear password fields
      setFormData(prev => ({
        ...prev,
        current_password: '',
        password: '',
        password_confirmation: ''
      }));
      
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
        toast.error('Gagal memperbarui profil. Silakan periksa kembali data Anda.');
      } else {
        toast.error(err.response?.data?.message || 'Terjadi kesalahan pada server.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '24px', fontWeight: '700', color: 'var(--green-900)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User color="#8b5cf6" size={28} /> Profil Saya
        </h1>
        <p style={{ color: 'var(--gray-500)', fontSize: '14px', marginTop: '4px' }}>
          Kelola informasi akun Anda
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div className="card">
          <form onSubmit={handleSubmit}>
            <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '18px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={20} color="#8b5cf6" /> Informasi Pribadi
            </h3>

            <div className="form-group">
              <label className="form-label">Nama Lengkap</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#8b5cf6' }}><User size={18} /></span>
                <input 
                  type="text" 
                  name="name"
                  className="form-input" 
                  style={{ paddingLeft: '40px' }}
                  value={formData.name} 
                  onChange={handleChange}
                  required 
                />
              </div>
              {errors.name && <p className="form-error">{errors.name[0]}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#3b82f6' }}><Mail size={18} /></span>
                <input 
                  type="email" 
                  name="email"
                  className="form-input" 
                  style={{ paddingLeft: '40px' }}
                  value={formData.email} 
                  onChange={handleChange}
                  required 
                />
              </div>
              {errors.email && <p className="form-error">{errors.email[0]}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">No. Handphone</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#10b981' }}><Phone size={18} /></span>
                <input 
                  type="text" 
                  name="phone"
                  className="form-input" 
                  style={{ paddingLeft: '40px' }}
                  value={formData.phone} 
                  onChange={handleChange}
                  placeholder="08123456789"
                />
              </div>
              {errors.phone && <p className="form-error">{errors.phone[0]}</p>}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--gray-200)', margin: '24px 0' }} />

            <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '18px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={20} color="#f59e0b" /> Ubah Password (Opsional)
            </h3>

            <div className="form-group">
              <label className="form-label">Password Saat Ini</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#f59e0b' }}><Lock size={18} /></span>
                <input 
                  type="password" 
                  name="current_password"
                  className="form-input" 
                  style={{ paddingLeft: '40px' }}
                  value={formData.current_password} 
                  onChange={handleChange}
                  placeholder="Masukkan jika ingin mengubah password"
                />
              </div>
              {errors.current_password && <p className="form-error">{errors.current_password[0]}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Password Baru</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#f59e0b' }}><Lock size={18} /></span>
                <input 
                  type="password" 
                  name="password"
                  className="form-input" 
                  style={{ paddingLeft: '40px' }}
                  value={formData.password} 
                  onChange={handleChange}
                  placeholder="Minimal 6 karakter"
                />
              </div>
              {errors.password && <p className="form-error">{errors.password[0]}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Konfirmasi Password Baru</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#f59e0b' }}><Lock size={18} /></span>
                <input 
                  type="password" 
                  name="password_confirmation"
                  className="form-input" 
                  style={{ paddingLeft: '40px' }}
                  value={formData.password_confirmation} 
                  onChange={handleChange}
                  placeholder="Ulangi password baru"
                />
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>

        <div className="card" style={{ height: 'fit-content' }}>
          <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            Informasi Akun
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--green-500), var(--green-700))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: '24px', fontWeight: '700'
            }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: '600', fontSize: '18px', margin: 0 }}>{user?.name}</p>
              <p style={{ color: 'var(--gray-500)', fontSize: '14px', margin: 0 }}>{user?.email}</p>
              <span className={`badge ${user?.role === 'admin' ? 'badge-confirmed' : 'badge-completed'}`} style={{ marginTop: '8px' }}>
                {user?.role === 'admin' ? 'Admin' : 'Member'}
              </span>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--gray-500)', lineHeight: '1.6' }}>
            Pastikan email yang Anda gunakan selalu aktif. Email ini akan digunakan untuk mengirimkan notifikasi penting seperti bukti pemesanan lapangan (E-Ticket) dan konfirmasi pembayaran.
          </p>
        </div>
      </div>
    </div>
  );
}
