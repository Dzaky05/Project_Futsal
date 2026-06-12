import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

export default function Schedule() {
  const navigate = useNavigate();
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/fields').then(res => {
      const f = res.data.data || res.data;
      setFields(Array.isArray(f) ? f : []);
      if (Array.isArray(f) && f.length > 0) setSelectedField(f[0].id);
    }).catch(console.error);
  }, []);

  // Calculate the Monday start_date based on weekOffset
  const getStartDate = useCallback((offset) => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ...
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

  const dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  const handleSlotClick = (slot, date) => {
    if (slot.status !== 'available') return;
    navigate(`/booking?field_id=${selectedField}&date=${date}&start=${slot.start_time}&end=${slot.end_time}`);
  };

  const getSlotClass = (status, reason) => {
    if (status === 'available') return 'slot-available';
    if (status === 'booked') return 'slot-booked';
    if (status === 'blocked') {
      if (reason) return `slot-blocked-${reason}`; // e.g. slot-blocked-rest
      return 'slot-blocked';
    }
    return 'slot-past';
  };

  const getSlotLabel = (status) => {
    switch (status) {
      case 'available': return 'Klik untuk booking';
      case 'booked': return 'Sudah dipesan';
      case 'blocked': return 'Diblokir';
      default: return 'Sudah lewat';
    }
  };

  const currentField = fields.find(f => f.id === selectedField);

  // Format period string from schedule response
  const formatPeriod = () => {
    if (!schedule?.start_date || !schedule?.end_date) return 'Memuat...';
    const opts = { day: 'numeric', month: 'short', year: 'numeric' };
    const start = new Date(schedule.start_date + 'T00:00:00').toLocaleDateString('id-ID', opts);
    const end = new Date(schedule.end_date + 'T00:00:00').toLocaleDateString('id-ID', opts);
    return `${start} — ${end}`;
  };

  // Safely get facilities array (model already casts to array, but handle edge cases)
  const getFacilities = (field) => {
    if (!field?.facilities) return [];
    if (Array.isArray(field.facilities)) return field.facilities;
    try { return JSON.parse(field.facilities); } catch { return []; }
  };

  // Get all unique time slots across all days for consistent row rendering
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

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '24px', fontWeight: '700', color: 'var(--green-900)' }}>
          📅 Jadwal Lapangan
        </h1>
        <p style={{ color: 'var(--gray-500)', fontSize: '14px', marginTop: '4px' }}>
          Pilih lapangan dan lihat jadwal ketersediaan
        </p>
      </div>

      {/* Field Selector Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {fields.map(field => (
          <button
            key={field.id}
            onClick={() => { setSelectedField(field.id); setWeekOffset(0); }}
            className={selectedField === field.id ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
          >
            {field.name}
          </button>
        ))}
      </div>

      {/* Field Info Card */}
      {currentField && (
        <div className="card" style={{
          marginBottom: '20px', background: 'linear-gradient(135deg, var(--green-800) 0%, var(--green-600) 100%)',
          color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap'
        }}>
          {currentField.image && (
            <div style={{ width: '220px', minWidth: '220px', maxHeight: '160px', overflow: 'hidden', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
              <img
                src={`http://127.0.0.1:8000/storage/${currentField.image}`}
                alt={currentField.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
          )}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '18px', marginBottom: '6px' }}>
              ⚽ {currentField.name}
            </h3>
            <p style={{ opacity: 0.85, fontSize: '13px', marginBottom: '8px' }}>
              {currentField.description || 'Lapangan futsal berkualitas'}
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', opacity: 0.9 }}>
                💰 Rp {Number(currentField.price_per_hour).toLocaleString('id-ID')}/jam
              </span>
              {getFacilities(currentField).map((f, i) => (
                <span key={i} style={{ fontSize: '12px', opacity: 0.8, background: 'rgba(255,255,255,0.15)', padding: '2px 10px', borderRadius: '12px' }}>
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Week Navigation */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
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
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap', fontSize: '12px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '14px', height: '14px', borderRadius: '4px', background: 'var(--green-100)', border: '1px solid var(--green-200)' }}></span>
          Tersedia
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '14px', height: '14px', borderRadius: '4px', background: 'var(--gray-200)' }}></span>
          Sudah Dipesan
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '14px', height: '14px', borderRadius: '4px', background: 'var(--blue-100)' }}></span>
          Istirahat
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '14px', height: '14px', borderRadius: '4px', background: 'var(--orange-100)' }}></span>
          Maintenance
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '14px', height: '14px', borderRadius: '4px', background: 'var(--yellow-100)' }}></span>
          Event
        </span>
      </div>

      {/* Schedule Grid */}
      {loading ? (
        <div className="loading-center"><div className="spinner"></div></div>
      ) : days.length > 0 && allTimes.length > 0 ? (
        <div className="card" style={{ padding: '16px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr>
                <th style={{ padding: '10px 8px', fontSize: '12px', fontWeight: '600', color: 'var(--gray-500)', textAlign: 'left', borderBottom: '2px solid var(--gray-200)', width: '80px' }}>
                  Jam
                </th>
                {days.map((day, i) => (
                  <th key={i} style={{
                    padding: '10px 8px', fontSize: '12px', fontWeight: '600',
                    color: 'var(--gray-600)', textAlign: 'center', borderBottom: '2px solid var(--gray-200)'
                  }}>
                    <div>{dayNames[i] || day.day_name}</div>
                    <div style={{ fontSize: '11px', fontWeight: '400', color: 'var(--gray-400)', marginTop: '2px' }}>
                      {day.date}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allTimes.map((time, slotIdx) => (
                <tr key={slotIdx}>
                  <td style={{ padding: '6px 8px', fontSize: '12px', fontWeight: '500', color: 'var(--gray-600)', borderBottom: '1px solid var(--gray-100)' }}>
                    {time}
                  </td>
                  {days.map((day, dayIdx) => {
                    const slot = day.slots?.find(s => s.start_time === time);
                    if (!slot) {
                      return (
                        <td key={dayIdx} style={{ padding: '3px', borderBottom: '1px solid var(--gray-100)' }}>
                          <div className="schedule-slot slot-past" style={{ margin: 0, fontSize: '11px', padding: '6px 2px', opacity: 0.4 }}>
                            —
                          </div>
                        </td>
                      );
                    }
                    return (
                      <td key={dayIdx} style={{ padding: '3px', borderBottom: '1px solid var(--gray-100)' }}>
                        <div
                          className={`schedule-slot ${getSlotClass(slot.status, slot.reason)}`}
                          onClick={() => handleSlotClick(slot, day.date)}
                          title={getSlotLabel(slot.status)}
                          style={{ margin: 0, fontSize: '11px', padding: '6px 2px' }}
                        >
                          {slot.start_time}
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
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📅</div>
          <p>Belum ada jadwal tersedia untuk lapangan ini</p>
        </div>
      )}
    </div>
  );
}
