import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartPulse, Lock, Mail, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError(lang === 'hi' ? 'पासवर्ड मेल नहीं खाते' : 'Passwords do not match');
    }

    if (password.length < 6) {
      return setError(lang === 'hi' ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए' : 'Password must be at least 6 characters long');
    }

    setLoading(true);

    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || (lang === 'hi' ? 'खाता पंजीकरण विफल रहा।' : 'Registration failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      {/* Top Language Selector */}
      <div className="absolute top-6 right-6 sm:right-10">
        <LanguageSelector variant="navbar" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 items-center justify-center text-white shadow-xl shadow-emerald-500/25 mb-4">
          <HeartPulse className="w-9 h-9" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {lang === 'hi' ? 'अपना नया खाता बनाएं' : 'Create Your Account'}
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          {lang === 'hi'
            ? 'अपनी व्यक्तिगत स्वास्थ्य, पोषण और आदत ट्रैकिंग यात्रा शुरू करें'
            : 'Start your personalized health, nutrition, and habit tracking journey'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100 sm:px-10">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                {lang === 'hi' ? 'पूरा नाम (Full Name)' : 'Full Name'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Mercer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm pl-10 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

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
                {lang === 'hi' ? 'पासवर्ड (कम से कम 6 अक्षर)' : 'Password (min. 6 characters)'}
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                {lang === 'hi' ? 'पासवर्ड की पुष्टि करें' : 'Confirm Password'}
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm pl-10 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 mt-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-semibold text-sm rounded-xl transition shadow-sm flex items-center justify-center gap-2"
            >
              <span>{loading ? (lang === 'hi' ? 'खाता बन रहा है...' : 'Creating Account...') : (lang === 'hi' ? 'आरंभ करें' : 'Get Started')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            {lang === 'hi' ? 'क्या आपके पास पहले से खाता है?' : 'Already have an account?'}{' '}
            <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
              {lang === 'hi' ? 'यहाँ साइन इन करें' : 'Sign in here'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
