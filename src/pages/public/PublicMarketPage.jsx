import React from 'react';
import { Link } from 'react-router-dom';
import { Globe } from 'lucide-react';
import MarketPricesPage from '../MarketPricesPage';

export default function PublicMarketPage() {
  return (
    <div dir="rtl">

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            أسعار السوق المباشرة
          </h1>
          <p className="text-[var(--text-secondary)] mt-2">تابع أسعار العملات الرقمية والأسواق التقليدية لحظة بلحظة</p>
        </div>
        
        {/* Render the internal component but within our public shell */}
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-panel)] overflow-hidden shadow-xl">
            <MarketPricesPage />
        </div>
      </main>
    </div>
  );
}
