import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  BarChart3,
  UserCheck,
  HeartPulse,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import InstallPrompt from './InstallPrompt';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, seedDemo } = useAuth();
  const { t } = useLanguage();
  const [seeding, setSeeding] = React.useState(false);

  const navItems = [
    { name: t('navDashboard'), path: '/', icon: LayoutDashboard },
    { name: t('navDailyTracker'), path: '/log', icon: CalendarDays },
    { name: t('navHabits'), path: '/habits', icon: CheckSquare },
    { name: t('navAnalytics'), path: '/analytics', icon: BarChart3 },
    { name: t('navProfile'), path: '/profile', icon: UserCheck },
  ];

  const handleSeed = async () => {
    if (confirm(t('seedSampleText'))) {
      try {
        setSeeding(true);
        await seedDemo();
        alert('Demo data successfully loaded! Data refreshed.');
        window.location.reload();
      } catch (err) {
        alert('Failed: ' + err.message);
      } finally {
        setSeeding(false);
      }
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <HeartPulse className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-base leading-tight">{t('brandName')}</h1>
            <span className="text-xs font-semibold text-emerald-600 tracking-wider uppercase">{t('brandTagline')}</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 shadow-sm font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-5 h-5 text-current" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Demo Data Seeder Banner */}
        <div className="p-4 mx-3 mb-3 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl">
          <div className="flex items-center gap-2 mb-2 text-emerald-800 font-semibold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>{t('interactiveDemo')}</span>
          </div>
          <p className="text-xs text-slate-600 mb-3 leading-relaxed">
            {t('seedSampleText')}
          </p>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center justify-center gap-1.5"
          >
            {seeding ? t('seeding') : t('seedSampleData')}
          </button>
        </div>

        {/* PWA Install Card */}
        <InstallPrompt variant="sidebar" />

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title={t('logout')}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
