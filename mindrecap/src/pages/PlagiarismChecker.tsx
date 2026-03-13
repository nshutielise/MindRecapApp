import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { ShieldAlert, RefreshCw, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import AdPlaceholder from "../components/AdPlaceholder";

export default function PlagiarismChecker() {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState("");
  const [isRewriting, setIsRewriting] = useState(false);
  const [rewrittenText, setRewrittenText] = useState("");
  const [error, setError] = useState("");

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsLoading(true);
    setError("");
    setResult("");
    setRewrittenText("");

    try {
      const res = await fetch("/api/plagiarism-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, action: "check" }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setResult(data.result);
      
      setTimeout(() => {
        document.getElementById("result-section")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err: any) {
      setError(err.message || "Failed to check text. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRewrite = async () => {
    if (!text.trim()) return;

    setIsRewriting(true);
    setError("");

    try {
      const res = await fetch("/api/plagiarism-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, action: "rewrite" }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setRewrittenText(data.result);
      
      setTimeout(() => {
        document.getElementById("rewrite-section")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err: any) {
      setError(err.message || "Failed to rewrite text. Please try again.");
    } finally {
      setIsRewriting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Plagiarism Checker & Remover for Students</title>
        <meta name="description" content="Check your assignments and essays for plagiarism and automatically rewrite them to be 100% original." />
      </Helmet>

      <div className="max-w-4xl mx-auto space-y-12">
        <section className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl mb-4">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Plagiarism Checker & Remover</h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Designed for students and researchers. Detect unoriginal content in your assignments and rewrite it to be 100% unique.
          </p>
        </section>

        <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50">
          <form onSubmit={handleCheck} className="space-y-6">
            <div>
              <label htmlFor="text" className="block text-sm font-bold text-slate-700 mb-2">
                Paste your essay, assignment, or research paper:
              </label>
              <textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter the text you want to check for plagiarism..."
                className="w-full h-64 p-6 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-700 shadow-sm text-lg resize-none"
                disabled={isLoading || isRewriting}
              />
              <div className="text-right mt-2 text-sm text-slate-400 font-medium">
                {text.length} characters
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-end">
              <button
                type="submit"
                disabled={isLoading || isRewriting || !text.trim()}
                className="bg-blue-600 text-white px-8 py-4 rounded-full font-black hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-200"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <ShieldAlert size={20} />
                    Check for Plagiarism
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {error && (
          <div className="p-6 bg-red-50 border border-red-100 text-red-700 rounded-3xl flex items-start gap-4">
            <ShieldAlert className="shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-bold mb-1">Oops! Something went wrong</p>
              <p className="text-sm opacity-90">{error}</p>
            </div>
          </div>
        )}

        <div id="result-section">
          {result && !isLoading && (
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 space-y-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                  <ShieldAlert className="text-blue-600" />
                  Plagiarism Report
                </h3>
              </div>
              <div className="prose prose-slate max-w-none prose-p:leading-relaxed prose-headings:font-bold prose-a:text-blue-600">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
              
              <div className="pt-6 border-t border-slate-100 flex flex-col items-center text-center space-y-4">
                <p className="text-slate-600 font-medium">Want to make this text 100% original?</p>
                <button
                  onClick={handleRewrite}
                  disabled={isRewriting}
                  className="bg-emerald-600 text-white px-8 py-4 rounded-full font-black hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-200 w-full md:w-auto"
                >
                  {isRewriting ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Rewriting...
                    </>
                  ) : (
                    <>
                      <RefreshCw size={20} />
                      Rewrite to Remove Plagiarism
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <div id="rewrite-section">
          {rewrittenText && !isRewriting && (
            <div className="bg-emerald-50 p-8 md:p-10 rounded-[2.5rem] border border-emerald-100 shadow-xl shadow-emerald-100/50 space-y-6 mt-8">
              <div className="flex items-center justify-between border-b border-emerald-200/50 pb-6">
                <h3 className="text-2xl font-black text-emerald-900 flex items-center gap-3">
                  <CheckCircle2 className="text-emerald-600" />
                  100% Original Text
                </h3>
                <button
                  onClick={() => navigator.clipboard.writeText(rewrittenText)}
                  className="text-emerald-700 hover:text-emerald-900 font-bold text-sm bg-emerald-100 hover:bg-emerald-200 px-4 py-2 rounded-full transition-colors"
                >
                  Copy Text
                </button>
              </div>
              <div className="prose prose-emerald max-w-none prose-p:leading-relaxed">
                <ReactMarkdown>{rewrittenText}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        <AdPlaceholder type="banner" />
      </div>
    </>
  );
}
