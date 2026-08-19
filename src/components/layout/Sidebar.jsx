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
  Mail,
  LineChart,
  History,
  Globe,
  ShieldAlert,
  Users,
  Wallet,
  CreditCard,
  Megaphone,
  Tag,
  Activity,
  Briefcase,
  PieChart,
  Settings,
  Shield,
  Database,
  ArrowRight,
  ArrowLeft,
  User
} from 'lucide-react';

export default function Sidebar() {
  const { activeScreen, setActiveScreen, setSelectedStrategyId, strategies, t, lang, isSidebarCollapsed, toggleSidebar, currentHub, setCurrentHub } = useApp();
  const { user } = useAuth();
  const isRtl = lang === 'ar';
  
  // Make "trades" (Trading Hub) open by default
  const [expandedGroups, setExpandedGroups] = useState({ trades: true, 'gold-hub': true });

  const toggleGroup = (key) => {
    setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleStrategyClick = (stratId) => {
    setSelectedStrategyId(stratId);
    setActiveScreen(`strategy-${stratId}`);
  };

  // Reports Group Items (Strategy Comparison + Dynamic Strategy Dashboards + Short/Long Term)
  const reportsItems = [
    { id: 'strategy-comparison', label: t('navStrategyComparison'), icon: LineChart, onClick: () => setActiveScreen('strategy-comparison') },
    { id: 'short-term', label: t('navShortTerm'), icon: Zap, onClick: () => setActiveScreen('short-term') },
    { id: 'long-term', label: t('navLongTerm'), icon: Gem, onClick: () => setActiveScreen('long-term') },
  ];
  
  strategies.forEach(strat => {
    // Only show strategy if it matches the current hub, or if strategy doesn't have market_type yet
    if ((strat.market_type || 'crypto') === currentHub) {
      reportsItems.push({
        id: `strategy-${strat.id}`,
        label: strat.name,
        icon: Target,
        isStrategy: true,
        category: strat.category,
        onClick: () => handleStrategyClick(strat.id)
      });
    }
  });

  const navGroups = [
    {
      id: 'trades',
      title: lang === 'ar' ? 'مركز التداول' : 'Trading Hub',
      icon: Activity,
      items: [
        { id: 'overview', label: t('navOverview'), icon: BarChart3, onClick: () => setActiveScreen('overview') },
        { id: 'market-prices', label: t('navMarketPrices'), icon: Globe, onClick: () => setActiveScreen('market-prices') },
        { id: 'trade-entry', label: t('navTradeEntry'), icon: PlusCircle, highlight: true, onClick: () => setActiveScreen('trade-entry') },
        { id: 'coin-portfolio', label: t('navCoinPortfolio'), icon: Coins, onClick: () => setActiveScreen('coin-portfolio') },
        { id: 'trade-history', label: lang === 'ar' ? 'سجل الصفقات' : 'Trade History', icon: History, onClick: () => setActiveScreen('trade-history') },
      ]
    },

    {
      id: 'portfolios',
      title: lang === 'ar' ? 'المحافظ والاستراتيجيات' : 'Portfolios & Strategies',
      icon: Briefcase,
      items: [
        { id: 'wallet', label: lang === 'ar' ? 'المحفظة' : 'Wallet', icon: Wallet, onClick: () => setActiveScreen('wallet') },
        { id: 'exchange-setup', label: t('navExchangeSetup'), icon: Building2, onClick: () => setActiveScreen('exchange-setup') },
        { id: 'strategy-factory', label: t('navStrategyFactory'), icon: Factory, onClick: () => setActiveScreen('strategy-factory') },
      ]
    },
    {
      id: 'reports',
      title: lang === 'ar' ? 'التقارير والمقارنات' : 'Reports & Comparisons',
      icon: PieChart,
      items: reportsItems
    },
    {
      id: 'settings',
      title: lang === 'ar' ? 'الإعدادات والأمان' : 'Settings & Security',
      icon: Settings,
      items: [
        { id: 'profile', label: lang === 'ar' ? 'الملف الشخصي' : 'Profile', icon: User, onClick: () => setActiveScreen('profile') },
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
      icon: Shield,
      items: [
        { id: 'users-management', label: lang === 'ar' ? 'إدارة المستخدمين' : 'Users Mgt', icon: Users, onClick: () => setActiveScreen('users-management') },
        { id: 'waitlist-management', label: lang === 'ar' ? 'قائمة الانتظار' : 'Waitlist', icon: Mail, onClick: () => setActiveScreen('waitlist-management') },
        { id: 'coupons-management', label: lang === 'ar' ? 'إدارة الكوبونات' : 'Coupons', icon: Tag, onClick: () => setActiveScreen('coupons-management') },
        { id: 'system-logs', label: lang === 'ar' ? 'سجل النظام (Admin)' : 'System Logs', icon: ShieldAlert, onClick: () => setActiveScreen('system-logs') },
      ]
    });
  }

  const goldNavGroups = [
    {
      id: 'gold-hub',
      title: lang === 'ar' ? 'مركز الذهب 🥇' : 'Gold Hub 🥇',
      icon: Gem,
      items: [
        { id: 'metals-inventory', label: lang === 'ar' ? 'مخزن الذهب' : 'Gold Inventory', icon: Database, onClick: () => setActiveScreen('metals-inventory') },
        { id: 'metals-market', label: lang === 'ar' ? 'سوق الذهب' : 'Gold Market', icon: Globe, onClick: () => setActiveScreen('metals-market') },
        { id: 'metals-trades', label: lang === 'ar' ? 'الصفقات المفتوحة والسجل' : 'Trades & History', icon: History, onClick: () => setActiveScreen('metals-trades') },
        { id: 'metal-trade-entry', label: lang === 'ar' ? 'إدخال صفقة' : 'Trade Entry', icon: PlusCircle, highlight: true, onClick: () => setActiveScreen('metal-trade-entry') },
      ]
    },
    {
      id: 'portfolios',
      title: lang === 'ar' ? 'المحافظ والاستراتيجيات' : 'Portfolios & Strategies',
      icon: Briefcase,
      items: [
        { id: 'exchange-setup', label: t('navExchangeSetup'), icon: Building2, onClick: () => setActiveScreen('exchange-setup') },
        { id: 'strategy-factory', label: t('navStrategyFactory'), icon: Factory, onClick: () => setActiveScreen('strategy-factory') },
      ]
    },
    {
      id: 'reports',
      title: lang === 'ar' ? 'تقارير الاستراتيجيات' : 'Strategy Reports',
      icon: PieChart,
      items: reportsItems
    }
  ];

  const activeGroups = currentHub === 'metals' ? goldNavGroups : navGroups;

  return (
    <>
      {/* Mobile Backdrop overlay when expanded */}
      {!isSidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden" 
          onClick={toggleSidebar}
        />
      )}
      
      <aside
        className={`glass-panel flex flex-col h-screen shrink-0 transition-all duration-300 ease-in-out
          fixed md:sticky top-0 z-40 
          ${isSidebarCollapsed 
            ? (isRtl ? 'translate-x-full md:translate-x-0 md:w-20' : '-translate-x-full md:translate-x-0 md:w-20') 
            : 'w-72 translate-x-0'
          }
          ${isRtl ? 'border-l border-white/10 right-0' : 'border-r border-white/10 left-0'}
        `}
      >
        {/* Top Header & Brand */}
        <div className={`p-4 border-b border-white/10 flex flex-col gap-2 shrink-0 ${isSidebarCollapsed ? 'items-center' : ''}`}>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
                currentHub === 'metals' 
                ? 'bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-600 shadow-amber-500/20'
                : 'bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 shadow-cyan-500/20'
              }`}>
                {currentHub === 'metals' ? <Gem className="w-6 h-6 text-white" /> : <Coins className="w-6 h-6 text-white" />}
              </div>
              {!isSidebarCollapsed && (
                <div className="min-w-0 flex-1">
                  <h1 className="text-sm font-bold text-white tracking-wide leading-tight truncate">
                    {currentHub === 'metals' ? (lang === 'ar' ? 'مركز الذهب' : 'Gold Hub') : t('appTitle')}
                  </h1>
                  <p className={`text-[11px] font-mono tracking-wider mt-0.5 truncate ${currentHub === 'metals' ? 'text-amber-400' : 'text-cyan-400'}`}>
                    {currentHub === 'metals' ? (lang === 'ar' ? 'إدارة الثروات المعدنية' : 'Precious Metals') : t('appVersion')}
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
            <div className={`mt-2 px-3 py-1.5 rounded-lg border flex items-center justify-center gap-2 text-xs font-semibold ${
              currentHub === 'metals' 
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
              : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300'
            }`}>
              <span className={`w-2 h-2 rounded-full animate-ping shrink-0 ${currentHub === 'metals' ? 'bg-amber-400' : 'bg-cyan-400'}`}></span>
              <span className="truncate">{currentHub === 'metals' ? (lang === 'ar' ? 'شراء مادي حقيقي' : 'Physical Spot') : t('spotOnlyBadge')}</span>
            </div>
          ) : (
            <div className={`mt-1 w-2 h-2 rounded-full animate-ping ${currentHub === 'metals' ? 'bg-amber-400' : 'bg-cyan-400'}`} title={t('spotOnlyBadge')}></div>
          )}

          {/* Hub Toggle Header */}
          <div className="mt-4 flex bg-black/40 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setCurrentHub('crypto')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-1 rounded-lg text-xs font-bold transition-all ${
                currentHub === 'crypto' 
                ? 'bg-cyan-500/20 text-cyan-300 shadow-sm' 
                : 'text-gray-500 hover:text-gray-300'
              }`}
              title={lang === 'ar' ? 'مركز الكريبتو' : 'Crypto Hub'}
            >
              <Coins className="w-4 h-4" />
              {!isSidebarCollapsed && (lang === 'ar' ? 'كريبتو' : 'Crypto')}
            </button>
            <button
              onClick={() => setCurrentHub('metals')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-1 rounded-lg text-xs font-bold transition-all ${
                currentHub === 'metals' 
                ? 'bg-amber-500/20 text-amber-300 shadow-sm' 
                : 'text-gray-500 hover:text-gray-300'
              }`}
              title={lang === 'ar' ? 'مركز الذهب' : 'Gold Hub'}
            >
              <Gem className="w-4 h-4" />
              {!isSidebarCollapsed && (lang === 'ar' ? 'ذهب' : 'Gold')}
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          {activeGroups.map((group) => {
            const GroupIcon = group.icon;
            return (
              <div key={group.id} className="space-y-1">
                {!isSidebarCollapsed ? (
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className="w-full px-3 py-2 flex items-center justify-between text-xs font-bold text-gray-300 uppercase tracking-wider hover:text-white transition-colors hover:bg-white/5 rounded-lg"
                  >
                    <div className="flex items-center gap-2.5">
                      <GroupIcon className={`w-4 h-4 ${currentHub === 'metals' ? 'text-amber-500' : 'text-cyan-500'}`} />
                      <span>{group.title}</span>
                    </div>
                    <ChevronRight 
                      className={`w-4 h-4 transition-transform duration-200 ${
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
                        onClick={() => {
                          item.onClick();
                          if (window.innerWidth < 768 && !isSidebarCollapsed) {
                            toggleSidebar();
                          }
                        }}
                        title={isSidebarCollapsed ? item.label : undefined}
                        className={`w-full flex items-center ${
                          isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-3 py-2.5'
                        } rounded-xl text-xs font-medium transition-all duration-200 ${
                          isActive
                            ? item.isStrategy 
                                ? (currentHub === 'metals' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold')
                                : (currentHub === 'metals' ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30 shadow-lg shadow-amber-500/10 font-bold' : 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/30 shadow-lg shadow-cyan-500/10 font-bold')
                            : item.highlight
                            ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 font-semibold'
                            : 'text-gray-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className={`flex items-center gap-3 min-w-0 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? (item.isStrategy ? (currentHub === 'metals' ? 'text-amber-400' : 'text-indigo-400') : (currentHub === 'metals' ? 'text-amber-400' : 'text-cyan-400')) : item.highlight ? 'text-emerald-400' : 'text-gray-400'}`} />
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
            );
          })}
        </nav>

        {/* Build Version / Timestamp */}
        <div className="p-2 border-t border-white/5 mt-auto text-center">
          <p className="text-xs text-gray-500 font-mono tracking-wide opacity-60 hover:opacity-100 transition-opacity">
            {typeof __BUILD_DATE__ !== 'undefined' ? `v${__BUILD_DATE__}` : 'DEV'}
          </p>
        </div>
      </aside>
    </>
  );
}
