import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Coins, Filter, HelpCircle, History, TrendingUp, TrendingDown, ArrowRightLeft } from 'lucide-react';

export default function CoinPortfolioPage() {
  const { coinPortfolios, trades, t, isFetchingPrices } = useApp();

  const [selectedCoin, setSelectedCoin] = useState('ALL');
  const [selectedExchange, setSelectedExchange] = useState('ALL');
  const [selectedStrategy, setSelectedStrategy] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL'); // 'ALL' | 'OPEN' | 'PARTIALLY_CLOSED' | 'CLOSED'

  // Extract unique coins, exchanges, and strategies for filter dropdowns
  const coinsList = Array.from(new Set(coinPortfolios.map((item) => item.symbol)));
  const exchangesList = Array.from(new Set(coinPortfolios.map((item) => item.exchange_name)));
  const strategiesList = Array.from(new Set(coinPortfolios.map((item) => item.strategy_name)));

  // Filter Active Portfolio Items
  const filteredPortfolios = coinPortfolios.filter((item) => {
    const matchCoin = selectedCoin === 'ALL' || item.symbol === selectedCoin;
    const matchEx = selectedExchange === 'ALL' || item.exchange_name === selectedExchange;
    const matchStrat = selectedStrategy === 'ALL' || item.strategy_name === selectedStrategy;
    const matchStatus = selectedStatus === 'ALL' || item.status === selectedStatus;
    return matchCoin && matchEx && matchStrat && matchStatus;
  });

  // Historical / Closed Trades List
  const historicalTrades = trades.filter((tr) => {
    const matchCoin = selectedCoin === 'ALL' || tr.symbol === selectedCoin;
    const matchEx = selectedExchange === 'ALL' || tr.exchange_name === selectedEx;
    const matchStrat = selectedStrategy === 'ALL' || tr.strategy_name === selectedStrategy;
    const matchStatus = selectedStatus === 'ALL' || tr.status === selectedStatus;
    return matchCoin && matchEx && matchStrat && matchStatus;
  });

  // Format Helper with Thousand Separator & Decimal Control
  const fmt = (num, decimals = 2) => {
    if (num === undefined || num === null || isNaN(num)) return '0.00';
    return Number(num).toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Coins className="w-6 h-6 text-cyan-400 shrink-0" />
            <span>{t('coinPortfolioTitle')}</span>
          </h2>
          <p className="text-sm text-gray-400 mt-1">{t('coinPortfolioDesc')}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{t('autoUpdatedBinance')}</span>
          </span>
        </div>
      </div>

      {/* Strict Average Purchase Cost Rules Banner */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1">
        <div className="font-bold flex items-center gap-2 text-amber-400">
          <HelpCircle className="w-4 h-4 shrink-0" />
          <span>{t('avgCostNoteTitle')}</span>
        </div>
        <p>{t('avgCostNote1')}</p>
        <p>{t('avgCostNote2')}</p>
      </div>

      {/* Multi-Filter Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2 font-bold text-gray-300 shrink-0">
          <Filter className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{t('actionFilter')}:</span>
        </div>

        {/* Filter 1: Coin Filter */}
        <select
          value={selectedCoin}
          onChange={(e) => setSelectedCoin(e.target.value)}
          className="p-2.5 rounded-xl glass-input text-white font-semibold min-w-[130px]"
        >
          <option value="ALL" className="bg-gray-900">{t('allCoins')}</option>
          {coinsList.map((symbol) => (
            <option key={symbol} value={symbol} className="bg-gray-900">
              {symbol}
            </option>
          ))}
        </select>

        {/* Filter 2: Exchange Filter */}
        <select
          value={selectedExchange}
          onChange={(e) => setSelectedExchange(e.target.value)}
          className="p-2.5 rounded-xl glass-input text-white font-semibold min-w-[140px]"
        >
          <option value="ALL" className="bg-gray-900">{t('allExchanges')}</option>
          {exchangesList.map((exName) => (
            <option key={exName} value={exName} className="bg-gray-900">
              {exName}
            </option>
          ))}
        </select>

        {/* Filter 3: Strategy Filter */}
        <select
          value={selectedStrategy}
          onChange={(e) => setSelectedStrategy(e.target.value)}
          className="p-2.5 rounded-xl glass-input text-white font-semibold min-w-[150px]"
        >
          <option value="ALL" className="bg-gray-900">{t('allStrategies')}</option>
          {strategiesList.map((stName) => (
            <option key={stName} value={stName} className="bg-gray-900">
              {stName}
            </option>
          ))}
        </select>

        {/* Filter 4: Trade Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="p-2.5 rounded-xl glass-input text-white font-bold min-w-[160px]"
        >
          <option value="ALL" className="bg-gray-900">{t('statusAll')}</option>
          <option value="OPEN" className="bg-gray-900">{t('statusOpen')}</option>
          <option value="PARTIALLY_CLOSED" className="bg-gray-900">{t('statusPartiallyClosed')}</option>
          <option value="CLOSED" className="bg-gray-900">{t('statusClosed')}</option>
        </select>
      </div>

      {/* Active Positions Table with Thousand Separators */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/10 space-y-3 p-6">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
          <Coins className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{t('activePositionsTitle')}</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-white/5 text-gray-400 font-semibold border-b border-white/10 uppercase tracking-wider">
              <tr>
                <th className="p-4">{t('symbol')}</th>
                <th className="p-4">{t('exchange')}</th>
                <th className="p-4">{t('strategy')}</th>
                <th className="p-4">{t('statusLabel')}</th>
                <th className="p-4">{t('totalQuantity')}</th>
                <th className="p-4">{t('averageCost')}</th>
                <th className="p-4">{t('totalInvested')}</th>
                <th className="p-4">{t('livePrice')}</th>
                <th className="p-4">{t('currentValue')}</th>
                <th className="p-4">{t('unrealizedPnl')}</th>
                <th className="p-4">{t('realizedPnl')}</th>
                <th className="p-4">{t('totalFeesPaid')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-200 font-mono">
              {filteredPortfolios.length === 0 ? (
                <tr>
                  <td colSpan="12" className="p-8 text-center text-gray-500 font-sans">
                    لا توجد عملات مطابقة للفلاتر المحددة حالياً.
                  </td>
                </tr>
              ) : (
                filteredPortfolios.map((item, idx) => {
                  const isProfit = item.unrealizedPnlUsd >= 0;
                  return (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-bold text-white font-sans">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-bold text-cyan-400 text-xs shrink-0">
                            {item.symbol.substring(0, 3)}
                          </div>
                          <span>{item.symbol}</span>
                        </div>
                      </td>
                      <td className="p-4 font-sans text-gray-300">{item.exchange_name}</td>
                      <td className="p-4 font-sans text-cyan-300 font-medium">{item.strategy_name}</td>
                      <td className="p-4 font-sans">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'OPEN'
                            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                            : item.status === 'PARTIALLY_CLOSED'
                            ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
                            : 'bg-gray-500/10 border border-gray-500/30 text-gray-400'
                        }`}>
                          {item.status || 'OPEN'}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-white" dir="ltr">{fmt(item.totalQuantity, 4)}</td>
                      <td className="p-4 text-cyan-300 font-bold" dir="ltr">${fmt(item.avgPurchaseCost, 2)}</td>
                      <td className="p-4 text-gray-300" dir="ltr">${fmt(item.totalInvestedUsd, 2)}</td>
                      <td className="p-4 text-emerald-400 font-bold" dir="ltr">${fmt(item.livePrice, 2)}</td>
                      <td className="p-4 text-white font-bold" dir="ltr">${fmt(item.currentValue, 2)}</td>
                      <td className="p-4" dir="ltr">
                        <div className={`flex items-center gap-1 font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isProfit ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          <span>{isProfit ? '+' : ''}${fmt(item.unrealizedPnlUsd, 2)} ({isProfit ? '+' : ''}{fmt(item.unrealizedPnlPct, 2)}%)</span>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-emerald-400" dir="ltr">+${fmt(item.realizedPnlUsd, 2)}</td>
                      <td className="p-4 text-purple-400 font-bold" dir="ltr">${fmt(item.totalFeesPaidUsd, 2)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historical Trades Log Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/10 space-y-3 p-6">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
          <History className="w-4 h-4 text-purple-400 shrink-0" />
          <span>{t('historicalTradesTitle')}</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-white/5 text-gray-400 font-semibold border-b border-white/10 uppercase tracking-wider">
              <tr>
                <th className="p-4">{t('symbol')}</th>
                <th className="p-4">{t('exchange')}</th>
                <th className="p-4">{t('strategy')}</th>
                <th className="p-4">{t('statusLabel')}</th>
                <th className="p-4">{t('entryPrice')}</th>
                <th className="p-4">{t('amountUsd')}</th>
                <th className="p-4">{t('calculatedQuantity')}</th>
                <th className="p-4">{t('appliedFee')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-200 font-mono">
              {historicalTrades.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-6 text-center text-gray-500 font-sans">
                    لا يوجد صفقات قديمة مسجلة.
                  </td>
                </tr>
              ) : (
                historicalTrades.map((tr, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold text-white font-sans">{tr.symbol}</td>
                    <td className="p-4 font-sans text-gray-300">{tr.exchange_name}</td>
                    <td className="p-4 font-sans text-cyan-300">{tr.strategy_name}</td>
                    <td className="p-4 font-sans">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        tr.status === 'OPEN'
                          ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                          : tr.status === 'PARTIALLY_CLOSED'
                          ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
                          : 'bg-gray-500/10 border border-gray-500/30 text-gray-400'
                      }`}>
                        {tr.status || 'OPEN'}
                      </span>
                    </td>
                    <td className="p-4 text-white font-bold" dir="ltr">${fmt(tr.entry_price, 2)}</td>
                    <td className="p-4 text-emerald-400 font-bold" dir="ltr">${fmt(tr.amount_usd, 2)}</td>
                    <td className="p-4 text-gray-200" dir="ltr">{fmt(tr.quantity, 4)}</td>
                    <td className="p-4 text-purple-400 font-bold" dir="ltr">${fmt(tr.calculated_fee, 2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
