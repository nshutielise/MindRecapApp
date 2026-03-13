import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import SummarizerForm from "../components/SummarizerForm";
import ResultCard from "../components/ResultCard";
import AffiliateSection from "../components/AffiliateSection";
import AdPlaceholder from "../components/AdPlaceholder";

interface ToolPageProps {
  title: string;
  description: string;
  h1: string;
  p: string;
  placeholder?: string;
}

export default function ToolPage({ title, description, h1, p, placeholder }: ToolPageProps) {
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastInput, setLastInput] = useState({ text: "", format: "" });

  const handleSummarize = async (text: string, format: string) => {
    setIsLoading(true);
    setError("");
    setLastInput({ text, format });
    
    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, format }),
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      setSummary(data.summary);
      // Scroll to result
      setTimeout(() => {
        document.getElementById("result-section")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Helmet>

      <div className="max-w-4xl mx-auto space-y-12">
        <section className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">{h1}</h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">{p}</p>
        </section>

        <section className="space-y-8">
          <SummarizerForm 
            onSubmit={handleSummarize} 
            isLoading={isLoading} 
            placeholder={placeholder}
            initialText={lastInput.text}
          />

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium animate-shake">
              {error}
            </div>
          )}

          <div id="result-section">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium animate-pulse">AI is reading and summarizing...</p>
              </div>
            )}

            {summary && !isLoading && (
              <div className="space-y-8">
                <ResultCard 
                  summary={summary} 
                  onRegenerate={() => handleSummarize(lastInput.text, lastInput.format)} 
                />
              </div>
            )}
          </div>
        </section>

        <AffiliateSection />

        <AdPlaceholder type="banner" />

        <section className="prose prose-slate max-w-none bg-slate-50 p-8 md:p-12 rounded-[2rem] border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900">How to use the {h1}</h2>
          <p>
            Using our AI-powered summarizer is simple and efficient. Just follow these three easy steps:
          </p>
          <ol>
            <li><strong>Paste your content:</strong> Copy the text you want to summarize and paste it into the large text area above.</li>
            <li><strong>Choose your format:</strong> Select whether you want a short summary, bullet points, a detailed breakdown, or key takeaways.</li>
            <li><strong>Get results:</strong> Click the "Summarize Now" button and watch as our AI generates your summary in seconds.</li>
          </ol>
          <p>
            Our tool uses advanced natural language processing to ensure that the most important information is preserved while removing fluff and redundant details.
          </p>
        </section>
      </div>
    </>
  );
}
