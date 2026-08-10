import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';

export default function Pricing() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Payment Modal State
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
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
        setError("Failed to load subscription plans.");
        setLoading(false);
      });
  }, []);

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
        alert("Subscription Activated Successfully! Welcome aboard.");
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

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading plans...</div>;
  if (error) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="py-12 px-6 font-sans selection:bg-cyan-500/30">
      
      <div className="max-w-6xl mx-auto text-center mb-16">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 mb-6">
          Choose Your Trading Arsenal
        </h1>
        <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
          Unlock the full potential of your trading strategy. Pay securely with Crypto. No hidden fees.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const isPro = plan.plan_code === 'PRO_MONTHLY';
          return (
            <div 
              key={plan.id} 
              className={`relative rounded-3xl p-8 flex flex-col backdrop-blur-sm border transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                isPro 
                  ? 'bg-gradient-to-b from-indigo-900/40 to-[var(--bg-card)] border-indigo-500/50 shadow-indigo-500/20' 
                  : 'bg-[var(--bg-card)] border-[var(--border-panel)] hover:border-slate-500/50'
              }`}
            >
              {isPro && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-[var(--text-primary)]">${plan.price_usd}</span>
                <span className="text-[var(--text-secondary)] ml-2">/ {plan.billing_cycle_days === 30 ? 'month' : plan.billing_cycle_days === 365 ? 'year' : 'cycle'}</span>
              </div>
              
              <ul className="mb-8 flex-1 space-y-4">
                <li className="flex items-center text-[var(--text-primary)]">
                  <svg className="w-5 h-5 text-emerald-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  Advanced Portfolio Tracking
                </li>
                <li className="flex items-center text-[var(--text-primary)]">
                  <svg className="w-5 h-5 text-emerald-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  Real-time Analytics
                </li>
                {plan.price_usd > 0 && (
                  <li className="flex items-center text-[var(--text-primary)]">
                    <svg className="w-5 h-5 text-emerald-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    Priority Support
                  </li>
                )}
              </ul>
              
              <button 
                onClick={() => handleSubscribe(plan)}
                disabled={isProcessing}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 border ${
                  isPro 
                    ? 'bg-slate-800/50 text-slate-500 border-slate-700/50 cursor-not-allowed' 
                    : 'bg-[var(--input-bg)] text-[var(--text-primary)] border-[var(--border-panel)] hover:border-cyan-500 hover:text-cyan-500'
                } disabled:opacity-50`}
              >
                {isProcessing ? 'Processing...' : isPro ? 'قريباً (Coming Soon)' : (plan.price_usd === 0 ? 'ابدأ تجربتك المجانية' : 'Subscribe Now')}
              </button>
            </div>
          );
        })}
      </div>

      {/* Payment Modal */}
      {paymentInfo && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
            <button 
              onClick={() => setPaymentInfo(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Awaiting Payment</h2>
              <p className="text-slate-400">Please send exactly the amount below to activate your {selectedPlan.name} subscription.</p>
            </div>
            
            <div className="bg-slate-950 rounded-xl p-6 mb-6 text-center border border-slate-800">
              <p className="text-sm text-slate-400 uppercase tracking-wider mb-1">Amount to send</p>
              <div className="text-3xl font-extrabold text-emerald-400 mb-1">
                {paymentInfo.amount_crypto} <span className="text-xl">{paymentInfo.asset}</span>
              </div>
              <p className="text-xs text-slate-500">Network: {paymentInfo.network}</p>
            </div>
            
            <div className="mb-8">
              <p className="text-sm text-slate-400 mb-2">Send to Address:</p>
              <div className="bg-slate-800 p-4 rounded-lg flex items-center justify-between border border-slate-700">
                <code className="text-cyan-400 text-sm break-all font-mono">
                  {paymentInfo.deposit_address}
                </code>
                <button 
                  onClick={() => navigator.clipboard.writeText(paymentInfo.deposit_address)}
                  className="ml-4 p-2 bg-slate-700 hover:bg-slate-600 rounded-md text-white transition-colors"
                  title="Copy Address"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-3 text-amber-400 bg-amber-400/10 p-4 rounded-xl border border-amber-400/20 mb-4">
              <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span className="text-sm font-medium">Listening for payment on the blockchain...</span>
            </div>

            {/* Dev Only: Simulate Payment Button */}
            <button 
              onClick={async () => {
                try {
                  await api.mockPayInvoice(paymentInfo.invoice_id);
                  alert("Payment simulated successfully! You now have full access.");
                  window.location.href = '/dashboard';
                } catch (e) {
                  alert("Failed to simulate payment: " + e.message);
                }
              }}
              className="w-full py-3 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 font-bold transition-all text-sm flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              Simulate Payment (Dev Only)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
