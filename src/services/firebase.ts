import { initializeApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBFAoDZRX2eVNVErGz_dKDCsyMOGnsVfA0",
  authDomain: "kangur-51f5c.firebaseapp.com",
  projectId: "kangur-51f5c",
  storageBucket: "kangur-51f5c.firebasestorage.app",
  messagingSenderId: "965357068356",
  appId: "1:965357068356:web:30558c52c6809c6f885c11",
  measurementId: "G-79WCJEWR9D"
};

const app = initializeApp(firebaseConfig);

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache()
})

export const auth = getAuth(app);
