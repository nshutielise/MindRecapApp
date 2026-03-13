import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const faqs = [
  {
    question: "How accurate is the AI Detector?",
    answer: "Our multi-model AI detector utilizes advanced algorithms analyzing patterns from GPT-4, Claude, and Gemini. It achieves over 98% accuracy in distinguishing between human-written and AI-generated text by evaluating perplexity and burstiness."
  },
  {
    question: "Do you store my data or text submissions?",
    answer: "No. We prioritize your privacy and confidentiality. All text processing is done in real-time, and we do not store, log, or use your submitted content to train our models. Your data remains entirely yours."
  },
  {
    question: "How does the AI Humanizer work?",
    answer: "The AI Humanizer rewrites AI-generated text to introduce natural human variations in sentence structure, vocabulary, and rhythm. It reduces predictability (perplexity) and increases structural variation (burstiness) to bypass AI detectors while maintaining the original meaning."
  },
  {
    question: "What is the character limit for the free tier?",
    answer: "Guest users on the free tier can process up to 1,000 characters per request. Upgrading to MindRecap Pro increases this limit to 10,000 characters and removes all advertisements."
  },
  {
    question: "Can the Plagiarism Checker scan uploaded files?",
    answer: "Yes, our Plagiarism Checker supports direct text input as well as file uploads (.txt, .md, .csv). It compares your content against billions of web pages and academic databases to provide a comprehensive Similarity Score."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-16 max-w-3xl mx-auto w-full px-4">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
        <p className="text-slate-600">Everything you need to know about MindRecap and our integrity tools.</p>
      </div>
      
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div 
            key={index}
            className="border border-slate-200 rounded-2xl overflow-hidden bg-white"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-slate-50 transition-colors"
            >
              <span className="font-medium text-slate-900">{faq.question}</span>
              <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform duration-200", openIndex === index && "rotate-180")} />
            </button>
            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="p-5 pt-0 text-slate-600 leading-relaxed">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}
