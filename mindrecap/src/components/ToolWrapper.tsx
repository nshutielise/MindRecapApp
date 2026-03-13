import React, { useRef, useCallback } from 'react';
import { Copy, FileText, Upload, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface ToolWrapperProps {
  title: string;
  description: string;
  isPro: boolean;
  value: string;
  onChange: (val: string) => void;
  onAction: () => void;
  actionLabel: string;
  actionIcon: React.ReactNode;
  isProcessing: boolean;
  children?: React.ReactNode;
}

export function ToolWrapper({
  title,
  description,
  isPro,
  value,
  onChange,
  onAction,
  actionLabel,
  actionIcon,
  isProcessing,
  children
}: ToolWrapperProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const charLimit = isPro ? 10000 : 1000;
  const charCount = value.length;

  const [isUploading, setIsUploading] = React.useState(false);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      onChange(text.slice(0, charLimit));
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
    }
  }, [onChange, charLimit]);

  const handleSample = useCallback(() => {
    const sample = "Artificial intelligence (AI) is intelligence demonstrated by machines, as opposed to intelligence of humans and other animals. AI applications include advanced web search engines, recommendation systems, understanding human speech, self-driving cars, and generative or creative tools.";
    onChange(sample.slice(0, charLimit));
  }, [onChange, charLimit]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/parse-file', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        onChange(data.text.slice(0, charLimit));
      } else {
        alert(data.error || 'Failed to parse file.');
      }
    } catch (error) {
      console.error('File upload error:', error);
      alert('Network error occurred while uploading file.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [onChange, charLimit]);

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[500px]">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-800">{title}</h3>
            <p className="text-xs text-slate-500">{description}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onChange('')} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Clear">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 relative p-4">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value.slice(0, charLimit))}
            placeholder="Type or paste your text here..."
            className="w-full h-full resize-none outline-none text-slate-700 placeholder:text-slate-400 bg-transparent"
          />
        </div>

        <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePaste}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" /> Paste
            </button>
            <button 
              onClick={handleSample}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" /> Sample
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              {isUploading ? (
                <div className="w-3.5 h-3.5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".txt,.md,.csv,.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
              className="hidden" 
            />
          </div>
          <div className={cn("text-xs font-medium", charCount >= charLimit ? "text-red-500" : "text-slate-400")}>
            {charCount} / {charLimit}
          </div>
        </div>
      </div>

      <div className="flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[500px]">
        {children ? (
          children
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
              {actionIcon}
            </div>
            <h4 className="text-lg font-medium text-slate-800 mb-2">Ready to analyze</h4>
            <p className="text-sm text-slate-500 mb-6 max-w-xs">
              Enter your text on the left and click the button below to process your content.
            </p>
            <button
              onClick={onAction}
              disabled={!value.trim() || isProcessing}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : actionIcon}
              {actionLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
