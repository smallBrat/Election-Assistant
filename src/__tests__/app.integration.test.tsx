import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from '../App';
import { renderWithProviders } from '../test/render';

describe('App integration', () => {
  it('navigates between sections and keeps the progress tracker in sync', async () => {
    const user = userEvent.setup();

    renderWithProviders(<App />);

    await user.click(screen.getByRole('button', { name: /faq/i }));
    expect(screen.getByRole('heading', { name: /frequently asked questions/i })).toBeInTheDocument();
    expect(screen.getByText(/10% Completed/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /glossary/i }));
    expect(screen.getByRole('heading', { name: /glossary of terms/i })).toBeInTheDocument();
    expect(screen.getByText(/20% Completed/i)).toBeInTheDocument();
  });
});
