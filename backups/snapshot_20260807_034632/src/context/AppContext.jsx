import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/i18n';
import { fetchLivePrices, DEFAULT_SPOT_PRICES } from '../services/binanceApi';
import { calculateCoinPortfolio, calculateOverviewMetrics } from '../utils/mathEngine';

const AppContext = createContext();

// Pre-seeded initial exchange accounts
const initialExchanges = [
  {
    id: 1,
    name: 'Binance',
    maker_fee_pct: 0.1,
    taker_fee_pct: 0.1,
    use_discount_token: true,
    discount_token_symbol: 'BNB',
    discount_pct: 25.0,
    initial_cash_balance: 15000.0,
  },
  {
    id: 2,
    name: 'Bybit',
    maker_fee_pct: 0.1,
    taker_fee_pct: 0.1,
    use_discount_token: false,
    discount_token_symbol: '',
    discount_pct: 0.0,
    initial_cash_balance: 10000.0,
  },
  {
    id: 3,
    name: 'OKX',
    maker_fee_pct: 0.08,
    taker_fee_pct: 0.1,
    use_discount_token: true,
    discount_token_symbol: 'OKB',
    discount_pct: 20.0,
    initial_cash_balance: 8000.0,
  }
];

// Pre-seeded initial strategies
const initialStrategies = [
  {
    id: 1,
    name: 'سوينغ المرتدات',
    category: 'Short-Term',
    default_exchange_id: 1,
    default_order_type: 'Limit',
    tp_rules: [
      { stage: 1, gain_pct: 3.0, sell_portion_pct: 50.0 },
      { stage: 2, gain_pct: 6.0, sell_portion_pct: 30.0 },
      { stage: 3, gain_pct: 10.0, sell_portion_pct: 20.0 },
    ],
    sl_rules: [
      { stage: 1, loss_pct: 2.5, sell_portion_pct: 100.0 }
    ]
  },
  {
    id: 2,
    name: 'تجميع DCA الشهري',
    category: 'Long-Term',
    default_exchange_id: 1,
    default_order_type: 'Market',
    tp_rules: [
      { stage: 1, gain_pct: 25.0, sell_portion_pct: 25.0 },
      { stage: 2, gain_pct: 50.0, sell_portion_pct: 50.0 },
    ],
    sl_rules: [
      { stage: 1, loss_pct: 15.0, sell_portion_pct: 100.0 }
    ]
  }
];

// Pre-seeded initial spot trades with historical status (OPEN, PARTIALLY_CLOSED, CLOSED)
const initialTrades = [
  {
    id: 101,
    symbol: 'SOLUSDT',
    strategy_id: 2,
    strategy_name: 'تجميع DCA الشهري',
    category: 'Long-Term',
    exchange_id: 1,
    exchange_name: 'Binance',
    order_type: 'Limit',
    entry_price: 90.09,
    amount_usd: 1351.35,
    quantity: 15.0,
    calculated_fee: 2.35,
    status: 'OPEN',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    targets: [
      { stage: 1, type: 'TP', gainPct: 25, targetPrice: 112.61, quantityToSell: 3.75, status: 'PENDING' },
      { stage: 2, type: 'TP', gainPct: 50, targetPrice: 135.13, quantityToSell: 7.5, status: 'PENDING' }
    ]
  },
  {
    id: 102,
    symbol: 'BTCUSDT',
    strategy_id: 1,
    strategy_name: 'سوينغ المرتدات',
    category: 'Short-Term',
    exchange_id: 1,
    exchange_name: 'Binance',
    order_type: 'Limit',
    entry_price: 61200.0,
    amount_usd: 30600.0,
    quantity: 0.5,
    calculated_fee: 22.95,
    status: 'PARTIALLY_CLOSED',
    realizedPnl: 450.0,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    targets: [
      { stage: 1, type: 'TP', gainPct: 3, targetPrice: 63036.0, quantityToSell: 0.25, status: 'EXECUTED', executedFee: 3.93 },
      { stage: 2, type: 'TP', gainPct: 6, targetPrice: 64872.0, quantityToSell: 0.15, status: 'PENDING' },
      { stage: 3, type: 'TP', gainPct: 10, targetPrice: 67320.0, quantityToSell: 0.1, status: 'PENDING' }
    ]
  },
  {
    id: 103,
    symbol: 'ETHUSDT',
    strategy_id: 1,
    strategy_name: 'سوينغ المرتدات',
    category: 'Short-Term',
    exchange_id: 2,
    exchange_name: 'Bybit',
    order_type: 'Limit',
    entry_price: 3300.0,
    amount_usd: 6600.0,
    quantity: 2.0,
    calculated_fee: 6.60,
    status: 'CLOSED',
    realizedPnl: 198.0,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    targets: [
      { stage: 1, type: 'TP', gainPct: 3, targetPrice: 3399.0, quantityToSell: 1.0, status: 'EXECUTED', executedFee: 3.40 },
      { stage: 2, type: 'TP', gainPct: 6, targetPrice: 3498.0, quantityToSell: 1.0, status: 'EXECUTED', executedFee: 3.50 }
    ]
  },
  {
    id: 104,
    symbol: 'NEARUSDT',
    strategy_id: 1,
    strategy_name: 'سوينغ المرتدات',
    category: 'Short-Term',
    exchange_id: 1,
    exchange_name: 'Binance',
    order_type: 'Limit',
    entry_price: 4.80,
    amount_usd: 2400.0,
    quantity: 500.0,
    calculated_fee: 2.40,
    status: 'CLOSED',
    realizedPnl: 225.0,
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    targets: [
      { stage: 1, type: 'TP', gainPct: 6, targetPrice: 5.088, quantityToSell: 250.0, status: 'EXECUTED', executedFee: 1.27 },
      { stage: 2, type: 'TP', gainPct: 10, targetPrice: 5.28, quantityToSell: 250.0, status: 'EXECUTED', executedFee: 1.32 }
    ]
  }
];

export function AppProvider({ children }) {
  const [lang, setLang] = useState('ar');
  const [theme, setTheme] = useState('dark');
  const [activeScreen, setActiveScreen] = useState('overview');
  const [selectedStrategyId, setSelectedStrategyId] = useState(null);
  
  // Collapsible Sidebar State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [exchanges, setExchanges] = useState(initialExchanges);
  const [strategies, setStrategies] = useState(initialStrategies);
  const [trades, setTrades] = useState(initialTrades);

  const [livePrices, setLivePrices] = useState(DEFAULT_SPOT_PRICES);
  const [priceSource, setPriceSource] = useState('Connecting...');
  const [isFetchingPrices, setIsFetchingPrices] = useState(false);

  // Sync theme with body element
  useEffect(() => {
    document.body.className = theme === 'light' ? 'theme-light' : 'theme-dark';
  }, [theme]);

  // Poll Binance REST API every 10 seconds for live spot prices
  useEffect(() => {
    let isMounted = true;
    const updatePrices = async () => {
      setIsFetchingPrices(true);
      const res = await fetchLivePrices();
      if (isMounted) {
        if (res.success && res.prices) {
          setLivePrices((prev) => ({ ...prev, ...res.prices }));
        }
        setPriceSource(res.source);
        setIsFetchingPrices(false);
      }
    };

    updatePrices();
    const interval = setInterval(updatePrices, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Helper translation function
  const t = (key) => {
    return translations[lang]?.[key] || translations['ar']?.[key] || key;
  };

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  // Add Exchange
  const addExchange = (exchangeData) => {
    const newEx = {
      ...exchangeData,
      id: Date.now()
    };
    setExchanges((prev) => [...prev, newEx]);
  };

  // Update Exchange
  const updateExchange = (updatedExchange) => {
    setExchanges((prev) =>
      prev.map((ex) => (String(ex.id) === String(updatedExchange.id) ? updatedExchange : ex))
    );
  };

  // Add Strategy
  const addStrategy = (strategyData) => {
    const newStrat = {
      ...strategyData,
      id: Date.now()
    };
    setStrategies((prev) => [...prev, newStrat]);
  };

  // Update Strategy
  const updateStrategy = (updatedStrategy) => {
    setStrategies((prev) =>
      prev.map((st) => (String(st.id) === String(updatedStrategy.id) ? updatedStrategy : st))
    );
  };

  // Add Trade
  const addTrade = (tradeData) => {
    const newTrade = {
      ...tradeData,
      id: Date.now(),
      created_at: new Date().toISOString()
    };
    setTrades((prev) => [newTrade, ...prev]);
  };

  // Derived calculations
  const coinPortfolios = calculateCoinPortfolio({ trades, livePrices });
  const overviewMetrics = calculateOverviewMetrics({ exchanges, coinPortfolios });

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        toggleLanguage,
        theme,
        toggleTheme,
        t,
        activeScreen,
        setActiveScreen,
        selectedStrategyId,
        setSelectedStrategyId,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        toggleSidebar,
        exchanges,
        addExchange,
        updateExchange,
        strategies,
        addStrategy,
        updateStrategy,
        trades,
        addTrade,
        livePrices,
        priceSource,
        isFetchingPrices,
        coinPortfolios,
        overviewMetrics
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
