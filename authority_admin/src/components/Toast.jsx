import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function Toast({ toasts, removeToast }) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastItem 
          key={toast.id} 
          toast={toast} 
          onClose={() => removeToast(toast.id)} 
        />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 size={18} />;
      case 'error':
        return <AlertTriangle size={18} />;
      default:
        return <Info size={18} />;
    }
  };

  return (
    <div className={`toast toast-${toast.type || 'info'}`}>
      {getIcon()}
      <div style={{ flexGrow: 1 }}>{toast.message}</div>
      <button 
        onClick={onClose} 
        style={{ 
          background: 'none', 
          border: 'none', 
          color: 'inherit', 
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          opacity: 0.7
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}
