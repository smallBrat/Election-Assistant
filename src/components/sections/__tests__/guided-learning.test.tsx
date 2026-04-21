import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../../../test/render';
import { GuidedLearning } from '../GuidedLearning';

describe('GuidedLearning', () => {
  it('walks through the lesson sequence and completes the guide', async () => {
    const user = userEvent.setup();

    renderWithProviders(<GuidedLearning />);

    expect(screen.getByText(/lesson 1 of 7/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /continue/i }));
    expect(screen.getByText(/lesson 2 of 7/i)).toBeInTheDocument();

    for (let step = 2; step < 7; step += 1) {
      await user.click(screen.getByRole('button', { name: /continue/i }));
    }

    expect(screen.getByText(/guide completed/i)).toBeInTheDocument();
  });
});
