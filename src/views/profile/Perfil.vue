<template>
    <AppLayout :show-back="true" back-route="/HomePage">
        <template #actions>
          <IonButton @click="logout">
            <IonIcon :icon="logOutOutline"></IonIcon>
          </IonButton>
        </template>

        <IonRefresher slot="fixed" @ionRefresh="handleRefresh">
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        <IonGrid class="ion-margin-bottom">
          <IonRow>
              <IonCol>
                  <IonButton color="dark" expand="block" fill="outline" class="confButton" @click="router.push('/config-familia')">
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
            <IonRow class="ion-justify-content-center">
                <IonCol size="auto">
                    <div class="pull-to-refresh-hint">Estira per refrescar</div>
                </IonCol>
            </IonRow>
        </IonGrid>

        <IonGrid v-if="mode === 'grafic'" class="ion-no-padding">
            <IonRow>
                <IonCol size="12" size-md="10" size-lg="8" offset-md="1" offset-lg="2">
                    <IonCard class="chart-card">
                        <IonCardHeader>
                            <IonCardTitle>Hores per cangur per dia</IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent class="chart-content">
                            <barChart :labels="barData.labels" :datasets="barData.datasets" />
                        </IonCardContent>
                    </IonCard>
                </IonCol>
            </IonRow>

            <IonRow>
                <IonCol size="12" size-md="10" size-lg="8" offset-md="1" offset-lg="2">
                    <IonCard class="chart-card">
                        <IonCardHeader>
                            <IonCardTitle>Total d'hores per cangur</IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent class="chart-content">
                            <pieChart :data="pieData" />
                        </IonCardContent>
                    </IonCard>
                </IonCol>
            </IonRow>

            <IonRow>
                <IonCol size="12" size-md="10" size-lg="8" offset-md="1" offset-lg="2">
                    <IonCard class="chart-card">
                        <IonCardHeader>
                            <IonCardTitle>Comparativa: Hores cangur vs Estada unitat</IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent class="chart-content">
                            <barChartGrouped :labels="comparisonData.labels" :datasets="comparisonData.datasets" />
                        </IonCardContent>
                    </IonCard>
                </IonCol>
            </IonRow>
        </IonGrid>

        <!-- vista llistat -->
        <IonList v-else>
            <IonItem v-for="(sessio, index) in sessions" :key="sessio.id || index">
                <IonLabel class="ion-text-wrap">
                    <div class="sessio-header">
                        <span class="sessio-date">{{ formatSessioDate(sessio.data, sessio.hora) }}</span>
                        <strong class="sessio-time">{{ formatSecondsToReadable(sessio.temps) }}</strong>
                    </div>
                    <div class="sessio-cangur">
                        <span>{{ sessio.cangur }}</span>
                        <IonIcon :icon="arrowForwardOutline" class="arrow-icon" />
                        <span>{{ sessio.nado }}</span>
                    </div>
                </IonLabel>
                <IonButton fill="clear" color="danger" size="small" @click.stop="promptDeleteSession(sessio.id)">
                  <IonIcon :icon="trashOutline" />
                </IonButton>
            </IonItem>
        </IonList>

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

          <IonAlert
            :is-open="showDeleteSessionAlert"
            header="Esborrar sessió"
            message="Segur que vols esborrar aquesta sessió?"
            :buttons="[
              {
                text: 'Cancelar',
                role: 'cancel',
                handler: cancelDeleteSession
              },
              {
                text: 'Esborrar',
                role: 'destructive',
                handler: deleteSessionConfirmed
              }
            ]"
            @didDismiss="cancelDeleteSession"
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
import { IonButton, IonLoading, IonGrid, IonCol, IonRow, IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonAlert, IonToast, onIonViewDidEnter, IonList, IonItem, IonLabel, IonRefresher, IonRefresherContent } from '@ionic/vue'
import { chevronBack, folderOpen, barChartOutline, listOutline, arrowForwardOutline, logOutOutline, chevronForward, peopleOutline, shieldOutline, trashOutline } from 'ionicons/icons'
import AppLayout from '@/components/AppLayout.vue'
import barChart from '@/views/charts/GrafBarres.vue'
import barChartGrouped from '@/views/charts/GrafBarresGrouped.vue'
import pieChart from '@/views/charts/GrafCercle.vue'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { auth, db } from '@/services/firebase'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { collection, getDocs } from 'firebase/firestore'
import adminService from '@/services/admin.service'

const router = useRouter()
const loadingCharts = ref(false)
const mode = ref<'grafic' | 'llista'>('grafic')
const showLogoutAlert = ref(false)
const showDeleteSessionAlert = ref(false)
const pendingDeleteSessionId = ref<string | null>(null)
const showErrorToast = ref(false)
const errorMessage = ref('')

async function confirmLogout() {
  try {
    await signOut(auth)
    superAdmin.value = false
    localStorage.removeItem('rol')
    router.push('/initialPage')
  } catch (error) {
    console.error('Error al tancar la sessió:', error)
  }
}

function logout() {
  showLogoutAlert.value = true
}

function promptDeleteSession(sessionId: string) {
  pendingDeleteSessionId.value = sessionId
  showDeleteSessionAlert.value = true
}

function cancelDeleteSession() {
  showDeleteSessionAlert.value = false
  pendingDeleteSessionId.value = null
}

async function deleteSessionConfirmed() {
  if (!pendingDeleteSessionId.value) return

  const user = auth.currentUser
  if (!user) return

  try {
    await adminService.deleteSession(user.uid, pendingDeleteSessionId.value)
    allSessions.value = allSessions.value.filter(session => session.id !== pendingDeleteSessionId.value)
    filterDataByWeek()
  } catch (err) {
    console.error('Error esborrant sessió:', err)
    showErrorToast.value = true
    errorMessage.value = 'No s’ha pogut esborrar la sessió. Torna-ho a intentar.'

    setTimeout(() => {
      showErrorToast.value = false
      errorMessage.value = ''
    }, 3000)
  } finally {
    pendingDeleteSessionId.value = null
    showDeleteSessionAlert.value = false
  }
}

interface Dataset { label: string; data: number[]; backgroundColor: string }

const barData = ref<{ labels: string[]; datasets: Dataset[] }>({ labels: [], datasets: [] })
const pieData = ref<Record<string, number>>({})
const comparisonData = ref<{ labels: string[]; datasets: Dataset[] }>({ labels: [], datasets: [] })
const sessions = ref<{ id:string; data: string; hora: string; temps: number; cangur: string; nado: string; ts?: number }[]>([])
const allSessions = ref<{ id:string; data: string; hora: string; temps: number; cangur: string; nado: string; ts?: number }[]>([])
const allEstades = ref<{ dia: string; horaEntrada: string; horaSortida: string }[]>([])

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
  sessions.value.slice(0, 3).forEach(s => console.log('  Dades:', { data: s.data, hora: s.hora, cangur: s.cangur, temps: s.temps, ts: s.ts, dia: obtenirDiaSetmanaCat(s.data) }))

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

  // Comparison Chart: cangurs + estada_unitat
  calculateComparisonChart()
}

function calculateComparisonChart() {
  const dies = ['Di', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dm']
  const cangurs = [...new Set(sessions.value.map(s => s.cangur))]
  const colors = ['#FFEEBC', '#ADD8E6', '#90EE90', '#3f37c9', '#3a0ca3', '#FF6B6B']

  // Filter estades for the current week
  const start = currentWeekStart.value
  const end = addDays(start, 6)
  const startDay = new Date(start); startDay.setHours(0,0,0,0)
  const endDay = new Date(end); endDay.setHours(23,59,59,999)

  const estadesSetmana = allEstades.value.filter(e => {
    const d = new Date(`${e.dia}T00:00`)
    return d >= startDay && d <= endDay
  })

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

  // Calculate estada minutes per day from actual records
  const estadaMinsPerDia: Record<string, number> = {}
  estadesSetmana.forEach(e => {
    const dia = obtenirDiaSetmanaCat(e.dia)
    if (!dia) return
    const [entradaH, entradaM] = e.horaEntrada.split(':').map(Number)
    const [sortidaH, sortidaM] = e.horaSortida.split(':').map(Number)
    let diffMins = (sortidaH * 60 + sortidaM) - (entradaH * 60 + entradaM)
    if (diffMins < 0) diffMins += 24 * 60
    estadaMinsPerDia[dia] = (estadaMinsPerDia[dia] || 0) + diffMins
  })

  if (Object.keys(estadaMinsPerDia).length > 0) {
    datasets.push({
      label: 'Estada unitat',
      data: dies.map(dia => estadaMinsPerDia[dia] || 0),
      backgroundColor: '#FFB6C1'
    })
  }

  comparisonData.value = { labels: dies, datasets }
}

const superAdmin = ref(false)

async function loadUserAdminStatus() {
  try {
    // intentem primer la via ràpida (localStorage)
    const permissionsStr = localStorage.getItem('permissions')
    const permissions = permissionsStr ? JSON.parse(permissionsStr) : null

    if (
      permissions?.sessions_all_read ||
      permissions?.sessions_all_edit ||
      permissions?.sessions_all_delete
    ) {
      superAdmin.value = true
      return
    }

    const hasAccess = await adminService.getCurrentUserAdminStatus()
    superAdmin.value = hasAccess
  } catch (e) {
    console.error('Error carregant estatus d\'admin:', e)
    superAdmin.value = false
  }
}

async function handleRefresh(event: any) {
  try {
    allSessions.value = []
    loadingCharts.value = true
    
    // Get current user and reload data
    const user = auth.currentUser
    if (user) {
      const snapshot = await getDocs(collection(db, 'users', user.uid, 'cronometres'))
      allSessions.value = snapshot.docs
        .filter(d => !d.data().eliminado)
        .map(d => {
          const docData = d.data()
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
            id: d.id,
            data: diaVal,
            hora: horaVal,
            temps: docData.temps || 0,
            cangur: docData.cangurNom || '',
            nado: docData.nadoNom || '',
            ts
          }
        })

      allSessions.value.sort((a, b) => (b.ts || 0) - (a.ts || 0))
      filterDataByWeek()
    }

    loadingCharts.value = false

    // Add 3-second delay before completing the refresh
    await new Promise(resolve => setTimeout(resolve, 3000))
    event.detail.complete()
  } catch (error) {
    console.error('Error en handleRefresh:', error)
    event.detail.complete()
  }
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
        allSessions.value = snapshot.docs
          .filter(d => !d.data().eliminado)
          .map(d => { const docData = d.data()
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
      id: d.id,
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

        // Load estades (actual daily unit stays) from Firebase
        try {
          const estadesSnapshot = await getDocs(collection(db, 'users', user.uid, 'estades'))
          allEstades.value = estadesSnapshot.docs.map(d => ({
            dia: d.data().dia || '',
            horaEntrada: d.data().horaEntrada || '',
            horaSortida: d.data().horaSortida || ''
          }))
          console.log('Estades loaded from Firebase:', allEstades.value.length, 'records')
        } catch (e) {
          console.warn('Error loading estades:', e)
          allEstades.value = []
        }

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

.arrow-icon {
  color: #26a69a;
  font-size: 18px;
}

.sessio-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.sessio-date {
  font-size: 0.9rem;
  color: #666;
}

.sessio-time {
  font-size: 0.95rem;
  color: #26a69a;
}

.sessio-cangur {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  color: #333;
}

.pull-to-refresh-hint {
  text-align: center;
  font-size: 0.8rem;
  color: #999;
  font-style: italic;
  padding: 4px 0 8px 0;
}

.chart-card {
  margin: 8px 0;
}

.chart-content {
  padding-left: 4px;
  padding-right: 4px;
}

</style>
