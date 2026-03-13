import { useState } from 'react';
import { FileCheck, AlertCircle, CheckCircle } from 'lucide-react';
import { ToolWrapper } from './ToolWrapper';
import { motion } from 'motion/react';

export function PlagiarismChecker({ isPro }: { isPro: boolean }) {
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ similarity: number, matches: number } | null>(null);

  const handleCheck = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/plagiarism', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        alert(data.error || 'Failed to analyze text.');
      }
    } catch (error) {
      console.error(error);
      alert('Network error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolWrapper
      title="Plagiarism Checker"
      description="Scan billions of pages for duplicate content."
      isPro={isPro}
      value={text}
      onChange={(val) => { setText(val); if(result) setResult(null); }}
      onAction={handleCheck}
      actionLabel="Check Plagiarism"
      actionIcon={<FileCheck className="w-5 h-5" />}
      isProcessing={isProcessing}
    >
      {result && (
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Plagiarism Report</h3>
            <button onClick={() => setResult(null)} className="text-xs text-blue-600 hover:underline font-medium">
              New Scan
            </button>
          </div>
          
          <div className="flex-1 p-8 flex flex-col items-center justify-center">
            
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-40 h-40 rounded-full flex items-center justify-center mb-8"
              style={{
                background: `conic-gradient(${result.similarity > 20 ? '#ef4444' : '#10b981'} ${result.similarity}%, #f1f5f9 0)`
              }}
            >
              <div className="absolute inset-2 bg-white rounded-full flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-slate-900">{result.similarity}%</span>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Similarity</span>
              </div>
            </motion.div>

            <div className="w-full max-w-sm grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <div className="text-2xl font-bold text-slate-900 mb-1">{100 - result.similarity}%</div>
                <div className="text-xs font-medium text-slate-500 uppercase">Unique</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <div className="text-2xl font-bold text-slate-900 mb-1">{result.matches}</div>
                <div className="text-xs font-medium text-slate-500 uppercase">Sources Found</div>
              </div>
            </div>

            <div className={`w-full p-4 rounded-xl flex items-start gap-3 text-sm ${result.similarity > 20 ? 'bg-red-50 text-red-800' : 'bg-emerald-50 text-emerald-800'}`}>
              {result.similarity > 20 ? (
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
              )}
              <p>
                {result.similarity > 20 
                  ? "Significant similarity found. We recommend reviewing the highlighted sections and properly citing your sources."
                  : "Great job! Your text appears to be highly unique with minimal matching content found online."}
              </p>
            </div>

          </div>
        </div>
      )}
    </ToolWrapper>
  );
}
