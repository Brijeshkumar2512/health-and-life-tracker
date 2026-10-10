import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartPulse, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';
import InstallPrompt from '../components/InstallPrompt';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || (lang === 'hi' ? 'लॉगिन विफल रहा। कृपया अपनी साख जांचें।' : 'Login failed. Please verify credentials.'));
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    const demoEmail = 'alex@healthtracker.io';
    const demoPassword = 'password123';

    try {
      await login(demoEmail, demoPassword);
      navigate('/');
    } catch (loginErr) {
      try {
        await register('Alex Mercer', demoEmail, demoPassword);
        navigate('/');
      } catch (regErr) {
        setError('Demo login error: ' + (regErr.response?.data?.message || regErr.message));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      {/* Top Language Selector & Install Button */}
      <div className="absolute top-6 right-6 sm:right-10 flex items-center gap-2.5">
        <InstallPrompt variant="button" />
        <LanguageSelector variant="navbar" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 items-center justify-center text-white shadow-xl shadow-emerald-500/25 mb-4">
          <HeartPulse className="w-9 h-9" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {t('brandName')} {t('brandTagline')}
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          {lang === 'hi'
            ? 'अपने खाते में साइन इन करें या सीधे इंटरैक्टिव डेमो शुरू करें'
            : 'Sign in to your account or jump into the interactive demo'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100 sm:px-10">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Quick Demo Access Button */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full mb-6 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 group"
          >
            <Sparkles className="w-4 h-4 text-emerald-200 group-hover:rotate-12 transition-transform" />
            <span>{t('demoAccount')}</span>
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider font-semibold">
              <span className="bg-white px-3 text-slate-400">
                {lang === 'hi' ? 'या ईमेल से लॉगिन करें' : 'or sign in with email'}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                {lang === 'hi' ? 'ईमेल पता (Email)' : 'Email Address'}
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="alex@healthtracker.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm pl-10 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                {lang === 'hi' ? 'पासवर्ड (Password)' : 'Password'}
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm pl-10 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 mt-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-semibold text-sm rounded-xl transition shadow-sm flex items-center justify-center gap-2"
            >
              <span>{loading ? (lang === 'hi' ? 'लॉगिन हो रहा है...' : 'Signing in...') : (lang === 'hi' ? 'साइन इन करें' : 'Sign In')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            {lang === 'hi' ? 'क्या आपका खाता नहीं है?' : "Don't have an account?"}{' '}
            <Link to="/register" className="font-semibold text-emerald-600 hover:text-emerald-700">
              {lang === 'hi' ? 'नया खाता बनाएं' : 'Create an account'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
