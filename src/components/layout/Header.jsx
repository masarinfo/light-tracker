import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Globe, Radio, Wallet, PanelLeftClose, PanelLeftOpen, Sun, Moon, Eye, EyeOff, Timer, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const { lang, toggleLanguage, theme, toggleTheme, t, activeScreen, priceSource, isFetchingPrices, overviewMetrics, isSidebarCollapsed, toggleSidebar } = useApp();
  const { user, logout } = useAuth();

  const [showBalance, setShowBalance] = useState(() => localStorage.getItem('show_balance') !== 'false');
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    localStorage.setItem('show_balance', showBalance);
  }, [showBalance]);

  useEffect(() => {
    if (isFetchingPrices) {
      setCountdown(30);
    } else {
      const interval = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isFetchingPrices]);

  const getScreenTitle = () => {
    if (activeScreen === 'overview') return t('overviewTitle');
    if (activeScreen === 'exchange-setup') return t('exchangeSetupTitle');
    if (activeScreen === 'strategy-factory') return t('strategyFactoryTitle');
    if (activeScreen === 'coin-portfolio') return t('coinPortfolioTitle');
    if (activeScreen === 'trade-entry') return t('tradeEntryTitle');
    if (activeScreen === 'short-term') return t('shortTermTitle');
    if (activeScreen === 'long-term') return t('longTermTitle');
    if (activeScreen === 'strategy-comparison') return t('comparisonTitle');
    if (activeScreen.startsWith('strategy-')) return t('navDynamicStrategy');
    if (activeScreen === 'security-preview') return t('securityPreviewTitle');
    return t('appTitle');
  };

  return (
    <header className="h-16 glass-panel border-b border-white/10 px-3 md:px-6 flex items-center justify-between sticky top-0 z-20 shrink-0">
      {/* Title & Menu Toggle Button */}
      <div className="flex items-center gap-2 md:gap-4 truncate min-w-0 flex-1">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/40 text-cyan-400 transition-all duration-200 shrink-0"
          title={isSidebarCollapsed ? 'Expand Sidebar / إظهار القائمة' : 'Collapse Sidebar / إخفاء القائمة'}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-5 h-5" />
          ) : (
            <PanelLeftClose className="w-5 h-5" />
          )}
        </button>

        <h2 className="text-base font-bold tracking-wide truncate flex items-center gap-2">
          {getScreenTitle()}
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">V4.0</span>
        </h2>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
        {/* Live Market Price Badge with Timer */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
          <Radio className={`w-3.5 h-3.5 text-cyan-400 shrink-0 ${isFetchingPrices ? 'animate-spin' : 'animate-pulse'}`} />
          <span>{priceSource}</span>
          <div className="flex items-center gap-1 border-l border-cyan-500/30 pl-2 ml-1">
            <Timer className="w-3 h-3 text-cyan-500" />
            <span className="text-[10px] text-cyan-500">{countdown}s</span>
          </div>
        </div>

        {/* Portfolio Value Summary Badge */}
        <div 
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs transition-all ${
            overviewMetrics.hasNegativeCash 
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' 
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          }`}
          title={overviewMetrics.hasNegativeCash ? `⚠️ ${t('unloggedDeposit') || 'Missing Deposit'}: $${overviewMetrics.unloggedDepositAmount.toLocaleString()}` : ''}
        >
          <Wallet className={`w-4 h-4 shrink-0 ${overviewMetrics.hasNegativeCash ? 'text-amber-400' : 'text-emerald-400'}`} />
          <div className="flex items-center gap-1 font-bold">
            <span className="text-gray-400 hidden md:inline">{t('portfolioSummaryLabel')}</span>
            <span className={`font-mono ${overviewMetrics.hasNegativeCash ? 'text-amber-400' : 'text-emerald-400'}`} dir="ltr">
              {showBalance 
                ? `$${overviewMetrics.totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : '********'}
            </span>
          </div>
          <button 
            onClick={() => setShowBalance(!showBalance)}
            className={`ml-1 p-1 rounded-md transition-colors ${
              overviewMetrics.hasNegativeCash ? 'hover:bg-amber-500/20 text-amber-500' : 'hover:bg-emerald-500/20 text-emerald-500'
            }`}
            title="Toggle Balance Visibility"
          >
            {showBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Light / Dark Mode Switcher */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-500/40 text-amber-400 text-xs font-semibold transition-all duration-200"
          title={theme === 'dark' ? t('themeLight') : t('themeDark')}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-sans hidden sm:inline">{t('themeLight')}</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="font-sans hidden sm:inline">{t('themeDark')}</span>
            </>
          )}
        </button>

        {/* Language Switcher */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/40 text-gray-200 text-xs font-semibold transition-all duration-200"
          title="Switch Language / تغيير اللغة"
        >
          <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="font-sans hidden sm:inline">{lang === 'ar' ? 'English (EN)' : 'العربية (AR)'}</span>
        </button>

        {/* User Profile & Logout */}
        <div className="flex items-center gap-1.5 md:gap-2 border-l border-white/10 pl-2 md:pl-3 ml-0.5 md:ml-1">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
            <User className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="font-sans hidden sm:inline">{user?.username}</span>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 transition-all duration-200 flex items-center justify-center"
            title="Logout / تسجيل الخروج"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
