import React, { useState } from 'react';
import { Mail, FileText, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './SocialIcons';
import { socialLinks } from '../data/socialLinks';
import './Contact.css';

export default function Contact({ cvPath }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [status, setStatus] = useState(null); // 'success', 'error', 'submitting'

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      const response = await fetch(socialLinks.formEndpoint, {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="section" aria-labelledby="contact-title">
      <div className="section-header">
        <span className="section-subtitle">Correspondence</span>
        <h2 id="contact-title" className="section-title">Get In Touch</h2>
      </div>

      <div className="contact-layout">
        {/* Contact Info Widget */}
        <div className="contact-info-card glass-panel">
          <div>
            <h3 className="contact-brand-title">Direct Contact</h3>
            <p className="contact-brand-desc">
              Whether you are looking to hire assistance, collaborate on cybersecurity research, request technical documentation, or simply start a conversation, please feel free to send a message.
            </p>
          </div>

          <div className="contact-details-list">
            <div className="contact-details-item">
              <span className="contact-icon-wrapper" aria-hidden="true">
                <Mail size={18} />
              </span>
              <a href={`mailto:${socialLinks.email}`} className="markdown-link">
                {socialLinks.email}
              </a>
            </div>
            
            <div className="contact-details-item">
              <span className="contact-icon-wrapper" aria-hidden="true">
                <FileText size={18} />
              </span>
              <span>{socialLinks.address}</span>
            </div>
          </div>

          <div>
            <h4 style={{ fontFamily: 'var(--font-serif-display)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-gold-dark)', marginBottom: '0.75rem' }}>
              Connect & Review Work
            </h4>
            <div className="contact-social-row">
              <a 
                href={socialLinks.github} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="contact-social-btn"
                aria-label="Visit GitHub profile"
                title="GitHub"
              >
                <GithubIcon size={18} />
              </a>
              <a 
                href={socialLinks.linkedin} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="contact-social-btn"
                aria-label="Visit LinkedIn profile"
                title="LinkedIn"
              >
                <LinkedinIcon size={18} />
              </a>
              <a 
                href={cvPath} 
                download 
                className="contact-social-btn"
                aria-label="Download Curriculum Vitae (PDF)"
                title="Download CV"
              >
                <FileText size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Letter Layout Correspondence Form */}
        <div className="contact-form-card glass-panel">
          <form onSubmit={handleSubmit} className="letter-form" aria-label="Contact message form">
            <div className="form-group-row">
              <div className="letter-group">
                <label htmlFor="form-name" className="letter-label">Your Name</label>
                <input 
                  type="text" 
                  id="form-name" 
                  name="name" 
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="letter-input"
                  placeholder="e.g., Jane Doe"
                  disabled={status === 'submitting'}
                />
              </div>

              <div className="letter-group">
                <label htmlFor="form-email" className="letter-label">Your Email</label>
                <input 
                  type="email" 
                  id="form-email" 
                  name="email" 
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="letter-input"
                  placeholder="e.g., jane@example.com"
                  disabled={status === 'submitting'}
                />
              </div>
            </div>

            <div className="letter-group">
              <label htmlFor="form-subject" className="letter-label">Subject</label>
              <input 
                type="text" 
                id="form-subject" 
                name="subject" 
                required
                value={formData.subject}
                onChange={handleChange}
                className="letter-input"
                placeholder="Inquiry regarding services..."
                disabled={status === 'submitting'}
              />
            </div>

            <div className="letter-group">
              <label htmlFor="form-message" className="letter-label">Message</label>
              <textarea 
                id="form-message" 
                name="message" 
                required
                rows={5}
                value={formData.message}
                onChange={handleChange}
                className="letter-textarea"
                placeholder="Write your correspondence details here..."
                disabled={status === 'submitting'}
              ></textarea>
            </div>

            {/* Submission Status Message */}
            {status === 'success' && (
              <div className="form-status-msg success" role="alert">
                <CheckCircle size={16} style={{ verticalAlign: 'middle', marginRight: '0.35rem' }} />
                Your message has been sent successfully. Thank you for your correspondence!
              </div>
            )}

            {status === 'error' && (
              <div className="form-status-msg error" role="alert">
                <AlertCircle size={16} style={{ verticalAlign: 'middle', marginRight: '0.35rem' }} />
                An error occurred. Please try emailing directly.
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem' }}
              disabled={status === 'submitting'}
              aria-label="Send message"
            >
              {status === 'submitting' ? 'Sending Correspondence...' : 'Send Message'}
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
