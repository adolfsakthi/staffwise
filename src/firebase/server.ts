import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// IMPORTANT: This file should only be used in server-side code (e.g., API routes, server actions).
// Do not import it in client components.

let app: App;
let db: Firestore;

if (getApps().length === 0) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    app = initializeApp({
      credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
    });
  } else {
    // For local development without service account (e.g., using emulators)
    // Make sure GOOGLE_APPLICATION_CREDENTIALS is set in your local env
    console.warn("FIREBASE_SERVICE_ACCOUNT not set. Using default credentials. This is expected for local development.");
    app = initializeApp();
  }
} else {
  app = getApps()[0];
}

db = getFirestore(app);

export { app as adminApp, db as getDb };
