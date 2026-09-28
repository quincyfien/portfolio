import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import HowIWork from './components/HowIWork';
import Skills from './components/Skills';
import Services from './components/Services';
import Projects from './components/Projects';
import Journey from './components/Journey';
import Certifications from './components/Certifications';
import Blog from './components/Blog';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminModal from './components/Admin/AdminModal';
import AdminDashboard from './components/Admin/AdminDashboard';
import Toast from './components/Admin/Toast';
import { DataProvider, useData } from './context/DataContext';

const CV_PATH = '/assets/documents/Ndichia_Quincy_CV.pdf';

function PortfolioMain() {
  const [activeSection, setActiveSection] = useState('home');
  const { isAdminOpen, isAuthenticated, openAdminModal, closeAdminModal } = useData();

  useEffect(() => {
    const sections = ['home', 'about', 'how-i-work', 'skills', 'services', 'projects', 'journey', 'certifications', 'blog', 'contact'];

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

  // Hidden admin entry: visit /#admin to open the login modal
  useEffect(() => {
    const openAdminFromHash = () => {
      if (window.location.hash === '#admin') {
        openAdminModal();
      }
    };
    openAdminFromHash();
    window.addEventListener('hashchange', openAdminFromHash);
    return () => window.removeEventListener('hashchange', openAdminFromHash);
  }, [openAdminModal]);

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
        <HowIWork />
        <Skills />
        <Services />
        <Projects />
        <Journey />
        <Certifications />
        <Blog />
        <Contact cvPath={CV_PATH} />
      </main>

      <Footer />

      {/* Admin Authentication Screen Modal */}
      <AdminModal isOpen={isAdminOpen && !isAuthenticated} onClose={closeAdminModal} />

      {/* Full Admin Studio Dashboard */}
      {isAdminOpen && isAuthenticated && (
        <AdminDashboard onClose={closeAdminModal} />
      )}

      {/* Global Toast Notifications */}
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <PortfolioMain />
    </DataProvider>
  );
}
