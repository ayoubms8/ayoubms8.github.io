import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Mail, BookOpen, Copy, Check, ExternalLink } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './Icons';
import { PORTFOLIO_CONTENT } from '../data/portfolioData';
import { useLanguage } from '../hooks/useLanguage';

gsap.registerPlugin(ScrollTrigger);

export default function Contact({ onShowToast }) {
  const { lang } = useLanguage();
  const content = PORTFOLIO_CONTENT[lang] || PORTFOLIO_CONTENT.en;
  const { personalInfo, ui, nav } = content;

  const [copied, setCopied] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Subtle parallax on background decorative rings
      gsap.to('.contact-hex-1', {
        y: -30,
        rotation: 30,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5
        }
      });

      gsap.to('.contact-hex-2', {
        y: 25,
        rotation: -35,
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
          start: 'top 80%',
          once: true
        }
      });

      tl.fromTo(
        '.contact-label-line',
        { scaleX: 0 },
        { scaleX: 1, duration: 0.6, ease: 'power3.out' }
      )
        .fromTo(
          '.contact-label-text',
          { opacity: 0, x: -12 },
          { opacity: 1, x: 0, duration: 0.45, ease: 'power2.out' },
          '-=0.35'
        )
        .fromTo(
          '#contact-title',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
          '-=0.25'
        )
        .fromTo(
          '#contact-sub',
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
          '-=0.3'
        )
        .fromTo(
          '.contact-item',
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.55, stagger: 0.08, ease: 'power3.out' },
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
        onShowToast(ui.emailCopied);
      }
      setTimeout(() => setCopied(false), 2500);
    };

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard
        .writeText(personalInfo.email)
        .then(triggerSuccess)
        .catch(() => {
          try {
            const textarea = document.createElement('textarea');
            textarea.value = personalInfo.email;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
          } catch {}
          triggerSuccess();
        });
    } else {
      triggerSuccess();
    }
  };

  return (
    <section id="contact" ref={sectionRef}>
      <div className="section-inner">
        <div className="contact-wrap" id="contact-wrap">
          <div className="contact-geo" aria-hidden="true">
            <div className="contact-hex-1"></div>
            <div className="contact-hex-2"></div>
          </div>

          <div className="section-label">
            <span className="label-line contact-label-line"></span>
            <span className="label-text contact-label-text">{nav.contact}</span>
          </div>

          <h2 className="section-title" id="contact-title">
            {ui.contactTitle}
          </h2>

          <p className="contact-sub" id="contact-sub">
            {ui.contactSub}
          </p>

          <div className="contact-links" id="contact-links">
            {/* Email with copy button */}
            <div
              className="contact-item contact-item-email"
              id="contact-email"
            >
              <a
                href={`mailto:${personalInfo.email}`}
                className="contact-item-left"
                title={`Send email to ${personalInfo.name}`}
              >
                <span className="contact-icon">
                  <Mail size={18} />
                </span>
                <span>{personalInfo.email}</span>
              </a>
              <button
                type="button"
                className="contact-copy-btn"
                onClick={handleCopyEmail}
                aria-label={ui.copyEmail}
                title={ui.copyEmail}
              >
                {copied ? <Check size={16} color="#4da3ff" /> : <Copy size={16} />}
              </button>
            </div>


            {/* GitHub */}
            <a
              href={personalInfo.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-item"
              id="contact-github"
            >
              <div className="contact-item-left">
                <span className="contact-icon">
                  <GithubIcon size={18} />
                </span>
                <span>github.com/ayoubms8</span>
              </div>
              <ExternalLink size={14} opacity={0.5} />
            </a>

            {/* LinkedIn */}
            <a
              href={personalInfo.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-item"
              id="contact-linkedin"
            >
              <div className="contact-item-left">
                <span className="contact-icon">
                  <LinkedinIcon size={18} />
                </span>
                <span>LinkedIn</span>
              </div>
              <ExternalLink size={14} opacity={0.5} />
            </a>

            {/* Technical Blog */}
            <a
              href={personalInfo.blogUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-item"
              id="contact-blog-link"
            >
              <div className="contact-item-left">
                <span className="contact-icon">
                  <BookOpen size={18} />
                </span>
                <span>{lang === 'fr' ? 'Blog Technique' : 'Technical Blog'}</span>
              </div>
              <ExternalLink size={14} opacity={0.5} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
