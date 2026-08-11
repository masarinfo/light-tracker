import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';

import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

import ExchangeSetupPage from './pages/ExchangeSetupPage';
import StrategyFactoryPage from './pages/StrategyFactoryPage';
import CoinPortfolioPage from './pages/CoinPortfolioPage';
import TradeEntryPage from './pages/TradeEntryPage';
import TradesHistoryPage from './pages/TradesHistoryPage';
import OverviewDashboardPage from './pages/OverviewDashboardPage';
import MarketPricesPage from './pages/MarketPricesPage';
import ShortTermDashboardPage from './pages/ShortTermDashboardPage';
import LongTermDashboardPage from './pages/LongTermDashboardPage';
import StrategyComparisonPage from './pages/StrategyComparisonPage';
import StrategyDashboardPage from './pages/StrategyDashboardPage';
import SecurityPreviewPage from './pages/SecurityPreviewPage';
import SystemLogsPage from './pages/SystemLogsPage';
import UsersManagementPage from './pages/UsersManagementPage';
import WaitlistManagementPage from './pages/admin/WaitlistManagementPage';
import WalletPage from './pages/WalletPage';
import BillingPage from './pages/BillingPage';
import AffiliateDashboard from './pages/AffiliateDashboard';
import CouponsManagementPage from './pages/CouponsManagementPage';

import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import PublicMarketPage from './pages/public/PublicMarketPage';
import Pricing from './pages/public/Pricing';

import PublicHeader from './components/layout/PublicHeader';

function PublicLayout({ children }) {
  const { lang } = useApp();
  const isRtl = lang === 'ar';

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen font-sans selection:bg-cyan-500/30 transition-colors duration-300 bg-[var(--bg-main)] text-[var(--text-primary)]">
      <PublicHeader />
      <div className="pt-24 pb-12">
        {children}
      </div>
    </div>
  );
}

function PrivateAppWrapper() {
  const { activeScreen, lang } = useApp();
  
  const renderScreen = () => {
    if (activeScreen === 'exchange-setup') return <ExchangeSetupPage />;
    if (activeScreen === 'strategy-factory') return <StrategyFactoryPage />;
    if (activeScreen === 'coin-portfolio') return <CoinPortfolioPage />;
    if (activeScreen === 'trade-entry') return <TradeEntryPage />;
    if (activeScreen === 'trade-history') return <TradesHistoryPage />;
    if (activeScreen === 'market-prices') return <MarketPricesPage />;
    if (activeScreen === 'wallet') return <WalletPage />;
    if (activeScreen === 'billing') return <BillingPage />;
    if (activeScreen === 'affiliate') return <AffiliateDashboard />;
    if (activeScreen === 'coupons-management') return <CouponsManagementPage />;
    if (activeScreen === 'system-logs') return <SystemLogsPage />;
    if (activeScreen === 'users-management') return <UsersManagementPage />;
    if (activeScreen === 'waitlist-management') return <WaitlistManagementPage />;
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

function PrivateLayout() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div className="flex h-screen items-center justify-center text-white bg-slate-900">جاري التحميل...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return <PrivateAppWrapper />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <Routes>
            <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
            <Route path="/market" element={<PublicLayout><PublicMarketPage /></PublicLayout>} />
            <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
            <Route path="/register" element={<PublicLayout><RegisterPage /></PublicLayout>} />
            <Route path="/pricing" element={<PublicLayout><Pricing /></PublicLayout>} />
            <Route path="/dashboard/*" element={<PrivateLayout />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
