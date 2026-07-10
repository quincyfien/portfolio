import React, { useEffect, useRef } from 'react';
import { Shield, FileText, ArrowRight, Briefcase } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './SocialIcons';
import { profile } from '../data/profile';
import { socialLinks } from '../data/socialLinks';
import profileImg from '../assets/images/profile-placeholder.png';
import './Hero.css';

export default function Hero({ onNavigate, cvPath }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particles = [];
    const particleCount = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000));
    const connectionDistance = 120;
    const mouse = { x: null, y: null, radius: 150 };

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.radius = Math.random() * 2 + 1;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
        if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
        if (mouse.x !== null && mouse.y !== null) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            this.x += (dx / dist) * force * 0.8;
            this.y += (dy / dist) * force * 0.8;
          }
        }
      }
      draw() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        ctx.fillStyle = isDark ? 'rgba(229, 193, 88, 0.45)' : 'rgba(197, 168, 128, 0.6)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) particles.push(new Particle());

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const handleMouseLeave = () => { mouse.x = null; mouse.y = null; };
    canvas.parentElement.addEventListener('mousemove', handleMouseMove);
    canvas.parentElement.addEventListener('mouseleave', handleMouseLeave);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const lineColor = isDark ? '229, 193, 88' : '197, 168, 128';
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * 0.15;
            ctx.strokeStyle = `rgba(${lineColor}, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (canvas && canvas.parentElement) {
        canvas.parentElement.removeEventListener('mousemove', handleMouseMove);
        canvas.parentElement.removeEventListener('mouseleave', handleMouseLeave);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section id="home" className="hero-wrapper" aria-label="Introduction">
      <canvas id="hero-canvas" ref={canvasRef}></canvas>

      <div className="section hero-inner" style={{ zIndex: 5, width: '100%' }}>

        {/* ── Left: Text ── */}
        <div className="hero-content">
          <div className="hero-subtitle">
            <Shield size={14} />
            <span>Secure Systems &amp; Documented Code</span>
          </div>

          <h1 className="hero-title">{profile.name}</h1>
          <p className="hero-headline">{profile.headline}</p>
          <p className="hero-bio">{profile.bio}</p>

          <div className="hero-buttons">
            <button
              onClick={() => onNavigate('projects')}
              className="btn btn-primary"
              aria-label="Navigate to Projects"
            >
              View Projects <ArrowRight size={16} />
            </button>

            <button
              onClick={() => onNavigate('contact')}
              className="btn btn-secondary"
              aria-label="Hire Me"
            >
              <Briefcase size={16} /> Hire Me
            </button>

            <a href={cvPath} className="btn btn-secondary" download aria-label="Download CV">
              <FileText size={16} /> Download CV
            </a>

            <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" aria-label="GitHub">
              <GithubIcon size={16} /> GitHub
            </a>

            <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" aria-label="LinkedIn">
              <LinkedinIcon size={16} /> LinkedIn
            </a>
          </div>
        </div>

        {/* ── Right: Floating Portrait ── */}
        <div className="hero-portrait-col">
          <div className="hero-portrait-frame">
            {/* Corner ornaments */}
            <span className="portrait-corner portrait-corner--tl" aria-hidden="true" />
            <span className="portrait-corner portrait-corner--tr" aria-hidden="true" />
            <span className="portrait-corner portrait-corner--bl" aria-hidden="true" />
            <span className="portrait-corner portrait-corner--br" aria-hidden="true" />

            <img
              src={profileImg}
              alt={`${profile.name} – professional portrait`}
              className="hero-portrait-img"
            />

            {/* Gold ribbon */}
            <div className="hero-portrait-ribbon" aria-hidden="true">
              <span className="hero-portrait-ribbon-monogram">{profile.avatarSymbol}</span>
              <span className="hero-portrait-ribbon-text">Cybersecurity · Developer · Writer</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
