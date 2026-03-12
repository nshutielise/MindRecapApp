import React, { useState, useEffect } from 'react';
import { Recorder } from './components/Recorder';
import { AnalysisResult } from './components/AnalysisResult';
import { Auth } from './components/Auth';
import { SubscriptionModal } from './components/SubscriptionModal';
import { useAuth } from './contexts/AuthContext';
import { AppState, MeetingAnalysis, RecordingSession, SessionType } from './types';
import { analyzeMeetingAudio } from './services/geminiService';
import { Bot, Sparkles, AlertCircle, Lock, Star, Globe2, Check, CreditCard, Zap, UserX, Shield, Download, Share2, FileText, MessageSquare, ClipboardList, GraduationCap, Newspaper, BookOpen, LogOut, X } from 'lucide-react';

import { saveSessionData, getSessionData, clearSessionData } from './utils/storage';

const MAX_ANONYMOUS_RECORDINGS = 2;
const MAX_FREE_RECORDINGS = 7; // 2 anonymous + 5 authenticated

const LANGUAGES = [
  "English", 
  "Chinese", 
  "Spanish", 
  "Arabic", 
  "Hindi", 
  "Bengali", 
  "Portuguese", 
  "Russian", 
  "Japanese", 
  "French",
  "Lahnda (Western Punjabi)",
  "Kinyarwanda"
];

const SESSION_TYPES = [
  { id: SessionType.AUTO, label: "Auto-Detect", description: "AI detects the best format", icon: Sparkles },
  { id: SessionType.MEETING, label: "Meetings & Summaries", description: "Professional minutes & tasks", icon: Bot },
  { id: SessionType.LECTURE, label: "Lecture Recall", description: "Study notes & exam prep", icon: GraduationCap },
  { id: SessionType.INTERVIEW, label: "Content for Reporters", description: "Quotes & narrative", icon: Newspaper },
  { id: SessionType.ACADEMIC, label: "Academic Research", description: "Findings & methodology", icon: BookOpen },
  { id: SessionType.INFORMAL, label: "Informal/Notes", description: "Quick takeaways", icon: ClipboardList }
];

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [recordingSession, setRecordingSession] = useState<RecordingSession | null>(null);
  const [analysis, setAnalysis] = useState<MeetingAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recordingCount, setRecordingCount] = useState<number>(0);
  const [anonymousCount, setAnonymousCount] = useState<number>(0);
  const [isPro, setIsPro] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("English");
  const [selectedSessionType, setSelectedSessionType] = useState<SessionType>(SessionType.AUTO);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  
  // 'idle' | 'processing' | 'success'
  const [upgradeStatus, setUpgradeStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const headers: Record<string, string> = {};
        if (currentUser) {
          headers['x-user-id'] = currentUser.uid;
        }
        
        const res = await fetch('/api/usage', { headers });
        if (res.ok) {
          const data = await res.json();
          setIsPro(data.isPro);
          if (currentUser) {
            setRecordingCount(data.count);
          } else {
            setAnonymousCount(data.count);
          }
        }
      } catch (e) {
        console.error("Failed to fetch usage", e);
      }
    };

    fetchUsage();

    // Load persisted session
    const loadSession = async () => {
      try {
        const savedAnalysis = await getSessionData('analysis');
        const savedRecordingBlob = await getSessionData('recordingBlob');
        const savedRecordingMeta = await getSessionData('recordingMeta');

        if (savedAnalysis && savedRecordingBlob && savedRecordingMeta) {
          const session: RecordingSession = {
            blob: savedRecordingBlob,
            url: URL.createObjectURL(savedRecordingBlob),
            duration: savedRecordingMeta.duration,
            timestamp: savedRecordingMeta.timestamp
          };
          setRecordingSession(session);
          setAnalysis(savedAnalysis);
          setAppState(AppState.REVIEW);
        }
      } catch (err) {
        console.error("Failed to load session", err);
      }
    };
    loadSession();
  }, [currentUser]);

  const handleRecordingComplete = async (blob: Blob, duration: number) => {
    // Check limits before processing
    if (!currentUser) {
      if (anonymousCount >= MAX_ANONYMOUS_RECORDINGS) {
        setShowAuthModal(true);
        return;
      }
    } else if (!isPro && recordingCount >= MAX_FREE_RECORDINGS) {
      setShowSubscriptionModal(true);
      return;
    }

    setAppState(AppState.PROCESSING);
    const timestamp = Date.now();
    setRecordingSession({
      blob,
      url: URL.createObjectURL(blob),
      timestamp,
      duration
    });

    try {
      const result = await analyzeMeetingAudio(blob, selectedLanguage, selectedSessionType);
      setAnalysis(result);
      
      // Save session
      await saveSessionData('analysis', result);
      await saveSessionData('recordingBlob', blob);
      await saveSessionData('recordingMeta', { duration, timestamp });
      
      // Increment count only on success
      if (!currentUser) {
        setAnonymousCount(prev => prev + 1);
      } else if (!isPro) {
        setRecordingCount(prev => prev + 1);
      }
      
      setAppState(AppState.REVIEW);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred while processing the recording.");
      setAppState(AppState.ERROR);
    }
  };

  const handleReset = async () => {
    await clearSessionData();
    setAppState(AppState.IDLE);
    setRecordingSession(null);
    setAnalysis(null);
    setError(null);
  };

  const handleSubscribe = async () => {
    if (!currentUser) {
      setShowSubscriptionModal(false);
      setShowAuthModal(true);
      return;
    }

    // Start transaction simulation
    setUpgradeStatus('processing');
    
    try {
      const res = await fetch('/api/upgrade', {
        method: 'POST',
        headers: {
          'x-user-id': currentUser.uid
        }
      });
      
      if (res.ok) {
        setUpgradeStatus('success');
        
        // Show success state briefly before unlocking
        setTimeout(() => {
          setIsPro(true);
          setShowSubscriptionModal(false);
          setUpgradeStatus('idle');
        }, 1500);
      } else {
        throw new Error("Upgrade failed");
      }
    } catch (e) {
      console.error(e);
      setUpgradeStatus('idle');
      alert("Failed to upgrade. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-accent/20 selection:text-accent">
      
      {/* Auth Modal */}
      {showAuthModal && !currentUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative">
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
            <Auth />
          </div>
        </div>
      )}

      {/* Subscription Modal */}
      <SubscriptionModal 
        isOpen={showSubscriptionModal} 
        onClose={() => setShowSubscriptionModal(false)}
        onSubscribe={handleSubscribe}
      />

      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-40 border-b border-slate-200 h-16 flex items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Bot size={20} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
            MindRecap <span className="text-accent font-light">AI</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
           {!currentUser ? (
             <div className="flex items-center gap-4">
               <span className="text-xs font-semibold text-slate-400 hidden sm:block">
                 {MAX_ANONYMOUS_RECORDINGS - anonymousCount} free tries left
               </span>
               <button 
                 onClick={() => setShowAuthModal(true)}
                 className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
               >
                 Sign In
               </button>
             </div>
           ) : (
             <>
               {!isPro && (
                 <span className="text-xs font-semibold text-slate-400 hidden sm:block">
                   {MAX_FREE_RECORDINGS - recordingCount} free sessions left
                 </span>
               )}
               <div className={`flex items-center gap-2 text-xs font-medium uppercase tracking-widest ${isPro ? 'text-amber-500 bg-amber-50 px-2 py-1 rounded-md border border-amber-100' : 'text-slate-500'}`}>
                  {isPro ? (
                    <>
                      <Star size={14} fill="currentColor" /> Pro Member
                    </>
                  ) : (
                    <>
                      <span>Free Plan</span>
                    </>
                  )}
               </div>
               <button 
                 onClick={logout}
                 className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                 title="Sign Out"
               >
                 <LogOut size={18} />
               </button>
             </>
           )}
        </div>
      </header>


      {/* Main Content */}
      <main className="pt-24 px-4 container mx-auto flex flex-col items-center min-h-[calc(100vh-4rem)]">
        
        {/* State: IDLE or RECORDING */}
        {(appState === AppState.IDLE || appState === AppState.RECORDING) && (
          <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl py-12">
             
             {/* Check Limit Pre-render */}
             {(!isPro && recordingCount >= MAX_FREE_RECORDINGS) ? (
               // This handles the edge case where they refresh the page after limit reached
               <div className="text-center space-y-6 bg-white p-10 rounded-2xl shadow-xl border border-slate-100 max-w-md animate-fade-in-up">
                 <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                   <Lock size={32} />
                 </div>
                 <h2 className="text-2xl font-bold text-slate-900">Free Limit Reached</h2>
                 <p className="text-slate-600">
                   You have used your {MAX_FREE_RECORDINGS} free sessions. Upgrade to Pro for unlimited AI insights.
                 </p>
                 <ul className="text-left space-y-3 text-sm text-slate-600 py-4 px-4 bg-slate-50 rounded-lg border border-slate-100">
                   <li className="flex items-center gap-3"><Check size={16} className="text-green-500"/> Unlimited Recordings</li>
                   <li className="flex items-center gap-3"><Check size={16} className="text-green-500"/> PDF & Docx Exports</li>
                   <li className="flex items-center gap-3"><Check size={16} className="text-green-500"/> Priority Processing</li>
                   <li className="flex items-center gap-3"><Check size={16} className="text-green-500"/> AI Knowledge Assistant</li>
                 </ul>
                 <div className="pt-4">
                   <button 
                     onClick={handleSubscribe}
                     disabled={upgradeStatus !== 'idle'}
                     className={`w-full py-3.5 rounded-xl font-semibold shadow-lg transition-all flex items-center justify-center gap-2
                       ${upgradeStatus === 'success' 
                         ? 'bg-green-500 text-white scale-105' 
                         : 'bg-gradient-to-r from-primary to-slate-800 text-white hover:shadow-xl hover:scale-[1.02]'}
                       ${upgradeStatus === 'processing' ? 'opacity-90 cursor-wait' : ''}
                     `}
                   >
                     {upgradeStatus === 'processing' && (
                       <>
                         <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                         Processing Payment...
                       </>
                     )}
                     {upgradeStatus === 'success' && (
                       <>
                         <Check size={20} className="animate-bounce" />
                         Payment Successful!
                       </>
                     )}
                     {upgradeStatus === 'idle' && (
                        <>
                          Subscribe - $10/Month
                        </>
                     )}
                   </button>
                   <p className="text-xs text-slate-400 mt-3 flex items-center justify-center gap-1">
                     <CreditCard size={12}/> Secure payment processing
                   </p>
                 </div>
               </div>
             ) : (
               <>
                <div className="text-center space-y-4 mb-12 animate-fade-in-down">
                  <h2 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
                    {isPro ? (
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-sm font-semibold mb-4 border border-amber-100 animate-fade-in">
                        <Star size={14} fill="currentColor" /> Premium Active
                      </span>
                    ) : null}
                    <div className="block">Capture Everything,</div>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">
                      Recall Anything.
                    </span>
                  </h2>
                  <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                    The ultimate AI platform for meetings, lectures, interviews, and academic research. Transform audio into structured knowledge instantly.
                  </p>
                </div>

                {/* Selectors */}
                {appState === AppState.IDLE && (
                  <div className="mb-8 w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                    {/* Language Selector */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider text-center md:text-left">
                        Audio Language
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Globe2 size={18} />
                        </div>
                        <select 
                          value={selectedLanguage}
                          onChange={(e) => setSelectedLanguage(e.target.value)}
                          className="block w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent appearance-none transition-all hover:border-accent/50 cursor-pointer"
                        >
                          {LANGUAGES.map(lang => (
                            <option key={lang} value={lang}>{lang}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Session Type Selector */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider text-center md:text-left">
                        Session Type
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <ClipboardList size={18} />
                        </div>
                        <select 
                          value={selectedSessionType}
                          onChange={(e) => setSelectedSessionType(e.target.value as SessionType)}
                          className="block w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent appearance-none transition-all hover:border-accent/50 cursor-pointer"
                        >
                          {SESSION_TYPES.map(type => (
                            <option key={type.id} value={type.id}>{type.label}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <Recorder 
                  onRecordingComplete={handleRecordingComplete} 
                  isProcessing={false} 
                  language={selectedLanguage}
                />

                {/* Features Section - Only show when IDLE */}
                {appState === AppState.IDLE && (
                  <div className="mt-24 w-full max-w-6xl px-4 animate-fade-in pb-12">
                    <div className="text-center mb-12">
                      <h3 className="text-accent font-semibold tracking-wider uppercase text-xs mb-2">Platform Capabilities</h3>
                      <h2 className="text-3xl font-bold text-slate-900">One Platform, Infinite Use Cases</h2>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                       {/* Feature 1: Meetings */}
                       <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center mb-4">
                             <Bot size={24} />
                          </div>
                          <h4 className="text-lg font-bold text-slate-800 mb-2">Meetings & Summaries</h4>
                          <p className="text-slate-600 text-sm leading-relaxed">
                            Professional minutes, action items, and executive summaries for corporate and team meetings.
                          </p>
                       </div>

                       {/* Feature 2: Lectures */}
                       <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                          <div className="w-12 h-12 bg-green-50 text-green-500 rounded-xl flex items-center justify-center mb-4">
                             <GraduationCap size={24} />
                          </div>
                          <h4 className="text-lg font-bold text-slate-800 mb-2">Lecture Recall</h4>
                          <p className="text-slate-600 text-sm leading-relaxed">
                            Perfect for students. Turn long lectures into structured study notes, exam prep, and key concept lists.
                          </p>
                       </div>

                       {/* Feature 3: Journalists */}
                       <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                          <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center mb-4">
                             <Newspaper size={24} />
                          </div>
                          <h4 className="text-lg font-bold text-slate-800 mb-2">Content for Reporters</h4>
                          <p className="text-slate-600 text-sm leading-relaxed">
                            Extract quotes, narrative arcs, and factual details from interviews for journalists and content creators.
                          </p>
                       </div>

                       {/* Feature 4: Academic */}
                       <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                          <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center mb-4">
                             <BookOpen size={24} />
                          </div>
                          <h4 className="text-lg font-bold text-slate-800 mb-2">Academic Research</h4>
                          <p className="text-slate-600 text-sm leading-relaxed">
                             Generate publication-ready material from research recordings, focus groups, and academic discussions.
                          </p>
                       </div>

                        {/* Feature 5: AI Assistant */}
                       <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                          <div className="w-12 h-12 bg-pink-50 text-pink-500 rounded-xl flex items-center justify-center mb-4">
                             <MessageSquare size={24} />
                          </div>
                          <h4 className="text-lg font-bold text-slate-800 mb-2">AI Knowledge Assistant</h4>
                          <p className="text-slate-600 text-sm leading-relaxed">
                            Chat with your recordings. Ask specific questions and get instant answers based on the audio context.
                          </p>
                       </div>

                       {/* Feature 6: Privacy */}
                       <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                          <div className="w-12 h-12 bg-teal-50 text-teal-500 rounded-xl flex items-center justify-center mb-4">
                             <Shield size={24} />
                          </div>
                          <h4 className="text-lg font-bold text-slate-800 mb-2">Secure & Private</h4>
                          <p className="text-slate-600 text-sm leading-relaxed">
                            Your recordings are processed with enterprise-grade security. Privacy is built into our core.
                          </p>
                       </div>
                    </div>
                  </div>
                )}
               </>
             )}
          </div>
        )}

        {/* State: LIMIT REACHED (Explicit State) */}
        {appState === AppState.LIMIT_REACHED && (
          <div className="flex-1 flex flex-col items-center justify-center w-full animate-fade-in">
             <div className="text-center space-y-6 bg-white p-10 rounded-2xl shadow-xl border border-slate-100 max-w-md">
                 <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                   <Lock size={32} />
                 </div>
                 <h2 className="text-2xl font-bold text-slate-900">Upgrade to Continue</h2>
                 <p className="text-slate-600">
                   You've reached the limit of {MAX_FREE_RECORDINGS} free sessions. Unlock unlimited access to professional AI insights.
                 </p>
                 <ul className="text-left space-y-3 text-sm text-slate-600 py-4 px-4 bg-slate-50 rounded-lg border border-slate-100">
                   <li className="flex items-center gap-3"><Check size={16} className="text-green-500"/> Unlimited Recordings</li>
                   <li className="flex items-center gap-3"><Check size={16} className="text-green-500"/> PDF & Docx Exports</li>
                   <li className="flex items-center gap-3"><Check size={16} className="text-green-500"/> Priority Processing</li>
                   <li className="flex items-center gap-3"><Check size={16} className="text-green-500"/> AI Knowledge Assistant</li>
                 </ul>
                 <div className="pt-2">
                   <button 
                     onClick={handleSubscribe}
                     disabled={upgradeStatus !== 'idle'}
                     className={`w-full py-3.5 rounded-xl font-semibold shadow-lg transition-all flex items-center justify-center gap-2
                       ${upgradeStatus === 'success' 
                         ? 'bg-green-500 text-white scale-105' 
                         : 'bg-gradient-to-r from-primary to-slate-800 text-white hover:shadow-xl hover:scale-[1.02]'}
                       ${upgradeStatus === 'processing' ? 'opacity-90 cursor-wait' : ''}
                     `}
                   >
                     {upgradeStatus === 'processing' && (
                       <>
                         <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                         Processing Payment...
                       </>
                     )}
                     {upgradeStatus === 'success' && (
                       <>
                         <Check size={20} className="animate-bounce" />
                         Payment Successful!
                       </>
                     )}
                     {upgradeStatus === 'idle' && (
                        <>
                          Subscribe - $10/Month
                        </>
                     )}
                   </button>
                   <p className="text-xs text-slate-400 mt-3 flex items-center justify-center gap-1">
                     <CreditCard size={12}/> Secure payment processing
                   </p>
                 </div>
               </div>
          </div>
        )}

        {/* State: PROCESSING */}
        {appState === AppState.PROCESSING && (
          <div className="flex-1 flex flex-col items-center justify-center w-full max-w-xl py-20 text-center animate-fade-in">
             <div className="relative mb-8">
               <div className="w-20 h-20 border-4 border-slate-100 border-t-accent rounded-full animate-spin"></div>
               <div className="absolute inset-0 flex items-center justify-center text-accent">
                 <Sparkles size={24} className="animate-pulse" />
               </div>
             </div>
             <h3 className="text-2xl font-semibold text-slate-800 mb-2">MindRecap is Thinking...</h3>
             <p className="text-slate-500">
               Analyzing your <span className="font-semibold text-primary">{selectedSessionType === SessionType.AUTO ? 'recording' : selectedSessionType}</span> in <span className="font-semibold text-accent">{selectedLanguage}</span>...
             </p>
          </div>
        )}

        {/* State: REVIEW */}
        {appState === AppState.REVIEW && analysis && recordingSession && (
          <AnalysisResult 
            analysis={analysis} 
            recording={recordingSession} 
            onReset={handleReset} 
          />
        )}

        {/* State: ERROR */}
        {appState === AppState.ERROR && (
          <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md py-20 text-center animate-fade-in">
             <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                <AlertCircle size={32} />
             </div>
             <h3 className="text-xl font-bold text-slate-800 mb-2">Processing Failed</h3>
             <p className="text-slate-500 mb-8">{error}</p>
             <button 
               onClick={handleReset}
               className="px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
             >
               Try Again
             </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
