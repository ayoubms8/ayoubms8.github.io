import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Footer from './components/Footer';
import CursorTrail from './components/CursorTrail';
import { Check } from 'lucide-react';
import './App.css';

export default function App() {
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  return (
    <div className="app-container">
      <CursorTrail />
      <Navbar />

      <main id="main-content">
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Contact onShowToast={showToast} />
      </main>

      <Footer />

      {/* Toast popup */}
      {toastMessage && (
        <div className="toast-notice" role="status" aria-live="polite">
          <Check size={16} color="#4da3ff" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
