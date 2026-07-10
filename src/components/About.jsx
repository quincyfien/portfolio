import React from 'react';
import { ChevronRight, MapPin, Shield } from 'lucide-react';
import { profile } from '../data/profile';
import { socialLinks } from '../data/socialLinks';
import profileImg from '../assets/images/profile-placeholder.png';
import './About.css';

export default function About() {
  return (
    <section id="about" className="section" aria-labelledby="about-title">
      <div className="section-header">
        <span className="section-subtitle">Biography</span>
        <h2 id="about-title" className="section-title">About Me</h2>
      </div>

      <div className="about-columns">

        {/* ── Column 1: Profile Portrait ── */}
        <div className="about-image-wrapper">
          <div className="about-image-frame">
            <img
              src={profileImg}
              alt={`Portrait of ${profile.name}`}
              className="about-image"
            />
          </div>

          {/* Name + Location badge below photo */}
          <div className="about-image-badge glass-panel">
            <span className="about-image-badge-name">{profile.avatarSymbol}</span>
            <div>
              <p className="about-image-badge-full">{profile.name}</p>
              <p className="about-image-badge-loc">
                <MapPin size={11} style={{ verticalAlign: 'middle', marginRight: '3px' }} />
                {socialLinks.address}
              </p>
            </div>
          </div>
        </div>

        {/* ── Column 2: Bio & Details ── */}
        <div className="about-intro-text">
          <div className="aristocratic-border">
            <div style={{ padding: '1.25rem 1rem' }}>
              <p className="serif-body-text" style={{ marginBottom: 0 }}>
                {profile.summary}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {profile.aboutDetails.map((detail, index) => (
              <div
                key={index}
                style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}
              >
                <ChevronRight
                  size={16}
                  style={{ color: 'var(--color-gold)', marginTop: '0.25rem', flexShrink: 0 }}
                />
                <p style={{ margin: 0, lineHeight: '1.6', fontSize: '0.95rem' }}>{detail}</p>
              </div>
            ))}
          </div>

          {/* Quick stats row */}
          <div className="about-stats-row">
            <div className="about-stat">
              <span className="about-stat-number">5+</span>
              <span className="about-stat-label">Projects Built</span>
            </div>
            <div className="about-stat">
              <span className="about-stat-number">2</span>
              <span className="about-stat-label">Degrees</span>
            </div>
            <div className="about-stat">
              <span className="about-stat-number">3+</span>
              <span className="about-stat-label">Service Areas</span>
            </div>
          </div>
        </div>

        {/* ── Column 3: Academic Card ── */}
        <div className="about-academic-card glass-panel">
          <h3 className="academic-headline">Academic Profile</h3>

          <div className="academic-timeline">
            {profile.education.map((edu, index) => (
              <div key={index} className="academic-item">
                <h4 className="academic-degree">{edu.degree}</h4>
                <p className="academic-school">{edu.institution}</p>
                <span className="academic-badge">{edu.status}</span>
              </div>
            ))}
          </div>

          {/* Separator */}
          <div style={{ margin: '2rem 0', borderTop: '1px dashed var(--border-color)' }} />

          {/* Commitment block */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div
              className="monogram-seal"
              style={{ width: '40px', height: '40px', fontSize: '1rem', flexShrink: 0 }}
              aria-hidden="true"
            >
              <Shield size={16} />
            </div>
            <div>
              <h4
                style={{
                  fontFamily: 'var(--font-serif-display)',
                  fontSize: '0.95rem',
                  marginBottom: '0.35rem',
                  color: 'var(--text-primary)',
                }}
              >
                Commitment to Growth
              </h4>
              <p style={{ fontSize: '0.85rem', margin: 0, lineHeight: '1.6' }}>
                Applying scientific rigor and analytical discipline from Physics to
                build and defend secure digital systems.
              </p>
            </div>
          </div>

          {/* Interests chips */}
          <div style={{ marginTop: '2rem' }}>
            <p
              style={{
                fontFamily: 'var(--font-serif-display)',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--color-gold-dark)',
                marginBottom: '0.75rem',
              }}
            >
              Areas of Interest
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {['Cybersecurity', 'Cloud Tech', 'Linux Systems', 'Software Engineering', 'Technical Writing'].map((area) => (
                <span key={area} className="academic-badge" style={{ fontSize: '0.72rem' }}>
                  {area}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="double-divider" role="presentation">
        <div className="double-divider-center"></div>
      </div>
    </section>
  );
}
