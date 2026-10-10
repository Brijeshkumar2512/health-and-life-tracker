import React from 'react';
import { Menu, Plus, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from './LanguageSelector';
import InstallPrompt from './InstallPrompt';

const Navbar = ({ onOpenSidebar }) => {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();

  const todayFormatted = new Date().toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 -ml-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-slate-500 text-xs font-medium bg-slate-50 border border-slate-200/60 px-3 py-1.5 rounded-full">
          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
          <span>{todayFormatted}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* PWA Install App Button */}
        <InstallPrompt variant="button" />

        {/* Dedicated Language Selector Dropdown */}
        <LanguageSelector variant="navbar" />

        <button
          onClick={() => navigate('/log')}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>{t('quickLog')}</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
