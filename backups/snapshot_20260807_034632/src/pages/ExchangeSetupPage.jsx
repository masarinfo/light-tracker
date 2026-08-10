import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { calculateEffectiveFeePct } from '../utils/mathEngine';
import { Building2, Plus, Edit, Percent, DollarSign, Tag, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ExchangeSetupPage() {
  const { exchanges, addExchange, updateExchange, t } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingExchangeId, setEditingExchangeId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    maker_fee_pct: 0.1,
    taker_fee_pct: 0.1,
    use_discount_token: false,
    discount_token_symbol: '',
    discount_pct: 0.0,
    initial_cash_balance: 10000.0
  });

  const handleOpenAddModal = () => {
    setEditingExchangeId(null);
    setFormData({
      name: '',
      maker_fee_pct: 0.1,
      taker_fee_pct: 0.1,
      use_discount_token: false,
      discount_token_symbol: '',
      discount_pct: 0.0,
      initial_cash_balance: 10000.0
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (ex) => {
    setEditingExchangeId(ex.id);
    setFormData({
      name: ex.name,
      maker_fee_pct: ex.maker_fee_pct,
      taker_fee_pct: ex.taker_fee_pct !== undefined ? ex.taker_fee_pct : 0.1,
      use_discount_token: ex.use_discount_token,
      discount_token_symbol: ex.discount_token_symbol || '',
      discount_pct: ex.discount_pct || 0.0,
      initial_cash_balance: ex.initial_cash_balance
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingExchangeId) {
      updateExchange({
        ...formData,
        id: editingExchangeId
      });
    } else {
      addExchange(formData);
    }

    setShowModal(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-white/10">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-cyan-400 shrink-0" />
            <span>{t('exchangeSetupTitle')}</span>
          </h2>
          <p className="text-sm text-gray-400 mt-1">{t('exchangeSetupDesc')}</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-extrabold shadow-lg shadow-cyan-500/20 transition-all duration-200 shrink-0 font-sans"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>{t('addExchangeModalTitle')}</span>
        </button>
      </div>

      {/* Strict Mathematical Formula Verification Card */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 bg-cyan-950/10 space-y-3">
        <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2 border-b border-cyan-500/20 pb-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{t('formulaDemoTitle')}</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-gray-400 block text-[10px] font-sans">{t('formulaScenario')}</span>
            <span className="text-white font-bold">{t('formulaScenarioVal')}</span>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-gray-400 block text-[10px] font-sans">{t('formulaBaseFee')}</span>
            <span className="text-cyan-300 font-bold">{t('formulaBaseFeeVal')}</span>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-gray-400 block text-[10px] font-sans">{t('formulaNetFee')}</span>
            <span className="text-emerald-400 font-bold">{t('formulaNetFeeVal')}</span>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-gray-400 block text-[10px] font-sans">{t('formulaCashDeduction')}</span>
            <span className="text-amber-300 font-bold">{t('formulaCashDeductionVal')}</span>
          </div>
        </div>
      </div>

      {/* Existing Exchanges Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {exchanges.map((ex) => {
          const effectiveMakerFee = calculateEffectiveFeePct(
            ex.maker_fee_pct,
            ex.use_discount_token,
            ex.discount_pct
          );

          const effectiveTakerFee = calculateEffectiveFeePct(
            ex.taker_fee_pct || ex.maker_fee_pct,
            ex.use_discount_token,
            ex.discount_pct
          );

          return (
            <div key={ex.id} className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4 hover:border-cyan-500/40 transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-bold text-cyan-400 text-sm">
                      {ex.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{ex.name}</h3>
                      <span className="text-xs font-mono text-gray-400 block">ID: #{ex.id}</span>
                    </div>
                  </div>
                  
                  {/* Edit Exchange Button */}
                  <button
                    onClick={() => handleOpenEditModal(ex)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-300 hover:text-white text-xs font-bold transition-all"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>{t('actionEdit')}</span>
                  </button>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  {/* Maker & Taker Fee Display */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-lg bg-white/5">
                      <span className="text-gray-400 block text-[10px] font-sans">{t('makerFee')}:</span>
                      <span className="text-white font-bold">{ex.maker_fee_pct}%</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white/5">
                      <span className="text-gray-400 block text-[10px] font-sans">{t('takerFee')}:</span>
                      <span className="text-white font-bold">{ex.taker_fee_pct || 0.1}%</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                    <span className="text-gray-400 font-sans">{t('discountToken')}:</span>
                    {ex.use_discount_token ? (
                      <span className="text-emerald-400 font-bold">
                        {ex.discount_token_symbol} (-{ex.discount_pct}%)
                      </span>
                    ) : (
                      <span className="text-gray-500">غير مفصلة</span>
                    )}
                  </div>

                  {/* Effective Fees Preview */}
                  <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between">
                    <span className="text-cyan-300 font-sans font-bold">{t('effectiveFeePreview')}:</span>
                    <span className="text-cyan-300 font-bold text-xs" dir="ltr">
                      Maker: {effectiveMakerFee.toFixed(3)}% | Taker: {effectiveTakerFee.toFixed(3)}%
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                    <span className="text-gray-400 font-sans">{t('initialCash')}:</span>
                    <span className="text-emerald-400 font-bold text-sm" dir="ltr">
                      ${ex.initial_cash_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Exchange Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
          <div className="glass-panel w-full max-w-lg p-6 rounded-2xl border border-white/20 space-y-4 my-8">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <Building2 className="w-5 h-5 text-cyan-400 shrink-0" />
              <span>{editingExchangeId ? 'تعديل بيانات المنصة' : t('addExchangeModalTitle')}</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 mb-1 font-semibold">{t('exchangeName')}</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Binance, Bybit, KuCoin"
                  required
                  className="w-full p-3 rounded-xl glass-input"
                />
              </div>

              {/* Maker Fee & Taker Fee Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-1 font-semibold">{t('makerFee')}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.maker_fee_pct}
                    onChange={(e) => setFormData({ ...formData, maker_fee_pct: parseFloat(e.target.value) || 0 })}
                    className="w-full p-3 rounded-xl glass-input font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1 font-semibold">{t('takerFee')}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.taker_fee_pct}
                    onChange={(e) => setFormData({ ...formData, taker_fee_pct: parseFloat(e.target.value) || 0 })}
                    className="w-full p-3 rounded-xl glass-input font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-1 font-semibold">{t('initialCash')}</label>
                <input
                  type="number"
                  step="100"
                  value={formData.initial_cash_balance}
                  onChange={(e) => setFormData({ ...formData, initial_cash_balance: parseFloat(e.target.value) || 0 })}
                  className="w-full p-3 rounded-xl glass-input font-mono"
                  required
                />
              </div>

              {/* Discount Token Checkbox */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <label className="flex items-center gap-2 text-white font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.use_discount_token}
                    onChange={(e) => setFormData({ ...formData, use_discount_token: e.target.checked })}
                    className="w-4 h-4 accent-cyan-500 rounded"
                  />
                  <span>{t('discountToken')}</span>
                </label>

                {formData.use_discount_token && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-gray-400 mb-1">{t('discountTokenSymbol')}</label>
                      <input
                        type="text"
                        value={formData.discount_token_symbol}
                        onChange={(e) => setFormData({ ...formData, discount_token_symbol: e.target.value.toUpperCase() })}
                        placeholder="e.g. BNB"
                        className="w-full p-2.5 rounded-lg glass-input uppercase font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-1">{t('discountPct')}</label>
                      <input
                        type="number"
                        step="1"
                        value={formData.discount_pct}
                        onChange={(e) => setFormData({ ...formData, discount_pct: parseFloat(e.target.value) || 0 })}
                        className="w-full p-2.5 rounded-lg glass-input font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 font-sans font-semibold"
                >
                  {t('actionCancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold font-sans"
                >
                  {t('actionSave')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
