import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const config = {
  port: Number(process.env.PORT || 8080),
  project: process.env.GOOGLE_CLOUD_PROJECT || '',
  location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
  modelName: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  mockAiMode: String(process.env.MOCK_AI || '').toLowerCase() === 'true',
  credentialsPath: process.env.GOOGLE_APPLICATION_CREDENTIALS || '',
};

const MODEL_TIMEOUT_MS = 15000;
const MAX_MESSAGE_LENGTH = 4000;
const MAX_HISTORY_ENTRIES = 12;
const JSON_BODY_LIMIT = '32kb';

const vertexModelBaseUrl = config.project
  ? `https://${config.location}-aiplatform.googleapis.com/v1/projects/${config.project}/locations/${config.location}/publishers/google/models`
  : `https://${config.location}-aiplatform.googleapis.com/v1/projects/_/locations/${config.location}/publishers/google/models`;

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

function createRequestId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function getCredentialsDiagnostics(credentialsFilePath) {
  if (!credentialsFilePath) {
    return {
      credentialsPathSet: false,
      credentialsFileExists: false,
      credentialsIsFile: false,
      credentialsReadable: false,
    };
  }

  const diagnostics = {
    credentialsPathSet: true,
    credentialsFileExists: false,
    credentialsIsFile: false,
    credentialsReadable: false,
  };

  try {
    diagnostics.credentialsFileExists = fs.existsSync(credentialsFilePath);

    if (diagnostics.credentialsFileExists) {
      const stats = fs.statSync(credentialsFilePath);
      diagnostics.credentialsIsFile = stats.isFile();

      if (diagnostics.credentialsIsFile) {
        fs.accessSync(credentialsFilePath, fs.constants.R_OK);
        diagnostics.credentialsReadable = true;
      }
    }
  } catch (_error) {
    diagnostics.credentialsReadable = false;
  }

  return diagnostics;
}

function getMockAssistantResponse(message) {
  const normalized = message.toLowerCase();

  if (normalized.includes('registration') || normalized.includes('register')) {
    return 'Voter registration means signing up with your local election authority before the deadline so your eligibility can be checked. The exact steps and deadlines vary by region, so verify the official process with your local election authority.';
  }

  if (normalized.includes('timeline') || normalized.includes('election day') || normalized.includes('before election')) {
    return 'A simple election timeline is: registration, candidate nomination, campaigning, voting day, counting, and results. Dates and procedures vary by country and region, so always check the official election calendar.';
  }

  if (normalized.includes('checklist') || normalized.includes('carry') || normalized.includes('bring')) {
    return 'A practical voting-day checklist usually includes an accepted ID, your voter card if required, your polling location, and any documents your local election authority asks for. Always verify the exact list for your region before you go.';
  }

  if (normalized.includes('document') || normalized.includes('id') || normalized.includes('proof of address')) {
    return 'Required documents often include a government-issued photo ID and sometimes proof of address or a voter card. The rules differ by country and region, so confirm the official requirements with your local election authority.';
  }

  return 'Elections are a step-by-step civic process: people register, candidates are nominated, campaigns happen, voting day arrives, ballots are counted, and results are announced. Rules and deadlines vary by country and region, so always verify official details with your local election authority.';
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

function withTimeout(promise, timeoutMs, timeoutLabel) {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    return promise;
  }

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${timeoutLabel} timed out after ${timeoutMs}ms.`));
    }, timeoutMs);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function buildChatResponse(text, source) {
  return {
    text,
    source,
    timestamp: new Date().toISOString(),
  };
}

function validateChatRequest(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('Request body must be a JSON object.');
  }

  const { message, history } = body;

  if (typeof message !== 'string' || message.trim().length === 0) {
    throw new Error('message must be a non-empty string.');
  }

  const trimmedMessage = message.trim();
  if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
    throw new Error(`message must be ${MAX_MESSAGE_LENGTH} characters or fewer.`);
  }

  const normalizedHistory = history === undefined ? [] : history;
  if (!Array.isArray(normalizedHistory)) {
    throw new Error('history must be an array when present.');
  }

  if (normalizedHistory.length > MAX_HISTORY_ENTRIES) {
    throw new Error(`history must contain no more than ${MAX_HISTORY_ENTRIES} messages.`);
  }

  const sanitizedHistory = normalizedHistory.map((item, index) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw new Error(`history[${index}] must be an object with role and content.`);
    }

    const { role, content } = item;
    if (role !== 'user' && role !== 'assistant') {
      throw new Error(`history[${index}].role must be either "user" or "assistant".`);
    }

    if (typeof content !== 'string' || content.trim().length === 0) {
      throw new Error(`history[${index}].content must be a non-empty string.`);
    }

    const normalizedContent = content.trim();
    if (normalizedContent.length > MAX_MESSAGE_LENGTH) {
      throw new Error(`history[${index}].content must be ${MAX_MESSAGE_LENGTH} characters or fewer.`);
    }

    return {
      role,
      content: normalizedContent,
    };
  });

  return {
    message: trimmedMessage,
    history: sanitizedHistory,
  };
}

const ai = config.project
  ? new GoogleGenAI({
      vertexai: true,
      project: config.project,
      location: config.location,
    })
  : null;

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json({ limit: JSON_BODY_LIMIT }));
app.use(express.static(path.join(__dirname, 'dist')));

app.get('/healthz', (_req, res) => {
  res.json({ ok: true });
});

app.get('/readyz', (_req, res) => {
  const credentialsDiagnostics = getCredentialsDiagnostics(config.credentialsPath);

  res.json({
    ok: true,
    mockAiMode: config.mockAiMode,
    vertexConfigured: Boolean(config.project && config.location && config.modelName),
    credentialsPathSet: credentialsDiagnostics.credentialsPathSet,
    credentialsFileExists: credentialsDiagnostics.credentialsFileExists,
    credentialsIsFile: credentialsDiagnostics.credentialsIsFile,
    credentialsReadable: credentialsDiagnostics.credentialsReadable,
  });
});

app.post('/api/chat', async (req, res) => {
  const requestId = createRequestId();
  const startedAt = Date.now();
  let requestMessage = '';

  try {
    const { message, history } = validateChatRequest(req.body);
    requestMessage = message;

    logEvent('INFO', 'chat.request_received', {
      requestId,
      project: config.project,
      location: config.location,
      model: config.modelName,
      mockAiMode: config.mockAiMode,
      messageLength: message.length,
      historyLength: history.length,
    });

    if (config.mockAiMode) {
      const response = buildChatResponse(getMockAssistantResponse(message), 'mock');

      logEvent('INFO', 'chat.mock_success', {
        requestId,
        project: config.project,
        location: config.location,
        model: config.modelName,
        mockAiMode: config.mockAiMode,
        durationMs: Date.now() - startedAt,
      });

      res.json(response);
      return;
    }

    if (!config.project) {
      throw new Error('GOOGLE_CLOUD_PROJECT is not set.');
    }

    if (!ai) {
      throw new Error('Gen AI client was not initialized.');
    }

    const credentialsDiagnostics = getCredentialsDiagnostics(config.credentialsPath);

    logEvent('INFO', 'chat.model_request_started', {
      requestId,
      project: config.project,
      location: config.location,
      model: config.modelName,
      mockAiMode: config.mockAiMode,
      credentialsPathSet: credentialsDiagnostics.credentialsPathSet,
      credentialsFileExists: credentialsDiagnostics.credentialsFileExists,
      credentialsIsFile: credentialsDiagnostics.credentialsIsFile,
      credentialsReadable: credentialsDiagnostics.credentialsReadable,
    });

    const contents = [
      ...normalizeHistory(history),
      {
        role: 'user',
        parts: [{ text: message }],
      },
    ];

    const result = await withTimeout(
      ai.models.generateContent({
        model: config.modelName,
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
      }),
      MODEL_TIMEOUT_MS,
      'Vertex AI request',
    );

    const text =
      (typeof result?.text === 'string' ? result.text.trim() : '') ||
      extractTextFromResponse(result);

    if (!text) {
      throw new Error('Vertex AI returned an empty response.');
    }

    logEvent('INFO', 'chat.model_request_success', {
      requestId,
      project: config.project,
      location: config.location,
      model: config.modelName,
      mockAiMode: config.mockAiMode,
      durationMs: Date.now() - startedAt,
    });

    res.json(buildChatResponse(text, 'vertex'));
  } catch (error) {
    console.error('Vertex AI error:', error);

    const rawError = error instanceof Error ? error.message : String(error);
    const timedOut = rawError.includes('timed out');
    const authHint = rawError.includes('default credentials')
      ? 'ADC missing in container. Mount a service-account key and set GOOGLE_APPLICATION_CREDENTIALS, or use Cloud Run service account auth.'
      : undefined;

    const fallback = requestMessage
      ? getFallbackResponse(requestMessage)
      : "I'm having trouble reaching the election assistant right now. Please try again later, and remember to verify important information with your local election authority.";
    const credentialsDiagnostics = getCredentialsDiagnostics(config.credentialsPath);

    logEvent('ERROR', 'chat.model_request_failure', {
      requestId,
      error: error instanceof Error ? error.toString() : String(error),
      authHint,
      timedOut,
      project: config.project,
      model: config.modelName,
      location: config.location,
      mockAiMode: config.mockAiMode,
      baseUrl: vertexModelBaseUrl,
      hasCredentialsPath: credentialsDiagnostics.credentialsPathSet,
      credentialsFileExists: credentialsDiagnostics.credentialsFileExists,
      credentialsIsFile: credentialsDiagnostics.credentialsIsFile,
      credentialsReadable: credentialsDiagnostics.credentialsReadable,
      durationMs: Date.now() - startedAt,
    });

    res.status(500).json(buildChatResponse(fallback, 'fallback'));
  }
});

app.use((error, _req, res, next) => {
  if (error?.type === 'entity.too.large') {
    res.status(413).json({
      error: 'Request body is too large.',
      source: 'validation',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  next(error);
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(config.port, '0.0.0.0', () => {
  const credentialsDiagnostics = getCredentialsDiagnostics(config.credentialsPath);

  logEvent('INFO', 'server.started', {
    port: config.port,
    project: config.project,
    location: config.location,
    model: config.modelName,
    mockAiMode: config.mockAiMode,
    hasCredentialsPath: credentialsDiagnostics.credentialsPathSet,
    credentialsFileExists: credentialsDiagnostics.credentialsFileExists,
    credentialsIsFile: credentialsDiagnostics.credentialsIsFile,
    credentialsReadable: credentialsDiagnostics.credentialsReadable,
    localCredentialsMode: Boolean(config.credentialsPath),
    baseUrl: vertexModelBaseUrl,
  });

  if (!config.mockAiMode && credentialsDiagnostics.credentialsPathSet && !credentialsDiagnostics.credentialsReadable) {
    logEvent('WARNING', 'credentials.path_unreadable', {
      localCredentialsMode: true,
      credentialsFileExists: credentialsDiagnostics.credentialsFileExists,
      credentialsIsFile: credentialsDiagnostics.credentialsIsFile,
      credentialsReadable: credentialsDiagnostics.credentialsReadable,
      hint: 'Check Docker bind mount source path and ensure it points to a readable JSON file, not a directory.',
    });
  }
});
