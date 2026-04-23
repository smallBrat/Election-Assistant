export interface AssistantHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AssistantApiSuccessResponse {
  text?: string;
}

interface AssistantApiErrorResponse {
  error?: string;
}

export async function askElectionAssistant(message: string, history: AssistantHistoryMessage[] = []): Promise<string> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, history }),
  });

  const payload = await response.json() as AssistantApiSuccessResponse & AssistantApiErrorResponse;

  const replyText = typeof payload.text === 'string' ? payload.text.trim() : '';
  if (replyText) {
    return replyText;
  }

  if (!response.ok) {
    throw new Error(payload.error || 'The assistant service is temporarily unavailable.');
  }

  throw new Error('The assistant returned an empty response.');
}
