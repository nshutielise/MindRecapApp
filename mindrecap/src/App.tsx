/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, lazy, Suspense } from 'react';
import { Shield, Lock, Zap } from 'lucide-react';
import { cn } from './lib/utils';
import { AdsContainer } from './components/AdsContainer';
import { GoProModal } from './components/GoProModal';
import { FAQ } from './components/FAQ';

// Lazy load heavy tool components to reduce initial bundle size
const AIDetector = lazy(() => import('./components/AIDetector').then(module => ({ default: module.AIDetector })));
const PlagiarismChecker = lazy(() => import('./components/PlagiarismChecker').then(module => ({ default: module.PlagiarismChecker })));
const AIHumanizer = lazy(() => import('./components/AIHumanizer').then(module => ({ default: module.AIHumanizer })));

type ToolType = 'detector' | 'plagiarism' | 'humanizer';

export default function App() {
  const [activeTool, setActiveTool] = useState<ToolType>('detector');
  const [isPro, setIsPro] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetch('/api/status')
      .then(res => res.json())
      .then(data => setIsPro(data.isPro))
      .catch(console.error);

    const query = new URLSearchParams(window.location.search);
    if (query.get('success') === 'true') {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900 flex flex-col">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-600">
            <Shield className="w-7 h-7" />
            <span className="text-xl font-bold text-slate-900 tracking-tight">MindRecap</span>
          </div>
          
          <div className="flex items-center gap-4">
            {!isPro ? (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-full text-sm font-medium shadow-sm shadow-blue-500/20 transition-all hover:shadow-md hover:shadow-blue-500/30"
              >
                <Zap className="w-4 h-4" />
                Go Pro
              </button>
            ) : (
              <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5" />
                Pro Active
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        
        {!isPro && <AdsContainer className="my-6" />}

        <div className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            Professional Content Integrity
          </h1>
          <p className="text-lg text-slate-600">
            Ensure your content is original, human-written, and ready for publishing with our suite of advanced analysis tools.
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-slate-200/50 p-1 rounded-xl">
            <button
              onClick={() => setActiveTool('detector')}
              className={cn(
                "px-5 py-2.5 rounded-lg text-sm font-medium transition-all",
                activeTool === 'detector' ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
              )}
            >
              AI Detector
            </button>
            <button
              onClick={() => setActiveTool('plagiarism')}
              className={cn(
                "px-5 py-2.5 rounded-lg text-sm font-medium transition-all",
                activeTool === 'plagiarism' ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
              )}
            >
              Plagiarism Checker
            </button>
            <button
              onClick={() => setActiveTool('humanizer')}
              className={cn(
                "px-5 py-2.5 rounded-lg text-sm font-medium transition-all",
                activeTool === 'humanizer' ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
              )}
            >
              AI Humanizer
            </button>
          </div>
        </div>

        <div className="mb-12 min-h-[500px]">
          <Suspense fallback={
            <div className="w-full h-[500px] flex items-center justify-center bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          }>
            {activeTool === 'detector' && <AIDetector isPro={isPro} />}
            {activeTool === 'plagiarism' && <PlagiarismChecker isPro={isPro} />}
            {activeTool === 'humanizer' && <AIHumanizer isPro={isPro} />}
          </Suspense>
        </div>

        {!isPro && <AdsContainer className="my-6" />}

        <FAQ />

      </main>

      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-slate-400">
            <Shield className="w-6 h-6" />
            <span className="text-lg font-bold text-slate-900">MindRecap</span>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-full">
            <Lock className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium text-slate-700">Safe & Secure</span>
          </div>

          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} MindRecap. All rights reserved.
          </p>
        </div>
      </footer>

      <GoProModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
