import { describe, expect, it } from 'vitest';
import { chatAssistantResponses, faqData, glossaryData, quizData, timelineData } from '../mockData';

describe('mock data', () => {
  it('contains the expected educational content', () => {
    expect(faqData.length).toBeGreaterThan(0);
    expect(glossaryData.length).toBeGreaterThan(0);
    expect(timelineData.length).toBeGreaterThan(0);
    expect(quizData.length).toBeGreaterThan(0);
    expect(chatAssistantResponses.default).toContain('educational assistant');
  });

  it('keeps quiz answers within the valid option range', () => {
    for (const question of quizData) {
      expect(question.correctAnswer).toBeGreaterThanOrEqual(0);
      expect(question.correctAnswer).toBeLessThan(question.options.length);
      expect(question.question).not.toHaveLength(0);
      expect(question.explanation).not.toHaveLength(0);
    }
  });
});
