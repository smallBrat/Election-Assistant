import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const port = Number(process.env.PORT || 8080);
const geminiApiKey = process.env.GEMINI_API_KEY?.trim();
const geminiModel = process.env.GEMINI_MODEL?.trim() || 'gemini-2.0-flash';
const __dirname = resolve(fileURLToPath(new URL('.', import.meta.url)));
const distDirectory = join(__dirname, 'dist');

const systemPrompt = [
  'You are a civic education assistant focused on the democratic election process.',
  'Use simple, plain language and stay strictly neutral.',
  'Do not persuade users to support a party, candidate, ideology, or political outcome.',
  'Explain registration, timelines, documents, polling, and vote counting clearly.',
  'If rules vary by country, state, or region, say so explicitly and encourage users to verify official local information.',
  'Never fabricate legal advice or claim certainty when local election rules may differ.',
].join(' ');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function logEvent(severity, event, details = {}) {
  console.log(JSON.stringify({ severity, event, timestamp: new Date().toISOString(), ...details }));
}

async function readJsonBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  const rawBody = Buffer.concat(chunks).toString('utf8');
  if (!rawBody) {
    return {};
  }

  return JSON.parse(rawBody);
}

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  response.end(JSON.stringify(body));
}

function fallbackReply(message) {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('register')) {
    return 'Registration usually means adding your details to the official voter list before the deadline. Rules vary by location, so verify the exact process with your local election office.';
  }

  if (lowerMessage.includes('document') || lowerMessage.includes('id')) {
    return 'Most places ask for some form of identification or proof of address, but the exact requirement depends on your region. Check the official election website for the current list.';
  }

  if (lowerMessage.includes('timeline') || lowerMessage.includes('when')) {
    return 'Election timelines often include an announcement, registration deadline, campaign period, voting day, and vote counting. The dates are set locally, so always confirm with official sources.';
  }

  return 'I can explain the election process in simple, neutral terms. Please check your official local election website for rules that apply in your country or region.';
}

async function callGemini(message, history) {
  if (!geminiApiKey) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  const requestBody = {
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [
      ...history.map((item) => ({
        role: item.role,
        parts: [{ text: item.text }],
      })),
      {
        role: 'user',
        parts: [{ text: message }],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      topP: 0.9,
      maxOutputTokens: 400,
    },
  };

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Gemini request failed.');
  }

  const reply = payload?.candidates?.[0]?.content?.parts?.map((part) => part.text).filter(Boolean).join('').trim();

  if (!reply) {
    throw new Error('Gemini returned an empty response.');
  }

  return reply;
}

async function serveStaticAsset(response, filePath) {
  try {
    const content = await readFile(filePath);
    const extension = extname(filePath);
    response.writeHead(200, {
      'Content-Type': mimeTypes[extension] || 'application/octet-stream',
      'Cache-Control': extension === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
    });
    response.end(content);
  } catch {
    const indexPath = join(distDirectory, 'index.html');
    const content = await readFile(indexPath);
    response.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache',
    });
    response.end(content);
  }
}

createServer(async (request, response) => {
  const requestUrl = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);

  if (request.method === 'GET' && requestUrl.pathname === '/healthz') {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (request.method === 'POST' && requestUrl.pathname === '/api/assistant') {
    try {
      const body = await readJsonBody(request);
      const message = typeof body.message === 'string' ? body.message.trim() : '';
      const history = Array.isArray(body.history)
        ? body.history.filter((item) => item && typeof item.text === 'string' && (item.role === 'user' || item.role === 'model'))
        : [];

      if (!message) {
        sendJson(response, 400, { error: 'Message is required.' });
        return;
      }

      logEvent('INFO', 'assistant.request', {
        messageLength: message.length,
        historyLength: history.length,
        model: geminiModel,
      });

      try {
        const reply = await callGemini(message, history);
        logEvent('INFO', 'assistant.success', { replyLength: reply.length });
        sendJson(response, 200, { reply });
      } catch (error) {
        const fallback = fallbackReply(message);
        logEvent('ERROR', 'assistant.fallback', {
          error: error instanceof Error ? error.message : 'Unknown Gemini error',
        });
        sendJson(response, 503, {
          error: 'Gemini is temporarily unavailable.',
          reply: fallback,
        });
      }
    } catch (error) {
      logEvent('ERROR', 'assistant.bad_request', {
        error: error instanceof Error ? error.message : 'Invalid JSON payload',
      });
      sendJson(response, 400, { error: 'Invalid request body.' });
    }
    return;
  }

  const pathname = requestUrl.pathname === '/' ? '/index.html' : requestUrl.pathname;
  const filePath = join(distDirectory, pathname);
  await serveStaticAsset(response, filePath);
}).listen(port, () => {
  logEvent('INFO', 'server.started', { port });
});
