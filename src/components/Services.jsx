import React from 'react';
import * as Icons from 'lucide-react';
import { useData } from '../context/DataContext';
import './Services.css';

export default function Services() {
  const { services } = useData();

  return (
    <section id="services" className="section" aria-labelledby="services-title">
      <div className="section-header">
        <span className="section-subtitle">Services</span>
        <h2 id="services-title" className="section-title">What I Offer</h2>
      </div>

      <div className="card-grid">
        {services.map((service) => {
          const IconComp = Icons[service.icon] || Icons.HelpCircle;

          return (
            <div key={service.id} className="interactive-card service-card">
              <div className="service-icon-box">
                <IconComp size={26} strokeWidth={1.5} />
              </div>

              <h3 className="service-title">{service.title}</h3>
              <p className="service-tagline">{service.tagline}</p>

              <ul className="service-list" aria-label={`Details for ${service.title}`}>
                {service.details.map((detail, index) => (
                  <li key={index} className="service-list-item">
                    {detail}
                  </li>
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
