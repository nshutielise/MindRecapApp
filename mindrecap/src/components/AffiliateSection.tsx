import { ExternalLink, BookOpen, Layout, PenTool } from "lucide-react";

export default function AffiliateSection() {
  const tools = [
    {
      name: "Grammarly",
      description: "Improve your writing with AI-powered suggestions.",
      icon: <PenTool size={20} className="text-emerald-500" />,
      link: "https://grammarly.com",
      tag: "Writing"
    },
    {
      name: "Notion",
      description: "The all-in-one workspace for notes and collaboration.",
      icon: <Layout size={20} className="text-slate-900" />,
      link: "https://notion.so",
      tag: "Productivity"
    },
    {
      name: "Udemy",
      description: "Master new skills with online courses from experts.",
      icon: <BookOpen size={20} className="text-indigo-500" />,
      link: "https://udemy.com",
      tag: "Learning"
    }
  ];

  return (
    <section className="mt-12 pt-12 border-t border-slate-100">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold text-slate-900">Recommended Productivity Tools</h3>
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Affiliate Partners</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <a
            key={tool.name}
            href={tool.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white p-6 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-indigo-50 transition-colors">
                {tool.icon}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-1 rounded">
                {tool.tag}
              </span>
            </div>
            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
              {tool.name}
              <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </h4>
            <p className="text-sm text-slate-500 leading-relaxed">
              {tool.description}
            </p>
          </a>
        ))}
      </div>
    </section>
  );
}
