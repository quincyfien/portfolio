import React from 'react';
import { ChevronRight, MapPin, Shield, GraduationCap } from 'lucide-react';
import { useData } from '../context/DataContext';
import { socialLinks } from '../data/socialLinks';
import profileImg from '../assets/images/profile-placeholder.png';
import './About.css';

const INTERESTS = ['Cybersecurity', 'Cloud Tech', 'Linux Systems', 'Software Engineering', 'Technical Writing'];

export default function About() {
  const { profile } = useData();

  return (
    <section id="about" className="section" aria-labelledby="about-title">
      <div className="section-header">
        <span className="section-subtitle">Biography</span>
        <h2 id="about-title" className="section-title">About Me</h2>
      </div>

      {/* ── Top: portrait + intro ── */}
      <div className="about-top">
        <div className="about-image-wrapper">
          <div className="about-image-frame">
            <img
              src={profileImg}
              alt={`Portrait of ${profile.name}`}
              className="about-image"
            />
          </div>

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

        <div className="about-intro-text">
          <div className="aristocratic-border">
            <div style={{ padding: '1.4rem 1.25rem' }}>
              <p className="serif-body-text" style={{ marginBottom: 0 }}>
                {profile.summary}
              </p>
            </div>
          </div>

          <div className="about-details-list">
            {(profile.aboutDetails || []).map((detail, index) => (
              <div key={index} className="about-detail-item">
                <ChevronRight size={16} className="about-detail-chevron" />
                <p className="about-detail-text">{detail}</p>
              </div>
            ))}
          </div>

          <div className="about-stats-row">
            <div className="about-stat">
              <span className="about-stat-number">5+</span>
              <span className="about-stat-label">Projects Built</span>
            </div>
            <div className="about-stat">
              <span className="about-stat-number">{(profile.education || []).length}</span>
              <span className="about-stat-label">Degrees</span>
            </div>
            <div className="about-stat">
              <span className="about-stat-number">4</span>
              <span className="about-stat-label">Service Areas</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom: education + interests ── */}
      <div className="about-bottom">
        <div className="about-bottom-header">
          <h3 className="academic-headline">
            <GraduationCap size={18} /> Academic Profile
          </h3>
        </div>

        <div className="education-grid">
          {(profile.education || []).map((edu, index) => (
            <div key={index} className="education-card glass-panel">
              <h4 className="academic-degree">{edu.degree}</h4>
              <p className="academic-school">{edu.institution}</p>
              <span className="academic-badge">{edu.status}</span>
            </div>
          ))}
        </div>

        <div className="interests-block">
          <div className="interests-commitment">
            <div className="monogram-seal" style={{ width: '40px', height: '40px', fontSize: '1rem', flexShrink: 0 }} aria-hidden="true">
              <Shield size={16} />
            </div>
            <div>
              <h4 className="interests-title">Commitment to Growth</h4>
              <p className="interests-text">
                Applying scientific rigor and analytical discipline from Physics to
                design, document, and defend secure digital systems.
              </p>
            </div>
          </div>

          <div className="interests-tags">
            <p className="interests-label">Areas of Interest</p>
            <div className="interests-chips">
              {INTERESTS.map((area) => (
                <span key={area} className="academic-badge">{area}</span>
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
