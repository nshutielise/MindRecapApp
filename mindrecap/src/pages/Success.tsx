import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Zap } from 'lucide-react';
import { usePro } from '../context/ProContext';

export default function Success() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { upgradeToPro } = usePro();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      // In a real app, you would verify this session ID with your backend
      // Since we don't have user accounts, we just trust the return and set local storage
      upgradeToPro();
      
      // Redirect to home after 3 seconds
      const timer = setTimeout(() => {
        navigate('/');
      }, 3000);
      
      return () => clearTimeout(timer);
    } else {
      navigate('/');
    }
  }, [searchParams, navigate, upgradeToPro]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 max-w-md w-full text-center animate-in fade-in zoom-in duration-500">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full mb-6">
          <CheckCircle2 size={48} />
        </div>
        
        <h1 className="text-3xl font-black text-slate-900 mb-4">Payment Successful!</h1>
        <p className="text-slate-600 mb-8">
          Thank you for upgrading to MindRecap Pro. Your account has been upgraded and all ads have been removed.
        </p>
        
        <div className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full">
          <Zap size={16} fill="currentColor" />
          Pro Features Unlocked
        </div>
        
        <p className="text-sm text-slate-400 mt-8">
          Redirecting you back to the app...
        </p>
      </div>
    </div>
  );
}
