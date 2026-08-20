import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Calculator, X, History, Trash2, Coins } from 'lucide-react';

export default function GoldCalculatorModal() {
  const { activeWorkspace, livePrices, lang } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  
  const [metal, setMetal] = useState('XAU');
  const [karat, setKarat] = useState('24');
  const [weight, setWeight] = useState('');
  
  const [history, setHistory] = useState([]);

  const isRtl = lang === 'ar';


  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('gold_calc_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  // Save history on change
  useEffect(() => {
    localStorage.setItem('gold_calc_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (metal === 'XAU') setKarat('24');
    else setKarat('999');
  }, [metal]);

  const TROY_OUNCE_TO_GRAM = 31.1034768;
  const liveOzPrice = metal === 'XAU' ? (livePrices['GC=F'] || 2500) : (livePrices['SI=F'] || 28);
  const livePureGramPrice = liveOzPrice / TROY_OUNCE_TO_GRAM;
  
  const getKaratMultiplier = (k) => {
    if (metal === 'XAU') return parseInt(k) / 24;
    return parseInt(k) / 999;
  };
  
  const liveKaratGramPrice = livePureGramPrice * getKaratMultiplier(karat);
  const totalValue = (parseFloat(weight) || 0) * liveKaratGramPrice;

  const handleSave = () => {
    if (!weight || parseFloat(weight) <= 0) return;
    
    const entry = {
      id: Date.now(),
      metal,
      karat,
      weight: parseFloat(weight),
      pricePerGram: liveKaratGramPrice,
      totalValue,
      date: new Date().toISOString()
    };
    
    setHistory(prev => [entry, ...prev].slice(0, 20)); // Keep last 20
    setWeight(''); // reset after save
  };

  const clearHistory = () => {
    if (window.confirm(isRtl ? 'هل أنت متأكد من مسح السجل؟' : 'Are you sure you want to clear history?')) {
      setHistory([]);
    }
  };

  // Only render if in metals hub
  if (activeWorkspace !== 'metals') return null;

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/30 flex items-center justify-center hover:scale-110 transition-transform z-40 group"
      >
        <Calculator className="w-6 h-6" />
        {/* Tooltip */}
        <span className="absolute -top-10 right-0 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10">
          {isRtl ? 'حاسبة سريعة' : 'Quick Calculator'}
        </span>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-amber-500/30 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="bg-amber-500/10 border-b border-amber-500/20 p-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                {isRtl ? 'الحاسبة السريعة' : 'Quick Calculator'}
              </h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content (Scrollable) */}
            <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-5">
              
              {/* Metal Toggle */}
              <div className="flex bg-black/20 p-1 rounded-xl border border-white/5">
                <button
                  onClick={() => setMetal('XAU')}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                    metal === 'XAU' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {isRtl ? 'ذهب' : 'Gold'}
                </button>
                <button
                  onClick={() => setMetal('XAG')}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                    metal === 'XAG' ? 'bg-gray-300 text-black shadow-lg shadow-gray-500/20' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {isRtl ? 'فضة' : 'Silver'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">{isRtl ? 'العيار' : 'Karat'}</label>
                  <select
                    value={karat}
                    onChange={(e) => setKarat(e.target.value)}
                    className="input-field w-full text-center font-bold"
                  >
                    {metal === 'XAU' 
                      ? ['24', '22', '21', '18'].map(k => <option key={k} value={k}>{k}</option>)
                      : ['999', '925', '800'].map(k => <option key={k} value={k}>{k}</option>)
                    }
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">{isRtl ? 'الوزن (جرام)' : 'Weight (g)'}</label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="0.00"
                    className="input-field w-full text-center font-mono font-bold"
                  />
                </div>
              </div>

              <div className="bg-black/30 p-4 rounded-xl border border-white/5 text-center">
                <div className="text-xs text-gray-400 mb-1">{isRtl ? 'القيمة التقديرية (حسب السعر العالمي)' : 'Estimated Value (Spot)'}</div>
                <div className={`text-3xl font-mono font-black ${totalValue > 0 ? 'text-emerald-400' : 'text-gray-500'}`}>
                  ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                {totalValue > 0 && (
                  <button
                    onClick={handleSave}
                    className="mt-3 px-4 py-1.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold hover:bg-emerald-500 hover:text-black transition-colors"
                  >
                    {isRtl ? 'حفظ في السجل +' : 'Save to History +'}
                  </button>
                )}
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
                    <History className="w-4 h-4" />
                    {isRtl ? 'سجل الحسابات' : 'History'}
                  </h3>
                  {history.length > 0 && (
                    <button onClick={clearHistory} className="text-xs text-rose-400 hover:text-rose-300">
                      {isRtl ? 'مسح' : 'Clear'}
                    </button>
                  )}
                </div>

                {history.length === 0 ? (
                  <div className="text-center text-xs text-gray-500 italic py-4">
                    {isRtl ? 'لا توجد حسابات محفوظة' : 'No saved calculations'}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {history.map(item => (
                      <div key={item.id} className="bg-white/5 p-3 rounded-lg border border-white/5 text-sm flex justify-between items-center group">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={item.metal === 'XAU' ? 'text-amber-400' : 'text-gray-300'}>
                              {item.metal === 'XAU' ? '🥇' : '🥈'} {item.karat}K
                            </span>
                            <span className="text-gray-400">· {item.weight}g</span>
                          </div>
                          <div className="text-[10px] text-gray-500 mt-1">
                            {new Date(item.date).toLocaleDateString(isRtl ? 'ar-SA' : 'en-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <div className="font-mono font-bold text-white">
                          ${item.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
