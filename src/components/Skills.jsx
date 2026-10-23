import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Cpu, Shield, Network, Cloud, Code2, Layers } from 'lucide-react';
import { SKILL_CATEGORIES } from '../data/portfolioData';

gsap.registerPlugin(ScrollTrigger);

const ICON_MAP = {
  Cpu,
  Shield,
  Network,
  Cloud,
  Code2,
  Layers
};

export default function Skills() {
  const sectionRef = useRef(null);
  const gridRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Header & Cards Entrance
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 78%',
          once: true
        }
      });

      tl.fromTo(
        '.skills-label-line',
        { scaleX: 0 },
        { scaleX: 1, duration: 0.65, ease: 'power3.out' }
      )
        .fromTo(
          '.skills-label-text',
          { opacity: 0, x: -15 },
          { opacity: 1, x: 0, duration: 0.45, ease: 'power2.out' },
          '-=0.35'
        )
        .fromTo(
          '#skills-title',
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out' },
          '-=0.25'
        )
        .fromTo(
          '.skill-card',
          { opacity: 0, y: 45, scale: 0.94 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.75,
            stagger: 0.08,
            ease: 'power3.out'
          },
          '-=0.3'
        )
        .fromTo(
          '.skill-tag-pill',
          { opacity: 0, scale: 0.9 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.35,
            stagger: {
              amount: 0.3,
              from: 'start'
            },
            ease: 'power2.out'
          },
          '-=0.3'
        );

      // 2. Subtle Parallax Column Differential on Scroll Scrub
      if (gridRef.current) {
        gsap.to('.skills-grid > div:nth-child(even)', {
          y: -18,
          ease: 'none',
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2
          }
        });

        gsap.to('.skills-grid > div:nth-child(odd)', {
          y: 18,
          ease: 'none',
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2
          }
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

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
        <div className="section-label">
          <span className="label-line skills-label-line"></span>
          <span className="label-text skills-label-text">Skills</span>
        </div>

        <h2 className="section-title centered" id="skills-title">
          Technical Arsenal
        </h2>

        <div className="skills-grid" id="skills-grid" ref={gridRef}>
          {SKILL_CATEGORIES.map((category) => {
            const IconComponent = ICON_MAP[category.icon] || Code2;

            return (
              <div
                key={category.id}
                className="skill-card"
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
