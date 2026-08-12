import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCryptoPrice } from '../utils/mathEngine';
import CloseTradeModal from '../components/trades/CloseTradeModal';
import { History, TrendingUp, TrendingDown, Clock, Search, ArrowRight, ArrowLeft } from 'lucide-react';

export default function MetalsTradesPage() {
  const { trades, lang, livePrices, updateTrade } = useApp();
  const isRtl = lang === 'ar';
  
  const [filterType, setFilterType] = useState('ALL'); // ALL, XAU, XAG
  const [tab, setTab] = useState('OPEN'); // OPEN, CLOSED
  const [search, setSearch] = useState('');
  
  const [tradeToClose, setTradeToClose] = useState(null);

  const handleSaveCloseModal = async (finalTrade) => {
    try {
      await updateTrade(finalTrade);
      setTradeToClose(null);
    } catch (error) {
      console.error("Failed to update trade", error);
      alert(isRtl ? 'فشل حفظ التعديلات' : 'Failed to save changes');
    }
  };

  const metalsTrades = trades.filter(t => t.market_type === 'metals');
  
  const filteredTrades = metalsTrades.filter(t => {
    if (tab === 'OPEN' && t.status === 'CLOSED') return false;
    if (tab === 'CLOSED' && t.status !== 'CLOSED') return false;
    if (filterType !== 'ALL' && t.symbol !== filterType) return false;
    
    if (search) {
      const q = search.toLowerCase();
      return (
        t.symbol.toLowerCase().includes(q) ||
        (t.strategy?.name || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getLivePrice = (symbol) => {
    if (symbol === 'XAU') return livePrices['GC=F'] ? livePrices['GC=F'] / 31.1034768 : 0;
    if (symbol === 'XAG') return livePrices['SI=F'] ? livePrices['SI=F'] / 31.1034768 : 0;
    return 0;
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-amber-400 tracking-tight flex items-center gap-3">
            <History className="w-8 h-8" />
            {isRtl ? 'الصفقات المفتوحة والسجل' : 'Trades & History'}
          </h1>
          <p className="text-sm text-gray-400 mt-1 font-medium">
            {isRtl ? 'إدارة صفقات الذهب والفضة' : 'Manage your gold and silver trades'}
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex bg-black/20 p-1 rounded-xl border border-white/5 w-full md:w-auto">
          <button
            onClick={() => setTab('OPEN')}
            className={`flex-1 md:flex-none px-6 py-2 text-sm font-bold rounded-lg transition-all ${
              tab === 'OPEN' ? 'bg-amber-500 text-black shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            {isRtl ? 'مفتوحة' : 'Open'}
          </button>
          <button
            onClick={() => setTab('CLOSED')}
            className={`flex-1 md:flex-none px-6 py-2 text-sm font-bold rounded-lg transition-all ${
              tab === 'CLOSED' ? 'bg-amber-500 text-black shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            {isRtl ? 'مغلقة' : 'Closed'}
          </button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input-field max-w-[120px]"
          >
            <option value="ALL">{isRtl ? 'الكل' : 'All'}</option>
            <option value="XAU">{isRtl ? 'الذهب' : 'Gold'}</option>
            <option value="XAG">{isRtl ? 'الفضة' : 'Silver'}</option>
          </select>
          <div className="relative flex-1 md:w-64">
            <Search className={`w-4 h-4 text-gray-400 absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              placeholder={isRtl ? 'بحث...' : 'Search...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`input-field w-full ${isRtl ? 'pr-9' : 'pl-9'}`}
            />
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className={`p-4 text-xs font-bold text-gray-400 uppercase tracking-wider ${isRtl ? 'text-right' : ''}`}>
                  {isRtl ? 'المعدن' : 'Metal'}
                </th>
                <th className={`p-4 text-xs font-bold text-gray-400 uppercase tracking-wider ${isRtl ? 'text-right' : ''}`}>
                  {isRtl ? 'الوزن (جرام)' : 'Weight (g)'}
                </th>
                <th className={`p-4 text-xs font-bold text-gray-400 uppercase tracking-wider ${isRtl ? 'text-right' : ''}`}>
                  {isRtl ? 'العيار' : 'Karat'}
                </th>
                <th className={`p-4 text-xs font-bold text-gray-400 uppercase tracking-wider ${isRtl ? 'text-right' : ''}`}>
                  {isRtl ? 'سعر الشراء' : 'Entry Price'}
                </th>
                <th className={`p-4 text-xs font-bold text-gray-400 uppercase tracking-wider ${isRtl ? 'text-right' : ''}`}>
                  {tab === 'OPEN' ? (isRtl ? 'الحالي / الربح' : 'Current / PnL') : (isRtl ? 'سعر البيع' : 'Exit Price')}
                </th>
                <th className={`p-4 text-xs font-bold text-gray-400 uppercase tracking-wider ${isRtl ? 'text-right' : ''}`}>
                  {isRtl ? 'التاريخ' : 'Date'}
                </th>
                {tab === 'OPEN' && (
                  <th className={`p-4 text-xs font-bold text-gray-400 uppercase tracking-wider ${isRtl ? 'text-left' : 'text-right'}`}>
                    {isRtl ? 'إجراء' : 'Action'}
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTrades.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    {isRtl ? 'لا توجد صفقات.' : 'No trades found.'}
                  </td>
                </tr>
              ) : (
                filteredTrades.map((trade) => {
                  const livePrice = getLivePrice(trade.symbol);
                  const entryPrice = trade.entry_price;
                  const qty = trade.quantity;
                  const isGold = trade.symbol === 'XAU';
                  
                  // For open trades
                  const currentValue = qty * livePrice;
                  const invested = trade.amount_usd + trade.calculated_fee;
                  const pnl = currentValue - invested;
                  const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;
                  const isPositive = pnl >= 0;

                  return (
                    <tr key={trade.id} className="hover:bg-white/5 transition-colors group">
                      <td className={`p-4 ${isRtl ? 'text-right' : ''}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isGold ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-gray-400/20 text-gray-300 border border-gray-400/30'}`}>
                            {isGold ? '🥇' : '🥈'}
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm">{isGold ? (isRtl ? 'ذهب' : 'Gold') : (isRtl ? 'فضة' : 'Silver')}</div>
                            <div className="text-[10px] text-gray-500 font-mono">{trade.strategy?.name || 'Manual'}</div>
                          </div>
                        </div>
                      </td>
                      <td className={`p-4 font-mono text-gray-300 ${isRtl ? 'text-right' : ''}`}>
                        {formatCryptoPrice(qty)} g
                      </td>
                      <td className={`p-4 text-sm font-bold text-gray-300 ${isRtl ? 'text-right' : ''}`}>
                        {trade.metal_karat || (isGold ? '24' : '999')}
                      </td>
                      <td className={`p-4 ${isRtl ? 'text-right' : ''}`}>
                        <div className="font-mono text-gray-300">${formatCryptoPrice(entryPrice)}</div>
                        <div className="text-[10px] text-gray-500">Total: ${formatCryptoPrice(trade.amount_usd)}</div>
                      </td>
                      <td className={`p-4 ${isRtl ? 'text-right' : ''}`}>
                        {tab === 'OPEN' ? (
                          <>
                            <div className="font-mono text-white">${formatCryptoPrice(livePrice)}</div>
                            <div className={`text-xs font-mono font-bold flex items-center gap-1 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              {isPositive ? '+' : ''}{pnl.toFixed(2)} ({pnlPct.toFixed(2)}%)
                            </div>
                          </>
                        ) : (
                          <div className="text-gray-500 text-xs italic">{isRtl ? 'مغلقة' : 'Closed'}</div>
                        )}
                      </td>
                      <td className={`p-4 ${isRtl ? 'text-right' : ''}`}>
                        <div className="flex items-center gap-1 text-gray-400 text-xs">
                          <Clock className="w-3 h-3" />
                          {new Date(trade.created_at).toLocaleDateString(isRtl ? 'ar-SA' : 'en-US')}
                        </div>
                        <div className="text-[10px] text-gray-600 mt-0.5">
                          {new Date(trade.created_at).toLocaleTimeString(isRtl ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      {tab === 'OPEN' && (
                        <td className={`p-4 ${isRtl ? 'text-left' : 'text-right'}`}>
                          <button
                            onClick={() => setTradeToClose(trade)}
                            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                          >
                            {isRtl ? 'إغلاق' : 'Close'}
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {tradeToClose && (
        <CloseTradeModal
          trade={tradeToClose}
          onClose={() => setTradeToClose(null)}
          onSave={handleSaveCloseModal}
          livePrice={getLivePrice(tradeToClose.symbol)}
        />
      )}
    </div>
  );
}
