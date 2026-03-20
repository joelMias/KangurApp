<template>
  <AppLayout :show-back="true" back-route="/HomePage" :scroll-y="false">
    <template #actions>
      <IonButton @click="router.push('/perfil')">
        <IonIcon :icon="menuOutline"></IonIcon>
      </IonButton>
    </template>
      <div class="centered-wrapper">
        <h2 class="titol">Entrada i sortida de la unitat</h2>

        <IonCard class="mini-card">
            <IonGrid> 
              <IonRow>
                <IonCol>
                  <span class="card-title">Entrada</span>
                </IonCol>
              </IonRow>

              <IonRow class="ion-justify-content-center ion-align-items-center">
                <IonCol size="auto">
                  <span class="negreta">{{ formattedDate }}</span>
                </IonCol>
                <IonCol size="auto">
                  <span>a les</span>
                </IonCol>
                <IonCol size="auto" class="ion-text-center ion-align-self-center">
                  <IonDatetime class="time-picker negreta" presentation="time" :value="entryTime" @ionChange="onEntryChange"/>
                </IonCol>
              </IonRow>
            </IonGrid>
        </IonCard>

        <IonCard class="mini-card">    
            <IonGrid>
               <IonRow>
                <IonCol>
                  <span class="card-title">Sortida</span>
                </IonCol>
              </IonRow>
              <IonRow class="ion-justify-content-center ion-align-items-center">
                <IonCol size="auto">
                  <span class="negreta">{{ formattedDate }}</span>
                </IonCol>
                <IonCol size="auto">
                  <span>a les</span>
                </IonCol>
                <IonCol size="auto" class="ion-text-center ion-align-self-center">
                  <IonDatetime class="time-picker bold-picker" presentation="time" :value="exitTime" @ionChange="onExitChange"/>
                </IonCol>
              </IonRow>
            </IonGrid>
        </IonCard>

        <div class="button-container">
          <IonButton expand="block" size="large" fill="outline" color="medium" @click="cancelar">
            Cancelar
          </IonButton>
          <IonButton expand="block" size="large" fill="outline" color="primary" @click="registrar">
            Registrar
          </IonButton>
        </div>
      </div>

      <IonToast :is-open="estaOk" :icon="checkbox" :message="toastMessage" :duration="3000" position="bottom" @didDismiss="estaOk = false" color="primary"/>
      <IonToast :is-open="showErrorToast" :message="errorMessage" :duration="3000" position="bottom" @didDismiss="showErrorToast = false" color="danger"/>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { IonGrid, IonRow, IonCol, IonCard, IonDatetime, IonIcon, IonButton, IonToast } from '@ionic/vue'
import { menuOutline, checkbox } from 'ionicons/icons'
import AppLayout from '@/components/AppLayout.vue'
import { useRouter } from 'vue-router'

// Firebase
import { db, auth } from '@/services/firebase'
import { collection, addDoc, getDocs } from 'firebase/firestore'
import offlineService from '@/services/offline.service'

const router = useRouter()
const today = new Date()
const estaOk = ref(false)
const toastMessage = ref('')
const showErrorToast = ref(false)
const errorMessage = ref('')

const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' }
const formattedDate = new Date().toLocaleDateString('ca-ES', options).replace('de', '')

const horaNormal = today.toISOString().split('T')[0]

const entryTime = ref('12:00')
const exitTime = ref('15:00')

function onEntryChange(ev: any) { entryTime.value = ev.detail.value }
function onExitChange(ev: any) { exitTime.value = ev.detail.value }

const cancelar = () => {
  router.push('/HomePage')
}

const registrar = async () => {
  try {
    const user = auth.currentUser
    const fallbackUid = localStorage.getItem('uid')
    if (!user && !fallbackUid) throw new Error('Usuari no autenticat')
    const userIdToUse = user?.uid ?? fallbackUid ?? ''

    // Comprovació: hora d'entrada < hora de sortida
    const [entryHour, entryMin] = entryTime.value.split(':').map(Number)
    const [exitHour, exitMin] = exitTime.value.split(':').map(Number)

    const entryDate = new Date(today)
    entryDate.setHours(entryHour, entryMin, 0, 0)

    const exitDate = new Date(today)
    exitDate.setHours(exitHour, exitMin, 0, 0)

    if (exitDate <= entryDate) {
      errorMessage.value = "Error: L'hora de sortida no pot ser anterior a l'hora d'entrada"
      showErrorToast.value = true
      return
    }

    // Obtenim l'únic nadó de l'usuari (fallback a localStorage si estem offline)
    let nadoId: string | null = null
    if (navigator.onLine) {
      try {
        const userIdToUse = user?.uid ?? fallbackUid ?? ''
        if (userIdToUse) {
          const snapshot = await getDocs(collection(db, 'users', userIdToUse, 'nadons'))
          if (!snapshot.empty) nadoId = snapshot.docs[0].id
        }
      } catch (err) {
        console.warn('Error obtenint usuaris de firebase', err)
      }
    }
    if (!nadoId) nadoId = localStorage.getItem('selectedNado')
    if (!nadoId) throw new Error('No hi ha cap nadó registrat (ni local)')

    const payload = {
      nadoId,
      dia: horaNormal,
      horaEntrada: entryTime.value,
      horaSortida: exitTime.value,
      createdAt: new Date(),
      eliminado: false
    }

    if (navigator.onLine) {
      await addDoc(collection(db, 'users', userIdToUse, 'estades'), payload)
      toastMessage.value = 'Temps a la unitat registrat'
    } else {
      offlineService.addPending('estades', payload, userIdToUse)
      console.log('Entrada guardada localment per sincronitzar després')
      toastMessage.value = 'Guardat localment — s’enviarà quan hi hagi connexió'
    }

    estaOk.value = true
    router.push('/HomePage')
  } catch (err: any) {
    console.error("Error registrant l'entrada:", err)
    errorMessage.value = "Error registrant l'entrada: " + err.message
    showErrorToast.value = true
  }
}
</script>


<style scoped>

.time-picker {
  margin-top: -40px;
  margin-bottom: -35px;
  color: black;
  --ion-color-primary: black;
  font-weight: 700;
  display: inline-block;
}

</style>