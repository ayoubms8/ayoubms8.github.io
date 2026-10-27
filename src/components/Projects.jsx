import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ExternalLink, Terminal, Sparkles } from 'lucide-react';
import { PORTFOLIO_CONTENT } from '../data/portfolioData';
import { useLanguage } from '../hooks/useLanguage';

gsap.registerPlugin(ScrollTrigger);

export default function Projects() {
  const { lang } = useLanguage();
  const content = PORTFOLIO_CONTENT[lang] || PORTFOLIO_CONTENT.en;
  const { projects, featuredProject, filters, ui, nav } = content;

  const [activeFilter, setActiveFilter] = useState('all');
  const sectionRef = useRef(null);
  const featuredRef = useRef(null);
  const gridRef = useRef(null);
  const isInitialMount = useRef(true);

  // 1. Initial ScrollTrigger setup for Section Header, Featured Project, and Grid
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header timeline
      const headerTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 78%',
          once: true
        }
      });

      headerTl
        .fromTo(
          '.projects-label-line',
          { scaleX: 0 },
          { scaleX: 1, duration: 0.65, ease: 'power3.out' }
        )
        .fromTo(
          '.projects-label-text',
          { opacity: 0, x: -15 },
          { opacity: 1, x: 0, duration: 0.45, ease: 'power2.out' },
          '-=0.35'
        )
        .fromTo(
          '#projects-title',
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out' },
          '-=0.25'
        )
        .fromTo(
          '#filter-tabs',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
          '-=0.3'
        );

      // Featured Project Entrance & Scroll Parallax
      if (featuredRef.current) {
        const featTl = gsap.timeline({
          scrollTrigger: {
            trigger: featuredRef.current,
            start: 'top 80%',
            once: true
          }
        });

        featTl
          .fromTo(
            featuredRef.current,
            { opacity: 0, y: 40, scale: 0.97 },
            { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out' }
          )
          .fromTo(
            '.feat-highlights li',
            { opacity: 0, x: -18 },
            { opacity: 1, x: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' },
            '-=0.4'
          );

        // Counter-rotating bare-metal emblems on scroll scrub
        gsap.to('.feat-hex-1', {
          rotation: 75,
          ease: 'none',
          scrollTrigger: {
            trigger: featuredRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5
          }
        });

        gsap.to('.feat-hex-2', {
          rotation: -75,
          ease: 'none',
          scrollTrigger: {
            trigger: featuredRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5
          }
        });

        gsap.to('.feat-visual', {
          yPercent: -10,
          ease: 'none',
          scrollTrigger: {
            trigger: featuredRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2
          }
        });
      }

      // Initial Projects Grid Reveal
      if (gridRef.current) {
        gsap.fromTo(
          '.project-card',
          { opacity: 0, y: 40, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: gridRef.current,
              start: 'top 82%',
              once: true
            }
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // 2. Smooth GSAP entrance whenever the category filter changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.project-card',
        { opacity: 0, y: 25, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.45,
          stagger: 0.04,
          ease: 'power2.out'
        }
      );
    }, gridRef);

    return () => ctx.revert();
  }, [activeFilter]);

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const glow = card.querySelector('.card-glow');
    if (!glow) return;
    const rect = card.getBoundingClientRect();
    glow.style.transform = `translate3d(${(e.clientX - rect.left).toFixed(1)}px, ${(e.clientY - rect.top).toFixed(1)}px, 0) translate(-50%, -50%)`;
  };


  // Filtered projects
  const filteredProjects = projects.filter((p) => {
    if (activeFilter === 'all') return true;
    return p.category === activeFilter;
  });

  const showFeatured = activeFilter === 'all' || activeFilter === 'systems';

  return (
    <section id="projects" ref={sectionRef}>
      <div className="section-inner">
        <div className="section-label">
          <span className="label-line projects-label-line"></span>
          <span className="label-text projects-label-text">{nav.projects}</span>
        </div>

        <h2 className="section-title" id="projects-title">
          {ui.projectsTitle}
        </h2>

        {/* Filter Tabs */}
        <div className="filter-tabs" id="filter-tabs">
          {filters.map((tab) => {
            const count =
              tab.id === 'all'
                ? projects.length + 1
                : projects.filter((p) => p.category === tab.id).length +
                  (tab.id === 'systems' ? 1 : 0);

            return (
              <button
                key={tab.id}
                type="button"
                className={`filter-btn ${activeFilter === tab.id ? 'active' : ''}`}
                id={`filter-${tab.id}`}
                onClick={() => setActiveFilter(tab.id)}
              >
                <span>{tab.label}</span>
                <span className="filter-count">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Featured Project */}
        {showFeatured && (
          <div
            ref={featuredRef}
            className="featured-project"
            id="featured-project"
            data-category={featuredProject.category}
          >
            <div className="feat-visual">
              <div className="feat-label-tag">
                <Sparkles size={13} />
                <span>{ui.featuredLabel}</span>
              </div>
              <div className="feat-geo-wrap">
                <div className="feat-hex feat-hex-1"></div>
                <div className="feat-hex feat-hex-2"></div>
                <div className="feat-hex feat-hex-3">
                  <Terminal size={26} />
                </div>
              </div>
            </div>

            <div className="feat-info">
              <div className="feat-meta">
                <span className="feat-category">
                  {featuredProject.categoryLabel}
                </span>
                <span className="feat-date">{featuredProject.year}</span>
              </div>

              <h3>{featuredProject.title}</h3>

              <p>{featuredProject.description}</p>

              <ul className="feat-highlights">
                {featuredProject.highlights.map((item) => (
                  <li key={item.code}>
                    <span className="highlight-num">{item.code}</span>
                    <span>{item.desc}</span>
                  </li>
                ))}
              </ul>

              <a
                href={featuredProject.link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary feat-btn"
                id="feat-btn"
              >
                <span>{lang === 'fr' ? 'Découvrir la série' : 'Read Series'}</span>
                <ExternalLink size={15} />
              </a>
            </div>
          </div>
        )}

        {/* Projects Grid */}
        <div className="projects-grid" id="projects-grid" ref={gridRef}>
          {filteredProjects.map((project) => {
            return (
              <article
                key={project.id}
                className="project-card"
                data-category={project.category}
                id={project.id}
                onMouseMove={handleMouseMove}
              >
                <div className="card-glow"></div>

                <div className="card-header">
                  <span className="card-category">{project.categoryLabel}</span>
                  <span className="card-year">{project.year}</span>
                </div>

                <h3>{project.title}</h3>
                <p>{project.description}</p>

                <div className="card-tags">
                  {project.tags.map((tag) => (
                    <span key={tag} className="card-tag">
                      {tag}
                    </span>
                  ))}
                </div>

                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-link"
                  id={`proj-link-${project.id}`}
                >
                  <span>{ui.viewPost}</span>
                  <ExternalLink size={13} />
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
