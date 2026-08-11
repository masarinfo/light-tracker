import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, TrendingUp, Sparkles, ShieldCheck, Coins } from 'lucide-react';
import MarketPricesPage from '../MarketPricesPage';
import { useApp } from '../../context/AppContext';

export default function PublicMarketPage() {
  const { lang } = useApp();
  const isRtl = lang === 'ar';

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="space-y-8 pb-16 selection:bg-cyan-500/30">
      
      {/* Public Header Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-white/10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>متابعة حية ومباشرة 24/7</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              أسعار العملات الرقمية والذهب المباشرة
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-sans">
              راقب حركة الأسواق العالمية ومعدلات التغير والتداولات اليومية لحظة بلحظة مع تحديث تلقائي وسريع.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/register"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-sm hover:opacity-90 shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
            >
              سجل حسابك لتتبع صفقاتك
            </Link>
          </div>
        </div>
      </section>

      {/* Main Market Component Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-900/60 rounded-3xl border border-white/10 overflow-hidden shadow-2xl backdrop-blur-md">
          <MarketPricesPage />
        </div>
      </main>

    </div>
  );
}

