import React from 'react';
import { socialLinks } from '../data/socialLinks';
import { profile } from '../data/profile';
import './Footer.css';

export default function Footer() {
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
      </div>
    </footer>
  );
}
