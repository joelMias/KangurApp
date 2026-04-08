<template>
  <AppLayout :show-back="true" back-route="/cronometre" :scroll-y="true"> <div class="centered-wrapper">
      <IonText color="dark">
        <h2 class="negreta ion-text-center titol">Registrar pell amb pell</h2>
      </IonText>

      <IonCard class="mini-card">
        <ion-grid>
          <IonRow class="ion-justify-content-center">
            <IonCol size="12" class="ion-text-center">
              <div class="timer-container">
                <IonIcon :icon="timerOutline" class="icona-rellotge" color="primary" style="font-size: 36px; margin: 0;"/>
                <div class="temps-display"><h2 class="negreta">{{ formatTime(temps) }}</h2></div>
              </div>
            </IonCol>
          </IonRow>

          <IonRow class="ion-justify-content-center ion-margin-top">
            <IonCol size="11">
              <div class="input-centered-group">
                <IonLabel color="primary" class="label-centrat">
                  <h2 class="negreta">Per què has hagut de finalitzar?</h2>
                </IonLabel>
                <IonTextarea 
                  v-model="motiuFinal" 
                  placeholder="Opcional..." 
                  fill="outline" 
                  :rows="3"
                  class="custom-textarea">
                </IonTextarea>
              </div>
            </IonCol>
          </IonRow>

          <IonRow class="ion-justify-content-center ion-margin-top">
            <IonCol size="12" class="ion-text-center">
              <IonLabel color="primary">
                <h2 class="negreta">Qui ha fet el pell amb pell?</h2>
              </IonLabel>
              
              <div class="button-grid-container">
                <IonButton 
                  v-for="c in cangurs" 
                  :key="c.id" 
                  :fill="c.id === cangurSeleccionat ? 'solid' : 'outline'"
                  color="primary"
                  class="btn-cangur"
                  @click="cangurSeleccionat = c.id">
                  {{ c.name }}
                </IonButton>
              </div>
            </IonCol>
          </IonRow>
        </ion-grid>
      </IonCard>
      
      <div class="action-buttons">
        <IonButton expand="block" fill="outline" color="medium" @click="cancelar">
          Cancel·lar
        </IonButton>
        <IonButton expand="block" fill="solid" color="primary" :disabled="!cangurSeleccionat || !motiuFinal.trim() || loadingSessio" @click="guardarSessio">
          <IonSpinner v-if="loadingSessio" name="dots" slot="start" />
          Registrar
        </IonButton>
      </div>

      <IonLoading :is-open="loadingCangurs" message="Carregant cangurs..." />
      <IonToast :is-open="estaOk" :icon="checkbox" :message="toastMessage" :duration="3000" color="primary" />
      <IonToast :is-open="showErrorToast" :message="errorMessage" :duration="3000" color="danger" />
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import {IonLoading, IonGrid, IonRow, IonCol, IonIcon, IonCard, IonLabel, IonButton, IonToast, onIonViewWillEnter, IonItem, IonTextarea,IonSpinner, IonText } from '@ionic/vue'
import AppLayout from '@/components/AppLayout.vue'
import { timerOutline, checkbox } from 'ionicons/icons'
import { useRouter, useRoute } from 'vue-router'

// Firebase
import { db, auth } from '@/services/firebase'
import { collection, getDocs, addDoc } from 'firebase/firestore'
import offlineService from '@/services/offline.service'

const router = useRouter()
const route = useRoute()
import { cronoTemp, loadCronoTempFromStorage, clearCronoTemp } from '@/stores/temps'

const loadingCangurs = ref(false)
const temps = ref(0)
const motiuFinal = ref('')

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
const loadingSessio = ref(false)

const formatTime = (t: number) => {
  const m = Math.floor((t % 3600) / 60)
  const s = t % 60
  return `${m} minuts ${s} segons`
}

const loadViewData = async () => {
  loadingCangurs.value = true

  const user = auth.currentUser
  if (!user) {
    console.warn('No hi ha usuari autenticat')
    cangurs.value = loadCangursFromCache()
    loadingCangurs.value = false
    return
  }

  try {
    let fetchedCangurs: { id: string; name: string }[] = []

    if (navigator.onLine) {
      const snapshot = await getDocs(collection(db, 'users', user.uid, 'cangurs'))
      fetchedCangurs = snapshot.docs
        .filter(d => !d.data().eliminado)
        .map(d => normalizeCangur(d.data(), d.id))
        .filter(c => c.name)

      if (fetchedCangurs.length) {
        saveCangursToCache(fetchedCangurs)
      } else {
        localStorage.setItem('localCangurs', JSON.stringify([]))
      }
    }

    const cachedCangurs = loadCangursFromCache()

    if (!navigator.onLine) {
      cangurs.value = cachedCangurs
    } else {
      cangurs.value = mergeCangurs(fetchedCangurs, cachedCangurs)
    }

    try {
      const regName = localStorage.getItem('name') || ''
      if (regName) {
        const idx = cangurs.value.findIndex(c => (c.name || '').toLowerCase() === regName.toLowerCase())
        if (idx > 0) {
          const [item] = cangurs.value.splice(idx, 1)
          cangurs.value.unshift(item)
        }
      }
    } catch (e) { }

    try {
      const nadonsnap = await getDocs(collection(db, 'users', user.uid, 'nadons'))
      if (!nadonsnap.empty) {
        const nadons = nadonsnap.docs.map(d => ({ id: d.id, name: d.data().name }))
        try { localStorage.setItem('localnadons', JSON.stringify(nadons)) } catch (e) { console.warn('Error saving localnadons', e) }
        const selId = localStorage.getItem('selectedNado')
        if (!selId && nadons.length) {
          try { localStorage.setItem('selectedNado', nadons[0].id); localStorage.setItem('selectedNadoName', nadons[0].name) } catch (e) { }
        } else if (selId) {
          const found = nadons.find(n => n.id === selId)
          if (found) try { localStorage.setItem('selectedNadoName', found.name) } catch (e) { }
        }
      }
    } catch (e) {
      console.warn("No s'han pogut llegir nadós per cache", e)
    }
  } catch (err) {
    console.error('Error carregant cangurs', err)
    cangurs.value = loadCangursFromCache()
  } finally {
    loadingCangurs.value = false
  }
}

onIonViewWillEnter(() => {
  cangurSeleccionat.value = null
  loadViewData()
})

const normalizeCangur = (source: any, id: string) => ({
  id,
  name: source?.name || source?.nom || source?.nomCangur || source?.nado || ''
})

const loadCangursFromCache = (): { id: string; name: string }[] => {
  const raw = localStorage.getItem('localCangurs')
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((c: any) => !c.eliminado)
      .map((c: any) => ({
        id: c.id,
        name: c.name || c.nom || c.nomCangur || ''
      }))
      .filter(c => c.name)
  } catch (e) {
    console.warn('Error llegint cangurs del cache', e)
    return []
  }
}

const saveCangursToCache = (list: { id: string; name: string }[]) => {
  try {
    localStorage.setItem('localCangurs', JSON.stringify(list))
  } catch (e) {
    console.warn('Error guardant cangurs al cache', e)
  }
}

const mergeCangurs = (server: { id: string; name: string }[], local: { id: string; name: string }[]) => {
  const map = new Map(server.map(c => [c.id, c]))
  local.forEach(c => {
    if (!map.has(c.id) && c.name) map.set(c.id, c)
  })
  return Array.from(map.values())
}



const cancelar = () => {
  router.push('/HomePage')
}

const guardarSessio = async () => {
  if (!cangurSeleccionat.value) {
    errorMessage.value = 'Selecciona un cangur primer'
    showErrorToast.value = true
    return
  }
  loadingSessio.value = true
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
      motiuFinal: motiuFinal.value,
      dia,
      hora,
      createdAt: now,
      eliminado: false
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
    motiuFinal.value = ''

    router.push('/HomePage')
  } catch (err: any) {
    console.error('Error desant el cronòmetre:', err)
    errorMessage.value = 'Error desant el cronòmetre: ' + err.message
    showErrorToast.value = true
  } finally {
    loadingSessio.value = false
  }
}
</script>


<style scoped>
.centered-wrapper {
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mini-card {
  width: 100%;
  max-width: 500px;
  margin: 10px 0;
  padding: 10px;
  box-shadow: none;
  border: 1px solid #e0e0e0;
}

.input-centered-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.label-centrat {
  margin-bottom: 10px;
  display: block;
}

.custom-textarea {
  --background: #f9f9f9;
  --padding-start: 10px;
  --padding-end: 10px;
  margin-top: 5px;
  text-align: left;
  width: 100%;
}

.button-grid-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 15px;
}

.btn-cangur {
  margin: 0;
  min-width: 100px;
}

.timer-container {
  padding: 20px;
  background: #fcfcfc;
  border-radius: 15px;
}

.action-buttons {
  width: 100%;
  max-width: 500px;
  margin-top: 20px;
}

.negreta {
  font-weight: 700;
}
</style>