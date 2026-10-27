import { ArrowUp } from 'lucide-react';
import { PORTFOLIO_CONTENT } from '../data/portfolioData';
import { useLanguage } from '../hooks/useLanguage';

const currentYear = new Date().getFullYear();

export default function Footer() {
  const { lang } = useLanguage();
  const content = PORTFOLIO_CONTENT[lang] || PORTFOLIO_CONTENT.en;
  const { personalInfo, ui } = content;

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer id="footer">
      <div className="footer-inner">
        <div className="footer-left">
          <span>{personalInfo.name} &copy; {currentYear}</span>
          <span className="footer-sep">◈</span>
          <span>{lang === 'fr' ? 'Conçu avec précision & React' : 'Built with precision & React'}</span>
        </div>

        <button
          type="button"
          className="back-to-top"
          onClick={scrollToTop}
          aria-label={ui.backToTop}
          title={ui.backToTop}
        >
          <span>{lang === 'fr' ? 'Haut' : 'Top'}</span>
          <ArrowUp size={14} />
        </button>
      </div>
    </footer>
  );
}
