<template>
  <AppLayout :show-back="true" :scroll-y="false" back-route="/register" content-class="ion-padding">
    <RegistrationProgress :current-step="2" />

    <IonGrid>
      <IonRow class="ion-justify-content-center">
        <IonCol size="12" size-md="6" size-lg="5">
          <IonText color="dark">
            <h2 class="titol">2. Registra el nadó</h2>
          </IonText>

          <div v-if="error">
            <IonText color="danger">
              <p class="error-message">{{ error }}</p>
            </IonText>
          </div>

          <div style="margin-bottom: 20px;">
            <strong>
              <IonLabel class="input-label">Nom del nadó</IonLabel>
            </strong>
            <IonInput v-model="nomNado" placeholder="Nom del nadó" fill="outline" class="input-box" />
          </div>

          <div class="datetime-wheel-container" @click="openGestationPicker">
            <div class="wheel-labels">
              <span>Dies</span>
              <span>Setmanes</span>
            </div>

            <div class="wheel-display">
              {{ dies }} + {{ setmanes }}
            </div>
          </div>

          <br>
          <IonButton expand="block" size="large" fill="outline" @click="Registre" class="ion-margin-top"
            :disabled="loading">
            <IonSpinner v-if="loading" name="crescent"></IonSpinner>
            <span v-else>Continuar</span>
          </IonButton>
        </IonCol>
      </IonRow>
    </IonGrid>
  </AppLayout>
</template>

<script setup lang="ts">
import { IonGrid, IonCol, IonRow, IonText, IonInput, IonLabel, IonButton, IonSpinner, onIonViewWillEnter } from '@ionic/vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { pickerController } from '@ionic/vue'
import { db, auth } from '@/services/firebase'
import { collection, addDoc } from 'firebase/firestore'
import offlineService from '@/services/offline.service'
import AppLayout from '@/components/AppLayout.vue'
import RegistrationProgress from '@/components/RegistrationProgress.vue'

const router = useRouter()

const nomNado = ref('')
const error = ref('')
const loading = ref(false)
const setmanes = ref(22)
const dies = ref(0)

async function openGestationPicker() {
  const picker = await pickerController.create({
    columns: [
      {
        name: 'dies',
        options: Array.from({ length: 8 }, (_, i) => ({ text: `${i}`, value: i }))
      },
      {
        name: 'setmanes',
        options: Array.from({ length: 22 }, (_, i) => ({ text: `${i + 22}`, value: i + 22 }))
      }
    ],
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      { 
        text: 'Ok', 
        handler: (val: any) => {
          dies.value = val.dies.value
          setmanes.value = val.setmanes.value
        }
      }
    ]
  })
  picker.present()
}

onIonViewWillEnter(() => {
  nomNado.value = ''
  setmanes.value = 22
  dies.value = 0
  error.value = ''
  loading.value = false
})

const Registre = async () => {
  if (!nomNado.value.trim()) {
    error.value = 'Omple tots els camps.'
    return
  }

  error.value = ''
  loading.value = true

  try {
    const user = auth.currentUser
    if (!user) throw new Error('Usuari no autenticat')

    const nadoData = {
      name: nomNado.value,
      setmanes: setmanes.value,
      dies: dies.value,
      createdAt: new Date()
    }

    const fallbackUid = localStorage.getItem('uid')
    const userIdToUse = user.uid ?? fallbackUid ?? ''
    if (navigator.onLine) {
      const docRef = await addDoc(collection(db, 'users', userIdToUse, 'nadons'), nadoData)
      console.log('Nadó desat:', nadoData)
      localStorage.setItem('selectedNado', docRef.id)
      localStorage.setItem('selectedNadoName', nomNado.value)

      try {
        const raw = localStorage.getItem('localnadons')
        const list = raw ? JSON.parse(raw) : []
        list.push({ id: docRef.id, name: nomNado.value })
        localStorage.setItem('localnadons', JSON.stringify(list))
      } catch (e) { console.warn('Error caching local nadons', e) }
    } else {
      const tempId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      localStorage.setItem('selectedNado', tempId)
      localStorage.setItem('selectedNadoName', nomNado.value)
      try {
        const raw = localStorage.getItem('localnadons')
        const list = raw ? JSON.parse(raw) : []
        list.push({ id: tempId, name: nomNado.value })
        localStorage.setItem('localnadons', JSON.stringify(list))
      } catch (e) { console.warn('Error al guardar el nado en local', e) }
      offlineService.addPending('nadons', { ...nadoData, __tempId: tempId }, userIdToUse)
      console.log('Nadó guardat localment per sincronitzar després')
    }

    router.push('/cangurs')
  } catch (err: any) {
    console.error('Error desant el nadó:', err)
    error.value = err.message || 'Error desant el nadó. Torna-ho a intentar.'
    loading.value = false
  }
}
</script>

<style scoped>
.input-label {
  font-weight: bold;
  font-family: "Nunito", sans-serif;
  color: grey;
}

.datetime-wheel-container {
  background: #f4f4f4;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.wheel-labels {
  display: flex;
  justify-content: space-around;
  position: absolute;
  top: 10px;
  width: 100%;
  z-index: 10;
  pointer-events: none;
}

.wheel-labels span {
  font-size: 12px;
  color: #888;
  font-weight: bold;
  text-transform: uppercase;
  flex: 1;
  text-align: center;
}

.wheel-display {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  padding: 70px 0 20px;
}
</style>