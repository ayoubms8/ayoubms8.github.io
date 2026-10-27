import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PORTFOLIO_CONTENT } from '../data/portfolioData';
import { useLanguage } from '../hooks/useLanguage';

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const { lang } = useLanguage();
  const content = PORTFOLIO_CONTENT[lang] || PORTFOLIO_CONTENT.en;
  const { personalInfo, ui, stats, nav } = content;

  const sectionRef = useRef(null);
  const geoBoxRef = useRef(null);
  const statsRef = useRef(null);
  const numRefs = useRef([]);


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
      const countProxy = stats.map(() => ({ val: 0 }));
      ScrollTrigger.create({
        trigger: statsRef.current,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          stats.forEach((stat, i) => {
            gsap.to(countProxy[i], {
              val: stat.target,
              duration: 1.5,
              ease: 'power2.out',
              onUpdate: () => {
                if (numRefs.current[i]) {
                  numRefs.current[i].textContent = `${Math.round(countProxy[i].val)}${stat.suffix}`;
                }
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
  }, [stats]);

  return (
    <section id="about" ref={sectionRef}>
      <div className="section-inner">
        <div className="section-label">
          <span className="label-line about-label-line"></span>
          <span className="label-text about-label-text">{nav.about}</span>
        </div>

        <div className="about-grid">
          <div className="about-text" id="about-text">
            <h2 className="section-title" id="about-title">
              {ui.aboutTitle}
            </h2>

            {personalInfo.bio.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}

            <div className="about-stats" ref={statsRef}>
              {stats.map((stat, idx) => (
                <div key={stat.id} className="stat" id={stat.id}>
                  <span
                    className="stat-num"
                    ref={(el) => (numRefs.current[idx] = el)}
                  >
                    0{stat.suffix}
                  </span>
                  <span className="stat-label">{stat.label}</span>
                </div>
              ))}
            </div>

            <div className="about-credentials">
              <div className="credential-pill">
                <span className="credential-dot"></span>
                <span>{personalInfo.certification}</span>
              </div>
              <div className="credential-pill">
                <span className="credential-dot"></span>
                <span>42 Paris &bull; EST Agadir</span>
              </div>
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
                <span className="badge-text">
                  {lang === 'fr' ? '42 Paris · Génie Logiciel' : '42 Paris · Software Engineering'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
