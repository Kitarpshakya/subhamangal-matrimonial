import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Get Firebase config from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Log current environment
const environment = import.meta.env.VITE_ENVIRONMENT || import.meta.env.MODE;
const projectId = firebaseConfig.projectId;

console.log('🔥 Firebase Environment:', environment);
console.log('📦 Firebase Project:', projectId);

if (environment === 'development' || environment === 'local') {
  console.log('⚠️  TESTING MODE - Using development database');
  console.log('✅ Safe to test - production data is protected');
} else {
  console.log('🚀 PRODUCTION MODE - Using production database');
  console.warn('⚠️  Be careful - changes affect real users!');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);