import { useState, useEffect } from 'react';
import { PERSONAL_INFO, STATS } from '../data/portfolioData';
import { useInView } from '../hooks/useInView';

export default function About() {
  const [sectionRef, inView] = useInView({ threshold: 0.15 });
  const [counts, setCounts] = useState(STATS.map(() => 0));

  useEffect(() => {
    if (!inView) return;

    // Smooth counter animation
    const duration = 1600;
    const start = performance.now();

    const animateCount = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const ease = 1 - Math.pow(1 - progress, 3);

      setCounts(
        STATS.map((stat) => Math.round(stat.target * ease))
      );

      if (progress < 1) {
        requestAnimationFrame(animateCount);
      }
    };

    requestAnimationFrame(animateCount);
  }, [inView]);

  return (
    <section id="about" ref={sectionRef}>
      <div className="section-inner">
        <div className={`section-label reveal ${inView ? 'is-visible' : ''}`}>
          <span className="label-line"></span>
          <span className="label-text">About</span>
        </div>

        <div className="about-grid">
          <div
            className={`about-text reveal-left ${inView ? 'is-visible' : ''}`}
            id="about-text"
          >
            <h2 className="section-title">Engineering at every layer of the stack</h2>

            {PERSONAL_INFO.bio.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}

            <div className="about-stats">
              {STATS.map((stat, idx) => (
                <div key={stat.id} className="stat" id={stat.id}>
                  <span className="stat-num">
                    {counts[idx]}
                    {stat.suffix}
                  </span>
                  <span className="stat-label">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div
            className={`about-visual reveal-right delay-2 ${inView ? 'is-visible' : ''}`}
            id="about-visual"
          >
            <div className="about-geo-box">
              <div className="geo-ring geo-ring-1"></div>
              <div className="geo-ring geo-ring-2"></div>
              <div className="geo-ring geo-ring-3"></div>
              <div className="geo-center-dot"></div>

              <div className="about-badge">
                <span className="badge-icon">⬡</span>
                <span className="badge-text">1337 / 42 Network</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
