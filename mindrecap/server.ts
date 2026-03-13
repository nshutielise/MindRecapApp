import express from 'express';
import { createServer as createViteServer } from 'vite';
import Stripe from 'stripe';
import cookieParser from 'cookie-parser';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '5mb' }));
app.use(cookieParser(process.env.SESSION_SECRET || 'mindrecap_secure_secret_2026'));

// --- Stripe Setup ---
let stripeClient: Stripe | null = null;
function getStripe() {
  if (!stripeClient && process.env.STRIPE_SECRET_KEY) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' as any });
  }
  return stripeClient;
}

// --- Gemini Setup ---
let ai: GoogleGenAI | null = null;
function getAI() {
  if (!ai && process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
}

// --- Auth & Payments API ---
app.get('/api/status', (req, res) => {
  const isPro = req.signedCookies.mindrecap_pro === 'true';
  res.json({ isPro });
});

app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const stripe = getStripe();
    const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
    
    if (!stripe) {
      // Mock mode for sandbox (when no real Stripe key is provided)
      return res.json({ url: `${appUrl}/api/checkout-success?session_id=mock_session_${Date.now()}` });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID || 'price_mock',
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${appUrl}/api/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/`,
    });
    res.json({ url: session.url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/checkout-success', async (req, res) => {
  const sessionId = req.query.session_id as string;
  if (!sessionId) return res.redirect('/');

  try {
    const stripe = getStripe();
    let isPaid = false;

    if (!stripe && sessionId.startsWith('mock_session_')) {
      // Mock success for sandbox
      isPaid = true;
    } else if (stripe) {
      // Real Stripe verification
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      isPaid = session.payment_status === 'paid';
    }

    if (isPaid) {
      res.cookie('mindrecap_pro', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        signed: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        sameSite: 'lax'
      });
      res.redirect('/?success=true');
    } else {
      res.redirect('/');
    }
  } catch (error) {
    console.error('Checkout success error:', error);
    res.redirect('/');
  }
});

// --- Tools API (Secure Backend Limits) ---
const enforceLimit = (req: express.Request, res: express.Response, text: string) => {
  const isPro = req.signedCookies.mindrecap_pro === 'true';
  const limit = isPro ? 10000 : 1000;
  if (text.length > limit) {
    res.status(403).json({ error: `Text exceeds the ${limit} character limit for your tier.` });
    return false;
  }
  return true;
};

app.post('/api/detect', (req, res) => {
  const { text } = req.body;
  if (!enforceLimit(req, res, text)) return;
  
  // Simulated AI detection logic
  const aiScore = Math.min(Math.max(Math.floor(Math.random() * 100), 10), 90);
  res.json({ aiScore, humanScore: 100 - aiScore });
});

app.post('/api/plagiarism', (req, res) => {
  const { text } = req.body;
  if (!enforceLimit(req, res, text)) return;
  
  // Simulated plagiarism check logic
  const similarity = Math.floor(Math.random() * 40);
  res.json({ similarity, matches: Math.floor(similarity / 10) + 1 });
});

app.post('/api/humanize', async (req, res) => {
  const { text } = req.body;
  if (!enforceLimit(req, res, text)) return;
  
  const aiClient = getAI();
  if (!aiClient) {
    // Fallback simulation if no API key
    const humanized = text.replace(/Additionally,/g, 'Also,').replace(/Furthermore,/g, 'Plus,');
    return res.json({ result: humanized + "\n\n(Simulated output: GEMINI_API_KEY not configured)" });
  }

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-3.1-flash-preview',
      contents: `Rewrite the following text to sound highly natural, conversational, and human-like. Introduce natural variations in sentence structure, vocabulary, and rhythm to bypass AI detectors. Do not add any extra commentary, just output the rewritten text.\n\nText to rewrite:\n${text}`,
    });
    res.json({ result: response.text });
  } catch (error: any) {
    console.error('Gemini error:', error);
    res.status(500).json({ error: 'Failed to process text with AI.' });
  }
});

// --- Vite Integration ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
