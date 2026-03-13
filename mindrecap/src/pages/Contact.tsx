import { Helmet } from "react-helmet-async";
import { Mail, MessageSquare, Globe } from "lucide-react";

export default function Contact() {
  return (
    <>
      <Helmet>
        <title>Contact Us - MindRecap</title>
      </Helmet>
      <div className="max-w-3xl mx-auto space-y-12 py-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-black text-slate-900">Get in Touch</h1>
          <p className="text-lg text-slate-500">Have questions or feedback? We'd love to hear from you.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-white border border-slate-100 rounded-3xl text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
              <Mail size={24} />
            </div>
            <h3 className="font-bold text-slate-900">Email</h3>
            <p className="text-sm text-slate-500">support@mindrecap.app</p>
          </div>
          <div className="p-8 bg-white border border-slate-100 rounded-3xl text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
              <MessageSquare size={24} />
            </div>
            <h3 className="font-bold text-slate-900">Support</h3>
            <p className="text-sm text-slate-500">Help Center</p>
          </div>
          <div className="p-8 bg-white border border-slate-100 rounded-3xl text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
              <Globe size={24} />
            </div>
            <h3 className="font-bold text-slate-900">Social</h3>
            <p className="text-sm text-slate-500">@MindRecap</p>
          </div>
        </div>

        <form className="bg-slate-50 p-8 md:p-12 rounded-[3rem] border border-slate-100 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Name</label>
              <input type="text" className="w-full p-4 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all" placeholder="Your Name" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Email</label>
              <input type="email" className="w-full p-4 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all" placeholder="your@email.com" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Message</label>
            <textarea className="w-full p-4 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all min-h-[150px]" placeholder="How can we help?"></textarea>
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-full font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
            Send Message
          </button>
        </form>
      </div>
    </>
  );
}
