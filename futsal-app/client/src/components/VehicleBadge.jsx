import React from 'react';

export default function VehicleBadge({ jenis }) {
  const isMotor = jenis === 'Motor';
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 600,
      fontFamily: "'Inter', sans-serif",
      background: isMotor ? 'rgba(34,197,94,0.12)' : 'rgba(59,130,246,0.12)',
      color: isMotor ? '#16A34A' : '#2563EB',
      border: `1px solid ${isMotor ? 'rgba(34,197,94,0.3)' : 'rgba(59,130,246,0.3)'}`,
    }}>
      {isMotor ? '🏍️' : '🚗'} {jenis}
    </span>
  );
}
