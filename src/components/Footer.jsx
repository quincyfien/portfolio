import React from 'react';
import { socialLinks } from '../data/socialLinks';
import { useData } from '../context/DataContext';
import { Shield } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  const { profile, openAdminModal } = useData();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-nav" role="contentinfo">
      <div className="footer-container">
        <div className="footer-logo">
          <div className="monogram-seal" style={{ width: '48px', height: '48px', fontSize: '1.4rem' }}>
            {profile.avatarSymbol}
          </div>
        </div>

        <p className="footer-message">
          "{socialLinks.footerMessage}"
        </p>

        <p className="footer-copyright">
          &copy; {currentYear} {profile.name}. All Rights Reserved. Crafted with scientific precision and security in mind.
        </p>

        <button
          onClick={openAdminModal}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-gold-dark, #c5a880)',
            cursor: 'pointer',
            fontSize: '0.75rem',
            marginTop: '0.75rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            opacity: 0.8,
            transition: 'opacity 0.2s ease',
          }}
          title="Open Admin Portal"
        >
          <Shield size={12} /> Admin Control Portal
        </button>
      </div>
    </footer>
  );
}
