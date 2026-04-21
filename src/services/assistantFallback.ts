import { chatAssistantResponses } from '../data/mockData';

export function getFallbackAssistantReply(message: string): string {
  const query = message.toLowerCase().trim();

  for (const [key, value] of Object.entries(chatAssistantResponses)) {
    if (key !== 'default' && query.includes(key)) {
      return value;
    }
  }

  return chatAssistantResponses.default;
}
