import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-100 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="text-xl font-bold text-slate-900 mb-4 block">MindRecap</Link>
            <p className="text-slate-500 text-sm max-w-xs">
              The ultimate AI-powered summarization tool for students, researchers, and professionals. Save time and get the gist instantly.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wider">Tools</h4>
            <ul className="space-y-2">
              <li><Link to="/plagiarism-checker" className="text-slate-500 hover:text-indigo-600 text-sm">Plagiarism Checker</Link></li>
              <li><Link to="/youtube-video-summarizer" className="text-slate-500 hover:text-indigo-600 text-sm">YouTube to Text</Link></li>
              <li><Link to="/text-summarizer" className="text-slate-500 hover:text-indigo-600 text-sm">Text Summarizer</Link></li>
              <li><Link to="/article-summarizer" className="text-slate-500 hover:text-indigo-600 text-sm">Article Summarizer</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/privacy-policy" className="text-slate-500 hover:text-indigo-600 text-sm">Privacy Policy</Link></li>
              <li><Link to="/contact" className="text-slate-500 hover:text-indigo-600 text-sm">Contact</Link></li>
              <li><Link to="/disclaimer" className="text-slate-500 hover:text-indigo-600 text-sm">Disclaimer</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-200 pt-8 flex flex-col md:row justify-between items-center gap-4">
          <p className="text-slate-400 text-xs">
            © {new Date().getFullYear()} MindRecap. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-slate-400 hover:text-slate-600 transition-colors">
              <span className="sr-only">Twitter</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
