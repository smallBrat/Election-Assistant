import { chatAssistantResponses } from '../data/mockData';

export function getFallbackAssistantReply(message: string): string {
  const query = message.toLowerCase().trim();

  const keywordEntries = Object.entries(chatAssistantResponses).filter(([key]) => key !== 'default');
  for (const [key, value] of keywordEntries) {
    if (query.includes(key)) {
      return value;
    }
  }

  if (query.includes('checklist') || query.includes('carry') || query.includes('bring')) {
    return 'A voting-day checklist usually includes an accepted ID, your voter card if needed, your polling place, and any document your local election authority requires. Always verify the exact list for your area before you go.';
  }

  if (query.includes('document') || query.includes('id') || query.includes('proof of address')) {
    return 'Required documents often include a government-issued photo ID and sometimes proof of address or a voter card. The rules differ by country and region, so confirm the official requirements with your local election authority.';
  }

  if (query.includes('timeline') || query.includes('election day') || query.includes('before election')) {
    return 'A simple election timeline is: registration, candidate nomination, campaigning, voting day, counting, and results. Always check your official election calendar because dates and procedures vary by location.';
  }

  return chatAssistantResponses.default;
}
