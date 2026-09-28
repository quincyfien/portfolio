import React, { useState } from 'react';
import { Shield, Eye, EyeOff, X, Mail, KeyRound, ArrowRight } from 'lucide-react';
import { useData } from '../../context/DataContext';
import './AdminModal.css';

export default function AdminModal({ isOpen, onClose }) {
  const { loginAdmin, isAuthenticated, isSupabaseConfigured } = useData();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || isAuthenticated) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const success = await loginAdmin(email, password);
    setLoading(false);
    if (success) {
      setEmail('');
      setPassword('');
    } else {
      setError('Invalid email or password.');
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
          <h2 id="admin-modal-title" className="admin-modal-title">Admin Authorization</h2>
          <p className="admin-modal-subtitle">
            Sign in to manage your portfolio content.
          </p>
        </div>

        {!isSupabaseConfigured ? (
          <p className="admin-error-text" style={{ textAlign: 'center', marginBottom: '1rem' }}>
            Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable admin access.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="admin-modal-form">
            <div className="admin-input-group">
              <label htmlFor="admin-email-input" className="admin-input-label">
                <Mail size={14} /> Email
              </label>
              <input
                id="admin-email-input"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="you@example.com"
                className="admin-pin-input"
                autoFocus
                autoComplete="email"
              />
            </div>

            <div className="admin-input-group">
              <label htmlFor="admin-password-input" className="admin-input-label">
                <KeyRound size={14} /> Password
              </label>
              <div className="admin-input-wrapper">
                <input
                  id="admin-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••••••"
                  className={`admin-pin-input ${error ? 'input-error' : ''}`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="pin-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {error && <p className="admin-error-text">{error}</p>}
            </div>

            <div className="admin-modal-actions">
              <button type="button" onClick={onClose} className="btn-admin-cancel">
                Cancel
              </button>
              <button type="submit" className="btn-admin-login" disabled={loading}>
                {loading ? 'Signing in…' : 'Authenticate'} <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
