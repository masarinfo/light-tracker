import React from 'react';
import { useApp } from '../../context/AppContext';
import { Info, Target, Users, Zap } from 'lucide-react';

export default function AboutUs() {
  const { lang } = useApp();
  const isRtl = lang === 'ar';

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-16 text-center">
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
          {isRtl ? 'من نحن' : 'About Us'}
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          {isRtl ? 'نحن نبني مستقبل التتبع المالي وتطوير الاستثمار الشخصي' : 'We build the future of financial tracking and personal investment development.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">
            {isRtl ? 'رسالتنا' : 'Our Mission'}
          </h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            {isRtl 
              ? 'نهدف في LightTracker إلى تمكين المتداولين والمستثمرين من فهم محافظهم بشكل أفضل عبر أدوات تتبع متطورة، وتحليلات دقيقة، وواجهة مستخدم سهلة وبسيطة تجعل من تعقيدات السوق أمراً سهلاً.' 
              : 'At LightTracker, we aim to empower traders and investors to better understand their portfolios through advanced tracking tools, precise analytics, and a simple UI that makes market complexities easy.'}
          </p>
        </div>
        <div className="glass-panel p-8 rounded-3xl border border-white/5 bg-gradient-to-br from-cyan-500/10 to-blue-500/10">
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center p-4">
              <div className="text-4xl font-black text-white mb-2">+10k</div>
              <div className="text-sm text-gray-400">{isRtl ? 'مستخدم نشط' : 'Active Users'}</div>
            </div>
            <div className="text-center p-4">
              <div className="text-4xl font-black text-white mb-2">$50M</div>
              <div className="text-sm text-gray-400">{isRtl ? 'حجم المحافظ المتتبعة' : 'Tracked Portfolio Vol'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-white/5 text-center">
          <Target className="w-10 h-10 text-cyan-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">{isRtl ? 'الرؤية' : 'Vision'}</h3>
          <p className="text-sm text-gray-400">{isRtl ? 'أن نكون المنصة الأولى عالمياً لإدارة أصول الأفراد.' : 'To be the #1 global platform for personal asset management.'}</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-white/5 text-center">
          <Zap className="w-10 h-10 text-amber-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">{isRtl ? 'السرعة' : 'Agility'}</h3>
          <p className="text-sm text-gray-400">{isRtl ? 'أسعار لحظية وتقنيات سحابية فائقة السرعة.' : 'Real-time prices and lightning-fast cloud tech.'}</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-white/5 text-center">
          <Users className="w-10 h-10 text-purple-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">{isRtl ? 'المجتمع' : 'Community'}</h3>
          <p className="text-sm text-gray-400">{isRtl ? 'نبني أدواتنا بناءً على طلب مجتمعنا النشط.' : 'We build our tools based on our active community requests.'}</p>
        </div>
      </div>
    </div>
  );
}
