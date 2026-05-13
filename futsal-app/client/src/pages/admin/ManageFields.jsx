import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { formatRupiah } from '../../utils/auth';
import Modal from '../../components/Modal';

export default function ManageFields() {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showHours, setShowHours] = useState(null);
  const [hours, setHours] = useState([]);
  const [formData, setFormData] = useState({
    name: '', description: '', price_per_hour: '', facilities: '', is_active: true
  });

  const fetchFields = () => {
    setLoading(true);
    api.get('/fields').then(res => {
      setFields(res.data.data || res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchFields(); }, []);

  const openForm = (field = null) => {
    if (field) {
      setEditing(field.id);
      setFormData({
        name: field.name, description: field.description || '',
        price_per_hour: field.price_per_hour,
        facilities: Array.isArray(JSON.parse(field.facilities || '[]')) ? JSON.parse(field.facilities || '[]').join(', ') : '',
        is_active: field.is_active !== false
      });
    } else {
      setEditing(null);
      setFormData({ name: '', description: '', price_per_hour: '', facilities: '', is_active: true });
    }
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      facilities: JSON.stringify(formData.facilities.split(',').map(s => s.trim()).filter(Boolean))
    };
    try {
      if (editing) {
        await api.put(`/admin/fields/${editing}`, payload);
      } else {
        await api.post('/admin/fields', payload);
      }
      setShowForm(false);
      fetchFields();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan');
    }
  };

  const openHours = async (fieldId) => {
    try {
      const res = await api.get(`/operational-hours/${fieldId}`);
      setHours(res.data.data || res.data);
      setShowHours(fieldId);
    } catch {
      alert('Gagal memuat jam operasional');
    }
  };

  const updateHour = (idx, key, val) => {
    const updated = [...hours];
    updated[idx] = { ...updated[idx], [key]: val };
    setHours(updated);
  };

  const saveHours = async () => {
    try {
      await api.put(`/admin/operational-hours/${showHours}`, { hours });
      alert('Jam operasional berhasil disimpan!');
      setShowHours(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan');
    }
  };

  const dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '24px', fontWeight: '700', color: 'var(--green-900)' }}>
            ⚽ Kelola Lapangan
          </h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '14px', marginTop: '4px' }}>Tambah dan edit lapangan futsal</p>
        </div>
        <button className="btn btn-primary" onClick={() => openForm()}>+ Tambah Lapangan</button>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner"></div></div>
      ) : fields.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px', color: 'var(--gray-400)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚽</div>
          <p>Belum ada lapangan. Tambahkan sekarang!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {fields.map(field => {
            let facilities = [];
            try { facilities = JSON.parse(field.facilities || '[]'); } catch {}
            return (
              <div key={field.id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{
                  background: 'linear-gradient(135deg, var(--green-700), var(--green-500))',
                  padding: '20px', color: 'white'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>
                        ⚽ {field.name}
                      </h3>
                      <p style={{ opacity: 0.85, fontSize: '13px' }}>{field.description || 'Lapangan futsal'}</p>
                    </div>
                    <span className="badge" style={{
                      background: field.is_active !== false ? 'rgba(255,255,255,0.25)' : 'rgba(239,68,68,0.3)',
                      color: 'white', fontSize: '10px'
                    }}>
                      {field.is_active !== false ? 'AKTIF' : 'NONAKTIF'}
                    </span>
                  </div>
                </div>
                <div style={{ padding: '16px' }}>
                  <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--green-700)', fontFamily: "'Poppins', sans-serif", marginBottom: '10px' }}>
                    {formatRupiah(field.price_per_hour)}<span style={{ fontSize: '13px', fontWeight: '400', color: 'var(--gray-400)' }}>/jam</span>
                  </div>
                  {facilities.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                      {facilities.map((f, i) => (
                        <span key={i} style={{
                          fontSize: '11px', padding: '3px 10px', borderRadius: '12px',
                          background: 'var(--green-50)', color: 'var(--green-700)', border: '1px solid var(--green-200)'
                        }}>{f}</span>
                      ))}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => openForm(field)}>✏️ Edit</button>
                    <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => openHours(field.id)}>🕐 Jam</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Field Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Lapangan' : 'Tambah Lapangan'}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nama Lapangan</label>
            <input className="form-input" required placeholder="Lapangan A" value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Deskripsi</label>
            <textarea className="form-input form-textarea" placeholder="Deskripsi lapangan..."
              value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Harga per Jam (Rp)</label>
            <input type="number" className="form-input" required placeholder="100000" value={formData.price_per_hour}
              onChange={e => setFormData({ ...formData, price_per_hour: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Fasilitas (pisahkan koma)</label>
            <input className="form-input" placeholder="WiFi, Parkir, Kamar Mandi" value={formData.facilities}
              onChange={e => setFormData({ ...formData, facilities: e.target.value })} />
          </div>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={formData.is_active}
                onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
              <span className="form-label" style={{ margin: 0 }}>Aktif</span>
            </label>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            {editing ? '💾 Simpan Perubahan' : '➕ Tambah Lapangan'}
          </button>
        </form>
      </Modal>

      {/* Operational Hours Modal */}
      <Modal isOpen={!!showHours} onClose={() => setShowHours(null)} title="Jam Operasional">
        <div style={{ fontSize: '14px' }}>
          {hours.length === 0 ? (
            <p style={{ color: 'var(--gray-400)', textAlign: 'center', padding: '20px' }}>
              Belum ada jam operasional. Jalankan seeder untuk membuat data default.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {hours.map((h, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '10px',
                  borderRadius: 'var(--radius-sm)',
                  background: h.is_open ? 'var(--green-50)' : 'var(--gray-50)',
                  border: `1px solid ${h.is_open ? 'var(--green-200)' : 'var(--gray-200)'}`
                }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', minWidth: '110px' }}>
                    <input type="checkbox" checked={h.is_open}
                      onChange={e => updateHour(i, 'is_open', e.target.checked)} />
                    <span style={{ fontWeight: '500', fontSize: '13px' }}>{dayNames[h.day_of_week] || `Hari ${h.day_of_week}`}</span>
                  </label>
                  {h.is_open && (
                    <>
                      <input type="time" className="form-input" style={{ width: '110px', padding: '6px 8px', fontSize: '13px' }}
                        value={h.open_time?.slice(0,5) || ''} onChange={e => updateHour(i, 'open_time', e.target.value)} />
                      <span style={{ color: 'var(--gray-400)' }}>-</span>
                      <input type="time" className="form-input" style={{ width: '110px', padding: '6px 8px', fontSize: '13px' }}
                        value={h.close_time?.slice(0,5) || ''} onChange={e => updateHour(i, 'close_time', e.target.value)} />
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
          {hours.length > 0 && (
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }} onClick={saveHours}>
              💾 Simpan Jam Operasional
            </button>
          )}
        </div>
      </Modal>
    </div>
  );
}
