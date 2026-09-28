import React from 'react';
import { Award, ExternalLink, CheckCircle2, Clock, CalendarClock } from 'lucide-react';
import { useData } from '../context/DataContext';
import './Certifications.css';

const STATUS_META = {
  Earned: { icon: CheckCircle2, className: 'cert-status-earned' },
  'In Progress': { icon: Clock, className: 'cert-status-progress' },
  Planned: { icon: CalendarClock, className: 'cert-status-planned' },
};

export default function Certifications() {
  const { certifications } = useData();

  return (
    <section id="certifications" className="section" aria-labelledby="certifications-title">
      <div className="section-header">
        <span className="section-subtitle">Credentials</span>
        <h2 id="certifications-title" className="section-title">Certifications</h2>
      </div>

      <div className="cert-grid">
        {certifications.map((cert) => {
          const meta = STATUS_META[cert.status] || STATUS_META.Earned;
          const StatusIcon = meta.icon;
          return (
            <div key={cert.id} className="cert-card glass-panel">
              <div className="cert-card-top">
                <div className="cert-icon-box">
                  <Award size={22} strokeWidth={1.5} />
                </div>
                <span className={`cert-status ${meta.className}`}>
                  <StatusIcon size={13} />
                  {cert.status}
                </span>
              </div>

              <h3 className="cert-name">{cert.name}</h3>
              <p className="cert-issuer">{cert.issuer}</p>

              {(cert.date || cert.credentialId) && (
                <div className="cert-meta">
                  {cert.date && <span className="cert-date">{cert.date}</span>}
                  {cert.credentialId && <span className="cert-cred-id">{cert.credentialId}</span>}
                </div>
              )}

              {cert.verifyUrl && (
                <a
                  href={cert.verifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cert-verify"
                >
                  Verify Credential <ExternalLink size={13} />
                </a>
              )}
            </div>
          );
        })}
      </div>

      <div className="double-divider" role="presentation">
        <div className="double-divider-center"></div>
      </div>
    </section>
  );
}
