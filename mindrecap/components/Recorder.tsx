import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, Play, Captions, MonitorUp, Pause } from 'lucide-react';
import Visualizer from './Visualizer';

interface RecorderProps {
  onRecordingComplete: (blob: Blob, duration: number) => void;
  isProcessing: boolean;
  language: string;
}

const LANGUAGE_MAP: { [key: string]: string } = {
  "English": "en-US",
  "Chinese": "zh-CN",
  "Spanish": "es-ES",
  "Arabic": "ar-SA",
  "Hindi": "hi-IN",
  "Bengali": "bn-IN",
  "Portuguese": "pt-PT",
  "Russian": "ru-RU",
  "Japanese": "ja-JP",
  "French": "fr-FR",
  "Lahnda (Western Punjabi)": "pa-IN", // Approximate
  "Kinyarwanda": "rw-RW"
};

export const Recorder: React.FC<RecorderProps> = ({ onRecordingComplete, isProcessing, language }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [duration, setDuration] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [transcript, setTranscript] = useState("");
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [recordSystemAudio, setRecordSystemAudio] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const reminderShownRef = useRef(false);
  
  const isRecordingRef = useRef(false);
  const isPausedRef = useRef(false);
  
  // Audio mixing refs
  const micStreamRef = useRef<MediaStream | null>(null);
  const sysStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const cleanupMedia = () => {
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop());
      micStreamRef.current = null;
    }
    if (sysStreamRef.current) {
      sysStreamRef.current.getTracks().forEach(t => t.stop());
      sysStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
  };

  const startRecording = async () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const dest = audioCtx.createMediaStreamDestination();

      // 1. Get Microphone
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = micStream;
      const micSource = audioCtx.createMediaStreamSource(micStream);
      micSource.connect(dest);

      // 2. Get System Audio (if enabled)
      if (recordSystemAudio) {
        try {
          const sysStream = await navigator.mediaDevices.getDisplayMedia({ 
            video: true, // Required by most browsers to trigger the screen picker
            audio: true 
          });
          sysStreamRef.current = sysStream;
          
          if (sysStream.getAudioTracks().length > 0) {
            const sysSource = audioCtx.createMediaStreamSource(sysStream);
            sysSource.connect(dest);
            
            // If user stops sharing via browser UI, we can optionally stop recording
            sysStream.getVideoTracks()[0].onended = () => {
              console.log("System audio sharing stopped by user");
            };
          } else {
            alert("No system audio detected. Please ensure you checked 'Share tab audio' or 'Share system audio' in the screen picker.");
            cleanupMedia();
            return;
          }
        } catch (err) {
          console.warn("System audio capture cancelled or failed", err);
          cleanupMedia();
          return; // Abort if they cancelled the picker
        }
      }

      const mixedStream = dest.stream;
      setStream(mixedStream);
      
      const mediaRecorder = new MediaRecorder(mixedStream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onRecordingComplete(blob, duration);
        cleanupMedia();
        
        // Stop recognition
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      setShowReminder(false);
      reminderShownRef.current = false;
      isRecordingRef.current = true;
      isPausedRef.current = false;
      setTranscript("");
      
      // Start Timer
      setDuration(0);
      timerRef.current = window.setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

      // Start Speech Recognition (Note: This typically only captures the default mic)
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = LANGUAGE_MAP[language] || 'en-US';

        recognition.onresult = (event: any) => {
          let fullTranscript = '';
          for (let i = 0; i < event.results.length; ++i) {
            fullTranscript += event.results[i][0].transcript;
          }
          // Limit to last 300 characters for "clean" real-time view
          if (fullTranscript.length > 300) {
            fullTranscript = "..." + fullTranscript.slice(-300);
          }
          setTranscript(fullTranscript);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
        };
        
        recognition.onend = () => {
          // Restart recognition if it stops unexpectedly while recording and not paused
          if (isRecordingRef.current && !isPausedRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              console.error("Failed to restart recognition", e);
            }
          }
        };
        
        recognition.start();
        recognitionRef.current = recognition;
      }

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access is required to record meetings.");
      cleanupMedia();
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      isPausedRef.current = true;
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      isPausedRef.current = false;
      setShowReminder(false);
      
      timerRef.current = window.setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error("Could not restart recognition", e);
        }
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      setShowReminder(false);
      isRecordingRef.current = false;
      isPausedRef.current = false;
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  };

  useEffect(() => {
    // 2 hours = 7200 seconds
    if (duration === 7200 && !reminderShownRef.current && isRecording && !isPaused) {
      pauseRecording();
      setShowReminder(true);
      reminderShownRef.current = true;
    }
  }, [duration, isRecording, isPaused]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearInterval(timerRef.current);
      cleanupMedia();
      isRecordingRef.current = false;
      isPausedRef.current = false;
      if (recognitionRef.current) recognitionRef.current.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-8 w-full animate-fade-in">
      {showReminder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 text-center space-y-6">
            <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto">
              <Mic size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Recording Paused</h3>
              <p className="text-slate-600">
                Your recording has reached 2 hours. Please check your recording and decide if you want to continue or stop and process it now.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={stopRecording}
                className="px-6 py-3 bg-slate-100 text-slate-700 font-medium rounded-full hover:bg-slate-200 transition-colors"
              >
                Stop & Process
              </button>
              <button
                onClick={resumeRecording}
                className="px-6 py-3 bg-accent text-white font-medium rounded-full hover:bg-accent/90 transition-colors shadow-md"
              >
                Continue Recording
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative w-full max-w-2xl flex flex-col items-center">
        <div className={`absolute inset-0 bg-accent/20 rounded-full blur-3xl transition-opacity duration-500 ${isRecording && !isPaused ? 'opacity-100' : 'opacity-0'}`} />
        
        {isRecording ? (
          <div className="flex flex-col items-center space-y-6 z-10 relative w-full">
            <div className="text-6xl font-mono font-bold text-slate-700 tabular-nums tracking-wider">
              {formatTime(duration)}
            </div>
            <Visualizer stream={stream} isRecording={isRecording && !isPaused} />
            
            <div className="flex items-center gap-4">
               <div className={`text-sm font-medium flex items-center gap-2 ${isPaused ? 'text-amber-500' : 'text-red-500 animate-pulse'}`}>
                 <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-red-500'}`}></span>
                 {isPaused ? 'Recording paused' : 'Recording in progress...'}
               </div>
               <button 
                 onClick={() => setShowSubtitles(!showSubtitles)}
                 className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${showSubtitles ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}
               >
                 <Captions size={14} />
                 {showSubtitles ? 'Hide Subtitles' : 'Show Subtitles'}
               </button>
            </div>

            {/* Live Subtitles Area */}
            {showSubtitles && (
              <div className="w-full max-w-lg mt-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm min-h-[100px] max-h-[200px] overflow-y-auto transition-all animate-fade-in-up">
                <p className="text-slate-600 text-center font-medium leading-relaxed">
                  {transcript || <span className="text-slate-400 italic">Listening for speech...</span>}
                </p>
              </div>
            )}
          </div>
        ) : (
           <div className="flex flex-col items-center space-y-6 w-full">
             <div className="w-24 h-24 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-300">
                <Mic size={40} />
             </div>
             
             {/* System Audio Toggle */}
             <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm w-full max-w-md flex flex-col gap-3">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2 text-slate-700 font-medium">
                   <MonitorUp size={18} className="text-accent" />
                   Record Online Meeting (Meet/Zoom)
                 </div>
                 <label className="relative inline-flex items-center cursor-pointer">
                   <input 
                     type="checkbox" 
                     className="sr-only peer" 
                     checked={recordSystemAudio}
                     onChange={(e) => setRecordSystemAudio(e.target.checked)}
                   />
                   <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                 </label>
               </div>
               {recordSystemAudio && (
                 <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                   <strong>Important:</strong> When prompted, select the tab or screen with your meeting and ensure you check the <strong>"Share tab audio"</strong> or <strong>"Share system audio"</strong> checkbox.
                 </div>
               )}
             </div>

             <p className="text-slate-500 text-center max-w-sm">
               Tap the button below to start your session. MindRecap will listen, transcribe, and summarize automatically.
             </p>
           </div>
        )}
      </div>

      <div className="flex items-center gap-4 z-10">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={isProcessing}
            className="group relative flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-full text-lg font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <div className="w-3 h-3 bg-red-500 rounded-full group-hover:animate-ping" />
                Start Recording
              </>
            )}
          </button>
        ) : (
          <>
            {isPaused ? (
              <button
                onClick={resumeRecording}
                className="flex items-center gap-3 px-6 py-4 bg-accent text-white rounded-full text-lg font-medium shadow-lg hover:bg-accent/90 hover:scale-105 transition-all"
              >
                <Play fill="currentColor" size={18} />
                Resume
              </button>
            ) : (
              <button
                onClick={pauseRecording}
                className="flex items-center gap-3 px-6 py-4 bg-amber-500 text-white rounded-full text-lg font-medium shadow-lg hover:bg-amber-600 hover:scale-105 transition-all"
              >
                <Pause fill="currentColor" size={18} />
                Pause
              </button>
            )}
            <button
              onClick={stopRecording}
              className="flex items-center gap-3 px-6 py-4 bg-red-500 text-white rounded-full text-lg font-medium shadow-lg hover:bg-red-600 hover:scale-105 transition-all"
            >
              <Square fill="currentColor" size={18} />
              Stop & Process
            </button>
          </>
        )}
      </div>
    </div>
  );
};