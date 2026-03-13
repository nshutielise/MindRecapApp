import express from "express";
import cors from "cors";
import multer from "multer";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";

const upload = multer({ storage: multer.memoryStorage() });
const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Simple file-based database for usage tracking
const DB_FILE = path.join(process.cwd(), 'usage_db.json');

interface UsageData {
  anonymous: Record<string, number>;
  authenticated: Record<string, number>;
  proUsers: Record<string, boolean>;
}

let db: UsageData = { anonymous: {}, authenticated: {}, proUsers: {} };

try {
  if (fs.existsSync(DB_FILE)) {
    db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  }
} catch (e) {
  console.error("Failed to load DB", e);
}

const saveDb = () => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db));
  } catch (e) {
    console.error("Failed to save DB", e);
  }
};

const MAX_ANONYMOUS_RECORDINGS = 2;
const MAX_FREE_RECORDINGS = 7;

// Middleware to check usage limits
const checkUsageLimit = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const uid = req.headers['x-user-id'] as string;
  const ip = req.ip || req.socket.remoteAddress || 'unknown';

  if (uid) {
    if (db.proUsers[uid]) {
      return next(); // Pro users have unlimited access
    }
    const count = db.authenticated[uid] || 0;
    if (count >= MAX_FREE_RECORDINGS) {
      return res.status(403).json({ error: "Free trial limit reached. Please upgrade to Pro." });
    }
  } else {
    const count = db.anonymous[ip] || 0;
    if (count >= MAX_ANONYMOUS_RECORDINGS) {
      return res.status(403).json({ error: "Anonymous limit reached. Please sign in to continue." });
    }
  }
  next();
};

const incrementUsage = (req: express.Request) => {
  const uid = req.headers['x-user-id'] as string;
  const ip = req.ip || req.socket.remoteAddress || 'unknown';

  if (uid) {
    if (!db.proUsers[uid]) {
      db.authenticated[uid] = (db.authenticated[uid] || 0) + 1;
      saveDb();
    }
  } else {
    db.anonymous[ip] = (db.anonymous[ip] || 0) + 1;
    saveDb();
  }
};

// API Route: Get Usage Status
app.get("/api/usage", (req, res) => {
  const uid = req.headers['x-user-id'] as string;
  const ip = req.ip || req.socket.remoteAddress || 'unknown';

  if (uid) {
    res.json({
      isPro: !!db.proUsers[uid],
      count: db.authenticated[uid] || 0,
      max: MAX_FREE_RECORDINGS
    });
  } else {
    res.json({
      isPro: false,
      count: db.anonymous[ip] || 0,
      max: MAX_ANONYMOUS_RECORDINGS
    });
  }
});

// API Route: Upgrade to Pro (Mock)
app.post("/api/upgrade", (req, res) => {
  const uid = req.headers['x-user-id'] as string;
  if (!uid) {
    return res.status(401).json({ error: "Must be logged in to upgrade" });
  }
  db.proUsers[uid] = true;
  saveDb();
  res.json({ success: true });
});

// Helper to get API Key
const getApiKey = () => {
  const key = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!key) {
    throw new Error("API Key is missing. Please configure it in the environment.");
  }
  return key;
};

const sessionTypeInstructions: Record<string, string> = {
  "Auto-Detect": "First, detect the context of the recording. If it is a meeting, generate professional meeting minutes. If it is a lecture, generate comprehensive study notes for students. If it is an interview or reporting, generate a structured report for journalists. If it is academic research, generate a formal academic summary. Adapt your tone and focus accordingly.",
  "Meetings & Summaries": "Generate professional meeting minutes. Focus on discussions, decisions, and action items. Use a formal, corporate tone.",
  "Lecture Recall": "Generate comprehensive study notes for students and academia. Focus on key concepts, definitions, examples, and potential exam topics. Use an educational and explanatory tone.",
  "Content for Reporters": "Generate a structured report for reporters and journalists. Focus on extracting quotes, key narrative points, factual details, and the story arc. Use a journalistic tone.",
  "Academic Research": "Generate a formal academic summary for researchers. Focus on methodology, findings, citations, theoretical implications, and data analysis. Use a scholarly tone.",
  "Informal/Notes": "Generate lightweight notes. Focus on quick takeaways, reminders, and bulleted lists. Use a casual tone."
};

const chatSessionTypeInstructions: Record<string, string> = {
  "Auto-Detect": "You are a versatile knowledge assistant. Adapt your tone and focus based on the content of the recording.",
  "Meetings & Summaries": "You are a professional meeting assistant. Focus on discussions, decisions, and action items.",
  "Lecture Recall": "You are an academic tutor. Focus on explaining key concepts, definitions, and helping students prepare for exams.",
  "Content for Reporters": "You are a journalistic assistant. Focus on extracting quotes, narrative arcs, and factual details for reporting.",
  "Academic Research": "You are a research assistant. Focus on methodology, findings, citations, and theoretical implications.",
  "Informal/Notes": "You are a helpful assistant. Focus on quick takeaways and reminders."
};

// API Route: Analyze Audio
app.post("/api/analyze", upload.single("audio"), checkUsageLimit, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file provided" });
    }

    const { language = "English", sessionType = "Meetings & Summaries" } = req.body;
    const base64Audio = req.file.buffer.toString("base64");
    const mimeType = req.file.mimetype || "audio/webm";

    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const modelName = 'gemini-flash-latest';

    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64Audio
            }
          },
          {
            text: `You are MindRecap AI, an expert knowledge assistant. Your task is to listen to the recording and generate a highly structured and professional report.
            
            The user has specified the language is: ${language}.
            The user has requested the session type to be: ${sessionType}.
            
            Style Instructions: ${sessionTypeInstructions[sessionType] || sessionTypeInstructions["Meetings & Summaries"]}
            
            Supported Input Languages include: Chinese, Spanish, English, Arabic, Hindi, Bengali, Portuguese, Russian, Japanese, Lahnda, French, Kinyarwanda.
            
            Please generate the content in ${language}.

            Structure the output as a formal document with the following sections:
            1. **Meeting Title**: A professional and descriptive title (or Lecture/Interview Title).
            2. **Date**: The date (if mentioned).
            3. **Attendees**: Participants, speakers, or lecturers identified.
            4. **Agenda Items**: Main topics discussed or the intended agenda/syllabus.
            5. **Executive Summary**: A comprehensive narrative summary.
            6. **Key Discussion Points**: Detailed list of important concepts and takeaways.
            7. **Decisions Made**: Explicit decisions, agreements, or key findings.
            8. **Questions Raised**: Specific questions asked or uncertainties raised.
            9. **Action Items**: Specific tasks, follow-ups, or study items with assignees/priority.
            10. **Narrative Sections**: Detailed breakdown of the meeting content with section titles and paragraphs.
            11. **Overall Sentiment**: The tone or atmosphere.
            12. **Language**: The primary language spoken.
            `
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Professional meeting title" },
            date: { type: Type.STRING, description: "Date of the meeting, if mentioned" },
            attendees: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of attendees or speakers identified"
            },
            agendaItems: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of agenda items or main topics"
            },
            executiveSummary: { type: Type.STRING, description: "Brief introductory summary of the meeting." },
            narrativeSections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Section title" },
                  content: { type: Type.STRING, description: "Detailed paragraph content for this section" }
                },
                required: ["title", "content"]
              },
              description: "Detailed narrative sections of the meeting minutes."
            },
            keyPoints: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of key points and concepts"
            },
            decisionsMade: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of decisions or agreements reached"
            },
            questionsRaised: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of questions or issues raised"
            },
            actionItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  task: { type: Type.STRING },
                  assignee: { type: Type.STRING },
                  priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] }
                }
              }
            },
            overallSentiment: { type: Type.STRING },
            durationMinutes: { type: Type.NUMBER },
            language: { type: Type.STRING, description: "The primary language spoken" },
            detectedSessionType: { type: Type.STRING, description: "The detected session type" }
          },
          required: ["title", "attendees", "agendaItems", "executiveSummary", "narrativeSections", "keyPoints", "decisionsMade", "questionsRaised", "actionItems", "overallSentiment", "language", "detectedSessionType"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      return res.status(500).json({ error: "No response received from the analysis service." });
    }

    const analysis = JSON.parse(text);
    analysis.sessionType = analysis.detectedSessionType || sessionType;
    
    // Increment usage after successful analysis
    incrementUsage(req);
    
    res.json(analysis);
  } catch (error: any) {
    console.error("Analysis Error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze audio" });
  }
});

// API Route: Chat
app.post("/api/chat", checkUsageLimit, async (req, res) => {
  try {
    const { base64Audio, mimeType, sessionType, message, history } = req.body;

    if (!base64Audio || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const modelName = 'gemini-flash-latest';

    const chatHistory = [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'audio/webm',
              data: base64Audio
            }
          },
          { text: "Here is the recording. I will ask questions about it." }
        ]
      },
      {
        role: "model",
        parts: [{ text: "I have processed the recording. What would you like to know?" }]
      }
    ];

    // Append previous history from client
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        chatHistory.push({
          role: msg.role === 'model' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        });
      }
    }

    const chat = ai.chats.create({
      model: modelName,
      config: {
        systemInstruction: `You are MindRecap AI, a powerful knowledge assistant. You have access to the audio recording. Your knowledge is strictly limited to the provided audio. If the user asks about anything not in the audio, politely state that it is out of scope. Do not use markdown headers (##). You may use **bold** for emphasis.
        
        Context: The user has identified this recording as a ${sessionType}.
        Role: ${chatSessionTypeInstructions[sessionType] || chatSessionTypeInstructions["Meetings & Summaries"]}
        `
      },
      history: chatHistory
    });

    const result = await chat.sendMessage({ message });
    
    res.json({ text: result.text });
  } catch (error: any) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: error.message || "Failed to process chat message" });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
