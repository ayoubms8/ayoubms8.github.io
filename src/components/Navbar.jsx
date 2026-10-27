import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Menu, X, ExternalLink } from 'lucide-react';
import { PORTFOLIO_CONTENT } from '../data/portfolioData';
import { useLanguage } from '../hooks/useLanguage';

gsap.registerPlugin(ScrollTrigger);

export default function Navbar() {
  const { lang, setLang } = useLanguage();
  const content = PORTFOLIO_CONTENT[lang] || PORTFOLIO_CONTENT.en;
  const { nav: navText, personalInfo } = content;

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
    const offsetPosition = elementPosition + window.scrollY - navOffset;

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
              {navText.about}
            </a>
          </li>
          <li>
            <a
              href="#skills"
              id="nav-skills"
              className={activeSection === 'skills' ? 'active' : ''}
              onClick={(e) => scrollToSection(e, '#skills')}
            >
              {navText.skills}
            </a>
          </li>
          <li>
            <a
              href="#projects"
              id="nav-projects"
              className={activeSection === 'projects' ? 'active' : ''}
              onClick={(e) => scrollToSection(e, '#projects')}
            >
              {navText.projects}
            </a>
          </li>
          <li>
            <a
              href="#contact"
              id="nav-contact"
              className={activeSection === 'contact' ? 'active' : ''}
              onClick={(e) => scrollToSection(e, '#contact')}
            >
              {navText.contact}
            </a>
          </li>
        </ul>

        <div className="nav-actions">
          <div className="nav-lang-toggle" role="group" aria-label="Language selection">
            <button
              type="button"
              className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
              onClick={() => setLang('en')}
              aria-pressed={lang === 'en'}
              aria-label="English"
            >
              EN
            </button>
            <span className="lang-sep">/</span>
            <button
              type="button"
              className={`lang-btn ${lang === 'fr' ? 'active' : ''}`}
              onClick={() => setLang('fr')}
              aria-pressed={lang === 'fr'}
              aria-label="Français"
            >
              FR
            </button>
          </div>

          <a
            href={personalInfo.blogUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="nav-blog-btn"
            id="nav-blog-btn"
          >
            <span>{navText.blog}</span>
            <ExternalLink size={14} />
          </a>

          <button
            type="button"
            className="mobile-toggle"
            id="mobile-nav-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
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
          {navText.about}
        </a>
        <a
          href="#skills"
          className={activeSection === 'skills' ? 'active' : ''}
          onClick={(e) => scrollToSection(e, '#skills')}
        >
          {navText.skills}
        </a>
        <a
          href="#projects"
          className={activeSection === 'projects' ? 'active' : ''}
          onClick={(e) => scrollToSection(e, '#projects')}
        >
          {navText.projects}
        </a>
        <a
          href="#contact"
          className={activeSection === 'contact' ? 'active' : ''}
          onClick={(e) => scrollToSection(e, '#contact')}
        >
          {navText.contact}
        </a>

        <div className="mobile-actions">
          <div className="nav-lang-toggle" role="group" aria-label="Language selection">
            <button
              type="button"
              className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
              onClick={() => {
                setLang('en');
                setMobileOpen(false);
              }}
              aria-pressed={lang === 'en'}
            >
              EN
            </button>
            <span className="lang-sep">/</span>
            <button
              type="button"
              className={`lang-btn ${lang === 'fr' ? 'active' : ''}`}
              onClick={() => {
                setLang('fr');
                setMobileOpen(false);
              }}
              aria-pressed={lang === 'fr'}
            >
              FR
            </button>
          </div>

          <a
            href={personalInfo.blogUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mobile-blog-btn"
            onClick={() => setMobileOpen(false)}
          >
            <span>{navText.blog}</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </nav>
  );
}
