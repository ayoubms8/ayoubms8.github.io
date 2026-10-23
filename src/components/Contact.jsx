import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Mail, BookOpen, Copy, Check, ExternalLink } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './Icons';
import { PERSONAL_INFO } from '../data/portfolioData';

gsap.registerPlugin(ScrollTrigger);

export default function Contact({ onShowToast }) {
  const [copied, setCopied] = useState(false);
  const sectionRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Ambient parallax on decorative hexagons
      gsap.to('.contact-hex-1', {
        y: -35,
        rotation: 40,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.6
        }
      });

      gsap.to('.contact-hex-2', {
        y: 30,
        rotation: -45,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.8
        }
      });

      // 2. Entrance Timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 78%',
          once: true
        }
      });

      tl.fromTo(
        wrapRef.current,
        { opacity: 0, y: 45, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.85, ease: 'power3.out' }
      )
        .fromTo(
          '.contact-label-line',
          { scaleX: 0 },
          { scaleX: 1, duration: 0.6, ease: 'power3.out' },
          '-=0.5'
        )
        .fromTo(
          '.contact-label-text',
          { opacity: 0, x: -15 },
          { opacity: 1, x: 0, duration: 0.45, ease: 'power2.out' },
          '-=0.35'
        )
        .fromTo(
          '#contact-title',
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
          '-=0.25'
        )
        .fromTo(
          '.contact-desc',
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
          '-=0.3'
        )
        .fromTo(
          '.contact-actions > *',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.55, stagger: 0.08, ease: 'power2.out' },
          '-=0.2'
        )
        .fromTo(
          '.contact-status',
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.4)' },
          '-=0.2'
        );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleCopyEmail = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const triggerSuccess = () => {
      setCopied(true);
      if (onShowToast) {
        onShowToast('Email copied to clipboard!');
      }
      setTimeout(() => setCopied(false), 2500);
    };

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard
        .writeText(PERSONAL_INFO.email)
        .then(triggerSuccess)
        .catch(() => {
          try {
            const textarea = document.createElement('textarea');
            textarea.value = PERSONAL_INFO.email;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
          } catch (_) {}
          triggerSuccess();
        });
    } else {
      triggerSuccess();
    }
  };

  return (
    <section id="contact" ref={sectionRef}>
      <div className="section-inner">
        <div className="contact-wrap" id="contact-wrap" ref={wrapRef}>
          <div className="contact-geo">
            <div className="contact-hex-1"></div>
            <div className="contact-hex-2"></div>
          </div>

          <div className="section-label">
            <span className="label-line contact-label-line"></span>
            <span className="label-text contact-label-text">Contact</span>
          </div>

          <h2 className="section-title" id="contact-title">
            Let's Build Something
          </h2>

          <p className="contact-desc">
            Have a challenging systems problem, infrastructure architecture, or
            distributed system to build? Let's connect.
          </p>

          <div className="contact-status" id="contact-status">
            <span className="status-dot"></span>
            <span>{PERSONAL_INFO.status}</span>
          </div>

          <div className="contact-actions">
            {/* Copy Email Box */}
            <div
              className="email-box"
              id="copy-email-box"
              onClick={handleCopyEmail}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleCopyEmail(e);
                }
              }}
              aria-label="Copy email address"
            >
              <div className="email-icon">
                <Mail size={18} />
              </div>
              <span className="email-text" id="email-text">
                {PERSONAL_INFO.email}
              </span>
              <button
                type="button"
                className="copy-btn"
                id="copy-email-btn"
                aria-label="Copy email address"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>

            {/* Technical Blog */}
            <a
              href={PERSONAL_INFO.blogUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-card-link"
              id="contact-blog-link"
            >
              <div className="contact-card-icon">
                <BookOpen size={18} />
              </div>
              <div className="contact-card-info">
                <span>Technical Blog</span>
                <span className="card-sub">{PERSONAL_INFO.name}'s Blog</span>
              </div>
              <ExternalLink size={16} className="contact-card-arrow" />
            </a>

            {/* GitHub */}
            <a
              href={PERSONAL_INFO.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-card-link"
              id="contact-github-link"
            >
              <div className="contact-card-icon">
                <GithubIcon size={18} />
              </div>
              <div className="contact-card-info">
                <span>GitHub</span>
                <span className="card-sub">@ayoubms8</span>
              </div>
              <ExternalLink size={16} className="contact-card-arrow" />
            </a>

            {/* LinkedIn */}
            <a
              href={PERSONAL_INFO.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-card-link"
              id="contact-linkedin-link"
            >
              <div className="contact-card-icon">
                <LinkedinIcon size={18} />
              </div>
              <div className="contact-card-info">
                <span>LinkedIn</span>
                <span className="card-sub">Ayoub Lemsafi</span>
              </div>
              <ExternalLink size={16} className="contact-card-arrow" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
