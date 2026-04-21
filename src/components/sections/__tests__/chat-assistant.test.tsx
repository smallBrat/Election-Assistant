import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../test/render';
import { ChatAssistant } from '../ChatAssistant';

describe('ChatAssistant', () => {
  it('renders Gemini responses when the service succeeds', async () => {
    const assistantService = vi.fn().mockResolvedValue('Check your official election office for the exact deadline.');

    renderWithProviders(<ChatAssistant assistantService={assistantService} />);

    fireEvent.change(screen.getByLabelText(/ask the assistant a civic education question/i), {
      target: { value: 'When should I register?' },
    });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => expect(assistantService).toHaveBeenCalledWith('When should I register?', expect.any(Array)));
    expect(await screen.findByText(/check your official election office/i)).toBeInTheDocument();
  });

  it('falls back locally when Gemini is unavailable', async () => {
    const assistantService = vi.fn().mockRejectedValue(new Error('network error'));

    renderWithProviders(<ChatAssistant assistantService={assistantService} />);

    fireEvent.change(screen.getByLabelText(/ask the assistant a civic education question/i), {
      target: { value: 'What should I carry to vote?' },
    });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    expect(await screen.findByText(/gemini is temporarily unavailable/i)).toBeInTheDocument();
    expect(screen.getByText(/you should carry an accepted form of identification/i)).toBeInTheDocument();
  });
});
