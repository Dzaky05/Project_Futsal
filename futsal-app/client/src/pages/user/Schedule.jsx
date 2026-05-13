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
      setFields(f);
      if (f.length > 0) setSelectedField(f[0].id);
    }).catch(console.error);
  }, []);

  const fetchSchedule = useCallback(() => {
    if (!selectedField) return;
    setLoading(true);
    api.get(`/schedule/weekly/${selectedField}`, { params: { week_offset: weekOffset } })
      .then(res => { setSchedule(res.data.data || res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [selectedField, weekOffset]);

  useEffect(() => { fetchSchedule(); }, [fetchSchedule]);

  const dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  const handleSlotClick = (slot, date) => {
    if (slot.status !== 'available') return;
    navigate(`/booking?field_id=${selectedField}&date=${date}&start=${slot.time}&end=${slot.end_time}`);
  };

  const getSlotClass = (status) => {
    switch (status) {
      case 'available': return 'slot-available';
      case 'booked': return 'slot-booked';
      case 'blocked': return 'slot-blocked';
      default: return 'slot-past';
    }
  };

  const currentField = fields.find(f => f.id === selectedField);

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
              {currentField.facilities && JSON.parse(currentField.facilities || '[]').map((f, i) => (
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
              {schedule?.period || 'Memuat...'}
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
          <span style={{ width: '14px', height: '14px', borderRadius: '4px', background: 'var(--orange-100)' }}></span>
          Diblokir
        </span>
      </div>

      {/* Schedule Grid */}
      {loading ? (
        <div className="loading-center"><div className="spinner"></div></div>
      ) : schedule?.days ? (
        <div className="card" style={{ padding: '16px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr>
                <th style={{ padding: '10px 8px', fontSize: '12px', fontWeight: '600', color: 'var(--gray-500)', textAlign: 'left', borderBottom: '2px solid var(--gray-200)', width: '80px' }}>
                  Jam
                </th>
                {schedule.days.map((day, i) => (
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
              {schedule.days[0]?.slots?.map((_, slotIdx) => (
                <tr key={slotIdx}>
                  <td style={{ padding: '6px 8px', fontSize: '12px', fontWeight: '500', color: 'var(--gray-600)', borderBottom: '1px solid var(--gray-100)' }}>
                    {schedule.days[0].slots[slotIdx]?.time}
                  </td>
                  {schedule.days.map((day, dayIdx) => {
                    const slot = day.slots[slotIdx];
                    if (!slot) return <td key={dayIdx}></td>;
                    return (
                      <td key={dayIdx} style={{ padding: '3px', borderBottom: '1px solid var(--gray-100)' }}>
                        <div
                          className={`schedule-slot ${getSlotClass(slot.status)}`}
                          onClick={() => handleSlotClick(slot, day.date)}
                          title={slot.status === 'available' ? 'Klik untuk booking' : slot.status === 'booked' ? 'Sudah dipesan' : 'Diblokir'}
                          style={{ margin: 0, fontSize: '11px', padding: '6px 2px' }}
                        >
                          {slot.time}
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
