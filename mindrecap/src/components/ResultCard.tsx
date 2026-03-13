import React from "react";
import ReactMarkdown from "react-markdown";
import { Copy, Check, RotateCcw } from "lucide-react";
import { useState } from "react";

interface ResultCardProps {
  summary: string;
  onRegenerate: () => void;
}

export default function ResultCard({ summary, onRegenerate }: ResultCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
          Your Summary
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="p-2 hover:bg-white rounded-lg transition-colors text-slate-500 hover:text-indigo-600 flex items-center gap-2 text-sm font-medium"
            title="Copy to clipboard"
          >
            {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={onRegenerate}
            className="p-2 hover:bg-white rounded-lg transition-colors text-slate-500 hover:text-indigo-600 flex items-center gap-2 text-sm font-medium"
            title="Regenerate summary"
          >
            <RotateCcw size={18} />
            Regenerate
          </button>
        </div>
      </div>
      <div className="p-8 prose prose-slate max-w-none">
        <ReactMarkdown>{summary}</ReactMarkdown>
      </div>
    </div>
  );
}
