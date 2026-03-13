import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, ShieldAlert, Globe, Clock, Sparkles, GraduationCap, Youtube } from "lucide-react";
import AdPlaceholder from "../components/AdPlaceholder";

export default function Home() {
  return (
    <>
      <Helmet>
        <title>MindRecap - The Ultimate AI Toolkit for Students & Researchers</title>
        <meta name="description" content="Check for plagiarism, convert YouTube videos to text, and summarize articles instantly. The perfect free tools for students and researchers." />
      </Helmet>

      <div className="space-y-24 pb-24">
        {/* Hero Section */}
        <section className="text-center pt-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 text-sm font-bold mb-8 animate-bounce">
            <GraduationCap size={16} />
            Designed for Students Worldwide
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-6 leading-[1.1]">
            Study Smarter, <br />
            <span className="text-indigo-600">Not Harder.</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            The ultimate free AI toolkit for students and researchers. Check assignments for plagiarism, convert lectures to text, and summarize research papers instantly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/plagiarism-checker" className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2">
              <ShieldAlert size={20} /> Check Plagiarism
            </Link>
            <Link to="/youtube-video-summarizer" className="w-full sm:w-auto bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-full text-lg font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
              <Youtube size={20} className="text-red-600" /> YouTube to Text
            </Link>
          </div>
        </section>

        <AdPlaceholder type="banner" />

        {/* Features Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-indigo-100 transition-colors">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm mb-6">
              <ShieldAlert size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Plagiarism Remover</h3>
            <p className="text-slate-500 leading-relaxed">
              Detect unoriginal content in your essays and automatically rewrite it to be 100% unique and plagiarism-free.
            </p>
          </div>
          <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-indigo-100 transition-colors">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-600 shadow-sm mb-6">
              <Youtube size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">YouTube to Text</h3>
            <p className="text-slate-500 leading-relaxed">
              Convert long video lectures and tutorials into readable text transcripts and concise summaries instantly.
            </p>
          </div>
          <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-indigo-100 transition-colors">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm mb-6">
              <Zap size={24} fill="currentColor" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Completely Free</h3>
            <p className="text-slate-500 leading-relaxed">
              Our core tools are 100% free for students globally. Optional Pro upgrade available to remove ads.
            </p>
          </div>
        </section>

        {/* Tools Showcase */}
        <section className="bg-indigo-900 rounded-[3rem] p-12 md:p-20 text-white overflow-hidden relative">
          <div className="relative z-10 max-w-3xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
              One Platform, <br />
              All Your Study Tools.
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: "Plagiarism Checker", path: "/plagiarism-checker", icon: ShieldAlert },
                { name: "YouTube to Text", path: "/youtube-video-summarizer", icon: Youtube },
                { name: "Article Summarizer", path: "/article-summarizer", icon: Globe },
                { name: "Text Summarizer", path: "/text-summarizer", icon: Zap },
              ].map((tool) => (
                <Link
                  key={tool.name}
                  to={tool.path}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-2xl hover:bg-white/20 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <tool.icon size={20} className="text-indigo-200" />
                    <span className="font-bold">{tool.name}</span>
                  </div>
                  <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
                </Link>
              ))}
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/10 rounded-full blur-2xl -ml-32 -mb-32"></div>
        </section>

        {/* Stats Section */}
        <section className="text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-black text-slate-900 mb-2">1M+</div>
              <div className="text-slate-500 text-sm font-medium uppercase tracking-widest">Summaries</div>
            </div>
            <div>
              <div className="text-4xl font-black text-slate-900 mb-2">99%</div>
              <div className="text-slate-500 text-sm font-medium uppercase tracking-widest">Accuracy</div>
            </div>
            <div>
              <div className="text-4xl font-black text-slate-900 mb-2">50k+</div>
              <div className="text-slate-500 text-sm font-medium uppercase tracking-widest">Users</div>
            </div>
            <div>
              <div className="text-4xl font-black text-slate-900 mb-2">&lt;3s</div>
              <div className="text-slate-500 text-sm font-medium uppercase tracking-widest">Speed</div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
