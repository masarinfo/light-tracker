import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, ArrowRight, Shield, Zap, TrendingUp } from 'lucide-react';

export default function LandingPage() {
  return (
    <div dir="rtl">
      {/* Hero Section */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/20 rounded-full blur-[120px] -z-10"></div>
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-black leading-tight text-[var(--text-primary)]">
            تتبع صفقاتك بذكاء وراقب <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
              الأسواق العالمية لحظة بلحظة
            </span>
          </h1>
          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
            المنصة الأسرع والأكثر أماناً لتتبع استثماراتك في العملات الرقمية والأسواق التقليدية. صمم استراتيجياتك وتابع أرباحك في مكان واحد.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link to="/register" className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-lg hover:opacity-90 transition-opacity flex items-center gap-2">
              <span>أنشئ محفظتك مجاناً</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/market" className="px-8 py-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-panel)] hover:border-slate-500/50 text-[var(--text-primary)] font-bold text-lg transition-all">
              استكشف الأسعار
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-[var(--bg-card)] border-t border-[var(--border-panel)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-[var(--text-primary)]">لماذا تختار Light Tracker؟</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-8 rounded-2xl border border-[var(--border-panel)] text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)]">حماية وخصوصية</h3>
              <p className="text-[var(--text-secondary)]">بياناتك وصفقاتك مشفرة ومحفوظة بأمان تام. لا يمكن لأي شخص آخر الاطلاع عليها.</p>
            </div>
            <div className="glass-panel p-8 rounded-2xl border border-[var(--border-panel)] text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)]">متابعة دقيقة</h3>
              <p className="text-[var(--text-secondary)]">احسب متوسط الشراء، الأرباح العائمة، والأهداف بدقة متناهية وفي الوقت الفعلي.</p>
            </div>
            <div className="glass-panel p-8 rounded-2xl border border-[var(--border-panel)] text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)]">أسعار لحظية</h3>
              <p className="text-[var(--text-secondary)]">تابع العملات الرقمية والأسواق التقليدية (الذهب، النفط) عبر واجهة سريعة الاستجابة.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10 text-center text-gray-500 text-sm">
        <p>© 2026 Light Tracker V3. جميع الحقوق محفوظة.</p>
        <div className="flex items-center justify-center gap-4 mt-4">
          <a href="#" className="hover:text-cyan-400 transition-colors">سياسة الخصوصية</a>
          <a href="#" className="hover:text-cyan-400 transition-colors">شروط الاستخدام</a>
        </div>
      </footer>
    </div>
  );
}
