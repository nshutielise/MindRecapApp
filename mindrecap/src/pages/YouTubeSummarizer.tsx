import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Youtube, Search, Loader2, Sparkles, AlertCircle, Clock } from "lucide-react";
import ResultCard from "../components/ResultCard";
import AffiliateSection from "../components/AffiliateSection";
import AdPlaceholder from "../components/AdPlaceholder";

export default function YouTubeSummarizer() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const [format, setFormat] = useState("short");

  const handleSummarize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setError("");
    setSummary("");
    setTranscript("");

    try {
      // 1. Fetch transcript
      const transcriptRes = await fetch("/api/youtube-transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      
      const transcriptData = await transcriptRes.json();
      if (transcriptData.error) throw new Error(transcriptData.error);

      if (transcriptData.hasTranscript) {
        setTranscript(transcriptData.transcript);
      }

      // 2. Summarize transcript or video
      const summarizeRes = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text: transcriptData.hasTranscript ? transcriptData.transcript : url, 
          format,
          type: "youtube",
          hasTranscript: transcriptData.hasTranscript
        }),
      });

      const summarizeData = await summarizeRes.json();
      if (summarizeData.error) throw new Error(summarizeData.error);

      setSummary(summarizeData.summary);
      
      // Scroll to result
      setTimeout(() => {
        document.getElementById("result-section")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err: any) {
      setError(err.message || "Failed to summarize video. Please check the URL and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>YouTube Video to Text & Summarizer - Extract Transcripts Instantly</title>
        <meta name="description" content="Paste a YouTube URL to get the full text transcript and an instant AI summary of the video. Perfect for students and researchers." />
      </Helmet>

      <div className="max-w-4xl mx-auto space-y-12">
        <section className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 text-red-600 rounded-2xl mb-4">
            <Youtube size={32} fill="currentColor" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">YouTube Video to Text</h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Convert any YouTube video into text. Get the full transcript and an AI summary in seconds. Designed for students to save time on lectures and research.
          </p>
        </section>

        <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50">
          <form onSubmit={handleSummarize} className="space-y-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-400">
                <Search size={20} />
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full pl-14 pr-6 py-5 rounded-2xl border border-slate-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all text-slate-700 shadow-sm text-lg"
                disabled={isLoading}
              />
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "short", label: "Short Summary" },
                  { id: "bullet", label: "Key Takeaways" },
                  { id: "detailed", label: "Detailed Recap" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFormat(opt.id)}
                    className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                      format === opt.id
                        ? "bg-red-600 text-white shadow-lg shadow-red-200"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={isLoading || !url.trim()}
                className="w-full md:w-auto bg-red-600 text-white px-10 py-4 rounded-full font-black hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-xl shadow-red-200"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Processing Video...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Summarize Video
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {error && (
          <div className="p-6 bg-red-50 border border-red-100 text-red-700 rounded-3xl flex items-start gap-4 animate-shake">
            <AlertCircle className="shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-bold mb-1">Oops! Something went wrong</p>
              <p className="text-sm opacity-90">{error}</p>
            </div>
          </div>
        )}

        <div id="result-section">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-24 space-y-6">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-red-100 border-t-red-600 rounded-full animate-spin"></div>
                <Youtube className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-600" size={24} fill="currentColor" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-xl font-bold text-slate-900">Extracting Transcript...</p>
                <p className="text-slate-500">This might take a moment for longer videos.</p>
              </div>
            </div>
          )}

          {summary && !isLoading && (
            <div className="space-y-12">
              <ResultCard 
                summary={summary} 
                onRegenerate={() => handleSummarize({ preventDefault: () => {} } as any)} 
              />
              
              {transcript && (
                <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                    <h3 className="text-2xl font-black text-slate-900">Full Video Transcript</h3>
                    <button
                      onClick={() => navigator.clipboard.writeText(transcript)}
                      className="text-slate-500 hover:text-slate-900 font-bold text-sm bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full transition-colors"
                    >
                      Copy Transcript
                    </button>
                  </div>
                  <div className="prose prose-slate max-w-none max-h-96 overflow-y-auto p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm leading-relaxed">
                    {transcript}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <AffiliateSection />

        <AdPlaceholder type="banner" />

        <section className="prose prose-slate max-w-none bg-slate-50 p-10 md:p-16 rounded-[3rem] border border-slate-100">
          <h2 className="text-3xl font-black text-slate-900 mb-6">Why summarize YouTube videos?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 not-prose">
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <Clock size={18} className="text-indigo-600" />
                Save Massive Time
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Turn a 30-minute educational video into a 2-minute read. Perfect for learning on the go.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <Search size={18} className="text-indigo-600" />
                Find Key Information
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Our AI identifies the most important parts of the video so you don't miss the core message.
              </p>
            </div>
          </div>
          <p className="mt-8">
            Note: This tool works best for videos that have transcripts or closed captions available. If a video is purely music or lacks a transcript, the summarization might not be possible.
          </p>
        </section>
      </div>
    </>
  );
}
