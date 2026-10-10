import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // Read saved language from localStorage, default to 'en'
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('health_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('health_lang', lang);
  }, [lang]);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'hi' : 'en'));
  };

  const setLanguage = (selectedLang) => {
    if (selectedLang === 'en' || selectedLang === 'hi') {
      setLang(selectedLang);
    }
  };

  // Helper translation function
  const t = (key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
