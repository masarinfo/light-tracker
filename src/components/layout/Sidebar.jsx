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
    setExpandedGroups(prev => ({ ...prev, [key]: prev[key] === false ? true : false }));
  };

  const navGroups = [
    {
      id: 'trades',
      title: lang === 'ar' ? 'الصفقات' : 'Trades',
      items: [
        { id: 'trade-entry', label: t('navTradeEntry'), icon: PlusCircle, highlight: true },
        { id: 'trade-history', label: lang === 'ar' ? 'سجل الصفقات' : 'Trade History', icon: History },
        { id: 'short-term', label: t('navShortTerm'), icon: Zap },
        { id: 'long-term', label: t('navLongTerm'), icon: Gem },
      ]
    },
    {
      id: 'portfolios',
      title: lang === 'ar' ? 'المحافظ والاستراتيجيات' : 'Portfolios & Strategies',
      items: [
        { id: 'wallet', label: lang === 'ar' ? 'المحفظة' : 'Wallet', icon: Wallet },
        { id: 'coin-portfolio', label: t('navCoinPortfolio'), icon: Coins },
        { id: 'strategy-factory', label: t('navStrategyFactory'), icon: Factory },
      ]
    },
    {
      id: 'reports',
      title: lang === 'ar' ? 'التقارير والمقارنات' : 'Reports & Comparisons',
      items: [
        { id: 'overview', label: t('navOverview'), icon: BarChart3 },
        { id: 'market-prices', label: t('navMarketPrices'), icon: Globe },
        { id: 'strategy-comparison', label: t('navStrategyComparison'), icon: LineChart },
      ]
    },
    {
      id: 'settings',
      title: lang === 'ar' ? 'الإعدادات والأمان' : 'Settings & Security',
      items: [
        { id: 'security-preview', label: t('navSecurityPreview'), icon: ShieldCheck },
        { id: 'exchange-setup', label: t('navExchangeSetup'), icon: Building2 },
        { id: 'billing', label: lang === 'ar' ? 'الاشتراك والفواتير' : 'Billing', icon: CreditCard },
        { id: 'affiliate', label: lang === 'ar' ? 'التسويق بالعمولة' : 'Affiliate', icon: Megaphone, highlight: true },
      ]
    }
  ];

  if (user?.is_superadmin) {
    navGroups.push({
      id: 'admin',
      title: lang === 'ar' ? 'الإدارة' : 'Admin',
      items: [
        { id: 'users-management', label: lang === 'ar' ? 'إدارة المستخدمين' : 'Users Mgt', icon: Users, highlight: true },
        { id: 'coupons-management', label: lang === 'ar' ? 'إدارة الكوبونات' : 'Coupons', icon: Tag, highlight: true },
        { id: 'system-logs', label: lang === 'ar' ? 'سجل النظام (Admin)' : 'System Logs', icon: ShieldAlert, highlight: true },
      ]
    });
  }

  const handleStrategyClick = (stratId) => {
    setSelectedStrategyId(stratId);
    setActiveScreen(`strategy-${stratId}`);
  };

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
                    expandedGroups[group.id] !== false ? (isRtl ? '-rotate-90' : 'rotate-90') : ''
                  }`} 
                />
              </button>
            ) : (
              <div className="h-2"></div>
            )}
            
            <div className={`space-y-1 overflow-hidden transition-all duration-300 ${(!isSidebarCollapsed && expandedGroups[group.id] === false) ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100'}`}>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveScreen(item.id)}
                    title={isSidebarCollapsed ? item.label : undefined}
                    className={`w-full flex items-center ${
                      isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-3 py-2.5'
                    } rounded-xl text-xs font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/30 shadow-lg shadow-cyan-500/10 font-bold'
                        : item.highlight
                        ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 font-semibold'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className={`flex items-center gap-3 min-w-0 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : item.highlight ? 'text-emerald-400' : 'text-gray-400'}`} />
                      {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </div>
                    {!isSidebarCollapsed && item.highlight && (
                      <span className="px-2 py-0.5 text-[10px] bg-emerald-500 text-black font-extrabold rounded-full shrink-0 animate-pulse">
                        NEW
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Dynamic Strategy Dashboards Submenu */}
        <div className="space-y-1">
          {!isSidebarCollapsed && strategies.length > 0 && (
            <button
              onClick={() => toggleGroup('strategies')}
              className="w-full pt-2 px-3 py-1.5 flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider hover:text-white transition-colors border-t border-white/5"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="truncate">{t('strategyDashboardsGroup')}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-cyan-300 font-mono shrink-0">
                  {strategies.length}
                </span>
              </div>
              <ChevronRight 
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  expandedGroups['strategies'] !== false ? (isRtl ? '-rotate-90' : 'rotate-90') : ''
                }`} 
              />
            </button>
          )}

          <div className={`space-y-1 overflow-hidden transition-all duration-300 ${(!isSidebarCollapsed && expandedGroups['strategies'] === false) ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100'}`}>
            {strategies.map((strat) => {
              const stratScreenId = `strategy-${strat.id}`;
              const isActive = activeScreen === stratScreenId;
              return (
                <button
                  key={strat.id}
                  onClick={() => handleStrategyClick(strat.id)}
                  title={isSidebarCollapsed ? strat.name : undefined}
                  className={`w-full flex items-center ${
                    isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-3 py-2'
                  } rounded-xl text-xs transition-all ${
                    isActive
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold'
                      : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                  }`}
                >
                  <div className={`flex items-center gap-2.5 min-w-0 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                    <Target className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-indigo-400' : 'text-gray-500'}`} />
                    {!isSidebarCollapsed && <span className="truncate">{strat.name}</span>}
                  </div>
                  {!isSidebarCollapsed && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0 ${
                      strat.category === 'Short-Term' ? 'bg-amber-500/10 text-amber-400' : 'bg-purple-500/10 text-purple-400'
                    }`}>
                      {strat.category === 'Short-Term' ? 'ST' : 'LT'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </aside>
  );
}
