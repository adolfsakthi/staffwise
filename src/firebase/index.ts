'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// --- Start of New Singleton Initialization ---

let firebaseApp: FirebaseApp;

// Check if Firebase has already been initialized
if (!getApps().length) {
  // If not, initialize a new app
  // This logic correctly handles both automatic App Hosting env vars and local config
  try {
    firebaseApp = initializeApp();
  } catch (e) {
    if (process.env.NODE_ENV === "production") {
        console.warn('Automatic initialization failed. Falling back to firebase config object.', e);
    }
    firebaseApp = initializeApp(firebaseConfig);
  }
} else {
  // If already initialized, use the existing app
  firebaseApp = getApp();
}

export const app = firebaseApp;
export const auth = getAuth(app);
export const firestore = getFirestore(app);

// --- End of New Singleton Initialization ---


export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './auth/use-user';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';