export enum SessionType {
  AUTO = 'Auto-Detect',
  MEETING = 'Meetings & Summaries',
  LECTURE = 'Lecture Recall',
  INTERVIEW = 'Content for Reporters',
  ACADEMIC = 'Academic Research',
  INFORMAL = 'Informal/Notes'
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface ActionItem {
  task: string;
  assignee: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface NarrativeSection {
  title: string;
  content: string;
}

export interface MeetingAnalysis {
  title: string;
  date?: string;
  attendees: string[];
  agendaItems: string[];
  executiveSummary: string;
  narrativeSections: NarrativeSection[];
  keyPoints: string[];
  decisionsMade: string[];
  questionsRaised: string[];
  actionItems: ActionItem[];
  overallSentiment: string;
  durationMinutes: number;
  language: string;
  sessionType?: string;
  detectedSessionType?: string;
}

export interface RecordingSession {
  blob: Blob;
  url: string;
  timestamp: number;
  duration: number; // in seconds
}

export enum AppState {
  IDLE = 'IDLE',
  RECORDING = 'RECORDING',
  PROCESSING = 'PROCESSING',
  REVIEW = 'REVIEW',
  ERROR = 'ERROR',
  LIMIT_REACHED = 'LIMIT_REACHED'
}