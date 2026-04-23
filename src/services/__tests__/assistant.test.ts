import { describe, expect, it, vi } from 'vitest';
import { askElectionAssistant } from '../assistant';

describe('askElectionAssistant', () => {
  it('returns a Gemini reply when the API responds successfully', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        text: 'Use the official election office to verify the deadline.',
        source: 'vertex',
        timestamp: '2026-04-23T00:00:00.000Z',
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const reply = await askElectionAssistant('When should I register?', [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there' },
    ]);

    expect(reply.text).toContain('official election office');
    expect(reply.source).toBe('vertex');
    expect(reply.timestamp).toBe('2026-04-23T00:00:00.000Z');
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
