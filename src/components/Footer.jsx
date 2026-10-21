import { ArrowUp } from 'lucide-react';
import { PERSONAL_INFO } from '../data/portfolioData';

export default function Footer() {
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
          <span>{PERSONAL_INFO.name} &copy; {new Date().getFullYear()}</span>
          <span className="footer-sep">◈</span>
          <span>Built with precision &amp; React</span>
        </div>

        <button
          type="button"
          className="back-to-top"
          onClick={scrollToTop}
          aria-label="Scroll back to top"
        >
          <span>Top</span>
          <ArrowUp size={14} />
        </button>
      </div>
    </footer>
  );
}
