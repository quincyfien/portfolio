import React, { useState, useMemo } from 'react';
import { skills } from '../data/skills';
import './Skills.css';

export default function Skills() {
  const [activeTab, setActiveTab] = useState('development');

  const categories = [
    { key: 'development', label: 'Full-Stack Development' },
    { key: 'security', label: 'Cloud & Security' },
  ];

  const groupedSkills = useMemo(() => {
    const group = skills[activeTab];
    return group.categories
      .map((cat) => ({
        key: cat.key,
        label: cat.key,
        description: cat.description,
        items: group.items.filter((s) => s.category === cat.key),
      }))
      .filter((g) => g.items.length > 0);
  }, [activeTab]);

  return (
    <section id="skills" className="section" aria-labelledby="skills-title">
      <div className="section-header">
        <span className="section-subtitle">Competencies</span>
        <h2 id="skills-title" className="section-title">Professional Skills</h2>
      </div>

      <div className="skills-tabs-container">
        <div className="skills-tabs-header" role="tablist" aria-label="Skills categories">
          {categories.map((cat) => (
            <button
              key={cat.key}
              role="tab"
              aria-selected={activeTab === cat.key}
              aria-controls={`panel-${cat.key}`}
              id={`tab-${cat.key}`}
              tabIndex={activeTab === cat.key ? 0 : -1}
              onClick={() => setActiveTab(cat.key)}
              className={`skills-tab-btn ${activeTab === cat.key ? 'active' : ''}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div
          id={`panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
        >
          <div className="skills-level-badge">{skills[activeTab].level}</div>

          {groupedSkills.map((group) => (
            <div key={group.key} className="skills-category-group">
              <div className="skills-category-heading">
                <h3 className="skills-category-title">{group.label}</h3>
                <p className="skills-category-desc">{group.description}</p>
              </div>
              <div className="skills-chips">
                {group.items.map((skill, index) => (
                  <span key={index} className="skill-chip">
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="double-divider" role="presentation">
        <div className="double-divider-center"></div>
      </div>
    </section>
  );
}
