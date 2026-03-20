// src/services/auth.service.ts
import { auth, db } from './firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
  onAuthStateChanged
} from 'firebase/auth'
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore'

const TOKEN_KEY = 'token'
const TOKEN_EXPIRY_KEY = 'tokenExpiry'
const TOKEN_EXPIRY_HOURS = 7 * 24 // 7 days

function generateToken(): string {
  return `token_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

function getTokenExpiryTime(): number {
  return Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000
}

async function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(TOKEN_EXPIRY_KEY, getTokenExpiryTime().toString())
}

async function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(TOKEN_EXPIRY_KEY)
}

async function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

function isTokenExpired(): boolean {
  const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY)
  if (!expiryStr) return true
  const expiry = parseInt(expiryStr, 10)
  return Date.now() > expiry
}

async function isTokenValid(): Promise<boolean> {
  const token = await getToken()
  if (!token) return false
  
  if (isTokenExpired()) {
    await removeToken()
    return false
  }

  // Wait for Firebase to restore the session
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      if (user) {
        // Authenticated user and valid token
        resolve(true)
      } else {
        // No authenticated user, clear token
        removeToken().then(() => resolve(false))
      }
    })
  })
}


async function register(payload: { name: string; email: string; password: string }) {
  const userCredential = await createUserWithEmailAndPassword(auth, payload.email, payload.password)
  const user = userCredential.user

  await updateProfile(user, { displayName: payload.name })

  await setDoc(doc(db, 'users', user.uid), {
    name: payload.name,
    email: payload.email,
    createdAt: new Date(),
    rol: 'usuari',
    eliminado: false
  })

  localStorage.setItem('name', payload.name)
  localStorage.setItem('email', payload.email)

  return user
}

async function login(payload: { email: string; password: string }) {
  const userCredential = await signInWithEmailAndPassword(auth, payload.email, payload.password)
  const user = userCredential.user

  // Generate and save token with expiration
  const token = generateToken()
  await saveToken(token)

  localStorage.setItem('uid', user.uid)
  localStorage.setItem('name', user.displayName || '')
  localStorage.setItem('email', user.email || '')

  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid))
    if (userDoc.exists()) {
      const userData = userDoc.data()
      const role = typeof userData.rol === 'string'
        ? userData.rol
        : (userData.admin === true ? 'admin' : 'usuari')

      localStorage.setItem('role', role)
      localStorage.setItem('admin', role === 'admin' ? 'true' : 'false')
      localStorage.setItem('rol', role)
    }
  } catch (e) {
    console.warn('Error loading user data', e)
    localStorage.setItem('role', 'usuari')
    localStorage.setItem('admin', 'false')
    localStorage.setItem('rol', 'usuari')
  }

  try {
    const nadonsSnap = await getDocs(collection(db, 'users', user.uid, 'nadons'))
    if (!nadonsSnap.empty) {
      const nadons = nadonsSnap.docs.map(d => ({ id: d.id, name: d.data().name }))
      try { localStorage.setItem('localnadons', JSON.stringify(nadons)) } catch (e) { }
      if (nadons.length === 1) {
        try { localStorage.setItem('selectedNado', nadons[0].id); localStorage.setItem('selectedNadoName', nadons[0].name) } catch (e) { /* ignore */ }
      }
    }
  } catch (e) {
    console.warn('No babies in local cache', e)
  }

  return {
    expires_in: TOKEN_EXPIRY_HOURS * 60 * 60
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
  
  // Clear all session data
  localStorage.removeItem('uid')
  localStorage.removeItem('name')
  localStorage.removeItem('rol')
  localStorage.removeItem('email')
  //localStorage.removeItem('admin')
  localStorage.removeItem('localnadons')
  localStorage.removeItem('selectedNado')
  localStorage.removeItem('selectedNadoName')
  localStorage.removeItem('localCangurs')
}

export default {
  register,
  login,
  me,
  logout,
  getToken,
  removeToken,
  saveToken,
  isTokenValid,
  isTokenExpired,
}

