import React from 'react';
import { PenTool, FileText, ShieldCheck } from 'lucide-react';
import { useData } from '../context/DataContext';
import './HowIWork.css';

const PILLAR_ICONS = [PenTool, FileText, ShieldCheck];

export default function HowIWork() {
  const { pillars } = useData();

  return (
    <section id="how-i-work" className="section" aria-labelledby="how-i-work-title">
      <div className="section-header">
        <span className="section-subtitle">Methodology</span>
        <h2 id="how-i-work-title" className="section-title">How I Work</h2>
      </div>

      <div className="pillars-grid">
        {pillars.map((pillar, index) => {
          const Icon = PILLAR_ICONS[index % PILLAR_ICONS.length] || FileText;
          return (
            <div key={pillar.id} className="pillar-card interactive-card">
              <div className="pillar-number">{String(index + 1).padStart(2, '0')}</div>
              <div className="pillar-icon-box">
                <Icon size={24} strokeWidth={1.5} />
              </div>
              <h3 className="pillar-title">{pillar.title}</h3>
              <p className="pillar-desc">{pillar.description}</p>
              <ul className="pillar-list">
                {pillar.items.map((item, i) => (
                  <li key={i} className="pillar-item">{item}</li>
                ))}
              </ul>
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
