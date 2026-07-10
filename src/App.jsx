import React, { useState, useEffect, useMemo, Fragment } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Services from './components/Services';
import Projects from './components/Projects';
import Journey from './components/Journey';
import Blog from './components/Blog';
import Contact from './components/Contact';
import Footer from './components/Footer';
import { getRoleConfig, ALL_SECTIONS } from './config/roles';

const SECTIONS_MAP = {
  home: Hero,
  about: About,
  skills: Skills,
  services: Services,
  projects: Projects,
  journey: Journey,
  blog: Blog,
  contact: Contact,
};

export default function App() {
  const roleConfig = useMemo(() => getRoleConfig(), []);
  const visibleSections = roleConfig ? roleConfig.sections : ALL_SECTIONS;
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    if (roleConfig) {
      document.title = roleConfig.pageTitle;
    }
  }, [roleConfig]);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0,
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    visibleSections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [visibleSections]);

  const handleNavigate = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const navbarOffset = 70;
      const elementPosition =
        element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - navbarOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const cvPath = useMemo(
    () => roleConfig?.cvPath || '/assets/documents/CV_Ndichia_Quincy_Cybersecurity.docx',
    [roleConfig],
  );

  const sectionProps = useMemo(
    () => ({
      home: { cvPath },
      skills: {
        defaultActiveTab: roleConfig?.defaultSkillTab,
      },
      projects: {
        defaultFilter: roleConfig?.defaultProjectFilter,
      },
      contact: { cvPath },
    }),
    [roleConfig, cvPath],
  );

  return (
    <div className="app-container">
      <Navbar
        currentSection={activeSection}
        onNavigate={handleNavigate}
        roleConfig={roleConfig}
        visibleSections={visibleSections}
      />

      <main id="main-content" className="main-content" role="main">
        {visibleSections.map((id) => {
          const Component = SECTIONS_MAP[id];
          if (!Component) return null;

          const extraProps = { ...(sectionProps[id] || {}) };
          if (id === 'home') {
            extraProps.onNavigate = handleNavigate;
          }

          return (
            <Fragment key={id}>
              <Component {...extraProps} />
            </Fragment>
          );
        })}
      </main>

      <Footer />
    </div>
  );
}
