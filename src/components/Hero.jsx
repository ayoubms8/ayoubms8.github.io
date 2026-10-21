import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, ExternalLink } from 'lucide-react';
import CanvasOverlay from './CanvasOverlay';
import { PERSONAL_INFO } from '../data/portfolioData';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const heroRef = useRef(null);
  const bgImgRef = useRef(null);
  const tagRef = useRef(null);
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);
  const subRef = useRef(null);
  const ctaRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Entrance sequence
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.2 });

      tl.fromTo(
        tagRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.7 }
      )
        .fromTo(
          line1Ref.current,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 0.8 },
          '-=0.4'
        )
        .fromTo(
          line2Ref.current,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 0.8 },
          '-=0.6'
        )
        .fromTo(
          subRef.current,
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 0.7 },
          '-=0.4'
        )
        .fromTo(
          ctaRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6 },
          '-=0.3'
        )
        .fromTo(
          scrollRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.5 },
          '-=0.2'
        );

      // Parallax scroll on hero background
      if (bgImgRef.current && heroRef.current) {
        gsap.to(bgImgRef.current, {
          yPercent: 20,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true
          }
        });
      }
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const scrollToSection = (e, id) => {
    e.preventDefault();
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
    <section id="hero" ref={heroRef}>
      <div className="hero-bg-container">
        <img
          ref={bgImgRef}
          src="/hero_bg.jpg"
          alt="Ayoub Lemsafi Background"
          className="hero-bg-img"
          id="hero-bg-img"
        />
        <div className="hero-bg-overlay"></div>
      </div>

      <CanvasOverlay />

      <div className="hero-content" id="hero-content">
        <div ref={tagRef} className="hero-tag" id="hero-tag">
          <span className="hero-tag-pulse"></span>
          <span>{PERSONAL_INFO.tagline}</span>
        </div>

        <h1 className="hero-name" id="hero-name">
          <span ref={line1Ref} className="hero-name-line" id="hero-line-1">
            Ayoub
          </span>
          <span ref={line2Ref} className="hero-name-line accent" id="hero-line-2">
            Lemsafi
          </span>
        </h1>

        <p ref={subRef} className="hero-sub" id="hero-sub">
          {PERSONAL_INFO.roles.join('. ')}.<br />
          <span className="metal">{PERSONAL_INFO.subtitle}</span>
        </p>

        <div ref={ctaRef} className="hero-cta" id="hero-cta">
          <a
            href="#projects"
            className="btn-primary"
            id="cta-projects"
            onClick={(e) => scrollToSection(e, '#projects')}
          >
            <span>View Projects</span>
          </a>
          <a
            href={PERSONAL_INFO.blogUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
            id="cta-blog"
          >
            <span>Read Blog</span>
            <ExternalLink size={15} />
          </a>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="hero-scroll-indicator"
        id="hero-scroll"
        onClick={(e) => scrollToSection(e, '#about')}
        role="button"
        tabIndex={0}
        aria-label="Scroll to About section"
      >
        <span>Scroll</span>
        <div className="scroll-line"></div>
      </div>
    </section>
  );
}
