import os

pages_dir = "/Users/mohammed/Desktop/AI IDE/light_Tracker_V4/src/pages/public"
os.makedirs(pages_dir, exist_ok=True)

# 1. Footer.jsx
footer_code = """import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, BookOpen, HelpCircle, Mail, Info, FileText, Twitter, Github, Linkedin } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Footer() {
  const { lang } = useApp();
  const isRtl = lang === 'ar';

  return (
    <footer className="bg-black/40 border-t border-white/5 pt-12 pb-8 mt-auto relative z-10">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <span className="text-white font-black text-sm">LT</span>
              </div>
              <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                LightTracker
              </span>
            </Link>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
              {isRtl 
                ? 'منصتك الاحترافية لتتبع وإدارة صفقات العملات الرقمية والمعادن الثمينة بذكاء.' 
                : 'Your professional platform for smartly tracking and managing crypto and precious metals trades.'}
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-500 hover:text-cyan-400 transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="text-gray-500 hover:text-cyan-400 transition-colors"><Github className="w-5 h-5" /></a>
              <a href="#" className="text-gray-500 hover:text-cyan-400 transition-colors"><Linkedin className="w-5 h-5" /></a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">{isRtl ? 'الروابط السريعة' : 'Quick Links'}</h4>
            <ul className="space-y-3">
              <li><Link to="/pricing" className="text-sm text-gray-400 hover:text-cyan-400 transition-colors">{isRtl ? 'الأسعار والاشتراكات' : 'Pricing'}</Link></li>
              <li><Link to="/market" className="text-sm text-gray-400 hover:text-cyan-400 transition-colors">{isRtl ? 'الأسواق' : 'Markets'}</Link></li>
              <li><Link to="/blog" className="text-sm text-gray-400 hover:text-cyan-400 transition-colors">{isRtl ? 'المدونة' : 'Blog'}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">{isRtl ? 'المساعدة والدعم' : 'Help & Support'}</h4>
            <ul className="space-y-3">
              <li><Link to="/faq" className="text-sm text-gray-400 hover:text-cyan-400 transition-colors">{isRtl ? 'الأسئلة الشائعة' : 'FAQ'}</Link></li>
              <li><Link to="/contact" className="text-sm text-gray-400 hover:text-cyan-400 transition-colors">{isRtl ? 'تواصل معنا' : 'Contact Us'}</Link></li>
              <li><Link to="/about" className="text-sm text-gray-400 hover:text-cyan-400 transition-colors">{isRtl ? 'من نحن' : 'About Us'}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">{isRtl ? 'قانوني' : 'Legal'}</h4>
            <ul className="space-y-3">
              <li><Link to="/privacy" className="text-sm text-gray-400 hover:text-cyan-400 transition-colors">{isRtl ? 'سياسة الخصوصية' : 'Privacy Policy'}</Link></li>
              <li><Link to="/terms" className="text-sm text-gray-400 hover:text-cyan-400 transition-colors">{isRtl ? 'الشروط والأحكام' : 'Terms of Service'}</Link></li>
            </ul>
          </div>

        </div>
        
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} LightTracker. {isRtl ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>Made with ❤️ for Traders</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
"""

with open("/Users/mohammed/Desktop/AI IDE/light_Tracker_V4/src/components/layout/Footer.jsx", "w") as f:
    f.write(footer_code)

# 2. PrivacyPolicy.jsx
privacy_code = """import React from 'react';
import { useApp } from '../../context/AppContext';
import { Shield } from 'lucide-react';

export default function PrivacyPolicy() {
  const { lang } = useApp();
  const isRtl = lang === 'ar';

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-6">
          <Shield className="w-8 h-8 text-cyan-400" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
          {isRtl ? 'سياسة الخصوصية' : 'Privacy Policy'}
        </h1>
        <p className="text-gray-400">
          {isRtl ? 'آخر تحديث: 12 أغسطس 2026' : 'Last updated: August 12, 2026'}
        </p>
      </div>

      <div className="glass-panel p-8 rounded-2xl border border-white/5 prose prose-invert max-w-none prose-cyan">
        {isRtl ? (
          <>
            <h2>1. جمع المعلومات</h2>
            <p>نقوم بجمع المعلومات التي تقدمها لنا مباشرة عندما تقوم بإنشاء حساب، مثل اسمك وبريدك الإلكتروني. كما نجمع بيانات تتعلق بتفاعلك مع منصتنا لتحسين تجربة المستخدم.</p>
            
            <h2>2. استخدام المعلومات</h2>
            <p>نستخدم معلوماتك لـ:</p>
            <ul>
              <li>توفير وصيانة وتحسين خدماتنا.</li>
              <li>معالجة المعاملات وإرسال الإشعارات المتعلقة بها.</li>
              <li>الرد على تعليقاتك وأسئلتك وتقديم خدمة العملاء.</li>
            </ul>

            <h2>3. أمان البيانات</h2>
            <p>نحن نتخذ تدابير معقولة للمساعدة في حماية معلوماتك من الفقد أو السرقة أو سوء الاستخدام والوصول غير المصرح به.</p>

            <h2>4. مشاركة المعلومات</h2>
            <p>نحن لا نبيع معلوماتك الشخصية. قد نشارك المعلومات فقط لتلبية القوانين التنظيمية أو لحماية حقوق المنصة.</p>
          </>
        ) : (
          <>
            <h2>1. Information Collection</h2>
            <p>We collect information you provide directly to us when you create an account, such as your name and email. We also collect data regarding your interaction with our platform to improve user experience.</p>
            
            <h2>2. Use of Information</h2>
            <p>We use your information to:</p>
            <ul>
              <li>Provide, maintain, and improve our services.</li>
              <li>Process transactions and send related notifications.</li>
              <li>Respond to your comments, questions, and provide customer service.</li>
            </ul>

            <h2>3. Data Security</h2>
            <p>We take reasonable measures to help protect your information from loss, theft, misuse, and unauthorized access.</p>

            <h2>4. Sharing of Information</h2>
            <p>We do not sell your personal information. We may share information only to comply with regulatory laws or to protect the platform's rights.</p>
          </>
        )}
      </div>
    </div>
  );
}
"""

with open(f"{pages_dir}/PrivacyPolicy.jsx", "w") as f:
    f.write(privacy_code)


# 3. Terms.jsx
terms_code = """import React from 'react';
import { useApp } from '../../context/AppContext';
import { FileText } from 'lucide-react';

export default function Terms() {
  const { lang } = useApp();
  const isRtl = lang === 'ar';

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
          <FileText className="w-8 h-8 text-amber-400" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
          {isRtl ? 'الشروط والأحكام' : 'Terms of Service'}
        </h1>
      </div>

      <div className="glass-panel p-8 rounded-2xl border border-white/5 prose prose-invert max-w-none prose-amber">
        {isRtl ? (
          <>
            <h2>1. الموافقة على الشروط</h2>
            <p>من خلال الوصول إلى المنصة أو استخدامها، فإنك توافق على الالتزام بهذه الشروط والأحكام.</p>

            <h2>2. استخدام المنصة</h2>
            <p>يجب أن تستخدم المنصة لأغراض قانونية فقط. يُمنع استخدام المنصة في أي نشاط احتيالي أو غير قانوني.</p>

            <h2>3. إخلاء المسؤولية</h2>
            <p>LightTracker هي منصة تتبع وتحليل وليست منصة لتقديم الاستشارات المالية. تقع مسؤولية اتخاذ قرارات التداول عليك وحدك.</p>

            <h2>4. التعديلات على الشروط</h2>
            <p>نحتفظ بالحق في تعديل أو استبدال هذه الشروط في أي وقت. سيتم إشعار المستخدمين بأي تغييرات جوهرية.</p>
          </>
        ) : (
          <>
            <h2>1. Acceptance of Terms</h2>
            <p>By accessing or using the platform, you agree to be bound by these terms and conditions.</p>

            <h2>2. Use of Platform</h2>
            <p>You must use the platform for lawful purposes only. Using the platform for any fraudulent or illegal activity is prohibited.</p>

            <h2>3. Disclaimer</h2>
            <p>LightTracker is a tracking and analysis platform, not a financial advisory platform. The responsibility for making trading decisions lies solely with you.</p>

            <h2>4. Modifications to Terms</h2>
            <p>We reserve the right to modify or replace these Terms at any time. Users will be notified of any material changes.</p>
          </>
        )}
      </div>
    </div>
  );
}
"""

with open(f"{pages_dir}/Terms.jsx", "w") as f:
    f.write(terms_code)

# 4. FAQ.jsx
faq_code = """import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { HelpCircle, ChevronDown } from 'lucide-react';

export default function FAQ() {
  const { lang } = useApp();
  const isRtl = lang === 'ar';
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      qAr: 'ما هي منصة LightTracker؟',
      qEn: 'What is LightTracker?',
      aAr: 'منصة LightTracker هي منصة ذكية مصممة لمساعدة المتداولين في تتبع استثماراتهم وصفقاتهم في العملات الرقمية والمعادن الثمينة بدقة وتوفر أدوات متقدمة لحساب الأرباح وإدارة المحافظ.',
      aEn: 'LightTracker is a smart platform designed to help traders accurately track their investments and trades in crypto and precious metals, providing advanced tools for PnL calculation and portfolio management.'
    },
    {
      qAr: 'هل بياناتي آمنة في المنصة؟',
      qEn: 'Is my data secure?',
      aAr: 'نعم، نحن نستخدم أحدث تقنيات التشفير لضمان أمان بياناتك وصفقاتك. المنصة مصممة بأعلى معايير الأمان العالمية.',
      aEn: 'Yes, we use the latest encryption technologies to ensure the security of your data and trades. The platform is built to the highest global security standards.'
    },
    {
      qAr: 'هل يمكنني تتبع أسعار الذهب والفضة اللحظية؟',
      qEn: 'Can I track live Gold and Silver prices?',
      aAr: 'بالتأكيد، توفر المنصة أسعاراً لحظية دقيقة للذهب والفضة معتمدة عالمياً لمساعدتك على تقييم مخزونك بدقة تامة.',
      aEn: 'Absolutely, the platform provides accurate live prices for Gold and Silver globally recognized to help you evaluate your inventory precisely.'
    },
    {
      qAr: 'هل يوجد تطبيق للهواتف المحمولة؟',
      qEn: 'Is there a mobile app?',
      aAr: 'المنصة مصممة بتقنية متجاوبة (Responsive) وتعمل كبرنامج ويب (PWA)، مما يعني أنها تعمل بشكل مثالي وسريع على جميع الأجهزة المحمولة من خلال المتصفح.',
      aEn: 'The platform is responsive and works as a PWA (Progressive Web App), meaning it works perfectly and fast on all mobile devices through the browser.'
    }
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-6">
          <HelpCircle className="w-8 h-8 text-purple-400" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
          {isRtl ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
        </h1>
        <p className="text-gray-400">
          {isRtl ? 'إجابات على الأسئلة الأكثر شيوعاً حول المنصة' : 'Answers to the most common questions about the platform'}
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className={`glass-panel border rounded-2xl transition-all ${isOpen ? 'border-purple-500/30 bg-white/5' : 'border-white/5 hover:border-white/10'}`}>
              <button 
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full text-left p-6 flex items-center justify-between gap-4 focus:outline-none"
              >
                <h3 className={`font-bold text-lg ${isOpen ? 'text-white' : 'text-gray-300'}`}>
                  {isRtl ? faq.qAr : faq.qEn}
                </h3>
                <ChevronDown className={`w-5 h-5 transition-transform text-gray-500 ${isOpen ? 'rotate-180 text-purple-400' : ''}`} />
              </button>
              {isOpen && (
                <div className="p-6 pt-0 text-gray-400 leading-relaxed">
                  {isRtl ? faq.aAr : faq.aEn}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
"""

with open(f"{pages_dir}/FAQ.jsx", "w") as f:
    f.write(faq_code)


# 5. AboutUs.jsx
about_code = """import React from 'react';
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
"""

with open(f"{pages_dir}/AboutUs.jsx", "w") as f:
    f.write(about_code)


# 6. ContactUs.jsx
contact_code = """import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Mail, Send, CheckCircle2 } from 'lucide-react';

export default function ContactUs() {
  const { lang } = useApp();
  const isRtl = lang === 'ar';
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8 text-blue-400" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
          {isRtl ? 'تواصل معنا' : 'Contact Us'}
        </h1>
        <p className="text-gray-400">
          {isRtl ? 'نحن هنا للإجابة على جميع استفساراتك' : 'We are here to answer all your inquiries'}
        </p>
      </div>

      <div className="glass-panel p-8 rounded-3xl border border-white/10">
        {sent ? (
          <div className="text-center py-12">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">{isRtl ? 'تم الإرسال بنجاح!' : 'Message Sent Successfully!'}</h3>
            <p className="text-gray-400">{isRtl ? 'سنقوم بالرد عليك في أقرب وقت ممكن.' : 'We will get back to you as soon as possible.'}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-300 font-semibold mb-2">{isRtl ? 'الاسم' : 'Name'}</label>
              <input type="text" required className="w-full p-4 rounded-xl glass-input text-white" placeholder={isRtl ? 'أدخل اسمك' : 'Enter your name'} />
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-2">{isRtl ? 'البريد الإلكتروني' : 'Email Address'}</label>
              <input type="email" required className="w-full p-4 rounded-xl glass-input text-white" placeholder="your@email.com" />
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-2">{isRtl ? 'الرسالة' : 'Message'}</label>
              <textarea required rows="5" className="w-full p-4 rounded-xl glass-input text-white resize-none" placeholder={isRtl ? 'كيف يمكننا مساعدتك؟' : 'How can we help you?'}></textarea>
            </div>
            <button type="submit" className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-black flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
              <Send className="w-5 h-5" />
              {isRtl ? 'إرسال الرسالة' : 'Send Message'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
"""

with open(f"{pages_dir}/ContactUs.jsx", "w") as f:
    f.write(contact_code)

# 7. Blog.jsx
blog_code = """import React from 'react';
import { useApp } from '../../context/AppContext';
import { BookOpen, ArrowRight, ArrowLeft } from 'lucide-react';

export default function Blog() {
  const { lang } = useApp();
  const isRtl = lang === 'ar';

  const articles = [
    {
      id: 1,
      titleAr: 'كيف تبدأ تداول الذهب؟ الدليل الشامل',
      titleEn: 'How to start trading Gold? The Comprehensive Guide',
      excerptAr: 'تعرف على أساسيات تداول الذهب، العيارات المختلفة، وكيفية حساب الأرباح والخسائر بسهولة باستخدام منصتنا.',
      excerptEn: 'Learn the basics of gold trading, different karats, and how to calculate PnL easily using our platform.',
      date: '10 Aug 2026',
      tag: 'المعادن الثمينة',
      image: 'https://images.unsplash.com/photo-1610969622935-77987823f669?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 2,
      titleAr: 'أهم 5 استراتيجيات لتداول العملات الرقمية',
      titleEn: 'Top 5 Strategies for Crypto Trading',
      excerptAr: 'اكتشف الاستراتيجيات الأكثر نجاحاً في سوق الكريبتو وكيف يمكنك تطبيقها باستخدام صانع الاستراتيجيات الخاص بنا.',
      excerptEn: 'Discover the most successful strategies in the crypto market and how you can apply them using our Strategy Builder.',
      date: '05 Aug 2026',
      tag: 'الكريبتو',
      image: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 3,
      titleAr: 'ما هو سعر التعادل ولماذا يعتبر مهماً جداً؟',
      titleEn: 'What is Break-Even Price and why is it crucial?',
      excerptAr: 'شرح مبسط لكيفية حساب سعر التعادل الذي يجنبك الخسارة وكيف تقوم المنصة بحسابه تلقائياً لجميع صفقاتك.',
      excerptEn: 'A simple explanation of how to calculate the break-even price to avoid losses, and how our platform does it automatically.',
      date: '28 Jul 2026',
      tag: 'تعليمي',
      image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=600&auto=format&fit=crop'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
          <BookOpen className="w-8 h-8 text-emerald-400" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
          {isRtl ? 'المدونة والتعليم' : 'Blog & Education'}
        </h1>
        <p className="text-gray-400">
          {isRtl ? 'مقالات، شروحات، ونصائح لتطوير مهاراتك في التداول' : 'Articles, guides, and tips to improve your trading skills'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <div key={article.id} className="glass-panel rounded-2xl border border-white/5 overflow-hidden group hover:border-emerald-500/30 transition-all cursor-pointer">
            <div className="h-48 overflow-hidden relative">
              <div className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10">
                {article.tag}
              </div>
              <img src={article.image} alt="Thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-6">
              <div className="text-xs text-gray-500 mb-3">{article.date}</div>
              <h3 className="text-xl font-bold text-white mb-3 leading-snug group-hover:text-emerald-400 transition-colors">
                {isRtl ? article.titleAr : article.titleEn}
              </h3>
              <p className="text-sm text-gray-400 line-clamp-3 mb-6">
                {isRtl ? article.excerptAr : article.excerptEn}
              </p>
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <span>{isRtl ? 'اقرأ المزيد' : 'Read More'}</span>
                {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
"""

with open(f"{pages_dir}/Blog.jsx", "w") as f:
    f.write(blog_code)

print("Created all public pages and Footer component.")
