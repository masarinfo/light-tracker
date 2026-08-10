import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

import ExchangeSetupPage from './pages/ExchangeSetupPage';
import StrategyFactoryPage from './pages/StrategyFactoryPage';
import CoinPortfolioPage from './pages/CoinPortfolioPage';
import TradeEntryPage from './pages/TradeEntryPage';
import OverviewDashboardPage from './pages/OverviewDashboardPage';
import ShortTermDashboardPage from './pages/ShortTermDashboardPage';
import LongTermDashboardPage from './pages/LongTermDashboardPage';
import StrategyComparisonPage from './pages/StrategyComparisonPage';
import StrategyDashboardPage from './pages/StrategyDashboardPage';
import SecurityPreviewPage from './pages/SecurityPreviewPage';

function MainContent() {
  const { activeScreen, lang } = useApp();

  const renderScreen = () => {
    if (activeScreen === 'exchange-setup') return <ExchangeSetupPage />;
    if (activeScreen === 'strategy-factory') return <StrategyFactoryPage />;
    if (activeScreen === 'coin-portfolio') return <CoinPortfolioPage />;
    if (activeScreen === 'trade-entry') return <TradeEntryPage />;
    if (activeScreen === 'overview') return <OverviewDashboardPage />;
    if (activeScreen === 'short-term') return <ShortTermDashboardPage />;
    if (activeScreen === 'long-term') return <LongTermDashboardPage />;
    if (activeScreen === 'strategy-comparison') return <StrategyComparisonPage />;
    if (activeScreen.startsWith('strategy-')) return <StrategyDashboardPage />;
    if (activeScreen === 'security-preview') return <SecurityPreviewPage />;
    return <OverviewDashboardPage />;
  };

  const isRtl = lang === 'ar';

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen flex bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors duration-300">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {renderScreen()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
