import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { toast } from 'react-hot-toast';
import { Ban, Plus, Trash2, CheckCircle2, Wrench, Calendar, Coffee, Loader2 } from 'lucide-react';

export default function BlockSlots() {
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    date: '', start_time: '', end_time: '', reason: 'maintenance', description: ''
  });
  const [confirmData, setConfirmData] = useState({ isOpen: false, id: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    api.get('/fields').then(res => {
      const f = res.data.data || res.data;
      setFields(f);
      if (f.length > 0) setSelectedField(f[0].id);
    }).catch(console.error);
  }, []);

  const fetchBlocked = () => {
    if (!selectedField) return;
    setLoading(true);
    api.get('/admin/blocked-slots', { params: { field_id: selectedField } })
      .then(res => {
        const d = res.data.data || res.data;
        setBlockedSlots(Array.isArray(d) ? d : d.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchBlocked(); }, [selectedField]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/admin/blocked-slots', { ...formData, field_id: selectedField });
      toast.success('Blokir berhasil ditambahkan');
      setShowAdd(false);
      setFormData({ date: '', start_time: '', end_time: '', reason: 'maintenance', description: '' });
      fetchBlocked();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menambahkan blokir');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (id) => {
    setConfirmData({ isOpen: true, id });
  };

  const executeDelete = async () => {
    const { id } = confirmData;
    setIsDeleting(true);
    try {
      await api.delete(`/admin/blocked-slots/${id}`);
      toast.success('Blokir berhasil dihapus');
      fetchBlocked();
      setConfirmData({ isOpen: false, id: null });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus');
    } finally {
      setIsDeleting(false);
    }
  };

  const reasonIcons = { 
    maintenance: <Wrench size={14} />, 
    event: <Calendar size={14} />, 
    rest: <Coffee size={14} /> 
  };
  const reasonLabels = { maintenance: 'Maintenance', event: 'Event', rest: 'Istirahat' };
  const reasonColors = {
    maintenance: { bg: 'var(--orange-100)', color: 'var(--orange-500)' },
    event: { bg: 'var(--yellow-100)', color: 'var(--yellow-500)' },
    rest: { bg: 'var(--blue-100)', color: 'var(--blue-500)' },
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '24px', fontWeight: '700', color: 'var(--green-900)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Ban color="#f87171" size={28} /> Blokir Jadwal
          </h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '14px', marginTop: '4px' }}>Blokir slot untuk maintenance, event, atau istirahat</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} /> Tambah Blokir
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {fields.map(f => (
          <button key={f.id}
            className={selectedField === f.id ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
            onClick={() => setSelectedField(f.id)}
          >{f.name}</button>
        ))}
      </div>

      {loading ? (
        <div className="loading-center"><Loader2 className="animate-spin text-green-600" size={40} /></div>
      ) : blockedSlots.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px', color: 'var(--gray-400)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <CheckCircle2 size={48} color="#22c55e" style={{ opacity: 0.5 }} />
          </div>
          <p style={{ fontSize: '16px' }}>Tidak ada slot yang diblokir</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
          {blockedSlots.map(slot => {
            const rc = reasonColors[slot.reason] || reasonColors.maintenance;
            return (
              <div key={slot.id} className="card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span className="badge" style={{ background: rc.bg, color: rc.color, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {reasonIcons[slot.reason] || <Wrench size={14} />} {reasonLabels[slot.reason] || slot.reason}
                  </span>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDeleteClick(slot.id)}
                    style={{ padding: '4px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Trash2 size={14} /> Hapus
                  </button>
                </div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '6px' }}>
                  {slot.field?.name || 'Lapangan'}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--gray-500)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <span>📅 {slot.date}</span>
                  <span>🕐 {slot.start_time?.slice(0,5)} - {slot.end_time?.slice(0,5)}</span>
                </div>
                {slot.description && (
                  <p style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '8px', fontStyle: 'italic' }}>
                    "{slot.description}"
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Tambah Blokir Jadwal">
        <form onSubmit={handleAdd}>
          <div className="form-group">
            <label className="form-label">Tanggal</label>
            <input type="date" className="form-input" required value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              min={new Date().toISOString().split('T')[0]} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Jam Mulai</label>
              <input type="time" className="form-input" required value={formData.start_time}
                onChange={e => setFormData({ ...formData, start_time: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Jam Selesai</label>
              <input type="time" className="form-input" required value={formData.end_time}
                onChange={e => setFormData({ ...formData, end_time: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Alasan</label>
            <select className="form-input" value={formData.reason}
              onChange={e => setFormData({ ...formData, reason: e.target.value })}>
              <option value="maintenance">Maintenance</option>
              <option value="event">Event</option>
              <option value="rest">Istirahat</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Deskripsi (opsional)</label>
            <textarea className="form-input form-textarea" placeholder="Deskripsi tambahan..."
              value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
          </div>
          <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Ban size={18} />} Blokir Slot
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmData.isOpen}
        title="Hapus Blokir Jadwal?"
        description="Apakah Anda yakin ingin menghapus blokir jadwal ini? Slot akan kembali tersedia untuk dibooking."
        onConfirm={executeDelete}
        onCancel={() => setConfirmData({ isOpen: false, id: null })}
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
