import React, { useState } from 'react';
import { X, CheckCircle2, Zap, ShieldAlert, Youtube, FileText, Loader2 } from 'lucide-react';
import { usePro } from '../context/ProContext';

export default function ProModal() {
  const { showUpgradeModal, setShowUpgradeModal, upgradeToPro, isPro } = usePro();
  const [isLoading, setIsLoading] = useState(false);

  if (!showUpgradeModal || isPro) return null;

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      // Fallback to local upgrade if Stripe fails or isn't configured
      upgradeToPro();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={() => setShowUpgradeModal(false)}
      />
      
      <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={() => setShowUpgradeModal(false)}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-10" />
          
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-3xl mb-6 shadow-xl shadow-indigo-200 relative z-10">
            <Zap size={36} fill="currentColor" />
          </div>
          
          <h2 className="text-3xl font-black text-slate-900 mb-4 relative z-10">Upgrade to Pro</h2>
          <p className="text-slate-600 mb-8 relative z-10">
            Get the ultimate toolkit for students and researchers. Remove all ads and unlock unlimited access.
          </p>

          <div className="space-y-4 text-left mb-10 relative z-10">
            {[
              { icon: <ShieldAlert size={20} className="text-emerald-500" />, text: "Unlimited Plagiarism Checks & Rewrites" },
              { icon: <Youtube size={20} className="text-emerald-500" />, text: "Unlimited YouTube to Text Conversions" },
              { icon: <FileText size={20} className="text-emerald-500" />, text: "Longer Document Summarization" },
              { icon: <CheckCircle2 size={20} className="text-emerald-500" />, text: "Completely Ad-Free Experience" },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="shrink-0">{feature.icon}</div>
                <span className="font-medium text-slate-700">{feature.text}</span>
              </div>
            ))}
          </div>

          <div className="relative z-10">
            <button
              onClick={handleUpgrade}
              disabled={isLoading}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-lg hover:bg-slate-800 transition-colors shadow-xl shadow-slate-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap size={20} fill="currentColor" />
                  Upgrade Now - $4.99/mo
                </>
              )}
            </button>
            <p className="text-xs text-slate-400 mt-4 font-medium">
              Cancel anytime. Secure payment powered by Stripe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
