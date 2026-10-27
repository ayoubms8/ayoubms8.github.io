import { useState, useEffect } from 'react';
import { LanguageContext } from './languageContextInstance';

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      const saved = localStorage.getItem('site_lang');
      if (saved === 'fr' || saved === 'en') return saved;
      if (navigator.language && navigator.language.startsWith('fr')) {
        return 'fr';
      }
    } catch {
      // Fallback
    }
    return 'en';
  });

  const setLang = (newLang) => {
    setLangState(newLang);
    try {
      localStorage.setItem('site_lang', newLang);
      const domain = window.location.hostname;
      document.cookie = `googtrans=/en/${newLang}; path=/; domain=${domain};`;
      document.cookie = `googtrans=/en/${newLang}; path=/;`;
    } catch {
      // Ignore storage errors
    }
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}
