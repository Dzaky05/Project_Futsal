import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { formatRupiah } from '../../utils/auth';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { toast } from 'react-hot-toast';
import { CircleDot, Plus, Pencil, Trash2, Save, Loader2, Image as ImageIcon } from 'lucide-react';

export default function ManageFields() {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '', description: '', price_per_hour: '', facilities: '', is_active: true
  });
  const [selectedImageName, setSelectedImageName] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

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
      setEditing(field);
      const facilitiesArray = Array.isArray(field.facilities) 
        ? field.facilities 
        : JSON.parse(field.facilities || '[]');
      setFormData({
        name: field.name, description: field.description || '',
        price_per_hour: field.price_per_hour,
        facilities: facilitiesArray.join(', '),
        is_active: field.is_active !== false
      });
      setSelectedImage(null);
      setSelectedImageName('');
    } else {
      setEditing(null);
      setFormData({ name: '', description: '', price_per_hour: '', facilities: '', is_active: true });
      setSelectedImage(null);
      setSelectedImageName('');
    }
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(k => {
        if (k === 'is_active') {
          data.append(k, formData[k] ? '1' : '0');
        } else if (k === 'facilities') {
          const facilitiesArray = formData[k] ? formData[k].split(',').map(f => f.trim()).filter(f => f) : [];
          if (facilitiesArray.length > 0) {
            facilitiesArray.forEach(f => data.append('facilities[]', f));
          } else {
            data.append('facilities[]', '');
          }
        } else {
          data.append(k, formData[k]);
        }
      });

      let fieldId;
      let successMsg = '';
      if (editing) {
        data.append('_method', 'PUT');
        await api.post(`/admin/fields/${editing.id}`, data);
        fieldId = editing.id;
        successMsg = 'Lapangan berhasil diupdate!';
      } else {
        const res = await api.post('/admin/fields', data);
        fieldId = res.data.field.id;
        successMsg = 'Lapangan berhasil ditambahkan!';
      }

      if (selectedImage) {
        const imgData = new FormData();
        imgData.append('image', selectedImage);
        await api.post(`/admin/fields/${fieldId}/image`, imgData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      toast.success(successMsg);
      setShowForm(false);
      setSelectedImage(null);
      setSelectedImageName('');
      fetchFields();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const executeDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/admin/fields/${deleteConfirm.id}`);
      toast.success('Lapangan berhasil dihapus!');
      fetchFields();
      setDeleteConfirm({ isOpen: false, id: null });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus lapangan');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '24px', fontWeight: '700', color: 'var(--green-900)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CircleDot color="#f472b6" size={28} /> Kelola Lapangan
          </h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '14px', marginTop: '4px' }}>Tambah dan edit lapangan futsal</p>
        </div>
        <button className="btn btn-primary" onClick={() => openForm()} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} /> Tambah Lapangan
        </button>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner"></div></div>
      ) : fields.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px', color: 'var(--gray-400)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}><CircleDot size={48} color="#d1d5db" /></div>
          <p>Belum ada lapangan. Tambahkan sekarang!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {fields.map(field => {
            let facilities = [];
            try { facilities = JSON.parse(field.facilities || '[]'); } catch {}
            const imageUrl = field.image ? `http://127.0.0.1:8000/storage/${field.image}` : null;
            return (
              <div key={field.id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
                {imageUrl ? (
                  <div 
                    onClick={() => setPreviewImage(imageUrl)}
                    style={{ 
                      height: '140px', 
                      width: '100%', 
                      overflow: 'hidden', 
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                  >
                    <img src={imageUrl} alt={field.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} 
                      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.nextElementSibling.style.opacity = '1'; }} 
                      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.nextElementSibling.style.opacity = '0'; }} />
                    <div style={{
                      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.3)',
                      display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: 0, transition: 'opacity 0.3s', pointerEvents: 'none'
                    }}>
                      <ImageIcon color="white" size={32} />
                    </div>
                  </div>
                ) : null}
                <div style={{
                  background: 'linear-gradient(135deg, var(--green-700), var(--green-500))',
                  padding: '20px', color: 'white'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '18px', fontWeight: '700', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CircleDot size={18} /> {field.name}
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
                    <button className="btn btn-outline btn-sm" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => openForm(field)}>
                      <Pencil size={14} /> Edit
                    </button>
                    <button className="btn btn-outline btn-sm" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--red-500)', borderColor: 'var(--red-200)' }} onClick={() => handleDeleteClick(field.id)}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--red-50)'; e.currentTarget.style.borderColor = 'var(--red-500)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--red-200)'; }}
                    >
                      <Trash2 size={14} /> Hapus
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
            <label className="form-label">Gambar Lapangan <span style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--gray-500)', marginLeft: '6px' }}>(JPG/PNG, Rasio 16:9 disarankan)</span></label>
            <input type="file" accept="image/jpeg, image/png, image/jpg" className="form-input" style={{ padding: '10px 12px' }}
              onChange={e => {
                const file = e.target.files?.[0] || null;
                setSelectedImage(file);
                setSelectedImageName(file ? file.name : '');
              }} />
            {selectedImageName && (
              <div style={{ marginTop: '8px', color: 'var(--gray-600)', fontSize: '13px' }}>
                Terpilih: {selectedImageName}
              </div>
            )}
            {editing && !selectedImageName && (
              <div style={{ marginTop: '8px', color: 'var(--gray-500)', fontSize: '13px' }}>
                Pilih gambar untuk mengganti gambar lapangan saat ini.
              </div>
            )}
          </div>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={formData.is_active}
                onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
              <span className="form-label" style={{ margin: 0 }}>Aktif</span>
            </label>
          </div>
          <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
            {isSubmitting ? (
              <><Loader2 className="animate-spin" size={16} /> Menyimpan...</>
            ) : editing ? (
              <><Save size={16} /> Simpan Perubahan</>
            ) : (
              <><Plus size={16} /> Tambah Lapangan</>
            )}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Hapus Lapangan?"
        description="Apakah Anda yakin ingin menghapus lapangan ini? Semua jadwal, booking, dan data terkait lapangan ini akan ikut terhapus secara permanen. Tindakan ini tidak dapat dibatalkan."
        onConfirm={executeDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: null })}
        type="danger"
        isLoading={isDeleting}
      />

      <Modal isOpen={!!previewImage} onClose={() => setPreviewImage(null)} title="Foto Lapangan">
        {previewImage && (
          <div style={{ padding: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img src={previewImage} alt="Preview Lapangan" style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '12px', objectFit: 'contain' }} />
          </div>
        )}
      </Modal>
    </div>
  );
}
