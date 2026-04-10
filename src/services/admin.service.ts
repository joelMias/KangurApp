import { auth, db } from './firebase'
import { collection, getDocs, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import authService from './auth.service'

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
      
      // Obté els cronòmetres de l'usuari
      const cronometresRef = collection(db, 'users', userId, 'cronometres')
      const cronometresSnap = await getDocs(cronometresRef)
      const cronometres = cronometresSnap.docs
        .filter(d => !d.data().eliminado)
        .map(d => ({
          id: d.id,
          ...d.data()
        }))
      
      // Obté els nadons de l'usuari
      const nadonsRef = collection(db, 'users', userId, 'nadons')
      const nadonsSnap = await getDocs(nadonsRef)
      const nadons = nadonsSnap.docs
        .filter(d => !d.data().eliminado)
        .map(d => ({
          id: d.id,
          ...d.data()
        }))

      // Obté els cangurs de l'usuari
      const cangursRef = collection(db, 'users', userId, 'cangurs')
      const cangursSnap = await getDocs(cangursRef)
      const cangurs = cangursSnap.docs
        .filter(d => !d.data().eliminado)
        .map(d => ({
          id: d.id,
          ...d.data()
        }))
      
      allUsersData.push({
        uid: userId,
        name: userData.name,
        email: userData.email,
        rol: userData.rol || 'usuari',
        createdAt: userData.createdAt,
        eliminado: !!userData.eliminado,
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
 * Esborrar un usuari
 */
async function deleteUser(userId: string) {
  try {
    const userRef = doc(db, 'users', userId)

    await updateDoc(userRef, { eliminado: true })
    
    const subCollections = ['cronometres', 'nadons', 'cangurs']
    for (const col of subCollections) {
      const colRef = collection(db, 'users', userId, col)
      const colSnap = await getDocs(colRef)
      for (const docItem of colSnap.docs) {
        await updateDoc(doc(db, 'users', userId, col, docItem.id), { eliminado: true })
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error marcant l\'usuari com a eliminat:', error)
    throw error
  }
}

/**
 * Soft delete a user session
 */
async function deleteSession(userId: string, sessionId: string) {
  try {
    const sessionRef = doc(db, 'users', userId, 'cronometres', sessionId)
    await updateDoc(sessionRef, { eliminado: true })
    return { success: true }
  } catch (error) {
    console.error('Error marcant la sessió com a eliminada:', error)
    throw error
  }
}

/**
 * Update user role
 */
async function updateUserRol(userId: string, rol: string) {
  try {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, { rol: rol })
    return { success: true }
  } catch (error) {
    console.error('Error canviant l\'estat d\'admin:', error)
    throw error
  }
}

/**
 * Get data for a specific user
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
 * Verificar si l'usuari actual és superusuari (basat en permisos)
 */
function isCurrentUserAdmin(): boolean {
  return (
    authService.userHasPermission('sessions_all_read') ||
    authService.userHasPermission('sessions_all_edit') ||
    authService.userHasPermission('sessions_all_delete')
  )
}

/**
 * Obtenir informació del superusuari actual
 */
async function getCurrentUserAdminStatus() {
  try {
    const user = auth.currentUser
    if (!user) {
      console.error('❌ currentUser és nul')
      return false
    }

    console.log('🔍 Comprovant l\'estat d\'admin per a l\'usuari:', user.uid)

    // Primer: comprova el localStorage per als permisos en memòria cau
    const cachedPermissions = localStorage.getItem('permissions')
    const cachedRol = localStorage.getItem('rol')
    console.log('📦 Rol en memòria cau:', cachedRol, '| Permisos en memòria cau:', cachedPermissions ? 'existeixen' : 'cap')
    
    if (cachedPermissions) {
      try {
        const perms = JSON.parse(cachedPermissions)
        const isAdmin = perms.sessions_all_read || perms.sessions_all_edit || perms.sessions_all_delete
        console.log('✓ Comprovació de permisos en memòria cau:', isAdmin ? 'ÉS ADMIN' : 'NO ÉS ADMIN')
        if (isAdmin) {
          return true
        }
      } catch (e) {
        console.warn('⚠️ Memòria cau corrupta:', e)
      }
    }

    // Segon: intenta obtenir-ho de Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid))
    const role = userDoc.exists()
      ? (typeof userDoc.data().rol === 'string'
          ? userDoc.data().rol
          : (userDoc.data().admin === true ? 'admin' : 'usuari'))
      : (localStorage.getItem('rol') || 'usuari')

    console.log('👤 Rol de l\'usuari des de Firestore:', role, '| El document existeix:', userDoc.exists())

    // Si el rol és admin/gestor directament, permet l'accés sense verificar permisos
    if (role === 'admin' || role === 'gestor') {
      console.log('✅ Comprovació directa del rol: el rol és', role, '→ ES PERMET L\'ACCÉS')
      localStorage.setItem('rol', role)
      return true
    }

    try {
      const permissions = await authService.fetchRolePermissions(role)
      console.log('🔑 Permisos obtinguts per al rol', role, ':', permissions)
      
      localStorage.setItem('permissions', JSON.stringify(permissions))

      const hasAccess = permissions.sessions_all_read || permissions.sessions_all_edit || permissions.sessions_all_delete
      console.log(hasAccess ? '✅ TÉ ACCÉS D\'ADMIN' : '❌ NO TÉ ACCÉS D\'ADMIN')
      return hasAccess
    } catch (permError) {
      console.error('⚠️ Error obtenint els permisos:', permError)
      // Si falla en obtenir permisos però el rol és admin/gestor, permet l'accés
      if (role === 'admin' || role === 'gestor') {
        console.log('✅ Ha fallat l\'obtenció de permisos però el rol és', role, '→ ES PERMET L\'ACCÉS')
        return true
      }
      console.log('❌ Ha fallat l\'obtenció de permisos i el rol és', role, '→ ES DENGA L\'ACCÉS')
      return false
    }
  } catch (error) {
    console.error('❌ Error obtenint l\'estat d\'admin:', error)
    return false
  }
}

export default {
  getAllUsersData,
  updateUserRol,
  deleteUser,
  deleteSession,
  getUserData,
  isCurrentUserAdmin,
  getCurrentUserAdminStatus
}
