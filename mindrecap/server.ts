import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { YoutubeTranscript } from "youtube-transcript";
import { getSubtitles } from "youtube-captions-scraper";
import dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const stripeKey = process.env.STRIPE_SECRET_KEY;
      
      // If no Stripe key is provided, we return a fallback URL to simulate a successful checkout
      // This is useful for templates or when the user hasn't configured Stripe yet.
      if (!stripeKey) {
        return res.json({ url: `${req.headers.origin}/success?session_id=mock_session_123` });
      }

      const stripe = new Stripe(stripeKey);
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'MindRecap Pro (Ad-Free)',
                description: 'Remove all ads and unlock unlimited access.',
              },
              unit_amount: 499,
              recurring: {
                interval: 'month',
              },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/`,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Stripe error:", error);
      res.status(500).json({ error: error.message || "Failed to create checkout session" });
    }
  });

  app.post("/api/summarize", async (req, res) => {
    try {
      const { text, type, format, hasTranscript } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text or URL is required" });
      }

      const apiKey = process.env.GEMINI_API_KEY?.trim();
      if (!apiKey) {
        return res.status(500).json({ error: "Gemini API key is not configured" });
      }

      const ai = new GoogleGenAI({ apiKey });
      const model = "gemini-3-flash-preview";

      let prompt = "";
      if (type === "youtube" && hasTranscript === false) {
        switch (format) {
          case "bullet":
            prompt = `Summarize the following YouTube video into concise bullet points focusing on key takeaways. Use the googleSearch tool to find information about the video if needed:\n\n${text}`;
            break;
          case "detailed":
            prompt = `Provide a detailed summary of the following YouTube video, covering all main points and supporting details. Use the googleSearch tool to find information about the video if needed:\n\n${text}`;
            break;
          case "takeaways":
            prompt = `Extract the most important key takeaways from the following YouTube video. Use the googleSearch tool to find information about the video if needed:\n\n${text}`;
            break;
          default:
            prompt = `Provide a short, concise summary of the following YouTube video. Use the googleSearch tool to find information about the video if needed:\n\n${text}`;
        }
      } else {
        switch (format) {
          case "bullet":
            prompt = `Summarize the following text into concise bullet points focusing on key takeaways:\n\n${text}`;
            break;
          case "detailed":
            prompt = `Provide a detailed summary of the following text, covering all main points and supporting details:\n\n${text}`;
            break;
          case "takeaways":
            prompt = `Extract the most important key takeaways from the following text:\n\n${text}`;
            break;
          default:
            prompt = `Provide a short, concise summary of the following text:\n\n${text}`;
        }
      }

      const config: any = {};
      if (type === "youtube" && hasTranscript === false) {
        config.tools = [{ googleSearch: {} }];
      }

      const result = await ai.models.generateContent({
        model,
        contents: prompt,
        config,
      });

      res.json({ summary: result.text });
    } catch (error: any) {
      console.error("Summarization error:", error);
      res.status(500).json({ error: error.message || "Failed to summarize text" });
    }
  });

  app.post("/api/plagiarism-check", async (req, res) => {
    try {
      const { text, action } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }

      const apiKey = process.env.GEMINI_API_KEY?.trim();
      if (!apiKey) {
        return res.status(500).json({ error: "Gemini API key is not configured" });
      }

      const ai = new GoogleGenAI({ apiKey });
      const model = "gemini-3-flash-preview";

      let prompt = "";
      if (action === "check") {
        prompt = `You are an advanced plagiarism checker for students and researchers. Analyze the following text and identify any parts that seem unoriginal, cliché, or potentially plagiarized. Give a "Plagiarism Score" from 0% to 100% (where 100% means completely plagiarized). Then, list the specific sentences or phrases that are problematic and explain why. Finally, provide a brief overall assessment.\n\nText:\n${text}`;
      } else if (action === "rewrite") {
        prompt = `You are an expert academic writer and editor. Rewrite the following text to completely remove any potential plagiarism, clichés, or unoriginal phrasing. Ensure the new text is 100% original, flows naturally, and maintains the original meaning and academic tone. Do not include any introductory or concluding remarks, just provide the rewritten text.\n\nText:\n${text}`;
      } else {
        return res.status(400).json({ error: "Invalid action" });
      }

      const result = await ai.models.generateContent({
        model,
        contents: prompt,
      });

      res.json({ result: result.text });
    } catch (error: any) {
      console.error("Plagiarism check error:", error);
      res.status(500).json({ error: error.message || "Failed to process text" });
    }
  });

  app.post("/api/youtube-transcript", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: "YouTube URL is required" });
      }

      // Extract video ID
      const videoIdMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      const videoId = videoIdMatch ? videoIdMatch[1] : null;

      if (!videoId) {
        return res.status(400).json({ error: "Invalid YouTube URL" });
      }

      let fullText = "";
      let hasTranscript = true;
      try {
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);
        fullText = transcript.map(t => t.text).join(" ");
      } catch (err1: any) {
        console.warn("YoutubeTranscript failed, trying youtube-captions-scraper...", err1.message);
        try {
          const captions = await getSubtitles({ videoID: videoId, lang: 'en' });
          fullText = captions.map((c: any) => c.text).join(" ");
        } catch (err2: any) {
          console.warn(`Both transcript methods failed. 1: ${err1.message}, 2: ${err2.message}`);
          hasTranscript = false;
        }
      }
      
      res.json({ transcript: fullText, videoId, hasTranscript, url });
    } catch (error: any) {
      console.error("YouTube transcript error:", error);
      res.status(500).json({ error: `Failed to fetch YouTube transcript: ${error.message || "Unknown error"}. It might be unavailable for this video.` });
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
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
