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
} from 'firebase/firestore';
import { db } from '../firebaseClient';
import type { SectionKey } from '../context/ProgressContext';

export type UserProgressRecord = Partial<Record<SectionKey, boolean>>;

export interface StoredQuizResult {
  score: number;
  totalQuestions: number;
  completedAt?: string;
}

// Firestore schema: userProgress/{uid} => { completedSections, updatedAt }
export async function loadUserProgress(userId: string): Promise<UserProgressRecord | null> {
  if (!db) {
    return null;
  }

  const snapshot = await getDoc(doc(db, 'userProgress', userId));
  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();
  if (!data || typeof data !== 'object') {
    return null;
  }

  const sections = data.completedSections;
  if (!sections || typeof sections !== 'object') {
    return null;
  }

  return sections as UserProgressRecord;
}

export async function saveUserProgress(userId: string, completedSections: UserProgressRecord): Promise<void> {
  if (!db) {
    return;
  }

  await setDoc(
    doc(db, 'userProgress', userId),
    {
      userId,
      completedSections,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

// Firestore schema: userQuizResults/{uid}/attempts/{autoId} => { score, totalQuestions, completedAt, createdAt }
export async function saveQuizResult(userId: string, score: number, totalQuestions: number): Promise<void> {
  if (!db) {
    return;
  }

  await addDoc(collection(db, 'userQuizResults', userId, 'attempts'), {
    userId,
    score,
    totalQuestions,
    completedAt: new Date().toISOString(),
    createdAt: serverTimestamp(),
  });
}

export async function loadLatestQuizResult(userId: string): Promise<StoredQuizResult | null> {
  if (!db) {
    return null;
  }

  const attemptsRef = collection(db, 'userQuizResults', userId, 'attempts');
  const attemptsQuery = query(attemptsRef, orderBy('createdAt', 'desc'), limit(1));
  const snapshots = await getDocs(attemptsQuery);

  if (snapshots.empty) {
    return null;
  }

  const data = snapshots.docs[0].data();
  const score = typeof data.score === 'number' ? data.score : 0;
  const totalQuestions = typeof data.totalQuestions === 'number' ? data.totalQuestions : 0;
  const completedAt = typeof data.completedAt === 'string' ? data.completedAt : undefined;

  return { score, totalQuestions, completedAt };
}