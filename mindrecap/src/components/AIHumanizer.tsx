import { useState } from 'react';
import { RefreshCw, Copy, Check } from 'lucide-react';
import { ToolWrapper } from './ToolWrapper';

export function AIHumanizer({ isPro }: { isPro: boolean }) {
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleHumanize = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/humanize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data.result);
      } else {
        alert(data.error || 'Failed to humanize text.');
      }
    } catch (error) {
      console.error(error);
      alert('Network error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <ToolWrapper
      title="AI Humanizer"
      description="Rewrite AI text to bypass detectors naturally."
      isPro={isPro}
      value={text}
      onChange={(val) => { setText(val); if(result) setResult(null); }}
      onAction={handleHumanize}
      actionLabel="Humanize Text"
      actionIcon={<RefreshCw className="w-5 h-5" />}
      isProcessing={isProcessing}
    >
      {result && (
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Humanized Output</h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button onClick={() => setResult(null)} className="text-xs text-blue-600 hover:underline font-medium ml-2">
                New Rewrite
              </button>
            </div>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="prose prose-slate prose-sm max-w-none">
              {result.split('\n').map((paragraph, i) => (
                <p key={i} className="text-slate-700 leading-relaxed mb-4 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </ToolWrapper>
  );
}
