import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Shield, Zap, TrendingUp, Coins, BarChart3, Wallet, 
  ChevronDown, CheckCircle2, Sparkles, Layers, Cpu, Lock, Globe2,
  Award, HelpCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function LandingPage() {
  const { lang, theme } = useApp();
  const isDark = theme === 'dark';
  const isRtl = lang === 'ar';

  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const features = [
    {
      icon: Coins,
      title: 'مركز إدارة وتداول الذهب 🥇',
      desc: 'إدارة متكاملة لصفقات الذهب بالجرام والعيارات (24، 21، 18 والجنيه الذهب) مع حساب متوسط التكلفة والتحويل الفوري بين الدولار والريال السعودي.',
      color: 'from-amber-500/20 to-orange-500/20',
      iconColor: 'text-amber-400',
      borderColor: 'border-amber-500/30'
    },
    {
      icon: TrendingUp,
      title: 'تتبع محفظة العملات الرقمية 🚀',
      desc: 'ربط ومتابعة الصفقات عبر مختلف المنصات (Binance, Bybit, KuCoin) وحساب الأرباح والخسائر ومتوسطات الشراء بدقة متناهية وفورية.',
      color: 'from-cyan-500/20 to-blue-500/20',
      iconColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/30'
    },
    {
      icon: Layers,
      title: 'مصنع الاستراتيجيات المتقدم 📊',
      desc: 'تصنيف صفقاتك إلى استراتيجيات مضاربة قصيرة المدى واستثمار طويل المدى لمراقبة كفاءة كل استراتيجية ونسب النجاح بدقة.',
      color: 'from-purple-500/20 to-indigo-500/20',
      iconColor: 'text-purple-400',
      borderColor: 'border-purple-500/30'
    },
    {
      icon: Wallet,
      title: 'إدارة المحفظة وكشف العجز النقدي 💰',
      desc: 'متابعة السيولة المتاحة مقابل الأموال المستثمرة، مع تنبيهات ذكية حية في حال وجود عجز نقدي نتيجة صفقات غير مسجلة الإيداع.',
      color: 'from-emerald-500/20 to-teal-500/20',
      iconColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/30'
    },
    {
      icon: Cpu,
      title: 'تحليلات وتقارير أداء شاملة 📈',
      desc: 'منحنى أرباح تراكمي (Equity Curve)، مخططات توزيع المحفظة حسب العملة والمنصة، وحساب أقصى تراجع (Max Drawdown).',
      color: 'from-indigo-500/20 to-blue-500/20',
      iconColor: 'text-indigo-400',
      borderColor: 'border-indigo-500/30'
    },
    {
      icon: Lock,
      title: 'أمان وتشفير بيانات 100% 🔒',
      desc: 'بيانات صفقاتك وحساباتك تشفر وتخزن بأحدث تقنيات الحماية. لا نطلب أبداً مفاتيح السحب، حسابك آمن ومعزول بالكامل.',
      color: 'from-rose-500/20 to-pink-500/20',
      iconColor: 'text-rose-400',
      borderColor: 'border-rose-500/30'
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'سجّل حسابك مجاناً',
      desc: 'أنشئ حسابك في أقل من دقيقة بدون الحاجة لبطاقة إئتمان واستمتع بالوصول للوحة التحكم مباشرة.'
    },
    {
      step: '02',
      title: 'أضف محافظك واستراتيجياتك',
      desc: 'قم بتعريف منصات التداول التي تستخدمها وأنشئ استراتيجياتك الخاصة بالعملات الرقمية أو الذهب.'
    },
    {
      step: '03',
      title: 'سجّل صفقاتك وراقب الأرباح',
      desc: 'أدخل الصفقات بسهولة عبر الواجهة السريعة وتابع متوسطات الشراء وتطور محفظتك لحظة بلحظة.'
    }
  ];

  const faqs = [
    {
      q: 'هل المنصة تحتاج ربط API سحب من منصاتي؟',
      a: 'لا مطلقاً! المنصة مخصصة لإدارة وتتبع الصفقات وتحليل الأداء وأمانك أولويتنا المطلقة. لا نطلب أي صلاحيات سحب أو ربط حساس.'
    },
    {
      q: 'كيف تساعدني المنصة في تداول وإدارة الذهب؟',
      a: 'توفر المنصة مركزاً كاملاً للذهب يحسب لك أسعار الجرامات لعيارات (24، 21، 18 والجنيه الذهب) بالدولار والريال السعودي بناءً على السعر العالمي، ويحسب لك متوسط تكلفة مشترياتك من الذهب وقيمتها الحالية.'
    },
    {
      q: 'هل يمكنني تجربة المنصة مجاناً قبل الاشتراك؟',
      a: 'نعم! نتيح باقة تجريبية مجانية يمكنك من خلالها تجربة جميع الخصائص الأساسية وتصفح أسعار السوق المباشرة واستخدام لوحة التحكم.'
    },
    {
      q: 'ما هي طرق الدفع المتاحة للاشتراك في الباقات المدفوعة؟',
      a: 'نوفر دفعاً آمناً وفورياً عبر العملات الرقمية المشفرة (USDT) لضمان السرعة والسهولة والخصوصية التامة.'
    }
  ];

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="space-y-20 pb-16 selection:bg-cyan-500/30">
      
      {/* 1. Hero Section */}
      <section className="relative pt-8 pb-16 md:pt-16 md:pb-24 px-4 sm:px-6 overflow-hidden">
        {/* Background Glow Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[600px] bg-gradient-to-tr from-cyan-500/20 via-indigo-500/20 to-purple-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
        
        <div className="max-w-5xl mx-auto text-center space-y-8">
          
          {/* Badge Tagline */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs sm:text-sm font-bold shadow-lg shadow-cyan-500/10 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>منصة التتبع والتحليل الأكثر شمولاً للعملات الرقمية والذهب</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.15] text-white">
            تتبع صفقاتك بذكاء متناهٍ وادُر <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400">
              محفظتك واستثماراتك باحترافية
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-sans">
            منصة متكاملة تمنحك سيطرة كاملة على صفقات العملات الرقمية والذهب. احسب متوسطات الشراء، راقب الأرباح الحية، واكتشف كفاءة استراتيجياتك الاستثمارية في مكان واحد.
          </p>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              to="/register" 
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 text-white font-extrabold text-base sm:text-lg hover:opacity-95 shadow-xl shadow-cyan-500/25 transition-all duration-200 active:scale-95 flex items-center justify-center gap-3 border border-white/20"
            >
              <span>ابدأ تجربتك المجانية الآن</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              to="/market" 
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/80 border border-white/15 hover:border-cyan-500/50 hover:bg-slate-900 text-white font-bold text-base sm:text-lg transition-all duration-200 shadow-md backdrop-blur-md flex items-center justify-center gap-2"
            >
              <Globe2 className="w-5 h-5 text-cyan-400" />
              <span>استكشف أسعار السوق المباشرة</span>
            </Link>
          </div>

          {/* Quick Platform Stats Bar */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md">
              <h4 className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">100%</h4>
              <p className="text-xs text-slate-400 mt-1 font-semibold">دقة الحسابات والمتوسطات</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md">
              <h4 className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">24K / 21K</h4>
              <p className="text-xs text-slate-400 mt-1 font-semibold">دعم كامل لعيارات الذهب</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md">
              <h4 className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">USD / SAR</h4>
              <p className="text-xs text-slate-400 mt-1 font-semibold">تحويل العملات الفوري</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md">
              <h4 className="text-2xl sm:text-3xl font-black text-purple-400 font-mono">Real-time</h4>
              <p className="text-xs text-slate-400 mt-1 font-semibold">أسعار حية ومباشرة</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Platform Value Propositions & Features */}
      <section className="py-12 px-4 sm:px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            كل ما تحتاجه لإدارة صفقاتك <span className="text-cyan-400">في مكان واحد</span>
          </h2>
          <p className="text-slate-300 text-base sm:text-lg">
            تم تصميم Light Tracker ليلبي تطلعات المتداولين والمستثمرين في الأسواق المالية والذهب بأعلى درجات السلاسة والأمان.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                className={`p-6 sm:p-8 rounded-3xl bg-slate-900/60 border ${item.borderColor} backdrop-blur-md hover:border-cyan-400/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl space-y-4 group`}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${item.color} border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-7 h-7 ${item.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. How It Works Section */}
      <section className="py-16 px-4 sm:px-6 bg-slate-900/40 border-y border-white/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              سهولة الاستخدام
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white">
              كيف تعمل المنصة في 3 خطوات بسيطة؟
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {steps.map((s, idx) => (
              <div key={idx} className="p-8 rounded-3xl bg-slate-950/80 border border-white/10 space-y-4 relative overflow-hidden group hover:border-indigo-500/40 transition-all">
                <span className="text-5xl font-black font-mono text-indigo-500/20 absolute top-4 left-4 group-hover:text-indigo-500/40 transition-colors">
                  {s.step}
                </span>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-sm font-mono">
                  {s.step}
                </div>
                <h3 className="text-xl font-bold text-white">{s.title}</h3>
                <p className="text-slate-300 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Gold Feature Spotlight Section */}
      <section className="py-12 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 backdrop-blur-xl relative overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>ميزة حصريّة: مركز إدارة الذهب</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              لا تترك استثماراتك في الذهب للتقديرات العشوائية!
            </h2>

            <p className="text-slate-300 text-base leading-relaxed">
              سواء كنت تشتري سبائك عيار 24، أو مجوهرات عيار 21 و18، أو جنيهات ذهب، يقوم Light Tracker بحساب تكلفة جراماتك بدقة، ويعرض لك القيمة السوقية الفورية بالدولار والريال السعودي لحظة بلحظة.
            </p>

            <ul className="space-y-3 pt-2">
              <li className="flex items-center gap-3 text-slate-200 text-sm font-semibold">
                <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
                <span>حساب متوسط الشراء التراكمي مهما اختلفت العيارات والأوزان.</span>
              </li>
              <li className="flex items-center gap-3 text-slate-200 text-sm font-semibold">
                <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
                <span>متابعة لحظية لسعر الجنيه الذهب (8 جرام عيار 21).</span>
              </li>
              <li className="flex items-center gap-3 text-slate-200 text-sm font-semibold">
                <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
                <span>تبديل فوري في العرض بين الدولار الأمريكي والريال السعودي.</span>
              </li>
            </ul>

            <div className="pt-4">
              <Link 
                to="/register" 
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-95"
              >
                <span>انضم الآن وجرب مركز الذهب</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-950/90 border border-amber-500/30 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-2">
                <Coins className="w-4 h-4" />
                معاينة حية: أسعار جرام الذهب
              </span>
              <span className="text-[10px] font-mono text-slate-400">Live Gold Ticker</span>
            </div>

            <div className="space-y-3 font-mono">
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900 border border-white/5">
                <span className="text-xs text-slate-300 font-sans">جرام عيار 24</span>
                <span className="text-base font-bold text-amber-300">$84.50 / 316.88 ر.س</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900 border border-white/5">
                <span className="text-xs text-slate-300 font-sans">جرام عيار 21</span>
                <span className="text-base font-bold text-amber-300">$73.93 / 277.27 ر.س</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <span className="text-xs text-amber-300 font-sans font-bold">الجنيه الذهب (8ج عيار 21)</span>
                <span className="text-base font-black text-amber-400">$591.44 / 2217.90 ر.س</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 5. Frequently Asked Questions (FAQ) Section */}
      <section className="py-12 px-4 sm:px-6 max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-bold">
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span>الأسئلة الشائعة</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            كل ما تحتاجه من إجابات قبل البدء
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div 
                key={index}
                className="rounded-2xl bg-slate-900/70 border border-white/10 overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-5 sm:p-6 text-right flex items-center justify-between gap-4 font-bold text-white text-base sm:text-lg hover:text-cyan-300 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-cyan-400 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-6 text-slate-300 text-sm leading-relaxed border-t border-white/5 pt-4 font-sans">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Final Call to Action Banner */}
      <section className="py-12 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-700 text-white text-center space-y-8 shadow-2xl relative overflow-hidden border border-white/20">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              جاهز لتداول وإدارة صفقاتك بذكاء وسهولة؟
            </h2>
            <p className="text-slate-100 text-base sm:text-lg">
              انضم اليوم إلى Light Tracker وابدأ في متابعة صفقاتك واستراتيجياتك ومحفظة الذهب والعملات بدقة احترافية.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link 
              to="/register" 
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-base sm:text-lg transition-all shadow-xl active:scale-95 border border-white/10"
            >
              إنشاء حساب جديد مجاناً
            </Link>
            <Link 
              to="/pricing" 
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-base sm:text-lg backdrop-blur-md transition-all border border-white/30"
            >
              عرض باقات الاشتراك
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="py-8 border-t border-white/10 text-center text-slate-400 text-xs sm:text-sm font-sans space-y-4">
        <p>© 2026 Light Tracker V4.0 Enterprise. جميع الحقوق محفوظة.</p>
        <div className="flex items-center justify-center gap-6 text-slate-400">
          <Link to="/market" className="hover:text-cyan-400 transition-colors">السوق المباشر</Link>
          <Link to="/pricing" className="hover:text-cyan-400 transition-colors">الأسعار والباقات</Link>
          <Link to="/login" className="hover:text-cyan-400 transition-colors">تسجيل الدخول</Link>
        </div>
      </footer>

    </div>
  );
}

