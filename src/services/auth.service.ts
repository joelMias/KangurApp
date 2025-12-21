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

const TOKEN_KEY = 'token'

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
    createdAt: new Date(),
    admin: false
  })

  localStorage.setItem('name', payload.name)
  localStorage.setItem('email', payload.email)

  return user
}

async function login(payload: { email: string; password: string }) {
  const userCredential = await signInWithEmailAndPassword(auth, payload.email, payload.password)
  const user = userCredential.user

  localStorage.setItem('uid', user.uid)
  localStorage.setItem('name', user.displayName || '')
  localStorage.setItem('email', user.email || '')

  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid))
    if (userDoc.exists()) {
      const userData = userDoc.data()
      localStorage.setItem('admin', userData.admin === true ? 'true' : 'false')
    }
  } catch (e) {
    console.warn('Error carregant dades de l\'usuari', e)
    localStorage.setItem('admin', 'false')
  }

  try {
    const nadosSnap = await getDocs(collection(db, 'users', user.uid, 'nados'))
    if (!nadosSnap.empty) {
      const nados = nadosSnap.docs.map(d => ({ id: d.id, name: d.data().name }))
      try { localStorage.setItem('localNados', JSON.stringify(nados)) } catch (e) { }
      if (nados.length === 1) {
        try { localStorage.setItem('selectedNado', nados[0].id); localStorage.setItem('selectedNadoName', nados[0].name) } catch (e) { /* ignore */ }
      }
    }
  } catch (e) {
    console.warn('No hi ha nados al cache', e)
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

