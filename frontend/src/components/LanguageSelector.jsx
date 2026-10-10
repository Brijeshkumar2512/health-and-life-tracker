import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const LanguageSelector = ({ variant = 'navbar' }) => {
  const { lang, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  ];

  const currentLang = languages.find((l) => l.code === lang) || languages[0];

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (variant === 'profile') {
    return (
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Language / भाषा चुनें
        </label>
        <div className="grid grid-cols-2 gap-3">
          {languages.map((l) => (
            <button
              type="button"
              key={l.code}
              onClick={() => setLanguage(l.code)}
              className={`p-3.5 rounded-2xl border text-sm font-semibold flex items-center justify-between transition-all ${
                lang === l.code
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm ring-2 ring-emerald-500/20'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{l.flag}</span>
                <div className="text-left">
                  <p className="font-bold text-slate-800 leading-tight">{l.native}</p>
                  <span className="text-2xs text-slate-400 font-normal">{l.label}</span>
                </div>
              </div>
              {lang === l.code && <Check className="w-5 h-5 text-emerald-600" />}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      >
        <span className="text-base leading-none">{currentLang.flag}</span>
        <span>{currentLang.native}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white shadow-xl border border-slate-100 py-1.5 z-50 animate-fade-in divide-y divide-slate-100">
          <div className="px-3 py-1.5 text-2xs font-bold text-slate-400 uppercase tracking-wider">
            Select Language / भाषा चुनें
          </div>
          <div className="py-1">
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  setLanguage(l.code);
                  setIsOpen(false);
                }}
                className={`w-full px-3.5 py-2.5 text-xs flex items-center justify-between transition ${
                  lang === l.code
                    ? 'bg-emerald-50 text-emerald-800 font-bold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{l.flag}</span>
                  <div className="text-left">
                    <p className="leading-tight">{l.native}</p>
                    <span className="text-2xs text-slate-400 font-normal">{l.label}</span>
                  </div>
                </div>
                {lang === l.code && <Check className="w-4 h-4 text-emerald-600" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
