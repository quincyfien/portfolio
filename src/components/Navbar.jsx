import React, { useState, useEffect } from 'react';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { profile } from '../data/profile';
import './Navbar.css';

const ALL_NAV_LINKS = [
  { name: 'Home', id: 'home' },
  { name: 'About', id: 'about' },
  { name: 'Skills', id: 'skills' },
  { name: 'Services', id: 'services' },
  { name: 'Projects', id: 'projects' },
  { name: 'Journey', id: 'journey' },
  { name: 'Blog', id: 'blog' },
  { name: 'Contact', id: 'contact' },
];

export default function Navbar({ currentSection, onNavigate, roleConfig, visibleSections }) {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const navLinks = ALL_NAV_LINKS.filter((link) =>
    visibleSections.includes(link.id),
  );

  const handleLinkClick = (id) => {
    setMobileMenuOpen(false);
    onNavigate(id);
  };

  return (
    <header className="header-nav" role="banner">
      <div className="nav-container">
        <a
          href="#home"
          className="nav-logo-link"
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick('home');
          }}
        >
          <div className="monogram-seal" aria-hidden="true">
            {profile.avatarSymbol}
          </div>
          <span className="nav-logo-text">{profile.name}</span>

          {roleConfig && (
            <span className="nav-role-badge">{roleConfig.label}</span>
          )}
        </a>

        <nav role="navigation" aria-label="Main navigation">
          <ul className={`nav-menu ${mobileMenuOpen ? 'open' : ''}`}>
            {navLinks.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  className={`nav-link ${
                    currentSection === link.id ? 'active' : ''
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick(link.id);
                  }}
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="nav-actions">
          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="menu-toggle-btn"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
}
