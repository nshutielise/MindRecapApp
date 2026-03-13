import React, { useMemo, useState } from 'react';
import { Download, FileText, CheckCircle, Clock, Hash, Activity, Share2, Edit2, Save, HelpCircle, Globe, MessageSquare, FileJson, AlertCircle } from 'lucide-react';
import { MeetingAnalysis, RecordingSession, ActionItem, NarrativeSection } from '../types';
import { MeetingChat } from './MeetingChat';
import { generatePDF, generateWord } from '../utils/documentGenerator';

interface AnalysisResultProps {
  analysis: MeetingAnalysis;
  recording: RecordingSession;
  onReset: () => void;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ analysis: initialAnalysis, recording, onReset }) => {
  const [data, setData] = useState<MeetingAnalysis>(initialAnalysis);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'notes' | 'chat'>('notes');
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);

  const handleDownloadPDF = () => {
    generatePDF(data);
  };

  const handleDownloadWord = () => {
    generateWord(data);
  };

  const handleShare = async () => {
    const text = `Session Notes: ${data.title}\n\nSummary: ${data.executiveSummary}\n\nShared via MindRecap AI`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: data.title,
          text: text,
        });
      } catch (err) {
        console.log('Share canceled');
      }
    } else {
      navigator.clipboard.writeText(text);
      alert("Summary copied to clipboard!");
    }
  };

  const audioUrl = useMemo(() => {
    return URL.createObjectURL(recording.blob);
  }, [recording.blob]);

  const toggleEdit = () => setIsEditing(!isEditing);

  // Helper to update state during edits
  const updateField = (field: keyof MeetingAnalysis, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const updateActionItem = (index: number, field: keyof ActionItem, value: string) => {
    const newItems = [...data.actionItems];
    // @ts-ignore
    newItems[index][field] = value;
    setData(prev => ({ ...prev, actionItems: newItems }));
  };
  
  const updateNarrativeSection = (index: number, field: keyof NarrativeSection, value: string) => {
    const newSections = [...(data.narrativeSections || [])];
    // @ts-ignore
    newSections[index][field] = value;
    setData(prev => ({ ...prev, narrativeSections: newSections }));
  };

  const handleResetClick = () => {
    setShowResetConfirmation(true);
  };

  const confirmReset = () => {
    setShowResetConfirmation(false);
    onReset();
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in-up pb-20">
      
      {/* 1. Audio Player (Top) */}
      <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto min-w-[150px]">
           <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-primary">
             <Activity size={20} />
           </div>
           <div className="flex flex-col">
             <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recording</span>
             <span className="text-sm font-medium text-slate-800">
               {Math.floor(recording.duration / 60)}:{(recording.duration % 60).toString().padStart(2, '0')}
             </span>
           </div>
        </div>
        <audio controls src={audioUrl} className="w-full h-10 outline-none" />
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center sticky top-20 z-10 bg-slate-50/90 backdrop-blur-sm py-2">
        {/* Tab Switcher */}
        <div className="flex gap-1 bg-slate-200/50 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeTab === 'notes' 
                ? 'bg-white text-slate-800 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Session Notes
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'chat' 
                ? 'bg-white text-accent shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <MessageSquare size={16} />
            Ask AI Assistant
          </button>
        </div>

        {activeTab === 'notes' && (
          <div className="flex gap-2">
            <button onClick={toggleEdit} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all ${isEditing ? 'bg-success text-white' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'}`}>
              {isEditing ? <><Save size={16} /> Save Changes</> : <><Edit2 size={16} /> Edit Notes</>}
            </button>
            <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 text-sm font-medium shadow-sm">
              <Share2 size={16} /> Share
            </button>
            <div className="flex gap-1">
              <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-l-lg hover:opacity-90 transition-colors text-sm font-medium shadow-sm border-r border-white/20">
                <Download size={16} /> PDF
              </button>
              <button onClick={handleDownloadWord} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-r-lg hover:opacity-90 transition-colors text-sm font-medium shadow-sm">
                <FileText size={16} /> Word
              </button>
            </div>
          </div>
        )}
      </div>

      {activeTab === 'notes' ? (
        /* Document Container */
        <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
          
          {/* Header */}
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
          {isEditing ? (
            <div className="space-y-4">
              <input 
                type="text" 
                value={data.title} 
                onChange={(e) => updateField('title', e.target.value)}
                className="text-3xl font-bold text-slate-900 w-full bg-transparent border-b-2 border-accent focus:outline-none px-1"
                placeholder="Meeting Title"
              />
              <input 
                type="text" 
                value={data.date || ''} 
                onChange={(e) => updateField('date', e.target.value)}
                className="text-sm text-slate-500 w-full bg-transparent border-b border-slate-300 focus:outline-none px-1"
                placeholder="Date (e.g., October 24, 2023)"
              />
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-slate-900">{data.title}</h1>
              {data.date && <p className="text-sm text-slate-500 mt-1">{data.date}</p>}
            </>
          )}
          
          <div className="flex flex-wrap items-center gap-6 mt-4 text-sm text-slate-500">
            <span className="flex items-center gap-2"><Clock size={16} /> {new Date(recording.timestamp).toLocaleDateString()} (Recorded)</span>
            <span className="flex items-center gap-2"><Globe size={16} /> {data.language}</span>
          </div>

          {/* Attendees */}
          <div className="mt-6 pt-4 border-t border-slate-200/60">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Attendees</h3>
             {isEditing ? (
                <textarea 
                  className="w-full text-sm text-slate-700 bg-white border rounded p-2"
                  value={data.attendees?.join(', ') || ''}
                  onChange={(e) => updateField('attendees', e.target.value.split(',').map(s => s.trim()))}
                  placeholder="John Doe, Jane Smith..."
                />
             ) : (
                <div className="flex flex-wrap gap-2">
                  {data.attendees && data.attendees.length > 0 ? (
                    data.attendees.map((attendee, idx) => (
                      <span key={idx} className="px-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-medium text-slate-600 shadow-sm">
                        {attendee}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 italic text-xs">No attendees listed</span>
                  )}
                </div>
             )}
          </div>
        </div>

        <div className="p-8 space-y-10">
          
          {/* Executive Summary */}
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2 pb-2 border-b border-slate-100">
              <FileText className="text-accent" size={24} />
              Executive Summary
            </h2>
            {isEditing ? (
              <textarea 
                value={data.executiveSummary}
                onChange={(e) => updateField('executiveSummary', e.target.value)}
                className="w-full h-24 p-4 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-slate-600 leading-relaxed"
              />
            ) : (
              <p className="text-slate-600 leading-relaxed text-justify whitespace-pre-wrap">
                {data.executiveSummary}
              </p>
            )}
          </section>

          {/* Narrative Sections (New) */}
          {data.narrativeSections && data.narrativeSections.length > 0 && (
            <section className="space-y-6">
              {data.narrativeSections.map((section, idx) => (
                <div key={idx} className="space-y-2">
                  {isEditing ? (
                    <>
                      <input 
                        className="text-lg font-bold text-slate-800 w-full border-b border-slate-200 pb-1"
                        value={section.title}
                        onChange={(e) => updateNarrativeSection(idx, 'title', e.target.value)}
                      />
                      <textarea 
                        className="w-full h-32 p-3 border rounded text-slate-600 leading-relaxed"
                        value={section.content}
                        onChange={(e) => updateNarrativeSection(idx, 'content', e.target.value)}
                      />
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-bold text-slate-800">{section.title}</h3>
                      <p className="text-slate-600 leading-relaxed text-justify whitespace-pre-wrap">
                        {section.content}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Agenda Items */}
          {data.agendaItems && (data.agendaItems.length > 0 || isEditing) && (
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2 pb-2 border-b border-slate-100">
                <Hash className="text-blue-500" size={24} />
                Agenda Items
              </h2>
              <div className="space-y-2">
                {(data.agendaItems || []).map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <span className="text-blue-500 mt-1.5">•</span>
                    {isEditing ? (
                      <input 
                        className="flex-1 p-2 border rounded text-slate-700"
                        value={item}
                        onChange={(e) => {
                          const newItems = [...(data.agendaItems || [])];
                          newItems[idx] = e.target.value;
                          updateField('agendaItems', newItems);
                        }}
                      />
                    ) : (
                      <p className="text-slate-700">{item}</p>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <button 
                    onClick={() => updateField('agendaItems', [...(data.agendaItems || []), "New Agenda Item"])}
                    className="text-xs text-blue-500 hover:underline mt-2 pl-6"
                  >
                    + Add Item
                  </button>
                )}
              </div>
            </section>
          )}

          {/* Key Points */}
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Activity className="text-purple-500" size={24} />
              Key Discussion Points
            </h2>
            <div className="space-y-2">
              {data.keyPoints.map((point, idx) => (
                <div key={idx} className="flex gap-3">
                  <span className="text-purple-500 mt-1.5">•</span>
                  {isEditing ? (
                    <input 
                      className="flex-1 p-2 border rounded text-slate-700"
                      value={point}
                      onChange={(e) => {
                        const newPoints = [...data.keyPoints];
                        newPoints[idx] = e.target.value;
                        updateField('keyPoints', newPoints);
                      }}
                    />
                  ) : (
                    <p className="text-slate-700">{point}</p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Decisions Made */}
          {data.decisionsMade && (data.decisionsMade.length > 0 || isEditing) && (
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2 pb-2 border-b border-slate-100">
                <CheckCircle className="text-green-600" size={24} />
                Decisions Made
              </h2>
              <div className="space-y-2">
                {(data.decisionsMade || []).map((decision, idx) => (
                  <div key={idx} className="flex gap-3">
                    <span className="text-green-600 mt-1.5">✓</span>
                    {isEditing ? (
                      <input 
                        className="flex-1 p-2 border rounded text-slate-700"
                        value={decision}
                        onChange={(e) => {
                          const newDecisions = [...(data.decisionsMade || [])];
                          newDecisions[idx] = e.target.value;
                          updateField('decisionsMade', newDecisions);
                        }}
                      />
                    ) : (
                      <p className="text-slate-700 font-medium">{decision}</p>
                    )}
                  </div>
                ))}
                 {isEditing && (
                  <button 
                    onClick={() => updateField('decisionsMade', [...(data.decisionsMade || []), "New Decision"])}
                    className="text-xs text-green-600 hover:underline mt-2 pl-6"
                  >
                    + Add Decision
                  </button>
                )}
              </div>
            </section>
          )}

          {/* Questions Raised */}
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2 pb-2 border-b border-slate-100">
              <HelpCircle className="text-orange-500" size={24} />
              Questions Raised
            </h2>
            {data.questionsRaised.length === 0 && !isEditing ? (
              <p className="text-slate-400 italic">No specific questions were recorded.</p>
            ) : (
              <div className="space-y-3">
                {data.questionsRaised.map((question, idx) => (
                  <div key={idx} className="flex gap-3 bg-orange-50/50 p-3 rounded-lg">
                    <span className="text-orange-500 font-bold">?</span>
                    {isEditing ? (
                      <input 
                        className="flex-1 p-1 bg-transparent border-b border-orange-200 text-slate-700"
                        value={question}
                        onChange={(e) => {
                          const newQs = [...data.questionsRaised];
                          newQs[idx] = e.target.value;
                          updateField('questionsRaised', newQs);
                        }}
                      />
                    ) : (
                      <p className="text-slate-700 italic">{question}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Action Items */}
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2 pb-2 border-b border-slate-100">
              <CheckCircle className="text-success" size={24} />
              Action Items
            </h2>
            <div className="space-y-3">
              {data.actionItems.length === 0 && !isEditing ? (
                <p className="text-slate-400 italic">No specific action items detected.</p>
              ) : (
                data.actionItems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className={`mt-2 w-2 h-2 rounded-full shrink-0 ${
                      item.priority === 'High' ? 'bg-red-500' : item.priority === 'Medium' ? 'bg-amber-500' : 'bg-green-500'
                    }`} />
                    
                    <div className="flex-1 space-y-2">
                      {isEditing ? (
                        <>
                          <input 
                            className="w-full font-medium text-slate-800 bg-transparent border-b border-slate-200 pb-1"
                            value={item.task}
                            onChange={(e) => updateActionItem(idx, 'task', e.target.value)}
                          />
                          <div className="flex gap-2">
                            <input 
                              className="text-xs text-slate-500 bg-white border rounded px-2 py-1"
                              value={item.assignee}
                              onChange={(e) => updateActionItem(idx, 'assignee', e.target.value)}
                              placeholder="Assignee"
                            />
                            <select 
                              className="text-xs text-slate-500 bg-white border rounded px-2 py-1"
                              value={item.priority}
                              onChange={(e) => updateActionItem(idx, 'priority', e.target.value)}
                            >
                              <option value="High">High</option>
                              <option value="Medium">Medium</option>
                              <option value="Low">Low</option>
                            </select>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="text-slate-800 font-medium">{item.task}</p>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-slate-500">Assignee: <span className="text-slate-700 font-medium">{item.assignee}</span></span>
                            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold border border-slate-200 px-2 py-0.5 rounded">{item.priority}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Footer Language Note */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 text-center text-xs text-slate-400">
           Detected Language: <span className="font-semibold text-slate-600">{data.language}</span> • MindRecap Professional
        </div>
      </div>
      ) : (
        <MeetingChat recording={recording} analysis={data} />
      )}
      
      <div className="flex justify-center pt-8">
        <button 
          onClick={handleResetClick}
          className="text-slate-400 hover:text-slate-600 underline text-sm transition-colors"
        >
          Start New Recording
        </button>
      </div>

      {/* Confirmation Modal */}
      {showResetConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-amber-500">
              <AlertCircle size={28} />
              <h3 className="text-lg font-bold text-slate-900">Start New Recording?</h3>
            </div>
            <p className="text-slate-600">
              Starting a new recording will clear the current session. 
              <strong>Please ensure you have downloaded your minutes/notes first.</strong>
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setShowResetConfirmation(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmReset}
                className="px-4 py-2 bg-amber-500 text-white hover:bg-amber-600 rounded-lg font-medium shadow-sm transition-colors"
              >
                Yes, Start New
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};