// Firebase configuration for AutoMarket Web App
// Project: automarket-pro
// Web App: automarket-pro.web.app

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBDD4fjIFgwm2F0jBmmQgyGjZsH0UYIYu4",
  authDomain: "automarket-pro.firebaseapp.com",
  projectId: "automarket-pro",
  storageBucket: "automarket-pro.firebasestorage.app",
  messagingSenderId: "774835684971",
  appId: "1:774835684971:web:594a1d583731cd6748932e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
