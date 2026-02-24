/**
 * Firebase initialization and configuration
 * 
 * This module initializes Firebase using environment variables.
 * No hardcoded values are used for security.
 */ 

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Firebase configuration interface
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

/**
 * Get Firebase configuration from environment variables
 * Throws an error if required variables are missing
 */
function getFirebaseConfig(): FirebaseConfig {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  // Validate that all required environment variables are present
  const missingVars = Object.entries(config)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required Firebase environment variables: ${missingVars.join(', ')}`
    );
  }

  return config as FirebaseConfig;
}

/**
 * Initialize Firebase app
 * Returns existing app instance if already initialized
 */
let app: FirebaseApp | undefined;

function initializeFirebaseApp(): FirebaseApp {
  if (getApps().length === 0) {
    const config = getFirebaseConfig();
    app = initializeApp(config);
  } else {
    app = getApps()[0];
  }
  return app;
}

// Initialize Firebase app
const firebaseApp = initializeFirebaseApp();

/**
 * Firebase Auth instance
 * Use this for authentication operations
 */
export const auth: Auth = getAuth(firebaseApp);

/**
 * Firestore instance
 * Use this for database operations
 */
export const firestore: Firestore = getFirestore(firebaseApp);

/**
 * Firebase app instance (exported for advanced use cases)
 */
export { firebaseApp };
