import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Building2,
  Factory,
  Coins,
  PlusCircle,
  BarChart3,
  Zap,
  Gem,
  Target,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  LineChart,
  History,
  Globe,
  ShieldAlert,
  Users,
  Wallet,
  CreditCard,
  Megaphone,
  Tag
} from 'lucide-react';

export default function Sidebar() {
  const { activeScreen, setActiveScreen, setSelectedStrategyId, strategies, t, lang, isSidebarCollapsed, toggleSidebar } = useApp();
  const { user } = useAuth();
  
  const [expandedGroups, setExpandedGroups] = useState({});

  const toggleGroup = (key) => {
    setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleStrategyClick = (stratId) => {
    setSelectedStrategyId(stratId);
    setActiveScreen(`strategy-${stratId}`);
  };

  // Top Standalone Items
  const standaloneItems = [
    { id: 'overview', label: t('navOverview'), icon: BarChart3, onClick: () => setActiveScreen('overview') },
    { id: 'market-prices', label: t('navMarketPrices'), icon: Globe, onClick: () => setActiveScreen('market-prices') },
  ];

  // Reports Group Items (Strategy Comparison + Dynamic Strategy Dashboards + Short/Long Term)
  const reportsItems = [
    { id: 'strategy-comparison', label: t('navStrategyComparison'), icon: LineChart, onClick: () => setActiveScreen('strategy-comparison') },
    { id: 'short-term', label: t('navShortTerm'), icon: Zap, onClick: () => setActiveScreen('short-term') },
    { id: 'long-term', label: t('navLongTerm'), icon: Gem, onClick: () => setActiveScreen('long-term') },
  ];
  
  strategies.forEach(strat => {
    reportsItems.push({
      id: `strategy-${strat.id}`,
      label: strat.name,
      icon: Target,
      isStrategy: true,
      category: strat.category,
      onClick: () => handleStrategyClick(strat.id)
    });
  });

  const navGroups = [
    {
      id: 'trades',
      title: lang === 'ar' ? 'مركز التداول' : 'Trading Hub',
      items: [
        { id: 'trade-entry', label: t('navTradeEntry'), icon: PlusCircle, highlight: true, onClick: () => setActiveScreen('trade-entry') },
        { id: 'coin-portfolio', label: t('navCoinPortfolio'), icon: Coins, onClick: () => setActiveScreen('coin-portfolio') },
        { id: 'trade-history', label: lang === 'ar' ? 'سجل الصفقات' : 'Trade History', icon: History, onClick: () => setActiveScreen('trade-history') },
      ]
    },
    {
      id: 'portfolios',
      title: lang === 'ar' ? 'المحافظ والاستراتيجيات' : 'Portfolios & Strategies',
      items: [
        { id: 'wallet', label: lang === 'ar' ? 'المحفظة' : 'Wallet', icon: Wallet, onClick: () => setActiveScreen('wallet') },
        { id: 'exchange-setup', label: t('navExchangeSetup'), icon: Building2, onClick: () => setActiveScreen('exchange-setup') },
        { id: 'strategy-factory', label: t('navStrategyFactory'), icon: Factory, onClick: () => setActiveScreen('strategy-factory') },
      ]
    },
    {
      id: 'reports',
      title: lang === 'ar' ? 'التقارير والمقارنات' : 'Reports & Comparisons',
      items: reportsItems
    },
    {
      id: 'settings',
      title: lang === 'ar' ? 'الإعدادات والأمان' : 'Settings & Security',
      items: [
        { id: 'security-preview', label: t('navSecurityPreview'), icon: ShieldCheck, onClick: () => setActiveScreen('security-preview') },
        { id: 'billing', label: lang === 'ar' ? 'الاشتراك والفواتير' : 'Billing', icon: CreditCard, onClick: () => setActiveScreen('billing') },
        { id: 'affiliate', label: lang === 'ar' ? 'التسويق بالعمولة' : 'Affiliate', icon: Megaphone, onClick: () => setActiveScreen('affiliate') },
      ]
    }
  ];

  if (user?.is_superadmin) {
    navGroups.push({
      id: 'admin',
      title: lang === 'ar' ? 'الإدارة' : 'Admin',
      items: [
        { id: 'users-management', label: lang === 'ar' ? 'إدارة المستخدمين' : 'Users Mgt', icon: Users, onClick: () => setActiveScreen('users-management') },
        { id: 'coupons-management', label: lang === 'ar' ? 'إدارة الكوبونات' : 'Coupons', icon: Tag, onClick: () => setActiveScreen('coupons-management') },
        { id: 'system-logs', label: lang === 'ar' ? 'سجل النظام (Admin)' : 'System Logs', icon: ShieldAlert, onClick: () => setActiveScreen('system-logs') },
      ]
    });
  }

  const isRtl = lang === 'ar';

  return (
    <aside
      className={`glass-panel flex flex-col h-screen sticky top-0 z-30 shrink-0 transition-all duration-300 ease-in-out ${
        isSidebarCollapsed ? 'w-20' : 'w-72'
      } ${isRtl ? 'border-l border-white/10' : 'border-r border-white/10'}`}
    >
      {/* Top Header & Brand */}
      <div className={`p-4 border-b border-white/10 flex flex-col gap-2 shrink-0 ${isSidebarCollapsed ? 'items-center' : ''}`}>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/20">
              <Coins className="w-6 h-6 text-white" />
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <h1 className="text-sm font-bold text-white tracking-wide leading-tight truncate">
                  {t('appTitle')}
                </h1>
                <p className="text-[11px] text-cyan-400 font-mono tracking-wider mt-0.5 truncate">
                  {t('appVersion')}
                </p>
              </div>
            )}
          </div>

          {/* Internal Toggle Button */}
          {!isSidebarCollapsed && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              title="Collapse Sidebar"
            >
              {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Strict Spot Only Banner */}
        {!isSidebarCollapsed ? (
          <div className="mt-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center gap-2 text-cyan-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0"></span>
            <span className="truncate">{t('spotOnlyBadge')}</span>
          </div>
        ) : (
          <div className="mt-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping" title={t('spotOnlyBadge')}></div>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="p-3 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
        
        {/* Standalone Items */}
        <div className="space-y-1">
          {standaloneItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                title={isSidebarCollapsed ? item.label : undefined}
                className={`w-full flex items-center ${
                  isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-3 py-2.5'
                } rounded-xl text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/30 shadow-lg shadow-cyan-500/10 font-bold'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className={`flex items-center gap-3 min-w-0 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-gray-400'}`} />
                  {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                </div>
              </button>
            );
          })}
        </div>

        {navGroups.map((group) => (
          <div key={group.id} className="space-y-1">
            {!isSidebarCollapsed ? (
              <button
                onClick={() => toggleGroup(group.id)}
                className="w-full px-3 py-1.5 flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider hover:text-white transition-colors"
              >
                <span>{group.title}</span>
                <ChevronRight 
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    expandedGroups[group.id] === true ? (isRtl ? '-rotate-90' : 'rotate-90') : ''
                  }`} 
                />
              </button>
            ) : (
              <div className="h-2"></div>
            )}
            
            <div className={`space-y-1 overflow-hidden transition-all duration-300 ${(!isSidebarCollapsed && !expandedGroups[group.id]) ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100'}`}>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={item.onClick}
                    title={isSidebarCollapsed ? item.label : undefined}
                    className={`w-full flex items-center ${
                      isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-3 py-2.5'
                    } rounded-xl text-xs font-medium transition-all duration-200 ${
                      isActive
                        ? item.isStrategy 
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold'
                            : 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/30 shadow-lg shadow-cyan-500/10 font-bold'
                        : item.highlight
                        ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 font-semibold'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className={`flex items-center gap-3 min-w-0 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? (item.isStrategy ? 'text-indigo-400' : 'text-cyan-400') : item.highlight ? 'text-emerald-400' : 'text-gray-400'}`} />
                      {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </div>
                    
                    {!isSidebarCollapsed && item.highlight && (
                      <span className="px-2 py-0.5 text-[10px] bg-emerald-500 text-black font-extrabold rounded-full shrink-0 animate-pulse">
                        NEW
                      </span>
                    )}

                    {!isSidebarCollapsed && item.isStrategy && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0 ${
                        item.category === 'Short-Term' ? 'bg-amber-500/10 text-amber-400' : 'bg-purple-500/10 text-purple-400'
                      }`}>
                        {item.category === 'Short-Term' ? 'ST' : 'LT'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
