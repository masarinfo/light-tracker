import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { CheckCircle2, Sparkles, Copy, Check, ArrowRight, XCircle, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';

// --- FAQ Component ---
function FAQItem({ question, answer, isRtl, isDark }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border-b ${isDark ? 'border-white/10' : 'border-slate-200'} py-4`}>
      <button 
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left focus:outline-none"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{question}</span>
        {open ? <ChevronUp className="w-5 h-5 text-cyan-500" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
      </button>
      {open && (
        <div className={`mt-3 text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`} dir={isRtl ? 'rtl' : 'ltr'}>
          {answer}
        </div>
      )}
    </div>
  );
}

export default function Pricing() {
  const { lang, theme } = useApp();
  const isRtl = lang === 'ar';
  const isDark = theme === 'dark';

  const [allPlans, setAllPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'
  
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
        setAllPlans(data);
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
        alert(isRtl ? "تم تفعيل الباقة المجانية بنجاح! مرحباً بك." : "Subscription Activated Successfully! Welcome aboard.");
        navigate('/dashboard');
      } else {
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

  // Features mapping
  const featuresList = [
    { id: 'crypto', labelAr: 'تتبع وإدخال الصفقات', labelEn: 'Trade Entry & Tracking', free: 'حد أقصى 10 صفقات', pro: 'غير محدود' },
    { id: 'dashboard', labelAr: 'الداشبورد العام والتحليلات', labelEn: 'Overview Dashboard & Analytics', free: true, pro: true },
    { id: 'strategies', labelAr: 'بناء الاستراتيجيات المخصصة', labelEn: 'Custom Strategy Builder', free: 'حد أقصى 2 استراتيجية', pro: 'غير محدود' },
    { id: 'gold', labelAr: 'مركز إدارة وتداول الذهب', labelEn: 'Gold Hub (Karats & Grams)', free: false, pro: true },
    { id: 'alerts', labelAr: 'تنبيهات العجز النقدي المتقدمة', labelEn: 'Advanced Cash Deficit Alerts', free: false, pro: true },
    { id: 'support', labelAr: 'أولوية الدعم الفني الفوري (VIP)', labelEn: 'Priority VIP Support', free: false, pro: true },
  ];

  // Filter plans based on billing cycle toggle
  // We assume FREE plan has price 0, and PRO has monthly (<=30) and yearly (>30)
  const displayedPlans = allPlans.filter(p => {
    if (p.price_usd === 0) return true; 
    if (billingCycle === 'monthly' && p.billing_cycle_days <= 30) return true;
    if (billingCycle === 'yearly' && p.billing_cycle_days > 30) return true;
    return false;
  }).sort((a, b) => a.price_usd - b.price_usd);

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
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs sm:text-sm font-bold backdrop-blur-md ${
          isDark ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' : 'bg-cyan-50 text-cyan-700 border-cyan-200'
        }`}>
          <Sparkles className="w-4 h-4 text-cyan-500 animate-pulse" />
          <span>{isRtl ? 'خطط وباقات واضحة بدون رسوم خفية' : 'Transparent Pricing & No Hidden Fees'}</span>
        </div>

        <h1 className={`text-4xl sm:text-6xl font-black tracking-tight leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {isRtl ? 'استثمر بذكاء، اختر الباقة المناسبة' : 'Choose Your Trading Plan'}
        </h1>

        <p className={`text-base sm:text-xl max-w-2xl mx-auto leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          {isRtl 
            ? 'احصل على الخصائص الكاملة لتتبع صفقاتك والذهب والعملات الرقمية مع دفع آمن وسريع عبر العملات المشفرة (USDT).' 
            : 'Unlock the full potential of your portfolio tracking. Pay securely with USDT. No hidden fees.'}
        </p>

        {/* Billing Toggle */}
        <div className="flex justify-center items-center mt-8">
          <div className={`relative flex items-center p-1.5 rounded-full border ${isDark ? 'bg-slate-900 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`relative z-10 px-6 py-2.5 text-sm font-bold rounded-full transition-all duration-300 ${
                billingCycle === 'monthly' 
                  ? (isDark ? 'text-white bg-slate-700 shadow-md' : 'text-slate-900 bg-white shadow-md')
                  : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900')
              }`}
            >
              {isRtl ? 'دفع شهري' : 'Monthly'}
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`relative z-10 px-6 py-2.5 text-sm font-bold rounded-full transition-all duration-300 flex items-center gap-2 ${
                billingCycle === 'yearly' 
                  ? (isDark ? 'text-white bg-slate-700 shadow-md' : 'text-slate-900 bg-white shadow-md')
                  : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900')
              }`}
            >
              <span>{isRtl ? 'دفع سنوي' : 'Yearly'}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 text-[10px] uppercase border border-emerald-500/30">
                {isRtl ? 'وفر 20%' : 'Save 20%'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className={`grid grid-cols-1 ${displayedPlans.length === 2 ? 'md:grid-cols-2 max-w-4xl' : 'md:grid-cols-3 max-w-6xl'} gap-8 mx-auto items-center`}>
        {displayedPlans.map((plan) => {
          const isFree = plan.price_usd === 0;
          const isPro = plan.plan_code.includes('PRO');
          
          return (
            <div 
              key={plan.id} 
              className={`relative rounded-3xl p-8 flex flex-col backdrop-blur-xl border transition-all duration-300 hover:shadow-2xl ${
                isPro 
                  ? `transform md:scale-105 z-10 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 border-cyan-500/50 shadow-2xl shadow-cyan-500/20 text-white ${isDark ? '' : 'md:scale-105'}` 
                  : isDark 
                  ? 'bg-slate-900/60 border-white/10 hover:border-slate-400/40 text-white' 
                  : 'bg-white border-slate-200 shadow-md hover:border-cyan-300 text-slate-900'
              }`}
            >
              {isPro && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white px-5 py-1.5 rounded-full text-xs font-black tracking-wider uppercase shadow-lg border border-white/20 whitespace-nowrap">
                  {isRtl ? 'الأكثر طلباً 🌟' : 'Most Popular 🌟'}
                </div>
              )}
              
              <div className="space-y-2 mb-6 text-center">
                <h3 className={`text-2xl font-black ${isPro ? 'text-white' : isDark ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                <p className={`text-sm ${isPro ? 'text-slate-300' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {isFree 
                    ? (isRtl ? 'الخطوة الأولى لاكتشاف المنصة' : 'First step to explore platform') 
                    : (isRtl ? 'الأدوات الكاملة للمتداول الجاد' : 'Full toolkit for serious traders')}
                </p>
              </div>

              <div className="mb-8 flex items-baseline justify-center gap-1">
                <span className={`text-5xl font-black font-mono ${isPro ? 'text-white' : isDark ? 'text-white' : 'text-slate-900'}`}>${plan.price_usd}</span>
                <span className={`text-sm font-semibold ${isPro ? 'text-slate-300' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  / {plan.billing_cycle_days === 30 ? (isRtl ? 'شهر' : 'month') : plan.billing_cycle_days >= 360 ? (isRtl ? 'سنة' : 'year') : (isRtl ? 'دورة' : 'cycle')}
                </span>
              </div>
              
              {/* Dynamic Features List */}
              <ul className="mb-8 flex-1 space-y-4 text-sm">
                {featuresList.map((feat) => {
                  const hasFeature = isFree ? feat.free : feat.pro;
                  const label = isRtl ? feat.labelAr : feat.labelEn;
                  
                  if (hasFeature === false) {
                    // Feature Locked
                    return (
                      <li key={feat.id} className={`flex items-center gap-3 font-semibold ${isPro ? 'text-white/40' : isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                        <Lock className="w-5 h-5 shrink-0 opacity-50" />
                        <span className="line-through decoration-slate-500/50">{label}</span>
                      </li>
                    );
                  }

                  if (typeof hasFeature === 'string') {
                    // Feature with specific text (e.g., limit)
                    return (
                      <li key={feat.id} className={`flex items-center gap-3 font-semibold ${isPro ? 'text-slate-200' : isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                        <CheckCircle2 className={`w-5 h-5 shrink-0 ${isPro ? 'text-cyan-400' : 'text-emerald-500'}`} />
                        <span>{label} <span className="text-xs px-2 py-0.5 rounded bg-white/10 font-bold ml-1">{hasFeature}</span></span>
                      </li>
                    );
                  }

                  // Standard Feature included
                  return (
                    <li key={feat.id} className={`flex items-center gap-3 font-semibold ${isPro ? 'text-slate-200' : isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      <CheckCircle2 className={`w-5 h-5 shrink-0 ${isPro ? 'text-cyan-400' : 'text-emerald-500'}`} />
                      <span>{label}</span>
                    </li>
                  );
                })}
              </ul>
              
              <button 
                onClick={() => handleSubscribe(plan)}
                disabled={isProcessing}
                className={`w-full py-4 rounded-2xl font-black text-base transition-all duration-200 border shadow-lg active:scale-95 flex items-center justify-center gap-2 ${
                  isPro 
                    ? 'bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 text-white border-white/20 hover:opacity-95 shadow-cyan-500/20' 
                    : isDark 
                    ? 'bg-slate-800 hover:bg-slate-700 text-white border-white/10' 
                    : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-700'
                }`}
              >
                <span>
                  {isProcessing 
                    ? (isRtl ? 'جاري المعالجة...' : 'Processing...') 
                    : (isFree 
                      ? (isRtl ? 'ابدأ مجاناً الآن' : 'Start Free Now') 
                      : (isRtl ? 'اشترك ورقي حسابك' : 'Upgrade & Subscribe'))}
                </span>
                <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            </div>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className={`max-w-3xl mx-auto rounded-3xl p-6 md:p-10 ${isDark ? 'bg-slate-900/50 border border-white/5' : 'bg-slate-50 border border-slate-200'}`}>
        <h3 className={`text-2xl font-black mb-8 text-center ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {isRtl ? 'الأسئلة الشائعة (FAQ)' : 'Frequently Asked Questions'}
        </h3>
        
        <div className="space-y-2">
          <FAQItem 
            isRtl={isRtl} isDark={isDark}
            question={isRtl ? 'كيف يتم الدفع وتفعيل الاشتراك؟' : 'How does payment and activation work?'}
            answer={isRtl 
              ? 'يتم الدفع بأمان وسرية عبر العملات الرقمية المستقرة (USDT) على شبكات TRC20 أو BEP20. بمجرد تحويلك للمبلغ للعنوان المخصص، سيتم التحقق عبر البلوكشين وتفعيل باقتك آلياً.'
              : 'Payments are made securely via USDT crypto on TRC20 or BEP20. Once transferred to the assigned address, blockchain verifies it and activates your plan automatically.'}
          />
          <FAQItem 
            isRtl={isRtl} isDark={isDark}
            question={isRtl ? 'هل يمكنني الترقية من الباقة المجانية لاحقاً؟' : 'Can I upgrade from free plan later?'}
            answer={isRtl 
              ? 'بالتأكيد! يمكنك البدء بالباقة المجانية لتجربة الداشبورد وإدارة صفقاتك الأساسية، وبمجرد احتياجك لمركز الذهب أو استراتيجيات أعمق، يمكنك الترقية بضغطة زر.'
              : 'Absolutely! Start free to test the dashboard, and whenever you need the Gold Hub or advanced strategies, you can upgrade with one click.'}
          />
          <FAQItem 
            isRtl={isRtl} isDark={isDark}
            question={isRtl ? 'هل بيانات صفقاتي آمنة ومحفوظة؟' : 'Is my trade data secure?'}
            answer={isRtl 
              ? 'نعم، نحن نستخدم تشفير عالي الجودة للبيانات في قاعدة البيانات (Bcrypt & JWT)، والمنصة مصممة للاستخدام كأداة تعقب محفظة (Portfolio Tracker) ولا تمتلك صلاحية سحب أو تحويل أي أموال من منصاتك.'
              : 'Yes, we use high-grade database encryption. The platform acts as a tracker only and has no withdrawal permissions from your exchange accounts.'}
          />
        </div>
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
