import { auth, db } from './firebase'
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore'

/**
 * Obtenir totes les dades de la base de dades (només per superusuaris)
 */
async function getAllUsersData() {
  try {
    const usersRef = collection(db, 'users')
    const usersSnap = await getDocs(usersRef)
    
    const allUsersData = []
    
    for (const userDoc of usersSnap.docs) {
      const userData = userDoc.data()
      const userId = userDoc.id
      
      // Obtenir cronometres de l'usuari
      const cronometresRef = collection(db, 'users', userId, 'cronometres')
      const cronometresSnap = await getDocs(cronometresRef)
      const cronometres = cronometresSnap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }))
      
      // Obtenir nadons de l'usuari
      const nadonsRef = collection(db, 'users', userId, 'nadons')
      const nadonsSnap = await getDocs(nadonsRef)
      const nadons = nadonsSnap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }))

      // Obtenir cangurs de l'usuari
      const cangursRef = collection(db, 'users', userId, 'cangurs')
      const cangursSnap = await getDocs(cangursRef)
      const cangurs = cangursSnap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }))
      
      allUsersData.push({
        uid: userId,
        name: userData.name,
        email: userData.email,
        rol: userData.rol || 'usuari',
        createdAt: userData.createdAt,
        cronometres,
        nadons,
        cangurs
      })
    }
    
    return allUsersData
  } catch (error) {
    console.error('Error obtenint les dades de tots els usuaris:', error)
    throw error
  }
}

/**
 * Canviar l'estatus d'admin d'un usuari
 */
async function updateUserRol(userId: string, rol: string) {
  try {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, { rol: rol })
    return { success: true }
  } catch (error) {
    console.error('Error canviant l\'estatus d\'admin:', error)
    throw error
  }
}

/**
 * Obtenir les dades d'un usuari concret
 */
async function getUserData(userId: string) {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return { uid: userDoc.id, ...userDoc.data() } as any;
    }
    throw new Error("L'usuari no existeix");
  } catch (error) {
    console.error('Error obtenint dades de l’usuari:', error);
    throw error;
  }
}


/**
 * Verificar si l'usuari actual és superusuari
 */
function isCurrentUserAdmin(): boolean {
  const role = localStorage.getItem('rol')
  return role === 'admin' || role === 'gestor'
}

/**
 * Obtenir informació del superusuari actual
 */
async function getCurrentUserAdminStatus() {
  try {
    const user = auth.currentUser
    if (!user) return false
    
    const userDoc = await getDoc(doc(db, 'users', user.uid))
    if (userDoc.exists()) {
      const data = userDoc.data()
      const role = typeof data.rol === 'string'
        ? data.rol
        : (typeof data.rol === 'string' ? data.rol : undefined)
      return data.rol === 'admin' || data.rol === 'gestor'
    }
    return false
  } catch (error) {
    console.error('Error obtenint l\'estatus d\'admin:', error)
    return false
  }
}

export default {
  getAllUsersData,
  updateUserRol,
  getUserData,
  isCurrentUserAdmin,
  getCurrentUserAdminStatus
}
