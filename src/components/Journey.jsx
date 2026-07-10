import React from 'react';
import { journey } from '../data/journey';
import './Journey.css';

export default function Journey() {
  return (
    <section id="journey" className="section" aria-labelledby="journey-title">
      <div className="section-header">
        <span className="section-subtitle">Timeline</span>
        <h2 id="journey-title" className="section-title">My Professional Journey</h2>
      </div>

      <div className="timeline-container">
        {journey.map((item, index) => (
          <div key={index} className="timeline-item">
            <div className="timeline-dot" aria-hidden="true"></div>
            
            <div className="timeline-content-wrapper">
              <article className="timeline-card glass-panel">
                <span className="timeline-date">{item.year}</span>
                <h3 className="timeline-title">{item.title}</h3>
                <h4 className="timeline-subtitle">{item.subtitle}</h4>
                <p className="timeline-desc">{item.description}</p>
              </article>
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
