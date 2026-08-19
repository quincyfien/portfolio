import React, { useState, useEffect } from 'react';
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

const CV_PATH = '/assets/documents/CV_Ndichia_Quincy.docx';

export default function App() {
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const sections = ['home', 'about', 'skills', 'services', 'projects', 'journey', 'blog', 'contact'];

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

    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

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

  return (
    <div className="app-container">
      <Navbar currentSection={activeSection} onNavigate={handleNavigate} />

      <main id="main-content" className="main-content" role="main">
        <Hero onNavigate={handleNavigate} cvPath={CV_PATH} />
        <About />
        <Skills />
        <Services />
        <Projects />
        <Journey />
        <Blog />
        <Contact cvPath={CV_PATH} />
      </main>

      <Footer />
    </div>
  );
}
