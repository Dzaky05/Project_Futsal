import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { formatRupiah } from '../../utils/auth';
import { toast } from 'react-hot-toast';
import { Clock, Calendar, Wrench, Coffee, Save, Trash2, Info, Loader2, CheckCircle, Ban, CheckCircle2 } from 'lucide-react';

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
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, slot: null, date: null, label: '' });
  const [isDeleting, setIsDeleting] = useState(false);

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

  useEffect(() => { fetchSchedule(); }, [fetchSchedule]);

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
      toast.error('Gagal memuat jam operasional: ' + (err.response?.data?.message || err.message));
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
      toast.success('Jam operasional minggu ini berhasil disimpan!');
      fetchSchedule(); // Refresh schedule grid
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan jam operasional');
    } finally {
      setSavingHours(false);
    }
  };

  // Slot click handler - Delete Booking or Blocked Slot
  const handleSlotClick = (slot, date) => {
    if (slot.status === 'blocked' || slot.status === 'booked') {
      const label = slot.status === 'booked' ? 'Pesanan (Booking)' : 'Blokir Slot';
      setConfirmDelete({ isOpen: true, slot, date, label });
    } else if (slot.status === 'available') {
      toast.error(`${date} ${slot.start_time}-${slot.end_time}: Slot ini masih tersedia.`);
    }
  };

  const executeDeleteSlot = async () => {
    const { slot, date, label } = confirmDelete;
    setIsDeleting(true);
    try {
      if (slot.status === 'blocked') {
        await api.delete('/admin/schedule/delete-slot', {
          data: { field_id: selectedField, date: date, start_time: slot.start_time, type: 'blocked' }
        });
      } else {
        await api.delete('/admin/schedule/delete-slot', {
          data: { field_id: selectedField, date: date, start_time: slot.start_time, type: 'booked' }
        });
      }
      toast.success(`${label} berhasil dihapus!`);
      fetchSchedule();
      setConfirmDelete({ isOpen: false, slot: null, date: null, label: '' });
    } catch (err) {
      toast.error('Gagal menghapus jadwal: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsDeleting(false);
    }
  };

  const getSlotClass = (status, reason) => {
    if (status === 'available') return 'slot-available';
    if (status === 'booked') return 'slot-booked';
    if (status === 'blocked') {
      if (reason) return `slot-blocked-${reason}`;
      return 'slot-blocked';
    }
    return 'slot-past';
  };

  const getSlotIcon = (status, reason) => {
    switch (status) {
      case 'available': return <CheckCircle2 size={14} />;
      case 'booked': return <Calendar size={14} />;
      case 'blocked':
        if (reason === 'rest') return <Coffee size={14} />;
        if (reason === 'event') return <Calendar size={14} />;
        return <Wrench size={14} />;
      default: return <Clock size={14} />;
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
          <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '24px', fontWeight: '700', color: 'var(--green-900)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar color="#34d399" size={28} /> Kelola Jadwal
          </h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '14px', marginTop: '4px' }}>
            Atur jam operasional, input jadwal bermain, dan blokir slot
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="btn btn-outline" onClick={openHoursModal} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={16} /> Jam Operasional
          </button>
        </div>
      </div>

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
              {currentField.name}
            </h3>
            <p style={{ opacity: 0.85, fontSize: '13px', marginBottom: '6px' }}>
              {currentField.description || 'Lapangan futsal'}
            </p>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>
              💰 {formatRupiah(currentField.price_per_hour)}/jam
            </span>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {[
              { label: 'Tersedia', value: weekStats.available, bg: 'var(--green-50)', color: 'var(--green-700)', icon: <CheckCircle2 size={24} /> },
              { label: 'Dipesan', value: weekStats.booked, bg: 'var(--gray-100)', color: 'var(--gray-600)', icon: <Calendar size={24} /> },
              { label: 'Diblokir', value: weekStats.blocked, bg: 'var(--orange-50, #fff7ed)', color: '#c2410c', icon: <Ban size={24} /> },
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
          { label: 'Sudah Dipesan', bg: 'var(--gray-200)', border: 'var(--gray-300)' },
          { label: 'Istirahat', bg: 'var(--blue-100)', border: '#93c5fd' },
          { label: 'Maintenance', bg: 'var(--orange-100)', border: '#fed7aa' },
          { label: 'Event', bg: 'var(--yellow-100)', border: '#fde68a' },
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
                    return (
                      <td key={dayIdx} style={{ padding: '6px', borderBottom: '1px solid var(--gray-100)' }}>
                        <div
                          className={`schedule-slot ${getSlotClass(slot.status, slot.reason)}`}
                          onClick={() => handleSlotClick(slot, day.date)}
                          title={
                            slot.status === 'available'
                              ? `Tersedia: ${day.date} ${slot.start_time}-${slot.end_time}`
                              : slot.status === 'booked' ? 'Sudah dipesan (Klik untuk Hapus)'
                              : slot.status === 'blocked' ? `Diblokir: ${slot.reason || ''} (Klik untuk Hapus)`
                              : 'Sudah lewat'
                          }
                          style={{
                            margin: 0, fontSize: '13px', padding: '12px 6px',
                            fontWeight: '600',
                            ...( (slot.status === 'booked' || slot.status === 'blocked') ? {
                              cursor: 'pointer'
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
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>{getSlotIcon(slot.status, slot.reason)} {slot.start_time}</span>
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
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}><Calendar size={48} color="#d1d5db" /></div>
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

          <button className="btn btn-primary" style={{ width: '100%', marginTop: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            onClick={saveHours} disabled={savingHours}>
            {savingHours ? (
              <><Loader2 className="animate-spin" size={16} /> Menyimpan...</>
            ) : <><Save size={16} /> Simpan Jam Operasional</>}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        title={`Hapus ${confirmDelete.label}?`}
        description={`Apakah Anda yakin ingin menghapus jadwal ini pada tanggal ${confirmDelete.date} jam ${confirmDelete.slot?.start_time}?`}
        onConfirm={executeDeleteSlot}
        onCancel={() => setConfirmDelete({ isOpen: false, slot: null, date: null, label: '' })}
        type="danger"
        isLoading={isDeleting}
      />


    </div>
  );
}
