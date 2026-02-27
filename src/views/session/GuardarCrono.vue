<template>
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle class="capçalera"> <img src="/src/assets/kangur_resized.jpg" class="header-logo">KANGURAPP</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent fullscreen class="ion-padding">
      <IonGrid>
        
        <IonRow>
          <IonCol class="ion-text-center">
            <h2 class="subtitol">Registrar pell amb pell</h2>
          </IonCol>
        </IonRow>

        
        <IonRow class="ion-justify-content-center ion-margin-top">
          <IonCol size="10" size-lg="6" size-md="4">
            <IonCard class="center-button">
              <IonRow class="ion-justify-content-center ion-margin-top">
                <IonCol size="auto">
                  <IonIcon :icon="timerOutline" class="icona-rellotge" />
                </IonCol>
              </IonRow>
              <IonRow class="ion-justify-content-center">
                <IonCol size="auto">
                  <div class="temps-display">{{ formatTime(temps) }}</div>
                </IonCol>
              </IonRow>
            </IonCard>
          </IonCol>
        </IonRow>

       
        <IonRow>
          <IonCol class="ion-text-center ion-margin-top">
            <IonLabel>Qui ha fet el pell amb pell?</IonLabel>
          </IonCol>
        </IonRow>

        
        <IonRow class="ion-justify-content-center ion-margin-top">
          <IonCol size="12" class="ion-text-center">
            <div class="cangur-cards">
              <div v-for="c in cangurs" :key="c.id" class="cangur-card" :class="{ selected: c.id === cangurSeleccionat }" @click="cangurSeleccionat = c.id">
                {{ c.name }}
              </div>
            </div>
          </IonCol>
        </IonRow>

      </IonGrid>

      <IonLoading :is-open="loadingCangurs" message="Carregant cangurs..." spinner="crescent"/>

    </IonContent>

    <IonFooter class="footer">
      <IonToolbar>
        <IonGrid>
          <IonRow class="ion-justify-content-center">
            <IonCol size="auto">
              <IonButton expand="block" fill="outline" color="medium" class="footer-button lletra" @click="cancelar">Cancelar</IonButton>
            </IonCol>
            <IonCol size="auto">
              <IonButton expand="block" color="primary" fill="solid" class="footer-button lletra" @click="guardarSessio">Registrar</IonButton>
              <IonToast :is-open="estaOk" :icon="checkbox" :message="toastMessage" :duration="3000" position="bottom" @didDismiss="estaOk = false" color="primary"></IonToast>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonToolbar>
    </IonFooter>

  </IonPage>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import {IonPage, IonButtons, IonLoading, IonGrid, IonRow, IonCol, IonHeader, IonIcon, IonCard, IonToolbar, IonTitle, IonFooter, IonContent, IonLabel, IonButton, IonToast } from '@ionic/vue'
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

const formatTime = (t: number) => {
  const m = Math.floor((t % 3600) / 60)
  const s = t % 60
  return `${m} minuts ${s} segons`
}

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
                
                if (!cangurSeleccionat.value && cangurs.value.length) cangurSeleccionat.value = cangurs.value[0].id
              }
            } catch (e) {  }
          
          try { localStorage.setItem('localCangurs', JSON.stringify(cangurs.value)) } catch (e) { }

          try {
            const nadoSnap = await getDocs(collection(db, 'users', user.uid, 'nados'))
            if (!nadoSnap.empty) {
              const nados = nadoSnap.docs.map(d => ({ id: d.id, name: d.data().name }))
              try { localStorage.setItem('localNados', JSON.stringify(nados)) } catch (e) { }
              const selId = localStorage.getItem('selectedNado')
              if (!selId && nados.length) {
                try { localStorage.setItem('selectedNado', nados[0].id); localStorage.setItem('selectedNadoName', nados[0].name) } catch (e) { /* ignore */ }
              } else if (selId) {
                const found = nados.find(n => n.id === selId)
                if (found) try { localStorage.setItem('selectedNadoName', found.name) } catch (e) { }
              }
            }
          } catch (e) {
            console.warn('No s’han pogut llegir nadós per cache', e)
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
                if (!cangurSeleccionat.value && cangurs.value.length) cangurSeleccionat.value = cangurs.value[0].id
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
    alert('Selecciona un cangur primer')
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
          const nadoSnap = await getDocs(collection(db, 'users', userIdToUse, 'nados'))
          if (!nadoSnap.empty) {
            const nadoDoc = nadoSnap.docs[0]
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
        const raw = localStorage.getItem('localNados')
        if (raw) {
          const list = JSON.parse(raw)
          const found = list.find((x: any) => x.id === nadoId)
          if (found) {
            nadoNom = found.name
            try { localStorage.setItem('selectedNadoName', nadoNom ?? '') } catch (e) {  }
          }
        }
      } catch (e) { console.warn('Error llegint localNados', e) }
    }

    if ((!nadoNom || nadoNom === '') && !nadoId) {
      try {
        const raw = localStorage.getItem('localNados')
        if (raw) {
          const list = JSON.parse(raw)
          if (Array.isArray(list) && list.length) {
            const first = list[0]
            nadoId = first.id
            nadoNom = first.name
            try { localStorage.setItem('selectedNado', nadoId ?? ''); localStorage.setItem('selectedNadoName', nadoNom ?? '') } catch (e) { /* ignore */ }
          }
        }
      } catch (e) { console.warn('Error llegint localNados fallback', e) }
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
    alert('Error desant el cronòmetre: ' + err.message)
  }
}
</script>


<style scoped>

.subtitol {
  font-weight: bold;
  margin-bottom: 10px;
}

.center-button {
  --background: #fff;
  --color: #000;
  border: 1px solid #26a69a;
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

.cangur-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

.cangur-card {
  padding: 12px 20px;
  background-color: #e0e0e0;
  border: 1px solid #000;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  min-width: 120px;
  transition: all 0.3s;
}

.cangur-card.selected {
  background-color: #4b9b90;
  color: #fff;
  border-color: #4b9b90;
}

.footer-button {
  --color: #4b9b90;
  --border-color: #4b9b90;
  --border-width: 1px;
  --border-radius:7px;
  font-weight: 600;
  text-transform: none;
  font-size: 18px;          
}

</style>