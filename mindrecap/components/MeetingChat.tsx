import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { RecordingSession, ChatMessage, MeetingAnalysis } from '../types';
import { createMeetingChatSession } from '../services/geminiService';
import { generatePDF, generateWord } from '../utils/documentGenerator';

interface MeetingChatProps {
  recording: RecordingSession;
  analysis: MeetingAnalysis;
}

export const MeetingChat: React.FC<MeetingChatProps> = ({ recording, analysis }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chatSessionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initChat = async () => {
      try {
        setIsInitializing(true);
        const chat = await createMeetingChatSession(recording.blob, analysis.sessionType as any);
        chatSessionRef.current = chat;
        setMessages([
          {
            role: 'model',
            content: "I'm ready to answer questions about this recording.",
            timestamp: Date.now()
          }
        ]);
      } catch (err) {
        console.error("Failed to initialize chat", err);
        setError("Failed to initialize knowledge assistant.");
      } finally {
        setIsInitializing(false);
      }
    };

    initChat();
  }, [recording.blob]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chatSessionRef.current || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Check for download commands
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes('download') && (lowerInput.includes('pdf') || lowerInput.includes('word') || lowerInput.includes('doc'))) {
      try {
        if (lowerInput.includes('pdf')) {
          generatePDF(analysis);
          setMessages(prev => [...prev, {
            role: 'model',
            content: "I've generated the PDF for you. The download should start automatically.",
            timestamp: Date.now()
          }]);
        } else if (lowerInput.includes('word') || lowerInput.includes('doc')) {
          generateWord(analysis);
          setMessages(prev => [...prev, {
            role: 'model',
            content: "I've generated the Word document for you. The download should start automatically.",
            timestamp: Date.now()
          }]);
        }
        setIsLoading(false);
        return;
      } catch (err) {
        console.error("Download error", err);
        setMessages(prev => [...prev, {
          role: 'model',
          content: "I tried to generate the document but encountered an error.",
          timestamp: Date.now()
        }]);
        setIsLoading(false);
        return;
      }
    }

    try {
      const result = await chatSessionRef.current.sendMessage({ message: input });
      const responseText = result.text;
      
      const botMessage: ChatMessage = {
        role: 'model',
        content: responseText,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error("Chat error", err);
      setError("Failed to get response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden animate-fade-in-up">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
        <Bot className="text-accent" size={20} />
        <h3 className="font-semibold text-slate-800">Knowledge Assistant</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
        {isInitializing ? (
          <div className="flex items-center justify-center h-full text-slate-400 gap-2">
            <Loader2 className="animate-spin" size={20} />
            Initializing AI Assistant...
          </div>
        ) : error ? (
           <div className="flex flex-col items-center justify-center h-full text-red-400 gap-2">
            <AlertCircle size={24} />
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="text-xs underline">Retry</button>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-accent/10 text-accent'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-slate-800 text-white rounded-tr-none' 
                  : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-sm'
              }`}>
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about the recording..."
            className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
            disabled={isLoading || isInitializing || !!error}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || isInitializing || !!error || !input.trim()}
            className="p-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};
