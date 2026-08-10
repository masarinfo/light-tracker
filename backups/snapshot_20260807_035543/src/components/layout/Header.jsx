import React from 'react';
import { useApp } from '../../context/AppContext';
import { Globe, Radio, Wallet, PanelLeftClose, PanelLeftOpen, Sun, Moon } from 'lucide-react';

export default function Header() {
  const { lang, toggleLanguage, theme, toggleTheme, t, activeScreen, priceSource, isFetchingPrices, overviewMetrics, isSidebarCollapsed, toggleSidebar } = useApp();

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
    <header className="h-16 glass-panel border-b border-white/10 px-6 flex items-center justify-between sticky top-0 z-20 shrink-0">
      {/* Title & Menu Toggle Button */}
      <div className="flex items-center gap-4 truncate min-w-0">
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

        <h2 className="text-base font-bold tracking-wide truncate">
          {getScreenTitle()}
        </h2>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Live Market Price Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
          <Radio className={`w-3.5 h-3.5 text-cyan-400 shrink-0 ${isFetchingPrices ? 'animate-spin' : 'animate-pulse'}`} />
          <span>{priceSource}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
        </div>

        {/* Portfolio Value Summary Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
          <Wallet className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="flex items-center gap-1 font-bold">
            <span className="text-gray-400">{t('portfolioSummaryLabel')}</span>
            <span className="text-emerald-400 font-mono" dir="ltr">
              ${overviewMetrics.totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
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
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/40 text-gray-200 text-xs font-semibold transition-all duration-200"
          title="Switch Language / تغيير اللغة"
        >
          <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="font-sans">{lang === 'ar' ? 'English (EN)' : 'العربية (AR)'}</span>
        </button>
      </div>
    </header>
  );
}
