import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Coins, Filter, HelpCircle, History, TrendingUp, TrendingDown, Edit, CheckCircle2 } from 'lucide-react';
import { calculateTradePurchase, generateTradeTargets } from '../utils/mathEngine';

export default function CoinPortfolioPage() {
  const { coinPortfolios, trades, updateTrade, exchanges, strategies, t, isFetchingPrices } = useApp();

  const [selectedCoin, setSelectedCoin] = useState('ALL');
  const [selectedExchange, setSelectedExchange] = useState('ALL');
  const [selectedStrategy, setSelectedStrategy] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Trade Editing Modal State
  const [editingTrade, setEditingTrade] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Modal Form Inputs State
  const [editSymbol, setEditSymbol] = useState('');
  const [editStrategyId, setEditStrategyId] = useState(strategies[0]?.id || 1);
  const [editExchangeId, setEditExchangeId] = useState(exchanges[0]?.id || 1);
  const [editEntryPriceStr, setEditEntryPriceStr] = useState('100');
  const [editAmountUsdStr, setEditAmountUsdStr] = useState('1,000');
  const [editStatus, setEditStatus] = useState('OPEN');

  // Digit Normalizer & Thousand Separators Helpers
  const convertArabicToEnglishDigits = (str) => {
    if (str === undefined || str === null) return '';
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    
    let result = String(str);
    for (let i = 0; i < 10; i++) {
      result = result.replace(new RegExp(arabicDigits[i], 'g'), englishDigits[i]);
    }
    result = result.replace(/٫/g, '.');
    return result;
  };

  const formatInputWithCommas = (val) => {
    if (val === undefined || val === null || val === '') return '';
    const normalized = convertArabicToEnglishDigits(val);
    const clean = normalized.replace(/,/g, '');
    if (isNaN(clean) && clean !== '.') return normalized;
    
    const parts = clean.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  const parseCommasToNumber = (val) => {
    if (!val) return 0;
    const normalized = convertArabicToEnglishDigits(val);
    const clean = normalized.replace(/,/g, '');
    return parseFloat(clean) || 0;
  };

  // Format Display Helper
  const fmt = (num, decimals = 2) => {
    if (num === undefined || num === null || isNaN(num)) return '0.00';
    return Number(num).toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

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

  // Historical Trades List
  const filteredTrades = trades.filter((tr) => {
    const matchCoin = selectedCoin === 'ALL' || tr.symbol === selectedCoin;
    const matchEx = selectedExchange === 'ALL' || tr.exchange_name === selectedExchange;
    const matchStrat = selectedStrategy === 'ALL' || tr.strategy_name === selectedStrategy;
    const matchStatus = selectedStatus === 'ALL' || tr.status === selectedStatus;
    return matchCoin && matchEx && matchStrat && matchStatus;
  });

  // Open Edit Modal for a Trade
  const handleOpenEditModal = (trade) => {
    setEditingTrade(trade);
    setEditSymbol(trade.symbol);
    setEditStrategyId(trade.strategy_id);
    setEditExchangeId(trade.exchange_id);
    setEditEntryPriceStr(formatInputWithCommas(trade.entry_price));
    setEditAmountUsdStr(formatInputWithCommas(trade.amount_usd));
    setEditStatus(trade.status || 'OPEN');
    setShowEditModal(true);
  };

  const handleSaveEditedTrade = (e) => {
    e.preventDefault();
    if (!editingTrade || !editSymbol.trim()) return;

    const entryPrice = parseCommasToNumber(editEntryPriceStr);
    const amountUsd = parseCommasToNumber(editAmountUsdStr);

    const stratObj = strategies.find((s) => String(s.id) === String(editStrategyId)) || strategies[0];
    const exObj = exchanges.find((ex) => String(ex.id) === String(editExchangeId)) || exchanges[0];

    const purchaseInfo = calculateTradePurchase({
      amountUsd,
      entryPrice,
      feePct: exObj?.maker_fee_pct || 0.1
    });

    const { tpTargets, slTargets } = generateTradeTargets({
      entryPrice,
      amountUsd,
      tpRules: stratObj?.tp_rules || [],
      slRules: stratObj?.sl_rules || []
    });

    const updatedTrade = {
      ...editingTrade,
      symbol: editSymbol.toUpperCase(),
      strategy_id: stratObj.id,
      strategy_name: stratObj.name,
      category: stratObj.category,
      exchange_id: exObj.id,
      exchange_name: exObj.name,
      entry_price: entryPrice,
      amount_usd: amountUsd,
      quantity: purchaseInfo.quantity,
      calculated_fee: purchaseInfo.feeUsd,
      status: editStatus,
      targets: editingTrade.targets && editingTrade.targets.length > 0 ? editingTrade.targets : [...tpTargets, ...slTargets]
    };

    updateTrade(updatedTrade);
    setShowEditModal(false);
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

      {/* Active Positions Table */}
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
                      <td className="p-4 font-bold text-white" dir="ltr">{fmt(item.currentQuantity, 4)}</td>
                      <td className="p-4 text-cyan-300 font-bold" dir="ltr">${fmt(item.averageCost, 2)}</td>
                      <td className="p-4 text-gray-300" dir="ltr">${fmt(item.totalInvestedRemaining, 2)}</td>
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

      {/* Historical Trades Log Table with Edit Action Column */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/10 space-y-3 p-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-purple-400 shrink-0" />
            <span>{t('historicalTradesTitle')}</span>
          </h3>
          <span className="text-xs font-mono text-cyan-300">
            إجمالي الصفقات: {filteredTrades.length}
          </span>
        </div>

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
                <th className="p-4 text-right">إجراءات التعديل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-200 font-mono">
              {filteredTrades.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-6 text-center text-gray-500 font-sans">
                    لا يوجد صفقات قديمة مسجلة.
                  </td>
                </tr>
              ) : (
                filteredTrades.map((tr, idx) => (
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
                    <td className="p-4 text-right font-sans">
                      <button
                        onClick={() => handleOpenEditModal(tr)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:text-white text-xs font-bold transition-all ml-auto"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>تعديل الصفقة</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trade Edit Modal Dialog */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
          <div className="glass-panel w-full max-w-lg p-6 rounded-2xl border border-white/20 space-y-4 my-8">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <Edit className="w-5 h-5 text-cyan-400 shrink-0" />
              <span>تعديل بيانات الصفقة #{editingTrade?.id}</span>
            </h3>

            <form onSubmit={handleSaveEditedTrade} className="space-y-4 text-xs">
              {/* Symbol */}
              <div>
                <label className="block text-gray-300 mb-1 font-semibold">{t('symbol')}</label>
                <input
                  type="text"
                  dir="ltr"
                  value={editSymbol}
                  onChange={(e) => setEditSymbol(e.target.value.toUpperCase())}
                  required
                  className="w-full p-3 rounded-xl glass-input uppercase font-mono font-bold text-cyan-300 text-sm"
                />
              </div>

              {/* Strategy & Exchange Selectors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-1 font-semibold">{t('strategy')}</label>
                  <select
                    value={editStrategyId}
                    onChange={(e) => setEditStrategyId(e.target.value)}
                    className="w-full p-3 rounded-xl glass-input text-white font-bold"
                  >
                    {strategies.map((st) => (
                      <option key={st.id} value={st.id} className="bg-gray-900">
                        {st.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 mb-1 font-semibold">{t('exchange')}</label>
                  <select
                    value={editExchangeId}
                    onChange={(e) => setEditExchangeId(e.target.value)}
                    className="w-full p-3 rounded-xl glass-input text-white font-bold"
                  >
                    {exchanges.map((ex) => (
                      <option key={ex.id} value={ex.id} className="bg-gray-900">
                        {ex.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Entry Price & Amount USD with Arabic Digit & Thousand Separator Support */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-1 font-semibold">{t('entryPrice')}</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    dir="ltr"
                    value={editEntryPriceStr}
                    onChange={(e) => setEditEntryPriceStr(formatInputWithCommas(e.target.value))}
                    required
                    className="w-full p-3 rounded-xl glass-input font-mono font-bold text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1 font-semibold">{t('amountUsd')}</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    dir="ltr"
                    value={editAmountUsdStr}
                    onChange={(e) => setEditAmountUsdStr(formatInputWithCommas(e.target.value))}
                    required
                    className="w-full p-3 rounded-xl glass-input font-mono font-bold text-emerald-400 text-sm"
                  />
                </div>
              </div>

              {/* Trade Status Dropdown */}
              <div>
                <label className="block text-gray-300 mb-1 font-semibold">{t('statusLabel')}</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full p-3 rounded-xl glass-input text-white font-bold"
                >
                  <option value="OPEN" className="bg-gray-900">{t('statusOpen')}</option>
                  <option value="PARTIALLY_CLOSED" className="bg-gray-900">{t('statusPartiallyClosed')}</option>
                  <option value="CLOSED" className="bg-gray-900">{t('statusClosed')}</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 font-sans font-semibold"
                >
                  {t('actionCancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold font-sans flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{t('actionSave')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
