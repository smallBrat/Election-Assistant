import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const REQUIRED_FIREBASE_CONFIG_KEYS = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
] as const;

type RequiredFirebaseConfigKey = typeof REQUIRED_FIREBASE_CONFIG_KEYS[number];

function getMissingFirebaseConfigKeys(): RequiredFirebaseConfigKey[] {
  return REQUIRED_FIREBASE_CONFIG_KEYS.filter((key) => !firebaseConfig[key]);
}

export function getFirebaseConfigStatus() {
  const missingKeys = getMissingFirebaseConfigKeys();

  return {
    configured: missingKeys.length === 0,
    missingKeys,
    hasAnalyticsMeasurementId: Boolean(firebaseConfig.measurementId),
  };
}

export const isFirebaseConfigured = getFirebaseConfigStatus().configured;

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let analytics: Analytics | null = null;
let analyticsPromise: Promise<Analytics | null> | null = null;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} else if (import.meta.env.DEV) {
  const { missingKeys } = getFirebaseConfigStatus();
  console.info(`Firebase client is not configured. Missing build-time env keys: ${missingKeys.join(', ')}.`);
}

function shouldInitializeAnalytics(): boolean {
  return Boolean(
    app &&
      firebaseConfig.measurementId &&
      typeof window !== 'undefined' &&
      typeof document !== 'undefined' &&
      import.meta.env.MODE !== 'test',
  );
}

export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (!shouldInitializeAnalytics()) {
    if (import.meta.env.DEV && app && !firebaseConfig.measurementId) {
      console.info('Firebase Analytics disabled because VITE_FIREBASE_MEASUREMENT_ID is missing.');
    }
    return null;
  }

  if (analytics) {
    return analytics;
  }

  if (!analyticsPromise) {
    analyticsPromise = isSupported()
      .then((supported) => {
        if (!supported || !app) {
          return null;
        }

        analytics = getAnalytics(app);
        return analytics;
      })
      .catch(() => null);
  }

  return analyticsPromise;
}

export { app, auth, db, storage };