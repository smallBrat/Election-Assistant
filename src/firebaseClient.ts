import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId,
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let analytics: Analytics | null = null;
let analyticsPromise: Promise<Analytics | null> | null = null;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} else if (import.meta.env.DEV) {
  console.info('Firebase client is not configured. Auth and Firestore features are disabled until VITE_FIREBASE_* vars are set.');
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

export { app, auth, db };