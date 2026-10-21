import { useState } from 'react';
import { Mail, BookOpen, Copy, Check, ExternalLink } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './Icons';
import { PERSONAL_INFO } from '../data/portfolioData';
import { useInView } from '../hooks/useInView';

export default function Contact({ onShowToast }) {
  const [copied, setCopied] = useState(false);
  const [sectionRef, inView] = useInView({ threshold: 0.15 });

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
        <div className="contact-wrap" id="contact-wrap">
          <div className="contact-geo">
            <div className="contact-hex-1"></div>
            <div className="contact-hex-2"></div>
          </div>

          <div className={`section-label reveal ${inView ? 'is-visible' : ''}`}>
            <span className="label-line"></span>
            <span className="label-text">Contact</span>
          </div>

          <h2
            className={`section-title reveal delay-1 ${inView ? 'is-visible' : ''}`}
            id="contact-title"
          >
            Let's build something.
          </h2>

          <p
            className={`contact-sub reveal delay-2 ${inView ? 'is-visible' : ''}`}
            id="contact-sub"
          >
            Available for opportunities, collaborations, and deep conversations
            about systems architecture, kernels, and infrastructure.
          </p>

          <div
            className={`contact-links reveal delay-3 ${inView ? 'is-visible' : ''}`}
            id="contact-links"
          >
            {/* Email with copy button */}
            <a
              href={`mailto:${PERSONAL_INFO.email}`}
              className="contact-item"
              id="contact-email"
              title="Click to send email or use copy button"
            >
              <div className="contact-item-left">
                <span className="contact-icon">
                  <Mail size={18} />
                </span>
                <span>{PERSONAL_INFO.email}</span>
              </div>
              <button
                type="button"
                className="contact-copy-btn"
                onClick={handleCopyEmail}
                aria-label="Copy email address"
                title="Copy to clipboard"
              >
                {copied ? <Check size={16} color="#4da3ff" /> : <Copy size={16} />}
              </button>
            </a>

            {/* GitHub */}
            <a
              href={PERSONAL_INFO.githubUrl}
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
              href={PERSONAL_INFO.linkedinUrl}
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
              href={PERSONAL_INFO.blogUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-item"
              id="contact-blog-link"
            >
              <div className="contact-item-left">
                <span className="contact-icon">
                  <BookOpen size={18} />
                </span>
                <span>Technical Blog</span>
              </div>
              <ExternalLink size={14} opacity={0.5} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
