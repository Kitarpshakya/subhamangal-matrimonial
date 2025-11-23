import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBKYbg-5AW5ZRbgLOTDtJBDOQf6fgbK1tY",
  authDomain: "subhamangal-matrimonial.firebaseapp.com",
  projectId: "subhamangal-matrimonial",
  storageBucket: "subhamangal-matrimonial.firebasestorage.app",
  messagingSenderId: "419394129938",
  appId: "1:419394129938:web:a66d4e075416e2433848cb",
  measurementId: "G-3DF6JJGY5L"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);