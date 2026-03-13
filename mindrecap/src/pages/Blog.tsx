import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, User } from "lucide-react";
import AdPlaceholder from "../components/AdPlaceholder";

export const BLOG_POSTS = [
  {
    slug: "how-to-summarize-articles-faster",
    title: "How to Summarize Articles Faster with AI",
    excerpt: "Learn the best techniques to get through your reading list in record time using AI tools.",
    date: "2024-03-15",
    author: "MindRecap Team",
    content: `
# How to Summarize Articles Faster with AI

In today's information-heavy world, we're constantly bombarded with articles, reports, and news. Staying informed can feel like a full-time job. This is where AI summarization comes in.

## Why Use AI for Summarization?

AI tools like MindRecap use advanced natural language processing to identify the core message of any text. This allows you to:

1. **Save Time:** Read a 2,000-word article in under 2 minutes.
2. **Improve Focus:** Get the main points without the fluff.
3. **Better Retention:** Focus on the key takeaways that matter.

## Best Practices for AI Summarization

- **Choose the Right Format:** Use bullet points for quick scanning or detailed summaries for deep understanding.
- **Verify Key Facts:** While AI is accurate, always double-check critical data points.
- **Combine Tools:** Use our YouTube summarizer for video content and the text summarizer for articles.

By integrating these tools into your daily workflow, you can stay ahead of the curve without feeling overwhelmed.
    `
  },
  {
    slug: "best-ai-summarizer-tools",
    title: "Best AI Summarizer Tools for Students in 2024",
    excerpt: "A comprehensive guide to the top AI tools that help students study more efficiently.",
    date: "2024-03-10",
    author: "Alex Chen",
    content: `
# Best AI Summarizer Tools for Students in 2024

Studying for exams often involves reading hundreds of pages of textbooks and lecture notes. AI summarizers are changing the game for students worldwide.

## Top Tools to Consider

1. **MindRecap:** Best for universal text and YouTube video summarization.
2. **Notion AI:** Great for summarizing notes already in your workspace.
3. **Grammarly:** Useful for summarizing and improving your own writing.

## How Students Can Use Summarizers

- **Lecture Recap:** Paste your messy lecture notes to get a clean summary.
- **Research:** Quickly scan academic papers to see if they're relevant to your thesis.
- **Exam Prep:** Create concise study guides from long chapters.

Using these tools responsibly can significantly enhance your learning experience and academic performance.
    `
  },
  {
    slug: "how-students-can-recap-notes-quickly",
    title: "How Students Can Recap Notes Quickly",
    excerpt: "Master the art of note-taking and summarization to ace your next exam.",
    date: "2024-03-05",
    author: "Sarah Miller",
    content: `
# How Students Can Recap Notes Quickly

Taking notes is only half the battle. The real learning happens when you review and recap those notes. Here's how to do it efficiently.

## The 3-Step Recap Method

1. **Capture:** Take comprehensive notes during your lecture.
2. **Clean:** Use an AI tool to remove redundancies and organize the flow.
3. **Review:** Focus your study sessions on the generated summary and key takeaways.

## Why Recapping Matters

Recapping forces your brain to process information at a deeper level. By focusing on the "gist" of the material, you build stronger neural connections and improve long-term retention.

Don't let your notes gather digital dust. Use MindRecap to turn them into valuable study assets today.
    `
  }
];

export default function Blog() {
  return (
    <>
      <Helmet>
        <title>MindRecap Blog - AI Tips, Productivity & More</title>
        <meta name="description" content="Read the latest articles on AI summarization, productivity hacks, and study tips from the MindRecap team." />
      </Helmet>

      <div className="max-w-4xl mx-auto space-y-12">
        <section className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">MindRecap Blog</h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Insights, tips, and guides to help you work smarter and learn faster.
          </p>
        </section>

        <div className="grid grid-cols-1 gap-8">
          {BLOG_POSTS.map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="group bg-white p-8 rounded-3xl border border-slate-100 hover:border-indigo-200 hover:shadow-xl transition-all flex flex-col md:flex-row gap-8"
            >
              <div className="flex-grow space-y-4">
                <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <span className="flex items-center gap-1"><Clock size={14} /> {post.date}</span>
                  <span className="flex items-center gap-1"><User size={14} /> {post.author}</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {post.title}
                </h2>
                <p className="text-slate-500 leading-relaxed">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                  Read Article <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <AdPlaceholder type="banner" />
      </div>
    </>
  );
}
