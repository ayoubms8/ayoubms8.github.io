import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PERSONAL_INFO, STATS } from '../data/portfolioData';

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const sectionRef = useRef(null);
  const geoBoxRef = useRef(null);
  const statsRef = useRef(null);
  const [counts, setCounts] = useState(STATS.map(() => 0));

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Text & Section Entrance Timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 78%',
          once: true
        }
      });

      tl.fromTo(
        '.about-label-line',
        { scaleX: 0 },
        { scaleX: 1, duration: 0.65, ease: 'power3.out' }
      )
        .fromTo(
          '.about-label-text',
          { opacity: 0, x: -15 },
          { opacity: 1, x: 0, duration: 0.45, ease: 'power2.out' },
          '-=0.35'
        )
        .fromTo(
          '#about-title',
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out' },
          '-=0.25'
        )
        .fromTo(
          '#about-text p',
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: 0.65, stagger: 0.12, ease: 'power2.out' },
          '-=0.35'
        )
        .fromTo(
          '.stat',
          { opacity: 0, y: 20, scale: 0.94 },
          { opacity: 1, y: 0, scale: 1, duration: 0.55, stagger: 0.09, ease: 'back.out(1.3)' },
          '-=0.2'
        );

      // 2. Animated Stats Counter (triggered exactly when in view)
      const countProxy = STATS.map(() => ({ val: 0 }));
      ScrollTrigger.create({
        trigger: statsRef.current,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          STATS.forEach((stat, i) => {
            gsap.to(countProxy[i], {
              val: stat.target,
              duration: 1.6,
              ease: 'power2.out',
              onUpdate: () => {
                setCounts((prev) => {
                  const updated = [...prev];
                  updated[i] = Math.round(countProxy[i].val);
                  return updated;
                });
              }
            });
          });
        }
      });

      // 3. Mechanical Gyro Parallax Scroll Scrub on the 42 Network emblem
      if (geoBoxRef.current) {
        gsap.to(geoBoxRef.current, {
          yPercent: -15,
          rotation: 10,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.4
          }
        });

        gsap.to('.geo-ring-1', {
          scale: 1.05,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1
          }
        });

        gsap.to('.geo-ring-2', {
          scale: 0.95,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2
          }
        });

        // 4. Badge pop-in
        gsap.fromTo(
          '.about-badge',
          { opacity: 0, scale: 0.8 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.7,
            ease: 'back.out(1.5)',
            scrollTrigger: {
              trigger: geoBoxRef.current,
              start: 'top 80%',
              once: true
            }
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={sectionRef}>
      <div className="section-inner">
        <div className="section-label">
          <span className="label-line about-label-line"></span>
          <span className="label-text about-label-text">About</span>
        </div>

        <div className="about-grid">
          <div className="about-text" id="about-text">
            <h2 className="section-title" id="about-title">
              Engineering at every layer of the stack
            </h2>

            {PERSONAL_INFO.bio.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}

            <div className="about-stats" ref={statsRef}>
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

          <div className="about-visual" id="about-visual">
            <div className="about-geo-box" ref={geoBoxRef}>
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
