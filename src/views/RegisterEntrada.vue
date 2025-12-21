<template>
  <IonPage>
    <IonHeader>
      <IonToolbar class="capçalera">
        <IonTitle> <img src="/src/assets/kangur_resized.jpg" class="header-logo">KANGURAPP</IonTitle>
        <IonButtons slot="start">
          <IonButton @click="router.push('/funcionalitats')">
            <IonIcon :icon="arrowBackOutline"></IonIcon>
          </IonButton>
        </IonButtons>
        <IonButtons slot="end">
          <IonButton @click="router.push('/historial')">
            <IonIcon :icon="menuOutline"></IonIcon>
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>

    <IonContent fullscreen class="ion-padding">
      <IonGrid>
        
        <IonRow>
          <IonCol class="ion-text-center">
            <div class="titol">Entrada i sortida de la unitat</div>
          </IonCol>
        </IonRow>

        <IonRow class="ion-justify-content-center">
          <IonCol size="12" size-md="8" size-lg="6">
            <IonCard class="mini-card">
                <IonGrid> 
                  <IonRow>
                    <IonCol>
                      <span class="card-title">Entrada</span>
                    </IonCol>
                  </IonRow>

                  <IonRow class="ion-justify-content-center ion-align-items-center">
                    <IonCol size="auto">
                      <span class="date-bold">{{ formattedDate }}</span>
                    </IonCol>
                    <IonCol size="auto">
                      <span>a les</span>
                    </IonCol>
                    <IonCol size="auto" class="ion-text-center ion-align-self-center">
                      <IonDatetime class="time-picker bold-picker" presentation="time" :value="entryTime" @ionChange="onEntryChange"/>
                    </IonCol>
                    <IonCol size="auto">
                      <span>hores</span>
                    </IonCol>
                  </IonRow>
                </IonGrid>
            </IonCard>
          </IonCol>
        </IonRow>

        <IonRow class="ion-justify-content-center">
          <IonCol size="12" size-md="8" size-lg="6">
            <IonCard class="mini-card">    
                <IonGrid>
                   <IonRow>
                    <IonCol>
                      <span class="card-title">Sortida</span>
                    </IonCol>
                  </IonRow>
                  <IonRow class="ion-justify-content-center ion-align-items-center">
                    <IonCol size="auto">
                      <span class="date-bold">{{ formattedDate }}</span>
                    </IonCol>
                    <IonCol size="auto">
                      <span>a les</span>
                    </IonCol>
                    <IonCol size="auto" class="ion-text-center ion-align-self-center">
                      <IonDatetime class="time-picker bold-picker" presentation="time" :value="exitTime" @ionChange="onExitChange"/>
                    </IonCol>
                    <IonCol size="auto">
                      <span>hores</span>
                    </IonCol>
                  </IonRow>
                </IonGrid>
            </IonCard>
          </IonCol>
        </IonRow>

      </IonGrid>
    </IonContent>

    <IonFooter class="footer">
      <IonToolbar>
        <IonGrid>
          <IonRow class="ion-justify-content-center">
            <IonCol size="auto">
              <IonButton expand="block" fill="outline" class="boto-cancelar" @click="cancelar">X</IonButton>
            </IonCol>
            <IonCol size="auto">
              <IonButton expand="block" fill="outline" class="boto-registrar" @click="registrar">Registrar</IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonToolbar>
      <IonToast :is-open="estaOk" :icon="checkbox" :message="toastMessage" :duration="3000" position="bottom" @didDismiss="estaOk = false" color="primary"/>
    </IonFooter>

  </IonPage>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { IonPage, IonHeader, IonButtons, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol, IonFooter, IonCard, IonCardHeader, IonCardContent, IonDatetime, IonIcon, IonButton, IonToast } from '@ionic/vue'
import { menuOutline, checkbox, arrowBackOutline } from 'ionicons/icons'
import { useRouter } from 'vue-router'

// Firebase
import { db, auth } from '@/services/firebase'
import { collection, addDoc, getDocs } from 'firebase/firestore'
import offlineService from '@/services/offline.service'

const router = useRouter()
const today = new Date()
const estaOk = ref(false)
const toastMessage = ref('')

const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' }
const formattedDate = new Date().toLocaleDateString('ca-ES', options).replace('de', '')

const horaNormal = today.toISOString().split('T')[0]

const entryTime = ref('12:00')
const exitTime = ref('15:00')

function onEntryChange(ev: any) { entryTime.value = ev.detail.value }
function onExitChange(ev: any) { exitTime.value = ev.detail.value }

const cancelar = () => {
  router.push('/funcionalitats')
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
      alert("Error: L'hora de sortida no pot ser anterior a l'hora d'entrada")
      return
    }

    // Obtenim l'únic nadó de l'usuari (fallback a localStorage si estem offline)
    let nadoId: string | null = null
    if (navigator.onLine) {
      try {
        const userIdToUse = user?.uid ?? fallbackUid ?? ''
        if (userIdToUse) {
          const snapshot = await getDocs(collection(db, 'users', userIdToUse, 'nados'))
          if (!snapshot.empty) nadoId = snapshot.docs[0].id
        }
      } catch (err) {
        console.warn('No s’han pogut llegir nadós del servidor', err)
      }
    }
    if (!nadoId) nadoId = localStorage.getItem('selectedNado')
    if (!nadoId) throw new Error('No hi ha cap nadó registrat (ni local)')

    const payload = {
      nadoId,
      dia: horaNormal,
      horaEntrada: entryTime.value,
      horaSortida: exitTime.value,
      createdAt: new Date()
    }

    if (navigator.onLine) {
      await addDoc(collection(db, 'users', userIdToUse, 'entrades'), payload)
      toastMessage.value = 'Temps a la unitat registrat'
    } else {
      offlineService.addPending('entrades', payload, userIdToUse)
      console.log('Entrada guardada localment per sincronitzar després')
      toastMessage.value = 'Guardat localment — s’enviarà quan hi hagi connexió'
    }

    estaOk.value = true
    router.push('/funcionalitats')
  } catch (err: any) {
    console.error('Error registrant l’entrada:', err)
    alert('Error registrant l’entrada: ' + err.message)
  }
}
</script>


<style scoped>

.titol {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.mini-card {
  border: 1px solid #6ad4d4;
  border-radius: 10px;
}

.card-title {
  position:relative;
  font-weight: bold;
  font-size: 16px;
  color: #6ad4d4;
}

.time-picker {
  margin-top: -40px;
  margin-bottom: -35px;
  color: black;
  --ion-color-primary: black;
  font-weight: 700;
  display: inline-block;
}

.date-bold {
  font-weight: 700;
}

.bold-picker {
  font-weight: 700;
}

.boto-cancelar {
  --background: #fff;
  --color: #555;
  --border-color: #555;
  --border-width: 1px;
}

.boto-registrar {
  --background: #fff;
  --color: #6ad4d4;
  --border-color: #6ad4d4;
  --border-width: 1px;
}

</style>