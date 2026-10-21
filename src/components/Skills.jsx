import { Cpu, Shield, Network, Cloud, Code2, Layers } from 'lucide-react';
import { SKILL_CATEGORIES } from '../data/portfolioData';
import { useInView } from '../hooks/useInView';

const ICON_MAP = {
  Cpu,
  Shield,
  Network,
  Cloud,
  Code2,
  Layers
};

export default function Skills() {
  const [sectionRef, inView] = useInView({ threshold: 0.1 });

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const glow = card.querySelector('.skill-card-glow');
    if (!glow) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    glow.style.left = `${x}px`;
    glow.style.top = `${y}px`;
  };

  return (
    <section id="skills" ref={sectionRef}>
      <div className="section-inner">
        <div className={`section-label reveal ${inView ? 'is-visible' : ''}`}>
          <span className="label-line"></span>
          <span className="label-text">Skills</span>
        </div>

        <h2
          className={`section-title centered reveal ${inView ? 'is-visible' : ''}`}
          id="skills-title"
        >
          Technical Arsenal
        </h2>

        <div className="skills-grid" id="skills-grid">
          {SKILL_CATEGORIES.map((category, index) => {
            const IconComponent = ICON_MAP[category.icon] || Code2;
            const delayClass = `delay-${(index % 6) + 1}`;

            return (
              <div
                key={category.id}
                className={`skill-card reveal ${delayClass} ${inView ? 'is-visible' : ''}`}
                id={`skill-${category.id}`}
                onMouseMove={handleMouseMove}
              >
                <div className="skill-card-glow"></div>
                <div className="skill-card-top">
                  <div className="skill-icon-wrap">
                    <IconComponent size={22} />
                  </div>
                  <span className="skill-glyph">{category.glyph}</span>
                </div>

                <h3>{category.title}</h3>

                <div className="skill-tags">
                  {category.tags.map((tag) => (
                    <span key={tag} className="skill-tag-pill">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
