import React, { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

interface SummarizerFormProps {
  onSubmit: (text: string, format: string) => void;
  isLoading: boolean;
  placeholder?: string;
  initialText?: string;
}

export default function SummarizerForm({ onSubmit, isLoading, placeholder, initialText = "" }: SummarizerFormProps) {
  const [text, setText] = useState(initialText);
  const [format, setFormat] = useState("short");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text, format);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder || "Paste your text, article, or notes here..."}
          className="w-full min-h-[300px] p-6 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none text-slate-700 leading-relaxed shadow-sm"
          disabled={isLoading}
        />
        <div className="absolute bottom-4 right-4 text-xs text-slate-400">
          {text.length} characters
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "short", label: "Short Summary" },
            { id: "bullet", label: "Bullet Points" },
            { id: "detailed", label: "Detailed" },
            { id: "takeaways", label: "Key Takeaways" },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setFormat(opt.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                format === opt.id
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <button
          type="submit"
          disabled={isLoading || !text.trim()}
          className="w-full md:w-auto bg-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Summarizing...
            </>
          ) : (
            <>
              <Sparkles size={20} />
              Summarize Now
            </>
          )}
        </button>
      </div>
    </form>
  );
}
