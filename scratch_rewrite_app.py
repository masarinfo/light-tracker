import os

app_path = "/Users/mohammed/Desktop/AI IDE/light_Tracker_V4/src/App.jsx"
with open(app_path, "r") as f:
    content = f.read()

# 1. Imports
imports_to_add = """
import Footer from './components/layout/Footer';
import PrivacyPolicy from './pages/public/PrivacyPolicy';
import Terms from './pages/public/Terms';
import FAQ from './pages/public/FAQ';
import AboutUs from './pages/public/AboutUs';
import ContactUs from './pages/public/ContactUs';
import Blog from './pages/public/Blog';
"""
content = content.replace("import PublicHeader from './components/layout/PublicHeader';", 
                          "import PublicHeader from './components/layout/PublicHeader';\n" + imports_to_add)


# 2. Add Footer to PublicLayout
public_layout_old = """  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen font-sans selection:bg-cyan-500/30 transition-colors duration-300 bg-[var(--bg-main)] text-[var(--text-primary)]">
      <PublicHeader />
      <div className="pt-24 pb-12">
        {children}
      </div>
      
      {/* Build Version / Timestamp */}
      <div className="fixed bottom-2 left-0 right-0 text-center pointer-events-none z-50">
        <p className="text-xs text-gray-500 font-mono tracking-wide opacity-50">
          {typeof __BUILD_DATE__ !== 'undefined' ? `v${__BUILD_DATE__}` : 'DEV'}
        </p>
      </div>
    </div>
  );"""

public_layout_new = """  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen font-sans flex flex-col selection:bg-cyan-500/30 transition-colors duration-300 bg-[var(--bg-main)] text-[var(--text-primary)]">
      <PublicHeader />
      <main className="flex-1 pt-24 pb-12">
        {children}
      </main>
      
      <Footer />
      
      {/* Build Version / Timestamp */}
      <div className="fixed bottom-2 left-0 right-0 text-center pointer-events-none z-50">
        <p className="text-xs text-gray-500 font-mono tracking-wide opacity-50">
          {typeof __BUILD_DATE__ !== 'undefined' ? `v${__BUILD_DATE__}` : 'DEV'}
        </p>
      </div>
    </div>
  );"""

content = content.replace(public_layout_old, public_layout_new)


# 3. Add Routes
routes_old = """            <Route path="/pricing" element={<PublicLayout><Pricing /></PublicLayout>} />
            <Route path="/dashboard/*" element={<PrivateLayout />} />"""

routes_new = """            <Route path="/pricing" element={<PublicLayout><Pricing /></PublicLayout>} />
            <Route path="/privacy" element={<PublicLayout><PrivacyPolicy /></PublicLayout>} />
            <Route path="/terms" element={<PublicLayout><Terms /></PublicLayout>} />
            <Route path="/faq" element={<PublicLayout><FAQ /></PublicLayout>} />
            <Route path="/about" element={<PublicLayout><AboutUs /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><ContactUs /></PublicLayout>} />
            <Route path="/blog" element={<PublicLayout><Blog /></PublicLayout>} />
            <Route path="/dashboard/*" element={<PrivateLayout />} />"""

content = content.replace(routes_old, routes_new)

with open(app_path, "w") as f:
    f.write(content)

print("Updated App.jsx successfully.")
