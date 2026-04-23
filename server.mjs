import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const port = Number(process.env.PORT || 8080);
const project = process.env.GOOGLE_CLOUD_PROJECT;
const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const vertexModelBaseUrl = project
  ? `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models`
  : `https://${location}-aiplatform.googleapis.com/v1/projects/_/locations/${location}/publishers/google/models`;

const systemInstructionText = [
  'You are a non-partisan election education assistant.',
  'Explain election processes clearly in plain language.',
  'Do not persuade users politically, endorse candidates, parties, or ideologies.',
  'Keep explanations educational, neutral, and factual.',
  'Always remind users that rules and required documents vary by country and region.',
  'Advise users to verify official information with their local election authority.',
].join(' ');

function logEvent(severity, event, details = {}) {
  console.log(JSON.stringify({ severity, event, timestamp: new Date().toISOString(), ...details }));
}

function getFallbackResponse(message) {
  const query = message.toLowerCase();

  if (query.includes('register')) {
    return 'Voter registration usually means adding your details to your local electoral roll before the deadline. Requirements and deadlines vary by country and region, so please verify with your local election authority.';
  }

  if (query.includes('document') || query.includes('id')) {
    return 'Many places require a valid ID and sometimes proof of address, but exact document rules vary by country and region. Please confirm official requirements with your local election authority.';
  }

  if (query.includes('timeline') || query.includes('when')) {
    return 'Election timelines often include announcement, registration, campaigning, voting day, and counting. Dates and procedures vary by country and region, so please check official local election information.';
  }

  return 'I can help explain election processes in neutral, plain language. Rules vary by country and region, so please verify official details with your local election authority.';
}

function normalizeHistory(history) {
  return history
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const role = item.role === 'assistant' ? 'model' : item.role;
      const content = typeof item.content === 'string' ? item.content.trim() : '';
      return { role, content };
    })
    .filter((item) => (item.role === 'user' || item.role === 'model') && item.content.length > 0)
    .map((item) => ({
      role: item.role,
      parts: [{ text: item.content }],
    }));
}

function extractTextFromResponse(response) {
  const candidates = response?.candidates;
  if (!Array.isArray(candidates) || candidates.length === 0) {
    return '';
  }

  const parts = candidates[0]?.content?.parts;
  if (!Array.isArray(parts) || parts.length === 0) {
    return '';
  }

  return parts
    .map((part) => (typeof part?.text === 'string' ? part.text : ''))
    .join('')
    .trim();
}

const ai = project
  ? new GoogleGenAI({
      vertexai: true,
      project,
      location,
    })
  : null;

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json({ limit: '1mb' }));

// Serve static assets from the "dist" directory
app.use(express.static(path.join(__dirname, 'dist')));

app.get('/healthz', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/chat', async (req, res) => {
  const { message, history = [] } = req.body ?? {};

  if (typeof message !== 'string' || message.trim().length === 0) {
    res.status(400).json({ error: 'message must be a non-empty string.' });
    return;
  }

  if (!Array.isArray(history)) {
    res.status(400).json({ error: 'history must be an array.' });
    return;
  }

  const userMessage = message.trim();
  const contents = [
    ...normalizeHistory(history),
    {
      role: 'user',
      parts: [{ text: userMessage }],
    },
  ];

  try {
    if (!project) {
      throw new Error('GOOGLE_CLOUD_PROJECT is not set.');
    }

    if (!ai) {
      throw new Error('Gen AI client was not initialized.');
    }

    const result = await ai.models.generateContent({
      model: modelName,
      contents,
      config: {
        systemInstruction: {
          role: 'system',
          parts: [{ text: systemInstructionText }],
        },
        temperature: 0.2,
        topP: 0.9,
        maxOutputTokens: 512,
      },
    });

    const text =
      (typeof result?.text === 'string' ? result.text.trim() : '') ||
      extractTextFromResponse(result);

    if (!text) {
      throw new Error('Vertex AI returned an empty response.');
    }

    logEvent('INFO', 'chat.vertex_success', {
      project,
      model: modelName,
      location,
      baseUrl: vertexModelBaseUrl,
    });

    res.json({ text });
  } catch (error) {
    const fallback = "I'm having trouble reaching the election assistant right now. Please try again later, and remember to verify important information with your local election authority.";

    logEvent('ERROR', 'chat.vertex_failure', {
      error: error instanceof Error ? error.toString() : String(error),
      project,
      model: modelName,
      location,
      baseUrl: vertexModelBaseUrl,
    });

    res.status(500).json({ text: fallback });
  }
});

// For any other request, serve the index.html (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  logEvent('INFO', 'server.started', {
    port,
    project,
    location,
    model: modelName,
    baseUrl: vertexModelBaseUrl,
  });
});
