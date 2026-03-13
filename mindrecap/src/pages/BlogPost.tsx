import { useParams, Link, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Clock, User, Share2 } from "lucide-react";
import { BLOG_POSTS } from "./Blog";
import AdPlaceholder from "../components/AdPlaceholder";

export default function BlogPost() {
  const { slug } = useParams();
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <>
      <Helmet>
        <title>{post.title} - MindRecap Blog</title>
        <meta name="description" content={post.excerpt} />
      </Helmet>

      <div className="max-w-3xl mx-auto space-y-12 pb-24">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
          <ArrowLeft size={16} /> Back to Blog
        </Link>

        <article className="space-y-8">
          <header className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-slate-400 uppercase tracking-widest border-y border-slate-100 py-4">
              <span className="flex items-center gap-2"><Clock size={16} /> {post.date}</span>
              <span className="flex items-center gap-2"><User size={16} /> {post.author}</span>
              <button className="flex items-center gap-2 hover:text-indigo-600 transition-colors ml-auto">
                <Share2 size={16} /> Share
              </button>
            </div>
          </header>

          <div className="prose prose-slate prose-indigo max-w-none prose-headings:font-black prose-a:text-indigo-600">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </article>

        <section className="bg-slate-50 p-8 rounded-3xl border border-slate-100 text-center space-y-6">
          <h3 className="text-2xl font-bold text-slate-900">Ready to save time?</h3>
          <p className="text-slate-500">Try our AI summarizer today and get through your reading list faster than ever.</p>
          <Link to="/text-summarizer" className="inline-flex bg-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
            Start Summarizing Now
          </Link>
        </section>

        <AdPlaceholder type="banner" />
      </div>
    </>
  );
}
