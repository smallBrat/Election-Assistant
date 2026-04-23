export interface AssistantHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AssistantApiSuccessResponse {
  text: string;
  source: 'vertex' | 'mock' | 'fallback';
  timestamp: string;
}

interface AssistantApiErrorResponse {
  error?: string;
  source?: string;
  timestamp?: string;
}

export async function askElectionAssistant(message: string, history: AssistantHistoryMessage[] = []): Promise<AssistantApiSuccessResponse> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, history }),
  });

  const payload = await response.json().catch(() => ({})) as Partial<AssistantApiSuccessResponse> & AssistantApiErrorResponse;

  const replyText = typeof payload.text === 'string' ? payload.text.trim() : '';
  const replySource = payload.source === 'vertex' || payload.source === 'mock' || payload.source === 'fallback'
    ? payload.source
    : response.ok
      ? 'vertex'
      : 'fallback';
  const replyTimestamp = typeof payload.timestamp === 'string' && payload.timestamp.trim().length > 0
    ? payload.timestamp
    : new Date().toISOString();

  if (response.ok && replyText) {
    return {
      text: replyText,
      source: replySource,
      timestamp: replyTimestamp,
    };
  }

  if (!response.ok) {
    throw new Error(payload.error || 'The assistant service is temporarily unavailable.');
  }

  throw new Error('The assistant returned an empty response.');
}
