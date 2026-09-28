import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useData } from '../../context/DataContext';
import './Toast.css';

export default function Toast() {
  const { toast } = useData();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 size={18} className="toast-icon toast-icon-success" />,
    error: <AlertCircle size={18} className="toast-icon toast-icon-error" />,
    info: <Info size={18} className="toast-icon toast-icon-info" />,
  };

  return (
    <div className={`toast-container toast-${toast.type || 'success'}`}>
      {icons[toast.type] || icons.success}
      <span className="toast-message">{toast.message}</span>
    </div>
  );
}
