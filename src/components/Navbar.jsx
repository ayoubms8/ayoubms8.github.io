import { useState, useEffect } from 'react';
import { Menu, X, ExternalLink } from 'lucide-react';
import { PERSONAL_INFO } from '../data/portfolioData';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
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
    <nav id="navbar" className={scrolled ? 'scrolled' : ''}>
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
              onClick={(e) => scrollToSection(e, '#about')}
            >
              About
            </a>
          </li>
          <li>
            <a
              href="#skills"
              id="nav-skills"
              onClick={(e) => scrollToSection(e, '#skills')}
            >
              Skills
            </a>
          </li>
          <li>
            <a
              href="#projects"
              id="nav-projects"
              onClick={(e) => scrollToSection(e, '#projects')}
            >
              Projects
            </a>
          </li>
          <li>
            <a
              href="#contact"
              id="nav-contact"
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
        <a href="#about" onClick={(e) => scrollToSection(e, '#about')}>
          About
        </a>
        <a href="#skills" onClick={(e) => scrollToSection(e, '#skills')}>
          Skills
        </a>
        <a href="#projects" onClick={(e) => scrollToSection(e, '#projects')}>
          Projects
        </a>
        <a href="#contact" onClick={(e) => scrollToSection(e, '#contact')}>
          Contact
        </a>
      </div>
    </nav>
  );
}
