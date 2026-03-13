import { Link } from "react-router-dom";
import { Zap, ShieldAlert } from "lucide-react";
import { usePro } from "../context/ProContext";

export default function Header() {
  const { isPro, setShowUpgradeModal } = usePro();

  return (
    <header className="border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-5xl">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white group-hover:bg-indigo-700 transition-colors">
            <Zap size={18} fill="currentColor" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">MindRecap</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Home</Link>
          <div className="relative group">
            <button className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-1">
              Tools
            </button>
            <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-slate-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform translate-y-2 group-hover:translate-y-0 p-2">
              <Link to="/plagiarism-checker" className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg flex items-center gap-2">
                <ShieldAlert size={16} className="text-blue-600" />
                Plagiarism Checker
              </Link>
              <Link to="/youtube-video-summarizer" className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">YouTube to Text</Link>
              <Link to="/text-summarizer" className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">Text Summarizer</Link>
              <Link to="/article-summarizer" className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">Article Summarizer</Link>
            </div>
          </div>
          <Link to="/blog" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Blog</Link>
        </nav>

        <div className="flex items-center gap-4">
          {!isPro ? (
            <button 
              onClick={() => setShowUpgradeModal(true)}
              className="hidden md:flex items-center gap-1.5 text-sm font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 px-4 py-2 rounded-full transition-colors"
            >
              <Zap size={16} fill="currentColor" />
              Upgrade to Pro
            </button>
          ) : (
            <span className="hidden md:flex items-center gap-1.5 text-sm font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full">
              <Zap size={16} fill="currentColor" />
              Pro Active
            </span>
          )}
          <Link to="/plagiarism-checker" className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
