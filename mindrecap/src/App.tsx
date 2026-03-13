import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import TextSummarizer from "./pages/TextSummarizer";
import ArticleSummarizer from "./pages/ArticleSummarizer";
import NotesSummarizer from "./pages/NotesSummarizer";
import ParagraphSummarizer from "./pages/ParagraphSummarizer";
import YouTubeSummarizer from "./pages/YouTubeSummarizer";
import PlagiarismChecker from "./pages/PlagiarismChecker";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Contact from "./pages/Contact";
import Disclaimer from "./pages/Disclaimer";
import Success from "./pages/Success";
import { ProProvider } from "./context/ProContext";
import ProModal from "./components/ProModal";

export default function App() {
  return (
    <HelmetProvider>
      <ProProvider>
        <Router>
          <Layout>
            <ProModal />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/text-summarizer" element={<TextSummarizer />} />
              <Route path="/article-summarizer" element={<ArticleSummarizer />} />
              <Route path="/notes-summarizer" element={<NotesSummarizer />} />
              <Route path="/paragraph-summarizer" element={<ParagraphSummarizer />} />
              <Route path="/youtube-video-summarizer" element={<YouTubeSummarizer />} />
              <Route path="/plagiarism-checker" element={<PlagiarismChecker />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/disclaimer" element={<Disclaimer />} />
              <Route path="/success" element={<Success />} />
            </Routes>
          </Layout>
        </Router>
      </ProProvider>
    </HelmetProvider>
  );
}
