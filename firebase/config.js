// firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration - REPLACE WITH YOUR ACTUAL CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyB3KB4aSxoezPYXvvpKiwFWZ958dzQ6sK8",
  authDomain: "mobile-store-2dc4c.firebaseapp.com",
  projectId: "mobile-store-2dc4c",
  storageBucket: "mobile-store-2dc4c.firebasestorage.app",
  messagingSenderId: "458301338269",
  appId: "1:458301338269:web:00541e61f77ba56f50da74",
  measurementId: "G-1Q6WFMMVR5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services and export them
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;