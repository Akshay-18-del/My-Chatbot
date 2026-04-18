import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import * as db from './db.js';
import workflowRouter from './workflows.js';

/* ─── Bootstrap ─────────────────────────────────────── */
config(); // load .env

const app  = express();
const PORT = process.env.PORT || 3001;

/* ─── Middleware ─────────────────────────────────────── */
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }));
app.use(express.json({ limit: '2mb' }));

/* ─── Advanced Workflows ──────────────────────────────── */
app.use('/api/workflows', workflowRouter);

/* ─── Google Gemini client ──────────────────────────────────── */
let ai = null;
const apiKey = process.env.GEMINI_API_KEY;
if (apiKey && apiKey !== 'your_gemini_api_key_here') {
  ai = new GoogleGenAI({ apiKey });
}
const MODEL  = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

/* ─── Health check ───────────────────────────────────── */
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', model: MODEL, timestamp: new Date().toISOString() });
});

/* ─── Conversations API ────────────────────────────── */
app.get('/api/conversations', (_req, res) => {
  try {
    const convs = db.getConversations();
    res.json(convs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/conversations/:id/messages', (req, res) => {
  try {
    const msgs = db.getMessages(req.params.id);
    res.json(msgs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/conversations', (req, res) => {
  try {
    const { id, title } = req.body;
    if (!id || !title) return res.status(400).json({ error: 'id and title required' });
    const conv = db.createConversation(id, title);
    res.json(conv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/conversations/:id', (req, res) => {
  try {
    db.deleteConversation(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ─── POST /api/chat  (SSE Streaming) ───────────────── */
app.post('/api/chat', async (req, res) => {
  const { messages, convId } = req.body;

  // Validate
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages must be a non-empty array.' });
  }

  // Save the user's message to the database
  const userMsg = messages[messages.length - 1];
  if (convId && userMsg.role === 'user') {
    try {
      db.addMessage(convId, 'user', userMsg.content);
    } catch (err) {
      console.error('[DB Error] saving user message:', err.message);
    }
  }

  // SSE headers
  res.setHeader('Content-Type',  'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection',    'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // disable nginx buffering
  res.flushHeaders();

  // Helper to safely write an SSE event
  const send = (payload) => {
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    }
  };

const delay = (ms) => new Promise(r => setTimeout(r, ms));

  try {
    if (!ai) {
      throw { status: 401, message: 'Missing GEMINI_API_KEY' };
    }

    const systemInstructionMsg = messages.find(m => m.role === 'system');
    const systemInstruction = systemInstructionMsg ? systemInstructionMsg.content : undefined;

    const validMessages = messages.filter(msg => msg.role !== 'system');
    const geminiContents = validMessages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const responseStream = await ai.models.generateContentStream({
      model: MODEL,
      contents: geminiContents,
      config: {
        temperature: 0.7,
        maxOutputTokens: 4096,
        ...(systemInstruction && { systemInstruction })
      }
    });

    let fullAssistantResponse = '';
    for await (const chunk of responseStream) {
      const delta = chunk.text;
      if (delta) {
        fullAssistantResponse += delta;
        send({ type: 'delta', content: delta });
      }
    }
    
    send({ type: 'done' });

    // Save full assistant message
    if (convId && fullAssistantResponse) {
      try {
        db.addMessage(convId, 'assistant', fullAssistantResponse);
      } catch (err) {
        console.error('[DB Error] saving assistant message:', err.message);
      }
    }
  } catch (err) {
    console.error('[Gemini Error]', err?.message ?? err);

    // Distinguish between auth errors and others
    if (err?.status === 401 || (err?.message || '').includes('API_KEY')) {
      send({ type: 'error', message: '🔑 Invalid API key. Please check your GEMINI_API_KEY in server/.env' });
    } else if (err?.status === 429 || (err?.message || '').includes('quota')) {
      // Fallback to streaming mock response without closing connection prematurely
      console.warn('⚠️ Rate limit reached. Falling back to mock response...');
      const mockResponse = "⚠️ **Rate Limit Reached**\n\nI am currently operating in **Mock Mode** because the Gemini API rate limit was exceeded. \n\nHowever, I can confirm that the frontend-to-backend connection is working perfectly! Your message was: \n> " + userMsg.content;
      
      for (const char of mockResponse) {
        send({ type: 'delta', content: char });
        await delay(20);
      }
      send({ type: 'done' });

      if (convId) {
        try {
          db.addMessage(convId, 'assistant', mockResponse);
        } catch (dbErr) {
          console.error('[DB Error] saving mock assistant message:', dbErr.message);
        }
      }
    } else {
      send({ type: 'error', message: `Server error: ${err?.message ?? 'Unknown error'}` });
    }
  } finally {
    if (!res.writableEnded) res.end();
  }
});

/* ─── Catch-all ──────────────────────────────────────── */
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

/* ─── Start ──────────────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`\n🚀  Server ready at http://localhost:${PORT}`);
  console.log(`🤖  Model         : ${MODEL}`);
  console.log(`🔑  API Key set   : ${(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') ? 'YES ✅' : 'NO ❌  (edit server/.env)'}\n`);
});
