import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Coins, Bitcoin, CheckCircle2, Sparkles } from 'lucide-react';

export default function WelcomeOnboarding({ onComplete }) {
  const { lang, setPlatformMode, setActiveWorkspace } = useApp();
  const isRtl = lang === 'ar';
  
  const [selectedMode, setSelectedMode] = useState(null);

  const handleComplete = () => {
    if (!selectedMode) return;
    
    setPlatformMode(selectedMode);
    localStorage.setItem('platform_mode', selectedMode);
    
    if (selectedMode === 'metals_only') {
      setActiveWorkspace('metals');
    } else {
      setActiveWorkspace('crypto');
    }
    
    localStorage.setItem('onboarding_complete', 'true');
    if (onComplete) onComplete();
  };

  const options = [
    {
      id: 'crypto_only',
      title: isRtl ? 'العملات الرقمية (Crypto)' : 'Crypto Only',
      desc: isRtl ? 'تركيز كامل على تداول العملات الرقمية والأسواق المشفرة' : 'Focus entirely on crypto trading and markets',
      icon: <Bitcoin className="w-8 h-8" />,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30'
    },
    {
      id: 'metals_only',
      title: isRtl ? 'المعادن الثمينة (الذهب والفضة)' : 'Precious Metals',
      desc: isRtl ? 'إدارة سبائك الذهب والفضة وتتبع أسعار الأونصة عالمياً' : 'Manage gold and silver bars, tracking global ounce prices',
      icon: <Coins className="w-8 h-8" />,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30'
    },
    {
      id: 'both',
      title: isRtl ? 'كلاهما (العملات والمعادن)' : 'Both (Crypto & Metals)',
      desc: isRtl ? 'محفظة شاملة تجمع بين الكريبتو والملاذ الآمن (الذهب)' : 'A comprehensive portfolio combining crypto and safe havens',
      icon: <Sparkles className="w-8 h-8" />,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30'
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#0f1014] border border-white/10 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 text-center mb-8">
          <h2 className="text-3xl font-black text-white mb-3">
            {isRtl ? 'أهلاً بك في منصتك الاستثمارية 👋' : 'Welcome to Your Investment Platform 👋'}
          </h2>
          <p className="text-gray-400 text-sm md:text-base">
            {isRtl 
              ? 'لتخصيص واجهة التطبيق بما يتناسب مع أهدافك، ما هو اهتمامك الرئيسي في التداول؟' 
              : 'To customize the application interface to suit your goals, what is your main trading interest?'}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedMode(opt.id)}
              className={`relative flex flex-col items-center text-center p-6 rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                selectedMode === opt.id 
                ? `${opt.border} ${opt.bg} scale-105 shadow-xl` 
                : 'border-white/5 bg-white/5 hover:bg-white/10 opacity-70 hover:opacity-100'
              }`}
            >
              {selectedMode === opt.id && (
                <div className="absolute top-3 right-3 text-white">
                  <CheckCircle2 className="w-5 h-5 fill-emerald-500 text-black" />
                </div>
              )}
              <div className={`mb-4 p-3 rounded-full bg-black/40 shadow-inner ${opt.color}`}>
                {opt.icon}
              </div>
              <h3 className="text-white font-bold mb-2">{opt.title}</h3>
              <p className="text-[10px] text-gray-400 leading-relaxed">
                {opt.desc}
              </p>
            </button>
          ))}
        </div>
        <div className="flex justify-center">
          <button
            onClick={handleComplete}
            disabled={!selectedMode}
            className={`px-12 py-4 rounded-xl text-black font-black text-lg transition-all flex items-center justify-center gap-2 shadow-lg ${
              selectedMode 
              ? 'bg-cyan-500 hover:bg-cyan-400 shadow-cyan-500/20 hover:-translate-y-1' 
              : 'bg-gray-500 opacity-50 cursor-not-allowed'
            }`}
          >
            {isRtl ? 'ابدأ الآن' : 'Start Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
