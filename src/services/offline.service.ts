import { db, auth } from '@/services/firebase'
import { collection, addDoc } from 'firebase/firestore'

type PendingItem = {
  id: string
  userId: string
  collection: string
  data: any
  createdAt: string
}

const KEY = 'offlineQueue'
let isProcessing = false

// Funció que llegeix la cua desada al localStorage i la retorna com a array 
function readQueue(): PendingItem[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    return JSON.parse(raw) as PendingItem[]
  } catch (e) {
    console.error('offlineQueue read error', e)
    return []
  }
}

// Funció que escriu a la cua al localStorage
function writeQueue(q: PendingItem[]) {
  localStorage.setItem(KEY, JSON.stringify(q))
}

export function addPending(collectionName: string, data: any, userId: string) {
  const q = readQueue()
  const item: PendingItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2,9)}`,
    userId,
    collection: collectionName,
    data,
    createdAt: new Date().toISOString(),
  }
  q.push(item)
  writeQueue(q)
  console.log('Queued offline item', item)
}

// Funció que processa la cua d'operacions pendents i els envia a la base de dades quan es torni a tenir connexió
export async function processQueue() {
  if (!navigator.onLine) {
    console.log('Offline, skipping queue processing')
    return
  }

  const q = readQueue()
  if (!q.length) return

  const user = auth.currentUser
  if (!user) {
    console.log('No authenticated user, cannot flush offline queue')
    return
  }

  const remaining: PendingItem[] = []
  if (isProcessing) {
    console.log('processQueue already running, skipping this invocation')
    return
  }
  isProcessing = true

  const tempIdMap = new Map<string, string>()

  for (const item of q) {
    try {
      if (item.userId !== user.uid) {
        remaining.push(item)
        continue
      }

      if (item.collection === 'nados' && item.data && item.data.__tempId) {
        const temp = item.data.__tempId as string
        if (tempIdMap.has(temp)) {
          console.log('Nado for temp id already created, skipping', temp)
          continue
        }
        const payload = { ...item.data }
        delete payload.__tempId
        const docRef = await addDoc(collection(db, 'users', user.uid, 'nados'), payload)
        tempIdMap.set(temp, docRef.id)
        console.log('Created nado for temp id', temp, '=>', docRef.id)
        continue 
      }

      if (item.collection === 'cronometres' && item.data && typeof item.data.nadoId === 'string' && item.data.nadoId.startsWith('local-')) {
        const localId: string = item.data.nadoId
        if (tempIdMap.has(localId)) {
          item.data.nadoId = tempIdMap.get(localId)
        } else {
          const name = item.data.nadoNom || item.data.nadoName || 'Nadó'
          const docRef = await addDoc(collection(db, 'users', user.uid, 'nados'), { name, createdAt: new Date() })
          tempIdMap.set(localId, docRef.id)
          item.data.nadoId = docRef.id
          console.log('Created missing nado for cronometre local id', localId, '=>', docRef.id)
        }
      }

      await addDoc(collection(db, 'users', user.uid, item.collection), item.data)
      console.log('Flushed offline item', item)
    } catch (err) {
      console.warn('Failed flushing offline item, keep for later', item, err)
      remaining.push(item)
    }
  }

  writeQueue(remaining)
  isProcessing = false
}

export function getPendingCount() {
  return readQueue().length
}

export default {
  addPending,
  processQueue,
  getPendingCount,
}
