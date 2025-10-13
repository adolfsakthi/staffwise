
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (!getApps().length) {
    // Important! initializeApp() is called without any arguments because Firebase App Hosting
    // integrates with the initializeApp() function to provide the environment variables needed to
    // populate the FirebaseOptions in production. It is critical that we attempt to call initializeApp()
    // without arguments.
    let firebaseApp;
    try {
      // Attempt to initialize via Firebase App Hosting environment variables
      firebaseApp = initializeApp();
    } catch (e) {
      // Only warn in production because it's normal to use the firebaseConfig to initialize
      // during development
      if (process.env.NODE_ENV === "production") {
        console.warn('Automatic initialization failed. Falling back to firebase config object.', e);
      }
      firebaseApp = initializeApp(firebaseConfig);
    }

    return getSdks(firebaseApp);
  }

  // If already initialized, return the SDKs with the already initialized App
  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  const auth = getAuth(firebaseApp);
  
  // Automatically sign in the demo user in development
  if (process.env.NODE_ENV === 'development' && !auth.currentUser) {
      signInWithEmailAndPassword(auth, 'demo@staffwise.com', 'password').catch(error => {
          // This might fail if the user doesn't exist, which is fine on first run.
          // In a real app, you might want a more robust seeding or sign-up flow.
          if(error.code === 'auth/user-not-found') {
            console.log("Demo user not found. You may need to create it in the Firebase console or sign up.")
          } else if (error.code !== 'auth/wrong-password') { // Ignore wrong password during dev hot reloads
            console.warn("Demo user sign-in failed:", error.message);
          }
      });
  }

  return {
    firebaseApp,
    auth,
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
export * from './auth/use-user-profile';
