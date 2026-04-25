import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebaseClient';
import type { SectionKey } from '../context/ProgressContext';
import type { User } from 'firebase/auth';
import {
  ensureValidUid,
  toIsoString,
  normalizeCompletedSections,
  normalizeStringField,
  normalizeNumberField,
  calculateProgressPercentage,
} from '../utils/helpers';
import {
  FIRESTORE_PROGRESS_DOC_ID,
  FIRESTORE_PREFERENCES_DOC_ID,
  FIRESTORE_QUIZ_COLLECTION_ID,
  VALID_SECTION_KEYS,
} from '../constants/app';

export type UserProgressRecord = Partial<Record<SectionKey, boolean>>;

export interface StoredQuizResult {
  score: number;
  totalQuestions: number;
  completedAt?: string;
}

export interface UserProgressOverview {
  completedSections: SectionKey[];
  currentSection: string | null;
  progressPercent: number;
  lastVisitedScreen: string | null;
  latestScore: number | null;
  bestScore: number | null;
  lastQuizAttemptAt?: string;
}

export interface QuizAttemptPayload {
  quizId: string;
  score: number;
  totalQuestions: number;
  answersSummary?: {
    correct?: number;
    incorrect?: number;
    unanswered?: number;
  };
  completedAt?: string;
}

export interface QuizAttemptRecord extends QuizAttemptPayload {
  id: string;
  completedAt?: string;
}

export interface UserPreferences {
  theme: string;
  learningMode: string;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  learningMode: 'guided',
};

// ============================================================================
// Firestore Path Helpers - centralized for easy refactoring
// ============================================================================

/**
 * Get reference to a user's progress document
 */
function progressDocRef(uid: string) {
  return doc(db!, 'users', uid, 'progress', FIRESTORE_PROGRESS_DOC_ID);
}

/**
 * Get reference to a user document
 */
function userDocRef(uid: string) {
  return doc(db!, 'users', uid);
}

/**
 * Get reference to a user's preferences document
 */
function preferencesDocRef(uid: string) {
  return doc(db!, 'users', uid, 'preferences', FIRESTORE_PREFERENCES_DOC_ID);
}

/**
 * Get reference to a user's quiz attempts collection
 */
function quizAttemptsCollection(uid: string) {
  return collection(db!, 'users', uid, FIRESTORE_QUIZ_COLLECTION_ID);
}

export async function ensureUserDocument(user: Pick<User, 'uid' | 'displayName' | 'email'>): Promise<void> {
  if (!db) {
    return;
  }

  ensureValidUid(user.uid);

  const userRef = userDocRef(user.uid);
  const existing = await getDoc(userRef);

  if (!existing.exists()) {
    await setDoc(userRef, {
      displayName: user.displayName ?? null,
      email: user.email ?? null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastActiveAt: serverTimestamp(),
    });
    return;
  }

  await updateDoc(userRef, {
    displayName: user.displayName ?? null,
    email: user.email ?? null,
    updatedAt: serverTimestamp(),
    lastActiveAt: serverTimestamp(),
  });
}

export async function getUserProgress(uid: string): Promise<UserProgressOverview | null> {
  if (!db) {
    return null;
  }

  ensureValidUid(uid);

  const snapshot = await getDoc(progressDocRef(uid));
  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();

  return {
    completedSections: normalizeCompletedSections(data.completedSections),
    currentSection: normalizeStringField(data.currentSection),
    progressPercent: normalizeNumberField(data.progressPercent, 0) ?? 0,
    lastVisitedScreen: normalizeStringField(data.lastVisitedScreen),
    latestScore: normalizeNumberField(data.latestScore, null),
    bestScore: normalizeNumberField(data.bestScore, null),
    lastQuizAttemptAt: toIsoString(data.lastQuizAttemptAt),
  };
}

export async function saveUserProgress(
  uid: string,
  progressPayload: {
    completedSections: SectionKey[];
    currentSection?: string | null;
    progressPercent?: number;
    lastVisitedScreen?: string | null;
  },
): Promise<void> {
  if (!db) {
    return;
  }

  ensureValidUid(uid);

  const completedSections = Array.from(new Set(progressPayload.completedSections))
    .filter((section): section is SectionKey => VALID_SECTION_KEYS.includes(section));

  await setDoc(
    progressDocRef(uid),
    {
      completedSections,
      currentSection: progressPayload.currentSection ?? null,
      progressPercent: typeof progressPayload.progressPercent === 'number' ? progressPayload.progressPercent : 0,
      lastVisitedScreen: progressPayload.lastVisitedScreen ?? null,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  await setDoc(
    userDocRef(uid),
    {
      lastActiveAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function markSectionCompleted(uid: string, sectionId: SectionKey): Promise<void> {
  if (!db) {
    return;
  }

  ensureValidUid(uid);

  const existing = await getUserProgress(uid);
  const completedSet = new Set(existing?.completedSections ?? []);
  completedSet.add(sectionId);

  const completedSections = Array.from(completedSet);
  const progressPercent = calculateProgressPercentage(completedSections.length, VALID_SECTION_KEYS.length);

  await saveUserProgress(uid, {
    completedSections,
    currentSection: sectionId,
    lastVisitedScreen: sectionId,
    progressPercent,
  });
}

export async function saveQuizAttempt(uid: string, attemptPayload: QuizAttemptPayload): Promise<void> {
  if (!db) {
    return;
  }

  ensureValidUid(uid);

  const payload = {
    quizId: attemptPayload.quizId,
    score: attemptPayload.score,
    totalQuestions: attemptPayload.totalQuestions,
    answersSummary: attemptPayload.answersSummary ?? null,
    completedAt: attemptPayload.completedAt ?? new Date().toISOString(),
    createdAt: serverTimestamp(),
  };

  await addDoc(quizAttemptsCollection(uid), payload);

  const progress = await getUserProgress(uid);
  const previousBest = progress?.bestScore ?? null;
  const bestScore = previousBest === null ? attemptPayload.score : Math.max(previousBest, attemptPayload.score);

  await setDoc(
    progressDocRef(uid),
    {
      latestScore: attemptPayload.score,
      bestScore,
      lastQuizAttemptAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  await setDoc(
    userDocRef(uid),
    {
      lastActiveAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function getRecentQuizAttempts(uid: string, maxCount = 5): Promise<QuizAttemptRecord[]> {
  if (!db) {
    return [];
  }

  ensureValidUid(uid);

  const attemptsQuery = query(
    quizAttemptsCollection(uid),
    orderBy('createdAt', 'desc'),
    limit(Math.max(1, maxCount)),
  );

  const snapshots = await getDocs(attemptsQuery);

  return snapshots.docs.map((docSnapshot) => {
    const data = docSnapshot.data();
    return {
      id: docSnapshot.id,
      quizId: normalizeStringField(data.quizId, 'self-check') as string,
      score: normalizeNumberField(data.score, 0) ?? 0,
      totalQuestions: normalizeNumberField(data.totalQuestions, 0) ?? 0,
      answersSummary: typeof data.answersSummary === 'object' && data.answersSummary ? data.answersSummary : undefined,
      completedAt:
        normalizeStringField(data.completedAt) ?? toIsoString(data.createdAt),
    };
  });
}

export async function saveUserPreferences(uid: string, preferencesPayload: Partial<UserPreferences>): Promise<void> {
  if (!db) {
    return;
  }

  ensureValidUid(uid);

  await setDoc(
    preferencesDocRef(uid),
    {
      theme: preferencesPayload.theme ?? DEFAULT_PREFERENCES.theme,
      learningMode: preferencesPayload.learningMode ?? DEFAULT_PREFERENCES.learningMode,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function getUserPreferences(uid: string): Promise<UserPreferences | null> {
  if (!db) {
    return null;
  }

  ensureValidUid(uid);

  const snapshot = await getDoc(preferencesDocRef(uid));
  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();
  return {
    theme: normalizeStringField(data.theme, DEFAULT_PREFERENCES.theme) as string,
    learningMode: normalizeStringField(data.learningMode, DEFAULT_PREFERENCES.learningMode) as string,
  };
}

// Compatibility wrapper for existing app usage.
export async function loadUserProgress(userId: string): Promise<UserProgressRecord | null> {
  const progress = await getUserProgress(userId);
  if (!progress) {
    return null;
  }

  const mapped: UserProgressRecord = {};
  for (const section of progress.completedSections) {
    mapped[section] = true;
  }

  return mapped;
}

// Compatibility wrapper for existing app usage.
export async function saveQuizResult(userId: string, score: number, totalQuestions: number): Promise<void> {
  await saveQuizAttempt(userId, {
    quizId: 'self-check',
    score,
    totalQuestions,
    answersSummary: {
      correct: score,
      incorrect: Math.max(totalQuestions - score, 0),
      unanswered: 0,
    },
  });
}

// Compatibility wrapper for existing app usage.
export async function loadLatestQuizResult(userId: string): Promise<StoredQuizResult | null> {
  const attempts = await getRecentQuizAttempts(userId, 1);
  if (attempts.length === 0) {
    return null;
  }

  return {
    score: attempts[0].score,
    totalQuestions: attempts[0].totalQuestions,
    completedAt: attempts[0].completedAt,
  };
}

// Compatibility wrapper for existing app usage.
export async function saveUserProgressLegacy(userId: string, completedSections: UserProgressRecord): Promise<void> {
  const keys = Object.entries(completedSections)
    .filter(([, value]) => Boolean(value))
    .map(([section]) => section as SectionKey)
    .filter((section): section is SectionKey => VALID_SECTION_KEYS.includes(section));

  await saveUserProgress(userId, {
    completedSections: keys,
    progressPercent: Math.round((keys.length / VALID_SECTION_KEYS.length) * 100),
  });
}