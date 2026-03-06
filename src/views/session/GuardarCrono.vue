<template>
  <AppLayout :show-back="true" back-route="/cronometre" :scroll-y="false">
    <div class="centered-wrapper">
    
      <h1 class="negreta">Registrar pell amb pell</h1>
      <IonCard class="mini-card">
        <ion-grid>
          <IonRow class="ion-justify-content-center">
            <IonCol size="10" size-lg="10" size-md="10">
              <IonCard class="center-button">
                <IonRow class="ion-justify-content-center ion-margin-top">
                  <IonCol size="auto">
                    <IonIcon :icon="timerOutline" class="icona-rellotge" />
                  </IonCol>
                </IonRow>
                <IonRow class="ion-justify-content-center">
                  <IonCol size="auto">
                    <div class="temps-display ion-text-center">{{ formatTime(temps) }}</div>
                  </IonCol>
                </IonRow>
              </IonCard>
            </IonCol>
          </IonRow>
        
          <IonRow>
            <IonCol class="ion-text-center ion-margin-top">
              <IonLabel color="primary"><h1 class="negreta">Qui ha fet el pell amb pell?</h1></IonLabel>
            </IonCol>
          </IonRow>
          
          <IonRow class="ion-justify-content-center ion-margin-top">
            <IonCol size="12" class="ion-text-center">

              <div class="button-container">
                <IonButton 
                  v-for="c in cangurs" 
                  :key="c.id" 
                  expand="block" 
                  :fill="c.id === cangurSeleccionat ? 'solid' : 'outline'"
                  color="primary"
                  @click="cangurSeleccionat = c.id">
                  {{ c.name }}
                </IonButton>
              </div>
            </IonCol>
          </IonRow>
          <br>
        </ion-grid>
      </IonCard>
      
      <div class="button-container">
        <IonButton expand="block" size="large" fill="outline" color="medium" @click="cancelar">
          Cancelar
        </IonButton>
        <IonButton expand="block" size="large" fill="solid" color="primary" :disabled="!cangurSeleccionat" @click="guardarSessio">
          Registrar
        </IonButton>
      </div>

      <IonLoading :is-open="loadingCangurs" message="Carregant cangurs..." spinner="crescent"/>
      <IonToast :is-open="estaOk" :icon="checkbox" :message="toastMessage" :duration="3000" position="bottom" @didDismiss="estaOk = false" color="primary"></IonToast>
      <IonToast :is-open="showErrorToast" :message="errorMessage" :duration="3000" position="bottom" @didDismiss="showErrorToast = false" color="danger"></IonToast>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import {IonLoading, IonGrid, IonRow, IonCol, IonIcon, IonCard, IonLabel, IonButton, IonToast, onIonViewWillEnter } from '@ionic/vue'
import AppLayout from '@/components/AppLayout.vue'
import { timerOutline, checkbox } from 'ionicons/icons'
import { useRouter, useRoute } from 'vue-router'
import { onAuthStateChanged } from 'firebase/auth'

// Firebase
import { db, auth } from '@/services/firebase'
import { collection, getDocs, addDoc } from 'firebase/firestore'
import offlineService from '@/services/offline.service'

const router = useRouter()
const route = useRoute()
import { cronoTemp, loadCronoTempFromStorage, clearCronoTemp } from '@/stores/temps'

const loadingCangurs = ref(false)
const temps = ref(0)

watch(
  () => route.query.temps,
  (val) => {
    if (val !== undefined) {
      loadCronoTempFromStorage()
      if (cronoTemp.value && cronoTemp.value > 0) temps.value = cronoTemp.value
    } else {
      clearCronoTemp()
      temps.value = 0
    }
  },
  { immediate: true }
)

const cangurs = ref<{ id: string; name: string }[]>([])
const cangurSeleccionat = ref<string | null>(null)
const estaOk = ref(false)
const toastMessage = ref('')
const showErrorToast = ref(false)
const errorMessage = ref('')

const formatTime = (t: number) => {
  const m = Math.floor((t % 3600) / 60)
  const s = t % 60
  return `${m} minuts ${s} segons`
}

onIonViewWillEnter(() => {
  cangurSeleccionat.value = null
})

onMounted(() => {
  loadingCangurs.value = true
  const unsub = onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        // Quan estem online, llegim els cangurs de la base de dades, sinó anem al "else"
        if (navigator.onLine) {
          const snapshot = await getDocs(collection(db, 'users', user.uid, 'cangurs'))
          cangurs.value = snapshot.docs.map(d => ({
            id: d.id,
            name: d.data().name || d.data().nom
          }))
            
            try {
              const regName = localStorage.getItem('name') || ''
              if (regName) {
                const idx = cangurs.value.findIndex(c => (c.name || '').toLowerCase() === regName.toLowerCase())
                if (idx > 0) {
                  const [item] = cangurs.value.splice(idx, 1)
                  cangurs.value.unshift(item)
                }
              }
            } catch (e) {  }
          
          try { localStorage.setItem('localCangurs', JSON.stringify(cangurs.value)) } catch (e) { }

          try {
            const nadonsnap = await getDocs(collection(db, 'users', user.uid, 'nadons'))
            if (!nadonsnap.empty) {
              const nadons = nadonsnap.docs.map(d => ({ id: d.id, name: d.data().name }))
              try { localStorage.setItem('localnadons', JSON.stringify(nadons)) } catch (e) { console.warn('Error saving localnadons', e) }
              const selId = localStorage.getItem('selectedNado')
              if (!selId && nadons.length) {
                try { localStorage.setItem('selectedNado', nadons[0].id); localStorage.setItem('selectedNadoName', nadons[0].name) } catch (e) { /* ignore */ }
              } else if (selId) {
                const found = nadons.find(n => n.id === selId)
                if (found) try { localStorage.setItem('selectedNadoName', found.name) } catch (e) { /* ignore */ }
              }
            }
          } catch (e) {
            console.warn("No s'han pogut llegir nadós per cache", e);
          }
        } else {
          // Quan estem offline llegim les dades del cache local
          const raw = localStorage.getItem('localCangurs')
          if (raw) {
            try {
              const parsed = JSON.parse(raw)
              cangurs.value = parsed.map((c: any) => ({ id: c.id, name: c.name || c.nom }))
              
              const regName = localStorage.getItem('name') || ''
              if (regName) {
                const idx = cangurs.value.findIndex((c: any) => (c.name || '').toLowerCase() === regName.toLowerCase())
                if (idx > 0) {
                  const [item] = cangurs.value.splice(idx, 1)
                  cangurs.value.unshift(item)
                }
              }
            } catch (e) {
              console.warn('Error llegint cangurs del cache', e)
            }
          }
        }
      } catch (err) {
        console.error('Error carregant cangurs', err)
        const raw = localStorage.getItem('localCangurs')
        if (raw) {
          try {
            const parsed = JSON.parse(raw)
            cangurs.value = parsed.map((c: any) => ({ id: c.id, name: c.name || c.nom }))
          } catch (e) { console.warn(e) }
        }
      } finally {
        loadingCangurs.value = false
      }
    } else {
      console.warn('No hi ha usuari autenticat')
      // si no hi ha usuari, intentem carregar els cangurs que hi ha al cache per usuaris anteriors
      const raw = localStorage.getItem('localCangurs')
      if (raw) {
        try {
          const parsed = JSON.parse(raw)
          cangurs.value = parsed.map((c: any) => ({ id: c.id, name: c.name || c.nom }))
        } catch (e) { console.warn(e) }
      }
      loadingCangurs.value = false
    }
    unsub() // deixem d’escoltar un cop tenim resposta
  })
})

const cancelar = () => {
  router.push('/HomePage')
}

const guardarSessio = async () => {
  if (!cangurSeleccionat.value) {
    errorMessage.value = 'Selecciona un cangur primer'
    showErrorToast.value = true
    return
  }
  try {
    const user = auth.currentUser
    const fallbackUid = localStorage.getItem('uid')
    if (!user && !fallbackUid) throw new Error('Usuari no autenticat')
    const userIdToUse = user?.uid ?? fallbackUid ?? ''

    // Obtenim el nadó de l’usuari. Això ho fem perquè el registre del pell amb pell necessita saber quin nadó és
    let nadoNom: string | null = null
    let nadoId: string | null = null
    if (navigator.onLine) {
      try {
        if (userIdToUse) {
          const nadonsnap = await getDocs(collection(db, 'users', userIdToUse, 'nadons'))
          if (!nadonsnap.empty) {
            const nadoDoc = nadonsnap.docs[0]
            nadoId = nadoDoc.id
            nadoNom = nadoDoc.data().name
          }
        }
      } catch (err) {
        console.warn('No s’han pogut llegir nadós del servidor', err)
      }
    }

    if (!nadoId) nadoId = localStorage.getItem('selectedNado')
    if (!nadoNom) nadoNom = localStorage.getItem('selectedNadoName')

    if ((!nadoNom || nadoNom === '') && nadoId) {
      try {
        const raw = localStorage.getItem('localnadons')
        if (raw) {
          const list = JSON.parse(raw)
          const found = list.find((x: any) => x.id === nadoId)
          if (found) {
            nadoNom = found.name
            try { localStorage.setItem('selectedNadoName', nadoNom ?? '') } catch (e) {  }
          }
        }
      } catch (e) { console.warn('Error llegint localnadons', e) }
    }

    if ((!nadoNom || nadoNom === '') && !nadoId) {
      try {
        const raw = localStorage.getItem('localnadons')
        if (raw) {
          const list = JSON.parse(raw)
          if (Array.isArray(list) && list.length) {
            const first = list[0]
            nadoId = first.id
            nadoNom = first.name
            try { localStorage.setItem('selectedNado', nadoId ?? ''); localStorage.setItem('selectedNadoName', nadoNom ?? '') } catch (e) { /* ignore */ }
          }
        }
      } catch (e) { console.warn('Error llegint localnadons fallback', e) }
    }

    if (!nadoNom) nadoNom = ''

    const now = new Date()
    const dia = now.toISOString().split('T')[0]
    const hora = now.toTimeString().slice(0,5)

    const payload = {
      cangurId: cangurSeleccionat.value,
      cangurNom: cangurs.value.find(c => c.id === cangurSeleccionat.value)?.name || '',
      nadoNom,
      nadoId,
      temps: temps.value,
      dia,
      hora,
      createdAt: now
    }

    if (navigator.onLine) {
      await addDoc(collection(db, 'users', userIdToUse, 'cronometres'), payload)
      toastMessage.value = 'Pell amb pell registrat'
    } else {
      // Quan estem offline, guardem les dades a la cua local
      offlineService.addPending('cronometres', payload, userIdToUse)
      console.log('Guardat localment per sincronitzar quan hi hagi connexió')
      toastMessage.value = 'Guardat localment — s’enviarà quan hi hagi connexió'
    }

    estaOk.value = true
    clearCronoTemp()
    router.push('/HomePage')
  } catch (err: any) {
    console.error('Error desant el cronòmetre:', err)
    errorMessage.value = 'Error desant el cronòmetre: ' + err.message
    showErrorToast.value = true
  }
}
</script>


<style scoped>

.center-button {
  --background: #fff;
  --color: #000;
  border-radius: 10px;
  font-weight: 600;
  font-size: 16px;
}

.icona-rellotge { 
  font-size: 36px; 
  margin-bottom: 10px; 
}

.temps-display { 
  font-size: 24px; 
  font-weight: bold; 
}
</style>