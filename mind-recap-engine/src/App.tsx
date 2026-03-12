import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Brain, Activity, BookOpen, Smartphone, Package, ArrowRight, Loader2 } from 'lucide-react';

interface ThemeRecap {
  theme: string;
  clarityScore: number;
  description: string;
}

interface Recommendation {
  productName: string;
  category: string;
  reason: string;
  url: string;
}

interface RecapResult {
  summary: string;
  sentiment: string;
  themes: ThemeRecap[];
  recommendations: Recommendation[];
}

export default function App() {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<RecapResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from server');
      }

      const parsedResult = await response.json() as RecapResult;
      setResult(parsedResult);
    } catch (err) {
      console.error(err);
      setError('Failed to process your brain dump. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('book')) return <BookOpen className="w-4 h-4" />;
    if (cat.includes('app') || cat.includes('software')) return <Smartphone className="w-4 h-4" />;
    return <Package className="w-4 h-4" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-emerald-400';
    if (score >= 5) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-indigo-500/30">
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        
        {/* Header */}
        <header className="mb-16 text-center">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-zinc-900/50 border border-zinc-800"
          >
            <Brain className="w-8 h-8 text-indigo-400" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-light tracking-tight text-white mb-4"
          >
            Mind Recap Engine
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-500 max-w-xl mx-auto text-lg"
          >
            Transform your unstructured thoughts into actionable clarity.
          </motion.p>
        </header>

        {/* Input Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-3xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
            <div className="relative bg-[#0a0a0a] border border-zinc-800 rounded-3xl overflow-hidden">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Dump your thoughts here... What's on your mind? What did you accomplish? What's stressing you out?"
                className="w-full h-48 md:h-64 bg-transparent text-zinc-200 placeholder-zinc-600 p-6 md:p-8 resize-none focus:outline-none text-lg leading-relaxed"
                spellCheck="false"
              />
              <div className="flex items-center justify-between p-4 md:px-8 md:py-6 bg-zinc-900/30 border-t border-zinc-800/50">
                <div className="text-xs font-mono text-zinc-600 uppercase tracking-wider">
                  {input.length} characters
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={isProcessing || !input.trim()}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Analyze
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm text-center">
              {error}
            </div>
          )}
        </motion.div>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {result && !isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-8"
            >
              {/* Top Row: Summary & Sentiment */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-[#0a0a0a] border border-zinc-800 rounded-3xl p-8">
                  <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4">The Week in Review</h2>
                  <p className="text-zinc-300 leading-relaxed text-lg">
                    {result.summary}
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-3xl p-8 flex flex-col justify-center items-center text-center relative overflow-hidden">
                  <Activity className="absolute -right-4 -bottom-4 w-32 h-32 text-indigo-500/5" />
                  <h2 className="text-xs font-mono text-indigo-400/70 uppercase tracking-widest mb-2">Primary State</h2>
                  <div className="text-3xl font-light text-white tracking-tight">
                    {result.sentiment}
                  </div>
                </div>
              </div>

              {/* The Recap Table */}
              <div className="bg-[#0a0a0a] border border-zinc-800 rounded-3xl overflow-hidden">
                <div className="p-8 border-b border-zinc-800">
                  <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Theme Recap & Clarity</h2>
                </div>
                <div className="divide-y divide-zinc-800/50">
                  {result.themes.map((theme, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * idx }}
                      key={idx} 
                      className="p-6 md:p-8 grid md:grid-cols-12 gap-6 items-center hover:bg-zinc-900/30 transition-colors"
                    >
                      <div className="md:col-span-3">
                        <div className="text-lg font-medium text-zinc-200">{theme.theme}</div>
                      </div>
                      <div className="md:col-span-7">
                        <p className="text-zinc-400 text-sm leading-relaxed">{theme.description}</p>
                      </div>
                      <div className="md:col-span-2 flex items-center md:justify-end gap-3">
                        <div className="text-xs font-mono text-zinc-600 uppercase">Clarity</div>
                        <div className={`text-2xl font-light ${getScoreColor(theme.clarityScore)}`}>
                          {theme.clarityScore}<span className="text-sm text-zinc-600">/10</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Affiliate Recommendations */}
              <div className="bg-[#0a0a0a] border border-zinc-800 rounded-3xl p-8">
                <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-8">Curated Solutions</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {result.recommendations.map((rec, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + (0.1 * idx) }}
                      key={idx} 
                      className="group relative bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-colors flex flex-col h-full"
                    >
                      <div className="flex items-center gap-2 mb-4 text-zinc-400">
                        {getCategoryIcon(rec.category)}
                        <span className="text-xs font-mono uppercase tracking-wider">{rec.category}</span>
                      </div>
                      <h3 className="text-xl font-medium text-white mb-3">{rec.productName}</h3>
                      <p className="text-sm text-zinc-500 leading-relaxed flex-grow mb-6">
                        {rec.reason}
                      </p>
                      <a 
                        href={rec.url} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors mt-auto"
                      >
                        Explore {rec.productName}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </a>
                    </motion.div>
                  ))}
                </div>
              </div>
              
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
