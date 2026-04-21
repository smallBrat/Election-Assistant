export interface AssistantHistoryMessage {
  role: 'user' | 'model';
  text: string;
}

interface AssistantApiSuccessResponse {
  reply?: string;
}

interface AssistantApiErrorResponse {
  error?: string;
}

export async function askElectionAssistant(message: string, history: AssistantHistoryMessage[] = []): Promise<string> {
  const response = await fetch('/api/assistant', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, history }),
  });

  const payload = await response.json() as AssistantApiSuccessResponse & AssistantApiErrorResponse;

  if (!response.ok) {
    throw new Error(payload.error || 'The assistant service is temporarily unavailable.');
  }

  if (typeof payload.reply !== 'string' || !payload.reply.trim()) {
    throw new Error('The assistant returned an empty response.');
  }

  return payload.reply.trim();
}
