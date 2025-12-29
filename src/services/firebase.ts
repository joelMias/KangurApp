import { initializeApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDzJbraExkbTMjfc28Ivn2RKnaIkmLSQUI",
  authDomain: "kangurapp-b452e.firebaseapp.com",
  projectId: "kangurapp-b452e",
  storageBucket: "kangurapp-b452e.firebasestorage.app",
  messagingSenderId: "600666214184",
  appId: "1:600666214184:web:529671edbf96b10d4d0a1d"
};

const app = initializeApp(firebaseConfig);

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache()
})

export const auth = getAuth(app);
