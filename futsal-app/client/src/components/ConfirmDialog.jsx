import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { AlertTriangle, CheckCircle } from 'lucide-react';

const ConfirmDialog = ({
  isOpen,
  title,
  description,
  onConfirm,
  onCancel,
  type = 'danger',
  isLoading = false
}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    } else {
      setShow(false);
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && !isLoading) {
        onCancel();
      }
    };
    if (show) {
      window.addEventListener('keydown', handleEscape);
    }
    return () => window.removeEventListener('keydown', handleEscape);
  }, [show, onCancel, isLoading]);

  if (!show) return null;

  const dialogContent = (
    <div className="modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget && !isLoading) onCancel();
    }}>
      <div className="modal-content" style={{ padding: '24px', maxWidth: '400px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <div style={{ 
            padding: '12px', 
            borderRadius: '50%', 
            background: type === 'danger' ? 'var(--red-100)' : 'var(--green-100)',
            color: type === 'danger' ? 'var(--red-500)' : 'var(--green-600)'
          }}>
            {type === 'danger' ? <AlertTriangle size={32} /> : <CheckCircle size={32} />}
          </div>
        </div>
        
        <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '20px', fontWeight: '700', color: 'var(--gray-900)', marginBottom: '8px' }}>
          {title}
        </h3>
        
        <p style={{ color: 'var(--gray-500)', fontSize: '14px', marginBottom: '24px' }}>
          {description}
        </p>
        
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="btn btn-outline"
            style={{ flex: 1 }}
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`btn ${type === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            style={{ flex: 1, border: 'none' }}
          >
            {isLoading ? (
              <>
                <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }}></div>
                Memproses...
              </>
            ) : (
              'Konfirmasi'
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(dialogContent, document.body);
};

export default ConfirmDialog;
