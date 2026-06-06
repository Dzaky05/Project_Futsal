import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import Modal from '../../components/Modal';
import { formatRupiah } from '../../utils/auth';

export default function ManageSchedule() {
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);

  // Operational Hours state
  const [showHoursModal, setShowHoursModal] = useState(false);
  const [hours, setHours] = useState([]);
  const [savingHours, setSavingHours] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  // Block Slot state
  const [showBlockSlot, setShowBlockSlot] = useState(false);
  const [blockForm, setBlockForm] = useState({
    date: '', start_time: '', end_time: '', reason: 'maintenance', description: ''
  });

  // Success message
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    api.get('/fields').then(res => {
      const f = res.data.data || res.data;
      const list = Array.isArray(f) ? f : [];
      setFields(list);
      if (list.length > 0) setSelectedField(list[0].id);
    }).catch(console.error);
  }, []);

  const getStartDate = useCallback((offset) => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayDiff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayDiff + (offset * 7));
    const year = monday.getFullYear();
    const month = String(monday.getMonth() + 1).padStart(2, '0');
    const day = String(monday.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const fetchSchedule = useCallback(() => {
    if (!selectedField) return;
    setLoading(true);
    const startDate = getStartDate(weekOffset);
    api.get('/schedule/weekly', {
      params: { field_id: selectedField, start_date: startDate }
    })
      .then(res => {
        setSchedule(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Schedule fetch error:', err);
        setSchedule(null);
        setLoading(false);
      });
  }, [selectedField, weekOffset, getStartDate]);

  useEffect(() => { fetchSchedule(); }, [fetchSchedule]);

  // Auto-hide success message
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  const dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  // DB day_of_week: 0=Sunday, 1=Monday, ..., 6=Saturday
  const dayOfWeekNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  const formatPeriod = () => {
    if (!schedule?.start_date || !schedule?.end_date) return 'Memuat...';
    const opts = { day: 'numeric', month: 'short', year: 'numeric' };
    const start = new Date(schedule.start_date + 'T00:00:00').toLocaleDateString('id-ID', opts);
    const end = new Date(schedule.end_date + 'T00:00:00').toLocaleDateString('id-ID', opts);
    return `${start} — ${end}`;
  };

  const getAllTimeSlots = () => {
    if (!schedule?.schedule) return [];
    const timesSet = new Set();
    schedule.schedule.forEach(day => {
      if (day.slots) {
        day.slots.forEach(slot => timesSet.add(slot.start_time));
      }
    });
    return [...timesSet].sort();
  };

  const days = schedule?.schedule || [];
  const allTimes = getAllTimeSlots();
  const currentField = fields.find(f => f.id === selectedField);

  // ======= Operational Hours =======
  const openHoursModal = async () => {
    if (!selectedField) return;
    try {
      const startDateStr = getStartDate(weekOffset);
      const startObj = new Date(startDateStr);
      
      const weekDates = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(startObj);
        d.setDate(d.getDate() + i);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${day}`;
        weekDates.push({ date: dateStr, day_of_week: d.getDay() });
      }

      const endDateStr = weekDates[6].date;

      const res = await api.get(`/admin/fields/${selectedField}/hours`, {
        params: { start_date: startDateStr, end_date: endDateStr }
      });
      const data = res.data.data || res.data;
      
      const allDays = weekDates.map(wd => {
        const existing = (Array.isArray(data) ? data : []).find(h => h.date === wd.date);
        return existing || { date: wd.date, day_of_week: wd.day_of_week, open_time: '08:00', close_time: '23:00', is_open: false };
      });

      setHours(allDays);
      setShowHoursModal(true);
    } catch (err) {
      alert('Gagal memuat jam operasional: ' + (err.response?.data?.message || err.message));
    }
  };

  const updateHour = (idx, key, val) => {
    const updated = [...hours];
    updated[idx] = { ...updated[idx], [key]: val };
    setHours(updated);
  };

  const saveHours = async () => {
    setSavingHours(true);
    try {
      const payload = hours.map(h => ({
        ...h,
        open_time: h.open_time ? h.open_time.slice(0, 5) : '08:00',
        close_time: h.close_time ? h.close_time.slice(0, 5) : '23:00'
      }));
      await api.put(`/admin/fields/${selectedField}/hours`, { hours: payload });
      setShowHoursModal(false);
      setSuccessMsg('✅ Jam operasional minggu ini berhasil disimpan!');
      fetchSchedule(); // Refresh schedule grid
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan jam operasional');
    } finally {
      setSavingHours(false);
    }
  };

  // ======= Block Slot =======
  const handleBlockSlot = async (e) => {
    e.preventDefault();
    // Frontend validation: cek apakah tanggal sudah lewat
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(blockForm.date + 'T00:00:00');
    if (selectedDate < today) {
      alert('⚠️ Tanggal yang dipilih sudah lewat! Tidak bisa memblokir jadwal yang sudah berlalu. Silakan pilih tanggal hari ini atau setelahnya.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/admin/blocked-slots', { ...blockForm, field_id: selectedField });
      setShowBlockSlot(false);
      setBlockForm({ date: '', start_time: '', end_time: '', reason: 'maintenance', description: '' });
      setSuccessMsg('🚫 Slot berhasil diblokir!');
      fetchSchedule();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menambahkan blokir');
    } finally {
      setSubmitting(false);
    }
  };

  // Slot click handler - Delete Booking or Blocked Slot
  const handleSlotClick = async (slot, date) => {
    if (slot.status === 'blocked' || slot.status === 'booked') {
      const label = slot.status === 'booked' ? 'Pesanan (Booking)' : 'Blokir Slot';
      if (window.confirm(`Hapus ${label} pada tanggal ${date} jam ${slot.start_time}?`)) {
        try {
          if (slot.status === 'blocked') {
            // Find blocked slot ID by fetching or changing backend to return ID
            // Since we don't have ID in schedule grid, we can make an API request to delete by date/time
            await api.delete('/admin/schedule/delete-slot', {
              data: { field_id: selectedField, date: date, start_time: slot.start_time, type: 'blocked' }
            });
          } else {
            await api.delete('/admin/schedule/delete-slot', {
              data: { field_id: selectedField, date: date, start_time: slot.start_time, type: 'booked' }
            });
          }
          setSuccessMsg(`✅ ${label} berhasil dihapus!`);
          fetchSchedule();
        } catch (err) {
          alert('Gagal menghapus jadwal: ' + (err.response?.data?.message || err.message));
        }
      }
    } else if (slot.status === 'available') {
      alert(`${date} ${slot.start_time}-${slot.end_time}: Slot ini masih tersedia.`);
    }
  };

  const getSlotStyle = (status) => {
    switch (status) {
      case 'available':
        return {
          background: 'var(--green-100)', color: 'var(--green-800)',
          border: '1px solid var(--green-200)', cursor: 'default'
        };
      case 'booked':
        return {
          background: '#dbeafe', color: '#1e40af',
          border: '1px solid #bfdbfe', cursor: 'default'
        };
      case 'blocked':
        return {
          background: 'var(--orange-100)', color: '#9a3412',
          border: '1px solid #fed7aa', cursor: 'default'
        };
      default: // past
        return {
          background: 'var(--gray-100)', color: 'var(--gray-400)',
          border: '1px solid var(--gray-200)', cursor: 'default'
        };
    }
  };

  const getSlotIcon = (status) => {
    switch (status) {
      case 'available': return '✅';
      case 'booked': return '📋';
      case 'blocked': return '🚫';
      default: return '⏱️';
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Count stats for current week
  const statsForWeek = () => {
    let available = 0, booked = 0, blocked = 0;
    days.forEach(day => {
      day.slots?.forEach(slot => {
        if (slot.status === 'available') available++;
        else if (slot.status === 'booked') booked++;
        else if (slot.status === 'blocked') blocked++;
      });
    });
    return { available, booked, blocked };
  };
  const weekStats = statsForWeek();

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '24px', fontWeight: '700', color: 'var(--green-900)' }}>
            📅 Kelola Jadwal
          </h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '14px', marginTop: '4px' }}>
            Atur jam operasional, input jadwal bermain, dan blokir slot
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="btn btn-outline" onClick={openHoursModal}>
            🕐 Jam Operasional
          </button>
          <button className="btn btn-outline" onClick={() => {
            setBlockForm({ date: todayStr, start_time: '', end_time: '', reason: 'maintenance', description: '' });
            setShowBlockSlot(true);
          }}>
            🚫 Blokir Slot
          </button>
        </div>
      </div>

      {/* Success Message */}
      {successMsg && (
        <div style={{
          background: 'var(--green-50)', border: '1px solid var(--green-200)',
          borderRadius: '12px', padding: '12px 16px', marginBottom: '16px',
          color: 'var(--green-800)', fontSize: '14px', fontWeight: '500',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          animation: 'fadeIn 0.3s ease'
        }}>
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--green-600)', fontSize: '16px', fontWeight: '700'
          }}>✕</button>
        </div>
      )}

      {/* Field Selector */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {fields.map(field => (
          <button
            key={field.id}
            onClick={() => { setSelectedField(field.id); setWeekOffset(0); }}
            className={selectedField === field.id ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
          >
            ⚽ {field.name}
          </button>
        ))}
      </div>

      {/* Field Info + Stats */}
      {currentField && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', marginBottom: '16px', alignItems: 'stretch' }}>
          <div className="card" style={{
            background: 'linear-gradient(135deg, var(--green-800) 0%, var(--green-600) 100%)',
            color: 'white', border: 'none', padding: '16px 20px', margin: 0
          }}>
            <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '16px', marginBottom: '4px' }}>
              ⚽ {currentField.name}
            </h3>
            <p style={{ opacity: 0.85, fontSize: '13px', marginBottom: '6px' }}>
              {currentField.description || 'Lapangan futsal'}
            </p>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>
              💰 {formatRupiah(currentField.price_per_hour)}/jam
            </span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {[
              { label: 'Tersedia', value: weekStats.available, bg: 'var(--green-50)', color: 'var(--green-700)', icon: '✅' },
              { label: 'Dipesan', value: weekStats.booked, bg: '#eff6ff', color: '#1d4ed8', icon: '📋' },
              { label: 'Diblokir', value: weekStats.blocked, bg: 'var(--orange-50, #fff7ed)', color: '#c2410c', icon: '🚫' },
            ].map((s, i) => (
              <div key={i} className="card" style={{
                padding: '12px 16px', textAlign: 'center', minWidth: '90px',
                background: s.bg, border: `1px solid ${s.color}22`, margin: 0
              }}>
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>{s.icon}</div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: s.color, fontFamily: "'Poppins', sans-serif" }}>{s.value}</div>
                <div style={{ fontSize: '11px', color: s.color, opacity: 0.8 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Week Navigation */}
      <div className="card" style={{ marginBottom: '16px', padding: '12px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button className="btn btn-outline btn-sm" onClick={() => setWeekOffset(w => w - 1)}>
            ← Minggu Lalu
          </button>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontWeight: '600', color: 'var(--green-800)', fontSize: '15px' }}>
              {formatPeriod()}
            </span>
            {weekOffset !== 0 && (
              <button
                onClick={() => setWeekOffset(0)}
                style={{
                  display: 'block', margin: '4px auto 0', background: 'none', border: 'none',
                  color: 'var(--green-600)', cursor: 'pointer', fontSize: '12px', fontWeight: '500'
                }}
              >
                ↻ Minggu Ini
              </button>
            )}
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => setWeekOffset(w => w + 1)}>
            Minggu Depan →
          </button>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', flexWrap: 'wrap', fontSize: '12px' }}>
        {[
          { label: 'Tersedia', bg: 'var(--green-100)', border: 'var(--green-200)' },
          { label: 'Sudah Dipesan', bg: '#dbeafe', border: '#bfdbfe' },
          { label: 'Diblokir', bg: 'var(--orange-100)', border: '#fed7aa' },
          { label: 'Sudah Lewat', bg: 'var(--gray-100)', border: 'var(--gray-200)' },
        ].map((l, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '14px', height: '14px', borderRadius: '4px', background: l.bg, border: `1px solid ${l.border}` }} />
            {l.label}
          </span>
        ))}
      </div>

      {/* Schedule Grid */}
      {loading ? (
        <div className="loading-center"><div className="spinner"></div></div>
      ) : days.length > 0 && allTimes.length > 0 ? (
        <div className="card" style={{ padding: '16px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr>
                <th style={{
                  padding: '14px 10px', fontSize: '13px', fontWeight: '600',
                  color: 'var(--gray-500)', textAlign: 'left',
                  borderBottom: '2px solid var(--gray-200)', width: '80px'
                }}>
                  Jam
                </th>
                {days.map((day, i) => (
                  <th key={i} style={{
                    padding: '14px 10px', fontSize: '13px', fontWeight: '600',
                    color: 'var(--gray-600)', textAlign: 'center',
                    borderBottom: '2px solid var(--gray-200)'
                  }}>
                    <div>{dayNames[i] || day.day_name}</div>
                    <div style={{ fontSize: '12px', fontWeight: '400', color: 'var(--gray-400)', marginTop: '4px' }}>
                      {day.date}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allTimes.map((time, slotIdx) => (
                <tr key={slotIdx}>
                  <td style={{
                    padding: '10px 10px', fontSize: '13px', fontWeight: '600',
                    color: 'var(--gray-600)', borderBottom: '1px solid var(--gray-100)'
                  }}>
                    {time}
                  </td>
                  {days.map((day, dayIdx) => {
                    const slot = day.slots?.find(s => s.start_time === time);
                    if (!slot) {
                      return (
                        <td key={dayIdx} style={{ padding: '6px', borderBottom: '1px solid var(--gray-100)' }}>
                          <div style={{
                            textAlign: 'center', fontSize: '13px', padding: '12px 6px',
                            borderRadius: '8px', background: 'var(--gray-50)',
                            color: 'var(--gray-300)', opacity: 0.6
                          }}>
                            —
                          </div>
                        </td>
                      );
                    }
                    const style = getSlotStyle(slot.status);
                    return (
                      <td key={dayIdx} style={{ padding: '6px', borderBottom: '1px solid var(--gray-100)' }}>
                        <div
                          onClick={() => handleSlotClick(slot, day.date)}
                          title={
                            slot.status === 'available'
                              ? `Tersedia: ${day.date} ${slot.start_time}-${slot.end_time}`
                              : slot.status === 'booked' ? 'Sudah dipesan (Klik untuk Hapus)'
                              : slot.status === 'blocked' ? `Diblokir: ${slot.reason || ''} (Klik untuk Hapus)`
                              : 'Sudah lewat'
                          }
                          style={{
                            textAlign: 'center', fontSize: '13px', padding: '12px 6px',
                            borderRadius: '8px', transition: 'all 0.2s ease',
                            fontWeight: '600', ...style,
                            ...( (slot.status === 'booked' || slot.status === 'blocked') ? {
                              cursor: 'pointer',
                              ':hover': { transform: 'scale(1.05)' }
                            } : {})
                          }}
                          onMouseEnter={e => {
                            if (slot.status === 'booked' || slot.status === 'blocked') {
                              e.currentTarget.style.transform = 'scale(1.05)';
                              e.currentTarget.style.boxShadow = '0 2px 8px rgba(239,68,68,0.2)';
                            }
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          {getSlotIcon(slot.status)} {slot.start_time}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--gray-400)' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📅</div>
          <p style={{ fontSize: '16px', marginBottom: '12px' }}>Belum ada jadwal untuk lapangan ini</p>
          <p style={{ fontSize: '13px' }}>Atur jam operasional terlebih dahulu dengan klik tombol "🕐 Jam Operasional"</p>
        </div>
      )}

      {/* ============= MODAL: Jam Operasional ============= */}
      <Modal isOpen={showHoursModal} onClose={() => setShowHoursModal(false)} title="🕐 Jam Operasional">
        <div style={{ fontSize: '14px' }}>
          <div style={{
            background: '#eff6ff', border: '1px solid #bfdbfe',
            borderRadius: '8px', padding: '10px 14px', marginBottom: '16px',
            fontSize: '13px', color: '#1e40af'
          }}>
            ℹ️ Atur jam buka-tutup untuk setiap hari. Jadwal ini akan menentukan slot yang tersedia di dashboard user.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {hours.map((h, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '10px', padding: '10px',
                borderRadius: '10px',
                background: h.is_open ? 'var(--green-50)' : 'var(--gray-50)',
                border: `1px solid ${h.is_open ? 'var(--green-200)' : 'var(--gray-200)'}`,
                transition: 'all 0.2s ease'
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', minWidth: '110px' }}>
                  <input type="checkbox" checked={h.is_open}
                    onChange={e => updateHour(i, 'is_open', e.target.checked)} />
                  <span style={{ fontWeight: '500', fontSize: '13px' }}>
                    {dayOfWeekNames[h.day_of_week] || `Hari ${h.day_of_week}`}
                    <div style={{ fontSize: '11px', color: 'var(--gray-400)', fontWeight: '400' }}>{h.date}</div>
                  </span>
                </label>
                {h.is_open && (
                  <>
                    <input type="time" className="form-input"
                      style={{ width: '110px', padding: '6px 8px', fontSize: '13px' }}
                      value={h.open_time?.slice(0, 5) || ''}
                      onChange={e => updateHour(i, 'open_time', e.target.value)} />
                    <span style={{ color: 'var(--gray-400)' }}>—</span>
                    <input type="time" className="form-input"
                      style={{ width: '110px', padding: '6px 8px', fontSize: '13px' }}
                      value={h.close_time?.slice(0, 5) || ''}
                      onChange={e => updateHour(i, 'close_time', e.target.value)} />
                  </>
                )}
                {!h.is_open && (
                  <span style={{ fontSize: '12px', color: 'var(--gray-400)', fontStyle: 'italic' }}>Tutup</span>
                )}
              </div>
            ))}
          </div>

          <button className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}
            onClick={saveHours} disabled={savingHours}>
            {savingHours ? (
              <><div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div> Menyimpan...</>
            ) : '💾 Simpan Jam Operasional'}
          </button>
        </div>
      </Modal>

      {/* ============= MODAL: Blokir Slot ============= */}
      <Modal isOpen={showBlockSlot} onClose={() => setShowBlockSlot(false)} title="🚫 Blokir Slot Jadwal">
        <form onSubmit={handleBlockSlot}>
          <div style={{
            background: '#fff7ed', border: '1px solid #fed7aa',
            borderRadius: '8px', padding: '10px 14px', marginBottom: '16px',
            fontSize: '13px', color: '#9a3412'
          }}>
            ⚠️ Slot yang diblokir tidak bisa dipesan oleh user. Gunakan untuk maintenance, event, atau istirahat.
          </div>

          <div className="form-group">
            <label className="form-label">📅 Tanggal</label>
            <input type="date" className="form-input" required value={blockForm.date}
              onChange={e => setBlockForm({ ...blockForm, date: e.target.value })}
              min={todayStr} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">🕐 Jam Mulai</label>
              <input type="time" className="form-input" required value={blockForm.start_time}
                onChange={e => setBlockForm({ ...blockForm, start_time: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">🕐 Jam Selesai</label>
              <input type="time" className="form-input" required value={blockForm.end_time}
                onChange={e => setBlockForm({ ...blockForm, end_time: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">📋 Alasan</label>
            <select className="form-input" value={blockForm.reason}
              onChange={e => setBlockForm({ ...blockForm, reason: e.target.value })}>
              <option value="maintenance">🔧 Maintenance</option>
              <option value="event">🎉 Event</option>
              <option value="rest">💤 Istirahat</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">📝 Deskripsi (opsional)</label>
            <textarea className="form-input form-textarea" placeholder="Deskripsi tambahan..."
              value={blockForm.description} onChange={e => setBlockForm({ ...blockForm, description: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
            {submitting ? (
              <><div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div> Memproses...</>
            ) : '🚫 Blokir Slot'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
