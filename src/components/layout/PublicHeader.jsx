import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Coins, LogIn, UserPlus, Sun, Moon, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

export default function PublicHeader() {
  const { user } = useAuth();
  const { lang, toggleLanguage, theme, toggleTheme, t } = useApp();
  const location = useLocation();

  const isRtl = lang === 'ar';
  const isDark = theme === 'dark';

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-lg border-b transition-all duration-300 ${
        isDark ? 'bg-slate-950/80 border-white/10' : 'bg-white/80 border-slate-200 shadow-sm'
      }`} 
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Coins className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className={`text-xl font-black tracking-wide leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Light Tracker
            </h1>
            <p className="text-xs text-cyan-500 font-mono tracking-wider mt-0.5">
              V4.0 - PRO
            </p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link 
            to="/" 
            className={`text-sm font-bold transition-colors ${
              location.pathname === '/' 
                ? 'text-cyan-500' 
                : isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isRtl ? 'الرئيسية' : 'Home'}
          </Link>
          <Link 
            to="/market" 
            className={`text-sm font-bold transition-colors ${
              location.pathname === '/market' 
                ? 'text-cyan-500' 
                : isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isRtl ? 'السوق المباشر' : 'Live Market'}
          </Link>
          <Link 
            to="/pricing" 
            className={`text-sm font-bold transition-colors ${
              location.pathname === '/pricing' 
                ? 'text-cyan-500' 
                : isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isRtl ? 'الباقات والأسعار' : 'Pricing'}
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          
          <div className="flex items-center gap-2 border-x border-slate-500/20 px-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:bg-white/10 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
              title={isDark ? 'Light Mode' : 'Dark Mode'}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={toggleLanguage}
              className={`p-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-1 ${isDark ? 'text-slate-400 hover:bg-white/10 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <Globe className="w-4 h-4" />
              {lang === 'ar' ? 'EN' : 'AR'}
            </button>
          </div>

          {user ? (
            <Link 
              to="/dashboard"
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white text-sm font-bold rounded-xl hover:opacity-90 shadow-lg shadow-cyan-500/20 transition-all"
            >
              {isRtl ? 'لوحة التحكم' : 'Dashboard'}
            </Link>
          ) : (
            <>
              <Link 
                to="/login"
                className={`hidden md:flex items-center gap-2 px-3 py-2.5 text-sm font-bold transition-colors ${isDark ? 'text-slate-300 hover:text-cyan-400' : 'text-slate-600 hover:text-cyan-600'}`}
              >
                <LogIn className="w-4 h-4" />
                {isRtl ? 'دخول' : 'Login'}
              </Link>
              <Link 
                to="/register"
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl transition-all bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20 hover:opacity-90"
              >
                <UserPlus className="w-4 h-4" />
                {isRtl ? 'حساب جديد' : 'Sign Up'}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
