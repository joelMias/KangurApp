<template>
    <AppLayout :show-back="true" back-route="/HomePage">
        <template #actions>
          <IonButton @click="logout">
            <IonIcon :icon="logOutOutline"></IonIcon>
          </IonButton>
        </template>

        <IonGrid class="ion-margin-bottom">
          <IonRow>
              <IonCol>
                  <IonButton expand="block" fill="outline" class="confButton" @click="router.push('/config-familia')">
                  Configuració de la família
                  <IonIcon slot="end" :icon="peopleOutline"></IonIcon>
                  </IonButton>
              </IonCol>
          </IonRow>
          <IonRow v-if="superAdmin === true">
            <IonCol>
              <IonButton expand="block" fill="outline" class="confButton" @click="router.push('/admin-panel')">
              Panell d'administració
              <IonIcon slot="end" :icon="shieldOutline"></IonIcon>
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonGrid class="ion-margin-bottom">
          <IonRow class="ion-align-items-center ion-justify-content-between">
            <IonCol size="auto">
              <h2 class="titolHist">
                  <IonIcon :icon="folderOpen"></IonIcon> Historial
              </h2>
            </IonCol>
            <IonCol size="auto">
              <IonRow class="modeBotons">
                <IonCol size="auto">
                    <IonButton color="dark" fill="outline" @click="recarregarHistorial">
                      <IonIcon :icon="refreshOutline"></IonIcon>
                    </IonButton>
                </IonCol>
                <IonCol size="auto">
                  <IonButton class="canviMode" :fill="mode === 'llista' ? 'solid' : 'outline'" @click="mode = 'grafic'">
                    <IonIcon :icon="barChartOutline"></IonIcon>
                  </IonButton>
                </IonCol>
                <IonCol size="auto">
                    <IonButton class="canviMode" :fill="mode === 'grafic' ? 'solid' : 'outline'" @click="mode = 'llista'">
                      <IonIcon :icon="listOutline"></IonIcon>
                    </IonButton>
                </IonCol>
              </IonRow>
            </IonCol>
                  
          </IonRow>
          <div class="separador"></div>
        </IonGrid>

        <IonGrid class="ion-margin-bottom">
            <IonRow class="ion-justify-content-center ion-align-items-center">
                <IonCol size="auto" class="ion-no-padding ion-no-margin">
                    <IonButton size="small" @click="previousWeek" fill="clear"><IonIcon :icon="chevronBack" /></IonButton>
                </IonCol>
                <IonCol size="auto" size-sm="7" size-md="auto" class="ion-text-center">
                    <h3>{{ weekLabel }}</h3>
                </IonCol>
                <IonCol size="auto" class="ion-no-padding ion-no-margin">
                    <IonButton size="small" @click="nextWeek" fill="clear"><IonIcon :icon="chevronForward" /></IonButton>
                </IonCol>
            </IonRow>
        </IonGrid>

          <IonGrid v-if="mode === 'grafic'" class="grafMode">
              <IonRow class="ion-justify-content-center">
                  <IonCol size="12" size-md="8" size-lg="6">
                      <IonCard>
                          <IonCardContent>
                              <barChart :labels="barData.labels" :datasets="barData.datasets" />
                          </IonCardContent>
                      </IonCard>
                  </IonCol>
              </IonRow>

              <IonRow class="ion-justify-content-center">
                  <IonCol size="12" size-md="8" size-lg="6">
                      <IonCard>
                          <IonCardContent>
                              <pieChart :data="pieData" />
                          </IonCardContent>
                      </IonCard>
                  </IonCol>
              </IonRow>
          </IonGrid>

          <IonGrid v-else class="llistaMode">
              <IonRow v-for="(sessio, index) in sessions" :key="index">
                  <IonCol>
                      <IonCard class="sessio-card">
                          <IonCardContent>
                              <IonRow class="sessio-header ion-justify-content-between">
                              <IonCol size="auto">
                                  <span>{{ formatSessioDate(sessio.data, sessio.hora) }}</span>
                              </IonCol>
                              <IonCol size="auto">
                                <strong>{{ formatSecondsToReadable(sessio.temps) }}</strong>
                              </IonCol>
                              </IonRow>
                              <IonRow class="ion-align-items-center">
                              <IonCol size="auto">{{ sessio.cangur }}</IonCol>
                              <IonCol size="auto">
                                  <IonIcon :icon="arrowForwardOutline" class="arrow-icon" />
                              </IonCol>
                              <IonCol size="auto">{{ sessio.nado }}</IonCol>
                              </IonRow>
                          </IonCardContent>
                      </IonCard>
                  </IonCol>
              </IonRow>
          </IonGrid>

          <IonLoading :is-open="loadingCharts" message="Carregant gràfics..." spinner="crescent"/>
            
            <IonAlert
              :is-open="showLogoutAlert"
              header="Tancar sessió"
              message="Estàs segur que vols tancar la sessió?"
              :buttons="[
                {
                  text: 'Cancelar',
                  role: 'cancel'
                },
                {
                  text: 'Sí, tancar sessió',
                  role: 'destructive',
                  handler: confirmLogout
                }
              ]"
              @didDismiss="showLogoutAlert = false"
            />
            
            <IonToast 
              :is-open="showErrorToast" 
              :message="errorMessage" 
              :duration="3000" 
              position="bottom" 
              color="danger"
              @didDismiss="showErrorToast = false" 
            />

  </AppLayout>
</template>

<script setup lang="ts">
import { IonButton, IonLoading, IonGrid, IonCol, IonRow, IonIcon, IonCard, IonCardContent, IonAlert, IonToast, onIonViewDidEnter } from '@ionic/vue'
import { chevronBack, folderOpen, barChartOutline, listOutline, arrowForwardOutline, logOutOutline, chevronForward, refreshOutline, peopleOutline, shieldOutline } from 'ionicons/icons'
import AppLayout from '@/components/AppLayout.vue'
import barChart from '@/views/charts/GrafBarres.vue'
import pieChart from '@/views/charts/GrafCercle.vue'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { auth, db } from '@/services/firebase'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { collection, getDocs } from 'firebase/firestore'

const router = useRouter()
const loadingCharts = ref(false)
const mode = ref<'grafic' | 'llista'>('grafic')
const showLogoutAlert = ref(false)
const showErrorToast = ref(false)
const errorMessage = ref('')

async function confirmLogout() {
  try {
    await signOut(auth)
    superAdmin.value = false
    localStorage.removeItem('admin')
    router.push('/initialPage')
  } catch (error) {
    console.error('Error al tancar la sessió:', error)
  }
}

function logout() {
  showLogoutAlert.value = true
}

interface Dataset { label: string; data: number[]; backgroundColor: string }

const barData = ref<{ labels: string[]; datasets: Dataset[] }>({ labels: [], datasets: [] })
const pieData = ref<Record<string, number>>({})
const sessions = ref<{ data: string; hora: string; temps: number; cangur: string; nado: string; ts?: number }[]>([])
const allSessions = ref<any[]>([])

// --- Funcions auxiliars ---
function convertirsegonsAMinuts(temps: number) {
  const mins = temps / 60
  return Number(mins.toFixed(2))
}

function obtenirDiaSetmanaCat(dataStr: string) {
  if (!dataStr) return undefined
  const date = dataStr && dataStr.length === 10 ? new Date(`${dataStr}T00:00`) : new Date(dataStr)
  const diaJS = date.getDay()
  const mapa = ['Dm', 'Di', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds']
  return mapa[diaJS]
}

import { formatSecondsToReadable } from '@/utils/time'

function formatSessioDate(dataStr: string, horaStr: string) {
  const date = new Date(`${dataStr}T${horaStr}`)
  const optionsData: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' }
  const optionsHora: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' }
  const formattedDate = date.toLocaleDateString('ca-ES', optionsData).replace('de ', '')
  const formattedTime = date.toLocaleTimeString('ca-ES', optionsHora)
  return `${formattedDate}   ${formattedTime}`
}

// --- Gestió de setmanes ---
function getMonday(d: Date) {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(date.setDate(diff))
}
function addDays(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

const currentWeekStart = ref(getMonday(new Date()))
const weekLabel = computed(() => {
  const start = currentWeekStart.value
  const end = addDays(start, 6)
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' }
  const startStr = start.toLocaleDateString('ca-ES', options).replace('de ', '')
  const endStr = end.toLocaleDateString('ca-ES', options).replace('de ', '')
  return `${startStr} - ${endStr}`
})

function previousWeek() {
  currentWeekStart.value = addDays(currentWeekStart.value, -7)
  filterDataByWeek()
}
function nextWeek() {
  currentWeekStart.value = addDays(currentWeekStart.value, 7)
  filterDataByWeek()
}

// --- Filtrar sessions i recalcular gràfics ---
function filterDataByWeek() {
  const start = currentWeekStart.value
  const end = addDays(start, 6)

  const startDay = new Date(start)
  startDay.setHours(0,0,0,0)
  const endDay = new Date(end)
  endDay.setHours(23,59,59,999)

  sessions.value = allSessions.value.filter(s => {
    const d = s.ts ? new Date(s.ts) : new Date(`${s.data}T${s.hora}`)
    if (isNaN(d.getTime())) return false
    return d >= startDay && d <= endDay
  })

  recalcCharts()
}

function recalcCharts() {
  const dies = ['Di', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dm']
  const cangurs = [...new Set(sessions.value.map(s => s.cangur))]
  const colors = ['#FFEEBC', '#ADD8E6', '#90EE90', '#3f37c9', '#3a0ca3']

  console.log('recalcCharts(): Processing', sessions.value.length, 'sessions')
  sessions.value.slice(0, 3).forEach(s => console.log('  Sample:', { data: s.data, hora: s.hora, cangur: s.cangur, temps: s.temps, ts: s.ts, dia: obtenirDiaSetmanaCat(s.data) }))

  const datasets: Dataset[] = cangurs.map((cangur, i) => ({
    label: cangur,
    data: dies.map(dia => {
      const tempsDia = sessions.value.filter(s =>
        s.cangur === cangur && obtenirDiaSetmanaCat(s.data) === dia
      ).reduce((sum, s) => sum + convertirsegonsAMinuts(s.temps), 0)
      return tempsDia
    }),
    backgroundColor: colors[i % colors.length]
  }))

  barData.value = { labels: dies, datasets }

  // PieChart: sumem temps per cangur
  const pie: Record<string, number> = {}
  sessions.value.forEach(s => {
    if (!pie[s.cangur]) pie[s.cangur] = 0
    pie[s.cangur] += convertirsegonsAMinuts(s.temps)
  })
  pieData.value = pie
}

const superAdmin = ref(false)

async function loadUserAdminStatus() {
  try {
    const adminStatus = localStorage.getItem('admin')
    superAdmin.value = adminStatus === 'true'
  } catch (e) {
    console.error('Error carregant estatus d\'admin:', e)
    superAdmin.value = false
  }
}

async function recarregarHistorial() {
  allSessions.value = []
  carregarHistorial()
}

// --- Carregar historial inicial ---
async function carregarHistorial() {
  loadingCharts.value = true
  try {
    onAuthStateChanged(auth, async (user) => {

      await loadUserAdminStatus()
      
      if (!user) return
      
      try {
        const snapshot = await getDocs(collection(db, 'users', user.uid, 'cronometres'))
        allSessions.value = snapshot.docs.map(d => { const docData = d.data()
        let ts: number | undefined
        if (docData.createdAt && typeof docData.createdAt.toDate === 'function') {
          ts = docData.createdAt.toDate().getTime()
        } else if (docData.createdAt && (typeof docData.createdAt === 'string' || typeof docData.createdAt === 'number')) {
          ts = typeof docData.createdAt === 'number' ? docData.createdAt : Date.parse(docData.createdAt)
        } else if (docData.dia && docData.hora) {
          ts = new Date(`${docData.dia}T${docData.hora}`).getTime()
        }

        let diaVal = docData.dia || ''
        let horaVal = docData.hora || ''
        if ((!diaVal || !horaVal) && ts) {
          const dd = new Date(ts)
          diaVal = diaVal || dd.toISOString().split('T')[0]
          horaVal = horaVal || dd.toTimeString().slice(0,5)
        }

    return {
      data: diaVal,
      hora: horaVal,
      temps: docData.temps || 0,
      cangur: docData.cangurNom || '',
      nado: docData.nadoNom || '',
      ts
    }

  })

  // Ordenem per data/hora de creació descendent
  allSessions.value.sort((a, b) => (b.ts || 0) - (a.ts || 0))

        filterDataByWeek()
        loadingCharts.value = false
      } catch (firebaseError: any) {
        console.error('Error carregant historial des de Firebase:', firebaseError)
        loadingCharts.value = false
        
        // Handle permission errors
        if (firebaseError.code === 'permission-denied' || firebaseError.message.includes('permission')) {
          errorMessage.value = 'Permís denegat. No pots accedir a l\'historial.'
        } else {
          errorMessage.value = 'Error carregant l\'historial. Intenta-ho més tard.'
        }
        
        showErrorToast.value = true
        
        // Auto-hide toast after 3 seconds
        setTimeout(() => {
          showErrorToast.value = false
        }, 3000)
      }
    })
  } catch (e) {
    console.error('Error carregant historial', e)
    loadingCharts.value = false
    errorMessage.value = 'Error desconegut al carregar l\'historial.'
    showErrorToast.value = true
    
    setTimeout(() => {
      showErrorToast.value = false
    }, 3000)
  }
}

onIonViewDidEnter(() => {
  loadUserAdminStatus()
  carregarHistorial()
})
</script>

<style scoped>

.confButton {
  --box-shadow: none;
  --border-color: #000;
  --color: #000;
  --background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.confButton ion-icon[slot='end'] {
  margin-left: auto;
}

.separador {
  border-top: 2px solid #26a69a; 
  margin: 0 8px;
}

.titolHist {
  font-weight: bold;
  font-size: 1.2rem;
  color: #333;
}

.canviar-data {
  --color: #26a69a;
}

.modeBotons {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
}

.canviMode {
  --background: transparent;
  --box-shadow: none;
  --border-color: #26a69a;
  --color: #000;
}

.grafMode {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.grafMode .ion-card,
.grafMode .ion-card-content {
  padding: 0;
}

.sessio-card {
  box-shadow: none;
  border-bottom: 1px solid #000;
}

.arrow-icon {
  color: #26a69a;
  font-size: 18px;
}

</style>
