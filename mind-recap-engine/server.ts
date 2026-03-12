import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import path from "path";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // API routes FIRST
  app.post("/api/analyze", async (req, res) => {
    try {
      const { input } = req.body;
      if (!input) {
        return res.status(400).json({ error: "Input is required" });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `Analyze the following brain dump and provide a structured recap.\n\nBrain Dump:\n"""\n${input}\n"""\n`,
        config: {
          systemInstruction: 'You are the "Mind Recap Engine," a high-end personal intelligence and digital wellness analyst. Your goal is to take "brain dumps" (unstructured text) and transform them into structured, actionable insights that drive clarity. Be professional, insightful, and empathetic.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: {
                type: Type.STRING,
                description: 'A "The Week in Review" summary from the user\'s notes.'
              },
              sentiment: {
                type: Type.STRING,
                description: 'Identify the user\'s primary emotional state (e.g., Stressed, Productive, Creative, Overwhelmed).'
              },
              themes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    theme: {
                      type: Type.STRING,
                      description: 'Key theme (e.g., Health, Career, Relationships)'
                    },
                    clarityScore: {
                      type: Type.INTEGER,
                      description: 'Clarity Score from 1 to 10 based on how clear or confused the user seems about this theme.'
                    },
                    description: {
                      type: Type.STRING,
                      description: 'Brief description of the theme based on the notes.'
                    }
                  },
                  required: ['theme', 'clarityScore', 'description']
                }
              },
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    productName: {
                      type: Type.STRING,
                      description: 'Specific name of the recommended product.'
                    },
                    category: {
                      type: Type.STRING,
                      description: 'Must be one of: Book, App, or Physical Product'
                    },
                    reason: {
                      type: Type.STRING,
                      description: 'Why this solves the user\'s mentioned problems.'
                    },
                    url: {
                      type: Type.STRING,
                      description: 'The exact, real URL to the product or solution.'
                    }
                  },
                  required: ['productName', 'category', 'reason', 'url']
                }
              }
            },
            required: ['summary', 'sentiment', 'themes', 'recommendations']
          }
        }
      });

      if (response.text) {
        res.json(JSON.parse(response.text));
      } else {
        res.status(500).json({ error: "No response from the engine." });
      }
    } catch (error) {
      console.error("Analysis error:", error);
      res.status(500).json({ error: "Failed to process your brain dump. Please try again." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
