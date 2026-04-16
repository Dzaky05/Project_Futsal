import React from 'react';

export default function Modal({ show, title, children, onConfirm, onCancel, confirmText = 'Ya, Proses', cancelText = 'Batal', confirmColor = '#F97316' }) {
  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      animation: 'fadeIn 0.2s ease',
    }} onClick={onCancel}>
      <div style={{
        background: '#fff',
        borderRadius: '20px',
        padding: '28px',
        maxWidth: '440px',
        width: '90%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        animation: 'slideUp 0.3s cubic-bezier(0.16,1,0.3,1)',
      }} onClick={e => e.stopPropagation()}>
        <h3 style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: '18px',
          fontWeight: 600,
          color: '#111827',
          marginBottom: '16px',
        }}>{title}</h3>

        <div style={{ marginBottom: '24px', color: '#4B5563', fontFamily: "'Inter', sans-serif", fontSize: '14px' }}>
          {children}
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              border: '1.5px solid #E5E7EB',
              background: '#fff',
              color: '#6B7280',
              fontWeight: 600,
              fontSize: '13px',
              fontFamily: "'Inter', sans-serif",
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F9FAFB'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              border: 'none',
              background: confirmColor,
              color: '#fff',
              fontWeight: 600,
              fontSize: '13px',
              fontFamily: "'Inter', sans-serif",
              cursor: 'pointer',
              boxShadow: `0 4px 12px ${confirmColor}55`,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
