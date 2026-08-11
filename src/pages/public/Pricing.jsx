import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { CheckCircle2, Sparkles, Shield, Zap, Coins, ArrowRight, HelpCircle, Copy, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Pricing() {
  const { lang, theme } = useApp();
  const isRtl = lang === 'ar';
  const isDark = theme === 'dark';

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Payment Modal State
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    api.getSubscriptionPlans()
      .then(data => {
        // Sort by price
        setPlans(data.sort((a, b) => a.price_usd - b.price_usd));
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(isRtl ? "تعذر تحميل خطط الاشتراك." : "Failed to load subscription plans.");
        setLoading(false);
      });
  }, [isRtl]);

  const handleSubscribe = async (plan) => {
    if (!token) {
      navigate('/login');
      return;
    }
    
    setIsProcessing(true);
    try {
      const data = await api.subscribeToPlan(plan.id);
      
      if (plan.price_usd === 0) {
        // Free plan activated instantly
        alert(isRtl ? "تم تفعيل الباقة المجانية بنجاح! مرحباً بك." : "Subscription Activated Successfully! Welcome aboard.");
        navigate('/dashboard');
      } else {
        // Show payment modal with crypto details
        setSelectedPlan(plan);
        setPaymentInfo(data.payment_details);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyAddress = (address) => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold font-sans text-slate-400">
          {isRtl ? 'جاري تحميل باقات الاشتراك...' : 'Loading subscription plans...'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-rose-400 space-y-4 px-4 text-center">
        <p className="text-lg font-bold">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-6 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold text-sm"
        >
          {isRtl ? 'إعادة المحاولة' : 'Try Again'}
        </button>
      </div>
    );
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="py-8 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto space-y-16 selection:bg-cyan-500/30 font-sans">
      
      {/* Header Banner */}
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs sm:text-sm font-bold backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>{isRtl ? 'خطط وباقات واضحة بدون رسوم خفية' : 'Transparent Pricing & No Hidden Fees'}</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
          {isRtl ? 'اختر الباقة المناسبة لحجم استثماراتك' : 'Choose Your Trading Plan'}
        </h1>

        <p className="text-slate-300 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed">
          {isRtl 
            ? 'احصل على الخصائص الكاملة لتتبع صفقاتك والذهب والعملات الرقمية مع دفع آمن وسريع عبر العملات المشفرة.' 
            : 'Unlock the full potential of your portfolio tracking. Pay securely with USDT. No hidden fees.'}
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const isFree = plan.price_usd === 0;
          const isPro = plan.plan_code === 'PRO_MONTHLY' || plan.plan_code === 'PRO_YEARLY';
          
          return (
            <div 
              key={plan.id} 
              className={`relative rounded-3xl p-8 flex flex-col backdrop-blur-xl border transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                isPro 
                  ? 'bg-gradient-to-b from-slate-900/90 via-indigo-950/60 to-slate-950 border-cyan-500/40 shadow-xl shadow-cyan-500/10' 
                  : 'bg-slate-900/60 border-white/10 hover:border-slate-400/40'
              }`}
            >
              {isPro && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white px-4 py-1 rounded-full text-xs font-black tracking-wider uppercase shadow-lg border border-white/20">
                  {isRtl ? 'الباقة الأكثر شعبية ⭐' : 'Most Popular ⭐'}
                </div>
              )}
              
              <div className="space-y-2 mb-6">
                <h3 className="text-2xl font-black text-white">{plan.name}</h3>
                <p className="text-slate-400 text-xs">
                  {isFree 
                    ? (isRtl ? 'لتجربة المنصة والاستكشاف المجاني' : 'Ideal for exploring platform features') 
                    : (isRtl ? 'للمتداولين والمستثمرين الجادين' : 'For serious traders and investors')}
                </p>
              </div>

              <div className="mb-8 flex items-baseline gap-1">
                <span className="text-5xl font-black font-mono text-white">${plan.price_usd}</span>
                <span className="text-slate-400 text-sm font-semibold">
                  / {plan.billing_cycle_days === 30 ? (isRtl ? 'شهر' : 'month') : plan.billing_cycle_days === 365 ? (isRtl ? 'سنة' : 'year') : (isRtl ? 'دورة' : 'cycle')}
                </span>
              </div>
              
              {/* Features List */}
              <ul className="mb-8 flex-1 space-y-3.5 text-sm">
                <li className="flex items-center text-slate-200 gap-3 font-semibold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>{isRtl ? 'تتبع صفقات العملات الرقمية' : 'Crypto Portfolio Tracking'}</span>
                </li>
                <li className="flex items-center text-slate-200 gap-3 font-semibold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>{isRtl ? 'مركز إدارة وتداول الذهب (العيارات والجرامات)' : 'Gold Hub (Karats & Grams)'}</span>
                </li>
                <li className="flex items-center text-slate-200 gap-3 font-semibold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>{isRtl ? 'تنبيهات العجز النقدي وإدارته' : 'Cash Deficit Alert Engine'}</span>
                </li>
                <li className="flex items-center text-slate-200 gap-3 font-semibold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>{isRtl ? 'مصنع الاستراتيجيات (قصيرة/طويلة المدى)' : 'Strategy Factory (ST & LT)'}</span>
                </li>
                {!isFree && (
                  <li className="flex items-center text-slate-200 gap-3 font-semibold">
                    <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                    <span>{isRtl ? 'دعم فني سريع ومتميز' : 'Priority Technical Support'}</span>
                  </li>
                )}
              </ul>
              
              <button 
                onClick={() => handleSubscribe(plan)}
                disabled={isProcessing}
                className={`w-full py-4 rounded-2xl font-black text-base transition-all duration-200 border shadow-lg active:scale-95 flex items-center justify-center gap-2 ${
                  isPro 
                    ? 'bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 text-white border-white/20 hover:opacity-95 shadow-cyan-500/20' 
                    : 'bg-slate-800 hover:bg-slate-700 text-white border-white/10'
                }`}
              >
                <span>
                  {isProcessing 
                    ? (isRtl ? 'جاري المعالجة...' : 'Processing...') 
                    : (isFree 
                      ? (isRtl ? 'ابدأ تجاربك المجانية' : 'Start Free Trial') 
                      : (isRtl ? 'اشترك الآن' : 'Subscribe Now'))}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Payment Modal */}
      {paymentInfo && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-6 text-right" dir="rtl">
            <button 
              onClick={() => setPaymentInfo(null)}
              className="absolute top-4 left-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              ✕
            </button>
            
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-white">في انتظار دفع الاشتراك</h2>
              <p className="text-xs text-slate-300">يرجى تحويل المبلغ المحدد أدناه عبر شبكة {paymentInfo.network} لتفعيل باقة {selectedPlan.name}.</p>
            </div>
            
            <div className="bg-slate-950 rounded-2xl p-6 text-center border border-slate-800 space-y-1">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">المبلغ المطلوب تحويله بالضبط</p>
              <div className="text-3xl font-black text-emerald-400 font-mono" dir="ltr">
                {paymentInfo.amount_crypto} <span className="text-lg">{paymentInfo.asset}</span>
              </div>
              <p className="text-xs text-cyan-400 font-mono">الشبكة: {paymentInfo.network}</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-xs text-slate-300 font-bold">عنوان المحفظة للاستلام:</p>
              <div className="bg-slate-950 p-3.5 rounded-xl flex items-center justify-between border border-slate-800 gap-2">
                <code className="text-cyan-400 text-xs break-all font-mono select-all" dir="ltr">
                  {paymentInfo.deposit_address}
                </code>
                <button 
                  onClick={() => handleCopyAddress(paymentInfo.deposit_address)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white transition-colors shrink-0 flex items-center gap-1 text-xs font-bold"
                  title="Copy Address"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-amber-400 bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/20 text-xs font-bold">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></div>
              <span>بانتظار تأكيد التحويل في البلوكشين...</span>
            </div>

            {/* Dev Only: Simulate Payment Button */}
            <button 
              onClick={async () => {
                try {
                  await api.mockPayInvoice(paymentInfo.invoice_id);
                  alert(isRtl ? "تم محاكاة الدفع بنجاح! تم تفعيل حسابك الآن." : "Payment simulated successfully! You now have full access.");
                  window.location.href = '/dashboard';
                } catch (e) {
                  alert("Failed to simulate payment: " + e.message);
                }
              }}
              className="w-full py-3 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 font-bold transition-all text-xs flex items-center justify-center gap-2"
            >
              <span>محاكاة الدفع (تجريبي Dev)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
