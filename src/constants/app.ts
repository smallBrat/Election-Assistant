/**
 * Application-wide constants
 */

// Timing constants (milliseconds)
export const PROGRESS_SAVE_DEBOUNCE_MS = 700;
export const ANIMATION_FADE_IN_MS = 300;

// Storage/File constants
export const MAX_VISIBLE_FILES = 5;
export const STORAGE_MAX_FILE_SIZE_MB = 10;
export const STORAGE_MAX_FILE_SIZE_BYTES = STORAGE_MAX_FILE_SIZE_MB * 1024 * 1024;

// Firestore document IDs
export const FIRESTORE_PROGRESS_DOC_ID = 'overview';
export const FIRESTORE_PREFERENCES_DOC_ID = 'settings';
export const FIRESTORE_QUIZ_COLLECTION_ID = 'quizAttempts';

// Section keys
export const VALID_SECTION_KEYS = [
  'timeline',
  'guide',
  'registration',
  'documents',
  'checklist',
  'faq',
  'glossary',
  'chat',
  'quiz',
  'guided',
] as const;

// Default values
export const DEFAULT_PROGRESS_PERCENT = 0;
export const DEFAULT_SCORE_VALUE = null;
export const RECENT_QUIZ_ATTEMPTS_MAX = 5;
