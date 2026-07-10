import React, { useState } from 'react';
import { ExternalLink, Info, X, ShieldAlert } from 'lucide-react';
import { GithubIcon } from './SocialIcons';
import { projects } from '../data/projects';
import './Projects.css';

export default function Projects({ defaultFilter = 'All' }) {
  const [filter, setFilter] = useState(defaultFilter);
  const [selectedProject, setSelectedProject] = useState(null);

  const filters = ['All', 'Featured', 'Cybersecurity', 'Web Development', 'Systems'];

  const filteredProjects = projects.filter(project => {
    if (filter === 'All') return true;
    if (filter === 'Featured') return project.featured;
    return project.tags.includes(filter) || project.technologies.includes(filter) || 
           (filter === 'Systems' && project.tags.includes('Distributed Systems')) ||
           (filter === 'Systems' && project.tags.includes('Systems'));
  });

  return (
    <section id="projects" className="section" aria-labelledby="projects-title">
      <div className="section-header">
        <span className="section-subtitle">Portfolio</span>
        <h2 id="projects-title" className="section-title">Technical Projects</h2>
      </div>

      {/* Filter Tabs */}
      <div className="projects-filters" role="tablist" aria-label="Project categories">
        {filters.map((category) => (
          <button
            key={category}
            role="tab"
            aria-selected={filter === category}
            onClick={() => setFilter(category)}
            className={`skills-tab-btn ${filter === category ? 'active' : ''}`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="projects-grid">
        {filteredProjects.map((project) => (
          <article key={project.id} className="interactive-card project-card">
            <div className="project-tag-list">
              {project.tags.slice(0, 2).map((tag, i) => (
                <span key={i} className="project-tag">{tag}</span>
              ))}
            </div>

            <h3 className="project-card-title">{project.title}</h3>
            <p className="project-card-desc">{project.description}</p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.5rem' }}>
              {project.technologies.slice(0, 4).map((tech, idx) => (
                <span 
                  key={idx} 
                  style={{ 
                    fontFamily: 'var(--font-mono)', 
                    fontSize: '0.65rem', 
                    color: 'var(--color-gold-dark)',
                    background: 'var(--color-gold-glow)',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '2px'
                  }}
                >
                  {tech}
                </span>
              ))}
              {project.technologies.length > 4 && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  +{project.technologies.length - 4} more
                </span>
              )}
            </div>

            <div className="project-card-footer">
              <button 
                onClick={() => setSelectedProject(project)}
                className="btn-text"
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                aria-label={`Read more details about ${project.title}`}
              >
                <Info size={14} />
                Read More
              </button>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <a 
                  href={project.githubLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="contact-social-btn" 
                  style={{ width: '32px', height: '32px' }}
                  title="View Source Code"
                  aria-label={`View code for ${project.title}`}
                >
                  <GithubIcon size={14} />
                </a>
                <a 
                  href={project.demoLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="contact-social-btn" 
                  style={{ width: '32px', height: '32px' }}
                  title="View Live Demo"
                  aria-label={`View live demo for ${project.title}`}
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div 
          className="project-modal-backdrop" 
          onClick={() => setSelectedProject(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div 
            className="project-modal-container" 
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedProject(null)}
              className="project-modal-close"
              aria-label="Close project details"
            >
              <X size={24} />
            </button>

            <div className="project-modal-body">
              <div className="project-modal-header">
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  {selectedProject.tags.map((tag, idx) => (
                    <span key={idx} className="project-tag">{tag}</span>
                  ))}
                </div>
                <h3 id="modal-title" className="project-modal-headline">{selectedProject.title}</h3>
              </div>

              <div className="project-modal-section">
                <h4 className="project-modal-section-title">Overview</h4>
                <p style={{ lineHeight: '1.7' }}>{selectedProject.longDescription}</p>
              </div>

              <div className="project-modal-section">
                <h4 className="project-modal-section-title">Core Features</h4>
                <ul className="project-modal-features-list">
                  {selectedProject.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
              </div>

              <div className="project-modal-section">
                <h4 className="project-modal-section-title">Challenges Solved</h4>
                <p style={{ lineHeight: '1.7', display: 'flex', gap: '0.75rem' }}>
                  <ShieldAlert size={20} style={{ color: 'var(--color-gold)', flexShrink: 0, marginTop: '0.2rem' }} />
                  <span>{selectedProject.challengesSolved}</span>
                </p>
              </div>

              <div className="project-modal-section">
                <h4 className="project-modal-section-title">Lessons Learned</h4>
                <p style={{ lineHeight: '1.7' }}>{selectedProject.lessonsLearned}</p>
              </div>

              <div className="project-modal-section">
                <h4 className="project-modal-section-title">Technology Stack</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {selectedProject.technologies.map((tech, idx) => (
                    <span 
                      key={idx} 
                      style={{ 
                        fontFamily: 'var(--font-mono)', 
                        fontSize: '0.75rem', 
                        color: 'var(--text-primary)',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '4px'
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="project-modal-links">
                <a 
                  href={selectedProject.githubLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-primary"
                  aria-label="View Project Code on GitHub"
                >
                  <GithubIcon size={16} />
                  View Code
                </a>
                <a 
                  href={selectedProject.demoLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-secondary"
                  aria-label="Launch Live Demo"
                >
                  <ExternalLink size={16} />
                  Live Demo
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="double-divider" role="presentation">
        <div className="double-divider-center"></div>
      </div>
    </section>
  );
}
