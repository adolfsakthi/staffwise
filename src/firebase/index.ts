
import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// --- Singleton Initialization ---
// This guarantees that Firebase is initialized only once.

let app: FirebaseApp;
if (!getApps().length) {
  // This logic handles both Vercel/App Hosting env vars and local config.
  try {
    // This will throw if the default app is not initialized, which is expected
    // in some environments.
    app = getApp();
  } catch (e) {
    // Fallback to config for local dev or environments where auto-init isn't set up.
    app = initializeApp(firebaseConfig);
  }
} else {
  app = getApp();
}

export const firebaseApp = app;
export const auth = getAuth(firebaseApp);
export const firestore = getFirestore(firebaseApp);

// --- End of Singleton Initialization ---

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './auth/use-user';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
