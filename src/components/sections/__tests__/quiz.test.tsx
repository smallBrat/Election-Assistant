import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../../../test/render';
import { Quiz } from '../Quiz';
import { quizData } from '../../../data/mockData';

describe('Quiz', () => {
  it('completes the quiz and shows the final score', async () => {
    const user = userEvent.setup();

    renderWithProviders(<Quiz />);

    for (const question of quizData) {
      await user.click(screen.getByRole('button', { name: question.options[question.correctAnswer] }));
      expect(screen.getByText(question.explanation)).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: /next question|see results/i }));
    }

    expect(screen.getByText(/great job finishing the quiz/i)).toBeInTheDocument();
    expect(
      screen.getByText((_, element) => {
        if (!element || element.tagName.toLowerCase() !== 'p') {
          return false;
        }

        return element.textContent?.replace(/\s+/g, ' ').includes('5 / 5') ?? false;
      })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });
});
