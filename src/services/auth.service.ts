// src/services/auth.service.ts
import { auth, db } from './firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User
} from 'firebase/auth'
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore'

const TOKEN_KEY = 'token' // opcional, si vols guardar l'idToken

async function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

async function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
}

async function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}


async function register(payload: { name: string; email: string; password: string }) {
  const userCredential = await createUserWithEmailAndPassword(auth, payload.email, payload.password)
  const user = userCredential.user

  await updateProfile(user, { displayName: payload.name })

  await setDoc(doc(db, 'users', user.uid), {
    name: payload.name,
    email: payload.email,
    createdAt: new Date()
  })

  localStorage.setItem('name', payload.name)
  localStorage.setItem('email', payload.email)

  return user
}

async function login(payload: { email: string; password: string }) {
  const userCredential = await signInWithEmailAndPassword(auth, payload.email, payload.password)
  const user = userCredential.user

  // Save useful info locally so offline flows can use them
  localStorage.setItem('uid', user.uid)
  localStorage.setItem('name', user.displayName || '')
  localStorage.setItem('email', user.email || '')

  // Try to cache the user's nados for offline use
  try {
    const nadosSnap = await getDocs(collection(db, 'users', user.uid, 'nados'))
    if (!nadosSnap.empty) {
      const nados = nadosSnap.docs.map(d => ({ id: d.id, name: d.data().name }))
      try { localStorage.setItem('localNados', JSON.stringify(nados)) } catch (e) { /* ignore */ }
      if (nados.length === 1) {
        try { localStorage.setItem('selectedNado', nados[0].id); localStorage.setItem('selectedNadoName', nados[0].name) } catch (e) { /* ignore */ }
      }
    }
  } catch (e) {
    console.warn('Could not cache nados on login', e)
  }

  return {
    expires_in: null
  }
}

async function me() {
  const user = auth.currentUser
  if (!user) return null

  const docSnap = await getDoc(doc(db, 'users', user.uid))
  return {
    uid: user.uid,
    email: user.email,
    name: user.displayName,
    extra: docSnap.exists() ? docSnap.data() : null
  }
}

async function logout() {
  await signOut(auth)
  await removeToken()
}

export default {
  register,
  login,
  me,
  logout,
  getToken,
  removeToken,
  saveToken,
}

/*
import api from './api.service';

// Interfície opcional per tipus de retorn
interface LoginResponse {
  token: string;
  expires_in?: number;
}

const TOKEN_KEY = 'token';

// Opció guardada: localStorage
async function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

async function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

async function register(payload: { name: string; email: string; password: string; password_confirmation: string}) {
  const resp = await api.post('/register', payload);
  return resp.data;
}

async function login(payload: { email: string; password: string }) : Promise<LoginResponse> {
  const resp = await api.post('/login', payload);
  const data = resp.data;
  const token = data.token ?? data.access_token ?? data.accessToken;
  if (!token) throw new Error('No token returned from login');
  await saveToken(token);
  if (data.user) {
    localStorage.setItem('name', data.user.name);
    localStorage.setItem('email', data.user.email);
  }

  if (data.nados) {
    if (data.nados.length === 1) {
      localStorage.setItem('selectedNado', data.nados[0].id);
    }else{
      localStorage.setItem('nados', JSON.stringify(data.nados));
    }
  }

  return {
    token,
    expires_in: data.expires_in ?? data.expiresIn ?? null
  };
}

async function me() {
  const resp = await api.get('/me');
  return resp.data;
}

async function logout() {
  try {
    await api.post('/logout');
  } catch (e) {
    // ignorar errors de logout servidor si cal
  } finally {
    await removeToken();
  }
}

export default {
  register,
  login,
  me,
  logout,
  getToken,
  removeToken,
  saveToken,
};
*/