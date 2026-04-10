import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

/**
 * Funció al núvol: quan un usuari es marca com a eliminat a Firestore,
 * també s'elimina de Firebase Authentication
 */
export const deleteUserAuthWhenMarkedAsEliminated = functions.firestore
  .document('users/{uid}')
  .onUpdate(async (change: functions.Change<functions.firestore.DocumentSnapshot>, context: functions.EventContext) => {
    const before = change.before.data();
    const after = change.after.data();
    const uid = context.params.uid;

    // Si l'usuari ha canviat de no eliminat a eliminat
    if ((before?.eliminado === false || before?.eliminado === undefined) && after?.eliminado === true) {
      try {
        console.log(`🗑️ Eliminant l'usuari ${uid} de Firebase Auth...`);
        
        // Elimina l'usuari de Firebase Authentication
        await admin.auth().deleteUser(uid);
        
        console.log(`✅ L'usuari ${uid} s'ha eliminat correctament de Firebase Auth`);
        return { success: true, message: `L'usuari ${uid} s'ha eliminat d'Auth` };
      } catch (error: any) {
        console.error(`❌ Error eliminant l'usuari ${uid} de Firebase Auth:`, error);
        
        // Si l'usuari no existeix a Auth, no és un error crític
        if (error.code === 'auth/user-not-found') {
          console.log(`⚠️ L'usuari ${uid} no s'ha trobat a Auth (potser ja estava eliminat)`);
          return { success: true, message: `L'usuari no s'ha trobat a Auth` };
        }
        
        throw error;
      }
    }

    return { success: true, message: `No hi ha canvis en l'estat d'eliminació` };
  });

/**
 * Funció al núvol: reintenta l'eliminació d'usuaris si falla la primera vegada
 */
export const retryDeleteUserAuth = functions.https.onCall(async (data: { uid?: string }, context: functions.https.CallableContext) => {
  // Comprova que només els admins poden cridar aquesta funció
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', "Has d'estar autenticat");
  }

  const uid = data.uid as string;
  if (!uid) {
    throw new functions.https.HttpsError('invalid-argument', 'No s\'ha proporcionat el UID');
  }

  try {
    console.log(`🗑️ Reintentant eliminar l'usuari ${uid} de Firebase Auth...`);
    await admin.auth().deleteUser(uid);
    console.log(`✅ L'usuari ${uid} s'ha eliminat correctament`);
    return { success: true, message: `L'usuari ${uid} s'ha eliminat` };
  } catch (error: any) {
    console.error(`❌ Error:`, error);
    if (error.code === 'auth/user-not-found') {
      return { success: true, message: `L'usuari ja no existeix a Auth` };
    }
    throw new functions.https.HttpsError('internal', error.message);
  }
});
