import React, { useState } from 'react';
import { Shield, Eye, EyeOff, X, KeyRound, ArrowRight } from 'lucide-react';
import { useData } from '../../context/DataContext';
import './AdminModal.css';

export default function AdminModal({ isOpen, onClose }) {
  const { loginAdmin, isAuthenticated } = useData();
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState(false);

  if (!isOpen || isAuthenticated) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = loginAdmin(pin);
    if (success) {
      setPin('');
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <div className="admin-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="admin-modal-title">
      <div className="admin-modal-backdrop" onClick={onClose} />
      <div className="admin-modal-card glass-panel">
        <button className="admin-modal-close" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        <div className="admin-modal-header">
          <div className="admin-shield-icon">
            <Shield size={28} />
          </div>
          <h2 id="admin-modal-title" className="admin-modal-title">Admin Dashboard Authorization</h2>
          <p className="admin-modal-subtitle">
            Enter your security access PIN code to manage job title, journey, and technical documents.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="admin-modal-form">
          <div className="admin-input-group">
            <label htmlFor="admin-pin-input" className="admin-input-label">
              <KeyRound size={14} /> Security PIN Code
            </label>
            <div className="admin-input-wrapper">
              <input
                id="admin-pin-input"
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(false);
                }}
                placeholder="Enter PIN (Default: admin123)"
                className={`admin-pin-input ${error ? 'input-error' : ''}`}
                autoFocus
              />
              <button
                type="button"
                className="pin-toggle-btn"
                onClick={() => setShowPin(!showPin)}
                tabIndex={-1}
              >
                {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && <p className="admin-error-text">Invalid PIN code. Please try default: admin123</p>}
          </div>

          <div className="admin-modal-hint">
            <span className="hint-pill">Default PIN: <strong>admin123</strong></span>
          </div>

          <div className="admin-modal-actions">
            <button type="button" onClick={onClose} className="btn-admin-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-admin-login">
              Authenticate Access <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
