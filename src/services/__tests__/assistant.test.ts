import { describe, expect, it, vi } from 'vitest';
import { askElectionAssistant } from '../assistant';

describe('askElectionAssistant', () => {
  it('returns a Gemini reply when the API responds successfully', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ text: 'Use the official election office to verify the deadline.' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const reply = await askElectionAssistant('When should I register?', [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there' },
    ]);

    expect(reply).toContain('official election office');
    expect(fetchMock).toHaveBeenCalledWith('/api/chat', expect.objectContaining({ method: 'POST' }));
  });

  it('throws a useful error when the API fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Gemini is temporarily unavailable.' }),
    }));

    await expect(askElectionAssistant('Hello', [])).rejects.toThrow('Gemini is temporarily unavailable.');
  });
});
