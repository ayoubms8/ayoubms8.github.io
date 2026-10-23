import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Menu, X, ExternalLink } from 'lucide-react';
import { PERSONAL_INFO } from '../data/portfolioData';

gsap.registerPlugin(ScrollTrigger);

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const progressBarRef = useRef(null);
  const navRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    const ctx = gsap.context(() => {
      // 1. Reading scroll progress bar scrub
      if (progressBarRef.current) {
        gsap.to(progressBarRef.current, {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            start: 'top top',
            end: 'max',
            scrub: 0.15
          }
        });
      }

      // 2. Active section detection on scroll
      const sections = [
        { id: 'hero', selector: '#hero' },
        { id: 'about', selector: '#about' },
        { id: 'skills', selector: '#skills' },
        { id: 'projects', selector: '#projects' },
        { id: 'contact', selector: '#contact' }
      ];

      sections.forEach(({ id, selector }) => {
        const el = document.querySelector(selector);
        if (el) {
          ScrollTrigger.create({
            trigger: el,
            start: 'top 35%',
            end: 'bottom 35%',
            onEnter: () => setActiveSection(id),
            onEnterBack: () => setActiveSection(id)
          });
        }
      });
    }, navRef);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      ctx.revert();
    };
  }, []);

  const scrollToSection = (e, id) => {
    e.preventDefault();
    setMobileOpen(false);
    const target = document.querySelector(id);
    if (!target) return;
    const navOffset = 70;
    const elementPosition = target.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - navOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  };

  return (
    <nav id="navbar" ref={navRef} className={scrolled ? 'scrolled' : ''}>
      <div className="nav-progress-bar" ref={progressBarRef} aria-hidden="true"></div>

      <div className="nav-inner">
        <a
          href="#hero"
          className="nav-logo"
          id="nav-logo"
          onClick={(e) => scrollToSection(e, '#hero')}
          aria-label="Home"
        >
          <span className="nav-logo-dot"></span>
          AL
        </a>

        <ul className="nav-links">
          <li>
            <a
              href="#about"
              id="nav-about"
              className={activeSection === 'about' ? 'active' : ''}
              onClick={(e) => scrollToSection(e, '#about')}
            >
              About
            </a>
          </li>
          <li>
            <a
              href="#skills"
              id="nav-skills"
              className={activeSection === 'skills' ? 'active' : ''}
              onClick={(e) => scrollToSection(e, '#skills')}
            >
              Skills
            </a>
          </li>
          <li>
            <a
              href="#projects"
              id="nav-projects"
              className={activeSection === 'projects' ? 'active' : ''}
              onClick={(e) => scrollToSection(e, '#projects')}
            >
              Projects
            </a>
          </li>
          <li>
            <a
              href="#contact"
              id="nav-contact"
              className={activeSection === 'contact' ? 'active' : ''}
              onClick={(e) => scrollToSection(e, '#contact')}
            >
              Contact
            </a>
          </li>
        </ul>

        <div className="nav-actions">
          <a
            href={PERSONAL_INFO.blogUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="nav-blog-btn"
            id="nav-blog-btn"
          >
            <span>Blog</span>
            <ExternalLink size={14} />
          </a>

          <button
            type="button"
            className="mobile-toggle"
            id="mobile-nav-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`}>
        <a
          href="#about"
          className={activeSection === 'about' ? 'active' : ''}
          onClick={(e) => scrollToSection(e, '#about')}
        >
          About
        </a>
        <a
          href="#skills"
          className={activeSection === 'skills' ? 'active' : ''}
          onClick={(e) => scrollToSection(e, '#skills')}
        >
          Skills
        </a>
        <a
          href="#projects"
          className={activeSection === 'projects' ? 'active' : ''}
          onClick={(e) => scrollToSection(e, '#projects')}
        >
          Projects
        </a>
        <a
          href="#contact"
          className={activeSection === 'contact' ? 'active' : ''}
          onClick={(e) => scrollToSection(e, '#contact')}
        >
          Contact
        </a>
      </div>
    </nav>
  );
}
