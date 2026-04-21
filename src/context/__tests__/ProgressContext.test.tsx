import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ProgressProvider, useProgress } from '../ProgressContext';

function ProgressProbe() {
  const { progressPercentage, markCompleted } = useProgress();

  return (
    <div>
      <span>{progressPercentage}%</span>
      <button type="button" onClick={() => markCompleted('faq')}>
        Complete FAQ
      </button>
    </div>
  );
}

describe('ProgressContext', () => {
  it('starts at 0% and updates when a section is completed', async () => {
    const user = userEvent.setup();

    render(
      <ProgressProvider>
        <ProgressProbe />
      </ProgressProvider>
    );

    expect(screen.getByText('0%')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /complete faq/i }));
    expect(screen.getByText('10%')).toBeInTheDocument();
  });

  it('restores a fully completed state from localStorage', () => {
    localStorage.setItem(
      'electionEduProgress',
      JSON.stringify({
        timeline: true,
        guide: true,
        registration: true,
        documents: true,
        checklist: true,
        faq: true,
        glossary: true,
        chat: true,
        quiz: true,
        guided: true,
      })
    );

    render(
      <ProgressProvider>
        <ProgressProbe />
      </ProgressProvider>
    );

    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('falls back to defaults when stored progress is invalid', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    localStorage.setItem('electionEduProgress', 'not-json');

    render(
      <ProgressProvider>
        <ProgressProbe />
      </ProgressProvider>
    );

    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
