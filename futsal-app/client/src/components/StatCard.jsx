import React from 'react';

const colorMap = {
  orange: { bg: '#FFF7ED', border: '#FDBA74', icon: '#F97316', barBg: '#FED7AA', barFill: '#F97316' },
  blue:   { bg: '#EFF6FF', border: '#93C5FD', icon: '#3B82F6', barBg: '#BFDBFE', barFill: '#3B82F6' },
  green:  { bg: '#F0FDF4', border: '#86EFAC', icon: '#22C55E', barBg: '#BBF7D0', barFill: '#22C55E' },
  red:    { bg: '#FEF2F2', border: '#FECACA', icon: '#EF4444', barBg: '#FECACA', barFill: '#EF4444' },
  purple: { bg: '#FAF5FF', border: '#D8B4FE', icon: '#A855F7', barBg: '#E9D5FF', barFill: '#A855F7' },
  gray:   { bg: '#F9FAFB', border: '#D1D5DB', icon: '#6B7280', barBg: '#E5E7EB', barFill: '#6B7280' },
};

export default function StatCard({ label, value, icon, color = 'orange', subtitle, progress }) {
  const scheme = colorMap[color] || colorMap.orange;

  return (
    <div style={{
      background: '#fff',
      borderRadius: '16px',
      border: `1px solid ${scheme.border}40`,
      padding: '20px 22px',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      transition: 'all 0.3s ease',
      cursor: 'default',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      position: 'relative',
      overflow: 'hidden',
      minHeight: '110px',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = `0 8px 24px ${scheme.border}30`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
      }}
    >
      <div style={{ flex: 1 }}>
        <p style={{
          fontSize: '12px',
          color: '#6B7280',
          fontFamily: "'Inter', sans-serif",
          fontWeight: 500,
          marginBottom: '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.3px',
        }}>{label}</p>
        <p style={{
          fontSize: '28px',
          fontWeight: 700,
          color: '#111827',
          fontFamily: "'Poppins', sans-serif",
          lineHeight: 1.1,
          marginBottom: '6px',
        }}>{value}</p>
        {subtitle && (
          <p style={{
            fontSize: '11px',
            color: '#9CA3AF',
            fontFamily: "'Inter', sans-serif",
            fontWeight: 400,
          }}>{subtitle}</p>
        )}
        {progress !== undefined && (
          <div style={{
            marginTop: '8px',
            height: '4px',
            background: scheme.barBg + '60',
            borderRadius: '2px',
            overflow: 'hidden',
            width: '100%',
            maxWidth: '120px',
          }}>
            <div style={{
              height: '100%',
              width: `${Math.min(100, progress)}%`,
              background: scheme.barFill,
              borderRadius: '2px',
              transition: 'width 0.6s ease',
            }} />
          </div>
        )}
      </div>
      <div style={{
        width: '44px',
        height: '44px',
        borderRadius: '12px',
        background: scheme.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        flexShrink: 0,
        border: `1px solid ${scheme.border}30`,
      }}>
        {icon}
      </div>
    </div>
  );
}
