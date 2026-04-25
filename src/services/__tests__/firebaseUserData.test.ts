import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('../../firebaseClient', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => {
  const doc = vi.fn();
  const collection = vi.fn();
  const getDoc = vi.fn();
  const getDocs = vi.fn();
  const addDoc = vi.fn();
  const limit = vi.fn();
  const orderBy = vi.fn();
  const query = vi.fn();
  const serverTimestamp = vi.fn(() => 'server-timestamp');
  const setDoc = vi.fn();
  const updateDoc = vi.fn();

  return {
    doc,
    collection,
    getDoc,
    getDocs,
    addDoc,
    limit,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
  };
});

import {
  addDoc,
  getDoc,
  getDocs,
  setDoc,
} from 'firebase/firestore';
import {
  ensureUserDocument,
  getRecentQuizAttempts,
  getUserPreferences,
  getUserProgress,
  loadLatestQuizResult,
  saveQuizResult,
  saveUserPreferences,
} from '../firebaseUserData';

describe('firebaseUserData service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('validates the user document payload', async () => {
    await expect(ensureUserDocument({ uid: '', displayName: 'Test', email: 'test@example.com' })).rejects.toThrow(
      'A valid user id is required for Firestore operations.',
    );
  });

  it('returns null when progress does not exist', async () => {
    vi.mocked(getDoc).mockResolvedValue({ exists: () => false } as never);

    await expect(getUserProgress('user-123')).resolves.toBeNull();
  });

  it('normalizes progress data when it exists', async () => {
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({
        completedSections: ['timeline', 'invalid'],
        currentSection: 'guide',
        progressPercent: 22,
        lastVisitedScreen: 'faq',
        latestScore: 8,
        bestScore: 9,
        lastQuizAttemptAt: { toDate: () => new Date('2026-04-23T12:00:00Z') },
      }),
    } as never);

    await expect(getUserProgress('user-123')).resolves.toEqual({
      completedSections: ['timeline'],
      currentSection: 'guide',
      progressPercent: 22,
      lastVisitedScreen: 'faq',
      latestScore: 8,
      bestScore: 9,
      lastQuizAttemptAt: '2026-04-23T12:00:00.000Z',
    });
  });

  it('saves preferences with defaults', async () => {
    vi.mocked(setDoc).mockResolvedValue(undefined as never);

    await saveUserPreferences('user-123', {});

    expect(setDoc).toHaveBeenCalled();

    const [, payload, options] = vi.mocked(setDoc).mock.calls[0];
    expect(payload).toEqual(
      expect.objectContaining({
        theme: 'system',
        learningMode: 'guided',
      }),
    );
    expect(options).toEqual({ merge: true });
  });

  it('maps recent quiz attempts', async () => {
    vi.mocked(getDocs).mockResolvedValue({
      docs: [
        {
          id: 'attempt-1',
          data: () => ({
            quizId: 'self-check',
            score: 9,
            totalQuestions: 10,
            answersSummary: { correct: 9, incorrect: 1, unanswered: 0 },
            completedAt: '2026-04-23T12:00:00.000Z',
          }),
        },
      ],
    } as never);

    await expect(getRecentQuizAttempts('user-123', 5)).resolves.toEqual([
      {
        id: 'attempt-1',
        quizId: 'self-check',
        score: 9,
        totalQuestions: 10,
        answersSummary: { correct: 9, incorrect: 1, unanswered: 0 },
        completedAt: '2026-04-23T12:00:00.000Z',
      },
    ]);
  });

  it('returns null when there are no latest quiz attempts', async () => {
    vi.mocked(getDocs).mockResolvedValue({ docs: [] } as never);

    await expect(loadLatestQuizResult('user-123')).resolves.toBeNull();
  });

  it('delegates quiz saving to the firestore layer', async () => {
    vi.mocked(getDoc).mockResolvedValue({ exists: () => false } as never);
    vi.mocked(addDoc).mockResolvedValue({ id: 'attempt-1' } as never);
    vi.mocked(setDoc).mockResolvedValue(undefined as never);

    await saveQuizResult('user-123', 8, 10);

    expect(addDoc).toHaveBeenCalled();
    expect(setDoc).toHaveBeenCalled();
  });

  it('returns null when preferences are missing', async () => {
    vi.mocked(getDoc).mockResolvedValue({ exists: () => false } as never);

    await expect(getUserPreferences('user-123')).resolves.toBeNull();
  });
});
