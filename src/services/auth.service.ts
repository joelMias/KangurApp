// src/services/auth.service.ts
import { auth, db } from './firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth'
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore'

const TOKEN_KEY = 'token'
const TOKEN_EXPIRY_KEY = 'tokenExpiry'
const TOKEN_EXPIRY_HOURS = 7 * 24 // 7 days

type RolePermissionsKey =
  | 'sessions_all_read'
  | 'sessions_all_edit'
  | 'sessions_all_delete'
  | 'sessions_own_read'
  | 'sessions_own_edit'
  | 'sessions_own_delete'

export type RolePermissions = Record<RolePermissionsKey, boolean>

const DEFAULT_ROLE_PERMISSIONS: RolePermissions = {
  sessions_all_read: false,
  sessions_all_edit: false,
  sessions_all_delete: false,
  sessions_own_read: true,
  sessions_own_edit: true,
  sessions_own_delete: true
}

const PERMISSIONS_KEY = 'permissions'

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

function parsePermissions(value: string | null): RolePermissions {
  if (!value) return DEFAULT_ROLE_PERMISSIONS

  try {
    const parsed = JSON.parse(value)
    if (!parsed || typeof parsed !== 'object') return DEFAULT_ROLE_PERMISSIONS

    return {
      sessions_all_read: Boolean(parsed.sessions_all_read),
      sessions_all_edit: Boolean(parsed.sessions_all_edit),
      sessions_all_delete: Boolean(parsed.sessions_all_delete),
      sessions_own_read: Boolean(parsed.sessions_own_read),
      sessions_own_edit: Boolean(parsed.sessions_own_edit),
      sessions_own_delete: Boolean(parsed.sessions_own_delete)
    }
  } catch (error) {
    return DEFAULT_ROLE_PERMISSIONS
  }
}

export function getStoredRolePermissions(): RolePermissions {
  return parsePermissions(localStorage.getItem(PERMISSIONS_KEY))
}

export function userHasPermission(permission: RolePermissionsKey): boolean {
  return Boolean(getStoredRolePermissions()[permission])
}

function setStoredRolePermissions(role: string, permissions: RolePermissions) {
  localStorage.setItem('role', role)
  localStorage.setItem('rol', role)
  localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(permissions))
}

function clearStoredRolePermissions() {
  localStorage.removeItem(PERMISSIONS_KEY)
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


async function fetchRolePermissions(role: string): Promise<RolePermissions> {
  try {
    const roleDoc = await getDoc(doc(db, 'rols', role))
    if (!roleDoc.exists()) return DEFAULT_ROLE_PERMISSIONS

    const data = roleDoc.data()
    return {
      sessions_all_read: Boolean(data.sessions_all_read),
      sessions_all_edit: Boolean(data.sessions_all_edit),
      sessions_all_delete: Boolean(data.sessions_all_delete),
      sessions_own_read: Boolean(data.sessions_own_read),
      sessions_own_edit: Boolean(data.sessions_own_edit),
      sessions_own_delete: Boolean(data.sessions_own_delete)
    }
  } catch (error) {
    console.warn('Error fetching role permissions', error)
    return DEFAULT_ROLE_PERMISSIONS
  }
}

async function loadAndStoreRolePermissions(role: string): Promise<RolePermissions> {
  const permissions = await fetchRolePermissions(role)
  setStoredRolePermissions(role, permissions)
  return permissions
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
    const role = (userDoc.exists() && typeof userDoc.data().rol === 'string')
      ? userDoc.data().rol
      : (userDoc.exists() && userDoc.data().admin === true ? 'admin' : 'usuari')

    await loadAndStoreRolePermissions(role)

    localStorage.setItem('admin', role === 'admin' ? 'true' : 'false')
  } catch (e) {
    console.warn('Error loading user data or permissions', e)
    setStoredRolePermissions('usuari', DEFAULT_ROLE_PERMISSIONS)
    localStorage.setItem('admin', 'false')
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
  localStorage.removeItem('role')
  localStorage.removeItem('email')
  localStorage.removeItem('admin')
  clearStoredRolePermissions()
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
  fetchRolePermissions,
  loadAndStoreRolePermissions,
  getStoredRolePermissions,
  userHasPermission
}

