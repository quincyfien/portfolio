import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import './Skills.css';

export default function Skills() {
  const { skills } = useData();

  const domains = useMemo(() => Object.entries(skills || {}), [skills]);

  return (
    <section id="skills" className="section" aria-labelledby="skills-title">
      <div className="section-header">
        <span className="section-subtitle">Competencies</span>
        <h2 id="skills-title" className="section-title">Professional Skills</h2>
      </div>

      <div className="skills-domains-grid">
        {domains.map(([key, domain]) => (
          <div key={key} className="skills-domain-card glass-panel">
            <div className="skills-domain-header">
              <h3 className="skills-domain-title">{domain.title}</h3>
              <span className="skills-level-badge">{domain.level}</span>
            </div>

            <div className="skills-domain-body">
              {(domain.categories || []).map((cat) => {
                const items = (domain.items || []).filter((s) => s.category === cat.key);
                if (items.length === 0) return null;
                return (
                  <div key={cat.key} className="skills-category-group">
                    <div className="skills-category-heading">
                      <h4 className="skills-category-title">{cat.key}</h4>
                      <p className="skills-category-desc">{cat.description}</p>
                    </div>
                    <div className="skills-chips">
                      {items.map((skill, index) => (
                        <span key={index} className="skill-chip">{skill.name}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="double-divider" role="presentation">
        <div className="double-divider-center"></div>
      </div>
    </section>
  );
}
