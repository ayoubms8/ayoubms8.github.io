import { useState } from 'react';
import { ExternalLink, Terminal, Sparkles } from 'lucide-react';
import { PROJECTS, FEATURED_PROJECT, FILTER_CATEGORIES } from '../data/portfolioData';
import { useInView } from '../hooks/useInView';

export default function Projects() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [sectionRef, inView] = useInView({ threshold: 0.08 });

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const glow = card.querySelector('.card-glow');
    if (!glow) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    glow.style.left = `${x}px`;
    glow.style.top = `${y}px`;
  };

  // Filtered projects
  const filteredProjects = PROJECTS.filter((p) => {
    if (activeFilter === 'all') return true;
    return p.category === activeFilter;
  });

  const showFeatured = activeFilter === 'all' || activeFilter === 'systems';

  return (
    <section id="projects" ref={sectionRef}>
      <div className="section-inner">
        <div className={`section-label reveal ${inView ? 'is-visible' : ''}`}>
          <span className="label-line"></span>
          <span className="label-text">Projects</span>
        </div>

        <h2
          className={`section-title reveal ${inView ? 'is-visible' : ''}`}
          id="projects-title"
        >
          Selected Work
        </h2>

        {/* Filter Tabs */}
        <div
          className={`filter-tabs reveal delay-1 ${inView ? 'is-visible' : ''}`}
          id="filter-tabs"
        >
          {FILTER_CATEGORIES.map((tab) => {
            const count =
              tab.id === 'all'
                ? PROJECTS.length + 1
                : PROJECTS.filter((p) => p.category === tab.id).length +
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
            className={`featured-project reveal delay-2 ${inView ? 'is-visible' : ''}`}
            id="featured-project"
            data-category={FEATURED_PROJECT.category}
          >
            <div className="feat-visual">
              <div className="feat-label-tag">
                <Sparkles size={13} />
                <span>Featured Series</span>
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
                  {FEATURED_PROJECT.categoryLabel}
                </span>
                <span className="feat-date">{FEATURED_PROJECT.year}</span>
              </div>

              <h3>{FEATURED_PROJECT.title}</h3>

              <p>{FEATURED_PROJECT.description}</p>

              <ul className="feat-highlights">
                {FEATURED_PROJECT.highlights.map((item) => (
                  <li key={item.code}>
                    <span className="highlight-num">{item.code}</span>
                    <span>{item.desc}</span>
                  </li>
                ))}
              </ul>

              <a
                href={FEATURED_PROJECT.link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary feat-btn"
                id="feat-btn"
              >
                <span>Read Series</span>
                <ExternalLink size={15} />
              </a>
            </div>
          </div>
        )}

        {/* Projects Grid */}
        <div className="projects-grid" id="projects-grid">
          {filteredProjects.map((project, index) => {
            const delayClass = `delay-${(index % 6) + 1}`;
            return (
              <article
                key={project.id}
                className={`project-card reveal ${delayClass} ${inView ? 'is-visible' : ''}`}
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
                  <span>Read more</span>
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
