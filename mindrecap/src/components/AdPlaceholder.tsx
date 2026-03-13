import React from 'react';
import { usePro } from '../context/ProContext';

interface AdPlaceholderProps {
  type?: 'banner' | 'sidebar' | 'in-content';
}

export default function AdPlaceholder({ type = 'banner' }: AdPlaceholderProps) {
  const { isPro, setShowUpgradeModal } = usePro();

  if (isPro) return null;

  const heights = {
    banner: 'h-32',
    sidebar: 'h-96',
    'in-content': 'h-64'
  };

  return (
    <div className={`w-full ${heights[type]} bg-slate-100 border border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 relative overflow-hidden group my-8`}>
      <div className="absolute top-2 right-2 text-[10px] uppercase tracking-wider font-bold bg-slate-200 px-2 py-1 rounded text-slate-500">
        Advertisement
      </div>
      <span className="text-sm font-medium mb-2">Ad Space</span>
      <button 
        onClick={() => setShowUpgradeModal(true)}
        className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-100"
      >
        Upgrade to Remove Ads
      </button>
    </div>
  );
}
