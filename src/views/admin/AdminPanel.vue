<template>
  <AppLayout :show-back="true">
    <IonGrid>
      <IonRow class="ion-justify-content-center">
        <IonCol size="12">
          <IonText color="dark">
            <h2 class="titol">Panell d'administració</h2>
          </IonText>
          <IonText color="medium" class="ion-text-center">
            <h2 class="user-email negreta">Gestió de tots els usuaris i dades del sistema</h2>
          </IonText>
        </IonCol>
      </IonRow>
    </IonGrid>

    <IonLoading :is-open="loading" message="Carregant dades..." spinner="crescent" />

    <div v-if="!loading" class="ion-margin-top">
      <IonSegment v-model="currentTab" @ionChange="currentTab = ($event.detail.value as string)">
        <IonSegmentButton value="usuaris">
          <IonLabel>Usuaris</IonLabel>
        </IonSegmentButton>
        <IonSegmentButton value="cronometres">
          <IonLabel>Sessions</IonLabel>
        </IonSegmentButton>
      </IonSegment>
    </div>

    <div v-if="currentTab === 'usuaris' && !loading" class="ion-margin-top">
      <IonRow class="ion-justify-content-center ion-margin-top">
        <IonCol size="12" size-md="6">
          <IonItem lines="none" class="search-item">
            <IonInput v-model="searchQuery" :debounce="300" placeholder="Cerca per nom de nadó o correu..." />
          </IonItem>
        </IonCol>
      </IonRow>

      <IonGrid class="ion-margin-top">
        <IonRow v-if="filteredUsers.length" class="ion-justify-content-center">
          <IonCol size="12" size-xl="10">
            <IonCard v-for="user in filteredUsers" :key="user.uid" class="user-main-card">
              <IonCardContent>
                <IonRow class="ion-align-items-center">
                  <IonCol size="12" size-md="5">
                    <div class="user-info-flex">
                      <IonAvatar class="user-avatar">
                        <img src="/src/assets/kangur_new_petit.png" />
                      </IonAvatar>
                      <div class="user-details">
                        <div class="user-name">{{ user.name }}</div>
                        <div class="user-email-sub">{{ user.email }}</div>
                        <div class="user-date">Creat: {{ formatDate(user.createdAt) }}</div>
                      </div>
                    </div>
                  </IonCol>
                  <IonCol size="12" size-md="3" class="ion-text-md-center stats-col">
                    <div class="stat-item">Nadons: <strong>{{ user.nadons.length }}</strong></div>
                    <div class="stat-item">Sessions: <strong>{{ user.cronometres.length }}</strong></div>
                    <div v-if="user.cangurs.length" class="stat-item cangurs-list">
                      Cangurs: <span>{{ getCangursList(user.cangurs) }}</span>
                    </div>
                  </IonCol>
                  <IonCol size="12" size-md="4" class="ion-text-md-end ion-text-center admin-actions">
                    <IonItem lines="none" class="admin-toggle-item">
                      <IonLabel>Rol del usuari</IonLabel>
                      <IonSelect :disabled="currentRole !== 'admin'" placeholder="Selecciona rol" :value="user.rol"
                        @ionChange="(event) => onRoleChange(user.uid, event.detail.value)">
                        <IonSelectOption value="usuari">Usuari</IonSelectOption>
                        <IonSelectOption value="admin">Admin</IonSelectOption>
                        <IonSelectOption value="gestor">Gestor</IonSelectOption>
                      </IonSelect>
                    </IonItem>
                    <IonSpinner v-if="isSavingAdminId === user.uid" name="dots" color="primary"></IonSpinner>
                  </IonCol>
                </IonRow>
              </IonCardContent>
            </IonCard>
          </IonCol>
        </IonRow>
        <IonRow v-else>
          <IonCol class="ion-text-center ion-padding">
            <IonText color="medium">No s'han trobat usuaris</IonText>
          </IonCol>
        </IonRow>
      </IonGrid>
    </div>

    <div v-if="currentTab === 'cronometres' && !loading" class="ion-margin-top">
      <IonRow class="ion-justify-content-center">
        <IonCol size="12" size-lg="11">
          <IonCard class="export-panel-compact">
            <IonCardContent>
              <div class="export-flex-row">
                <div class="flex-item-users">
                  <IonItem lines="none" class="input-data-compact selector-item" button @click="isModalOpen = true">
                    <div class="selector-content">
                      <IonLabel color="medium">Usuaris</IonLabel>
                      <div class="selected-users-text">
                        {{ isAllSelected ? 'Tots' : `${selectedExportUsers.length} sel.` }}
                      </div>
                    </div>
                  </IonItem>
                </div>

                <div class="flex-item-date">
                  <IonItem lines="none" class="input-data-compact date-item">
                    <div class="containerDate">
                      <IonLabel class="labelDate">Des de:</IonLabel>
                      <input ref="exportDateFromRef" type="date" v-model="exportDateFrom" class="custom-date-input" />
                    </div>
                  </IonItem>
                </div>
                <div class="flex-item-date">
                  <IonItem lines="none" class="input-data-compact date-item">
                    <div class="containerDate">
                      <IonLabel class="labelDate">Fins a:</IonLabel>
                      <input ref="exportDateToRef" type="date" v-model="exportDateTo" class="custom-date-input" />
                    </div>
                    
                  </IonItem>
                </div>

                <div class="flex-item-actions">
                  <IonButton color="success" class="btn-export-inline" @click="exportSessionsCSV"
                    title="Descarregar CSV">
                    <IonIcon slot="icon-only" :icon="downloadOutline"></IonIcon>
                  </IonButton>
                </div>
              </div>
            </IonCardContent>
          </IonCard>
        </IonCol>
      </IonRow>

      <div class="ion-padding">
        <div v-for="userGroup in cronometresByUser" :key="userGroup.userEmail" class="session-group">
          <div class="group-header">
            <span class="user-title">{{ userGroup.userName || userGroup.userEmail }}</span>
            <IonBadge color="light">{{ userGroup.cronometres.length }} sessions</IonBadge>
          </div>
          <IonCard class="session-inner-card">
            <IonCardContent>
              <div v-for="crono in userGroup.cronometres" :key="crono.id" class="session-row">
                <div class="session-info">
                  <div class="session-names">
                    {{ crono.cangurNom }}
                    <IonIcon :icon="chevronForwardOutline" />
                    {{ crono.nadoNom }}
                  </div>
                  <div class="session-motiu" v-if="crono.motiuFinal">{{ crono.motiuFinal }}</div>
                </div>
                <div class="session-time-data">
                  <div class="s-date">{{ formatDate(crono.createdAt) }}</div>
                  <div class="s-duration">{{ formatSecondsToMMSS(crono.temps) }}</div>
                </div>
              </div>
            </IonCardContent>
          </IonCard>
        </div>
      </div>
    </div>

    <IonToast :is-open="showToast" :message="toastMessage" :color="toastColor" duration="3000"
      @didDismiss="showToast = false" />

    <IonModal :is-open="isModalOpen" @didDismiss="isModalOpen = false">
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Selecciona Usuaris</IonTitle>
          <IonButtons slot="end">
            <IonButton @click="isModalOpen = false">Fet</IonButton>
          </IonButtons>
        </IonToolbar>
        <IonToolbar>
          <IonSearchbar v-model="userSearchModal" placeholder="Cerca per nom o email..." :debounce="200" />
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonItem lines="full">
            <IonLabel><strong>Seleccionar-ho tot</strong></IonLabel>
            <IonCheckbox slot="start" :checked="isAllSelected" @ionChange="toggleSelectAll"></IonCheckbox>
          </IonItem>
          <IonItem v-for="user in filteredUsersModal" :key="user.uid">
            <IonAvatar slot="start" class="mini-avatar">
              <img src="/src/assets/kangur_new_petit.png" />
            </IonAvatar>
            <IonLabel>
              <h2>{{ user.name }}</h2>
              <p>{{ user.email }}</p>
            </IonLabel>
            <IonCheckbox slot="end" :checked="selectedExportUsers.includes(user.email)"
              @ionChange="toggleUserSelection(user.email)">
            </IonCheckbox>
          </IonItem>
        </IonList>
      </IonContent>
    </IonModal>
  </AppLayout>
</template>

<script setup lang="ts">
import {
  IonButton, IonIcon, IonGrid, IonRow, IonCol, IonCard, IonCardContent,
  IonLabel, IonSegment, IonSegmentButton, IonLoading, IonText, IonAvatar,
  onIonViewDidEnter, IonSpinner, IonItem, IonInput, IonSelect, IonSelectOption,
  IonBadge, IonModal, IonHeader, IonToolbar, IonTitle,
  IonButtons, IonContent, IonList, IonCheckbox, IonSearchbar, IonToast
} from '@ionic/vue'
import { downloadOutline, chevronForwardOutline, mailOutline, calendarOutline } from 'ionicons/icons'
import AppLayout from '@/components/AppLayout.vue'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '@/services/firebase'
import adminService from '@/services/admin.service'
import { formatSecondsToMMSS } from '@/utils/time'

const router = useRouter()
const loading = ref(true)
const currentTab = ref('usuaris')
const isSavingAdminId = ref('')
const currentRole = ref('')
const searchQuery = ref('')

const isModalOpen = ref(false)
const userSearchModal = ref('')
const exportDateFrom = ref('')
const exportDateTo = ref('')
const selectedExportUsers = ref<string[]>([])

const showToast = ref(false)
const toastMessage = ref('')
const toastColor = ref('success')

const exportDateFromRef = ref<HTMLInputElement | null>(null)
const exportDateToRef = ref<HTMLInputElement | null>(null)

const focusDateInput = (which: 'from' | 'to') => {
  const ref = which === 'from' ? exportDateFromRef : exportDateToRef
  ref.value?.focus()
}

interface User {
  uid: string;
  name: string;
  email: string;
  rol: string;
  createdAt: any;
  cronometres: any[];
  nadons: any[];
  cangurs: any[];
}

const allUsers = ref<User[]>([])
const allCronometres = ref<any[]>([])
const cronometresByUser = ref<any[]>([])

const filteredUsers = computed(() => {
  const query = (searchQuery.value || '').toLowerCase().trim()
  if (!query) return allUsers.value
  return allUsers.value.filter(user =>
    (user.name || '').toLowerCase().includes(query) ||
    (user.email || '').toLowerCase().includes(query) ||
    (user.nadons || []).some(n => (n.name || n.nom || '').toLowerCase().includes(query))
  )
});

const filteredUsersModal = computed(() => {
  const q = (userSearchModal.value || '').toLowerCase().trim()
  if (!q) return allUsers.value
  return allUsers.value.filter(u =>
    (u.name && u.name.toLowerCase().includes(q)) ||
    (u.email && u.email.toLowerCase().includes(q))
  )
});

const isAllSelected = computed(() => {
  return allUsers.value.length > 0 && selectedExportUsers.value.length === allUsers.value.length
});

const toggleSelectAll = (event: any) => {
  if (event.detail.checked) {
    selectedExportUsers.value = allUsers.value.map(u => u.email)
  } else {
    if (selectedExportUsers.value.length === allUsers.value.length) {
      selectedExportUsers.value = []
    }
  }
}

const toggleUserSelection = (email: string) => {
  const index = selectedExportUsers.value.indexOf(email)
  if (index > -1) {
    selectedExportUsers.value.splice(index, 1)
  } else {
    selectedExportUsers.value.push(email)
  }
}

function getCSVData() {
  let data = [...allCronometres.value]
  if (selectedExportUsers.value.length > 0) {
    data = data.filter(c => selectedExportUsers.value.includes(c.userEmail))
  } else {
    return { error: 'Selecciona almenys un usuari.' }
  }

  if (exportDateFrom.value || exportDateTo.value) {
    data = data.filter(c => {
      const cDate = c.createdAt?.toDate ? c.createdAt.toDate() : new Date(c.createdAt)
      if (exportDateFrom.value && cDate < new Date(exportDateFrom.value)) return false
      if (exportDateTo.value) {
        const toDate = new Date(exportDateTo.value); toDate.setHours(23, 59, 59)
        if (cDate > toDate) return false
      }
      return true
    })
  }

  if (!data.length) return { error: 'No hi ha dades per exportar.' }

  const headers = ['Data', 'Email Usuari', 'Nom Usuari', 'Cangur', 'Nadó', 'Temps', 'Motiu']
  const rows = data.map(c => [
    `"${formatDate(c.createdAt)}"`,
    `"${c.userEmail}"`,
    `"${c.userName}"`,
    `"${c.cangurNom}"`,
    `"${c.nadoNom}"`,
    `"${formatSecondsToMMSS(c.temps)}"`,
    `"${(c.motiuFinal || 'N/A').replace(/\n/g, ' ')}"`
  ])

  return {
    content: "sep=;\n\uFEFF" + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n'),
    filename: `export_kangur_${new Date().getTime()}.csv`
  }
}

async function exportSessionsCSV() {
  const result = getCSVData()
  if (result.error) {
    toastMessage.value = result.error; toastColor.value = 'danger'; showToast.value = true
    return
  }
  const blob = new Blob([result.content!], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url); link.setAttribute('download', result.filename!); link.click()
}

function onRoleChange(userId: string, newRole: string) {
  if (currentRole.value !== 'admin') {
    toastMessage.value = 'Només els administradors poden canviar rols.'
    toastColor.value = 'warning'
    showToast.value = true
    return
  }

  if (!newRole || !['usuari', 'admin', 'gestor'].includes(newRole)) return
  toggleAdmin(userId, newRole)
}

function formatDate(date: any) {
  if (!date) return '-'
  const d = date.toDate ? date.toDate() : new Date(date)
  return d.toLocaleDateString('ca-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function getCangursList(cangurs: any[]) {
  return cangurs.map(c => c.name || c.nom).join(', ')
}

async function loadAdminData() {
  loading.value = true
  try {
    const data = await adminService.getAllUsersData()
    allUsers.value = data
    selectedExportUsers.value = data.map(u => u.email)

    const list: any[] = []
    data.forEach(u => u.cronometres.forEach((c: any) => list.push({
      ...c,
      id: `${u.uid}-${c.id}`,
      userName: u.name,
      userEmail: u.email,
      cangurNom: c.cangurNom || 'Desconegut',
      nadoNom: c.nadoNom || 'Desconegut'
    })))
    allCronometres.value = list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))

    const groups = new Map()
    allCronometres.value.forEach(c => {
      if (!groups.has(c.userEmail)) groups.set(c.userEmail, [])
      groups.get(c.userEmail).push(c)
    })
    cronometresByUser.value = Array.from(groups.entries()).map(([email, cronos]) => ({
      userEmail: email, userName: cronos[0].userName, cronometres: cronos
    }))
  } finally {
    loading.value = false
  }
}

async function toggleAdmin(userId: string, newRole: string) {
  isSavingAdminId.value = userId
  try {
    await adminService.updateUserRol(userId, newRole)
    const u = allUsers.value.find(u => u.uid === userId)
    if (u) u.rol = newRole
  } finally {
    isSavingAdminId.value = ''
  }
}

onIonViewDidEnter(async () => {
  const user = auth.currentUser
  if (!user) return router.push('/login')
  const hasAccess = await adminService.getCurrentUserAdminStatus()
  if (!hasAccess) return router.back()

  try {
    const me = await adminService.getUserData(user.uid)
    currentRole.value = me?.rol || 'usuari';
  } catch (err) {
    console.warn('No s’ha pogut obtenir el rol de l’usuari actual', err)
    currentRole.value = 'admin'
  }

  await loadAdminData()
})
</script>

<style scoped>
.user-main-card {
  margin-bottom: 15px;
  border-radius: 12px;
  border-left: 5px solid #26a69a;
}

.user-info-flex {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-avatar {
  width: 50px;
  height: 50px;
}

.mini-avatar {
  width: 35px;
  height: 35px;
}

.user-name {
  font-weight: bold;
  font-size: 1.1rem;
  color: #333;
}

.user-email-sub {
  font-size: 0.9rem;
  color: #666;
}

.user-date {
  font-size: 0.75rem;
  color: #999;
}

.stat-item {
  font-size: 0.9rem;
  margin: 4px 0;
}

.cangurs-list span {
  font-style: italic;
  color: #26a69a;
}

.admin-toggle-item {
  --background: transparent;
  font-weight: 600;
}

.export-panel-compact {
  border-top: 4px solid #26a69a;
  border-radius: 12px;
  margin-bottom: 20px;
  background: #fdfdfd;
}

.export-flex-row {
  display: flex;
  flex: 1;
  flex-wrap: nowrap;
  align-items: stretch;
  gap: 10px;
}

.flex-item-users {
  flex: 2;
  min-width: 140px;
}

.selector-item {
  --background: #f0f2f2;
  --border-radius: 8px;
  --min-height: 56px;
  --padding-start: 12px;
  --padding-top: 0;
  --padding-bottom: 0;
  margin: 0;
  height: 56px;
  display: flex;
  align-items: center;
}

.containerDate{
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 4px;
}

.selector-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.selector-content IonLabel {
  margin: 0;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.selected-users-text {
  padding-top: 2px;
  font-weight: 700;
  color: #26a69a;
  font-size: 1rem;
}

.selector-arrow {
  font-size: 1.2rem;
  color: #999;
  margin-left: 4px;
}

.flex-item-date {
  flex: 1.5;
  min-width: 110px;
  height: 56px;
}

.flex-item-actions {
  display: flex;
  flex: 0.8;
  min-width: 60px;
}

.input-data-compact {
  --background: #f0f2f2;
  --border-radius: 8px;
  --min-height: 56px;
  --padding-top: 0;
  --padding-bottom: 0;
  margin: 0;
  height: 56px;
  display: flex;
  align-items: center;
}

.date-item {
  --background: transparent;
  --border-radius: 0;
  box-shadow: none;
}

.custom-date-input {
  font-size: 0.75rem;
  font-weight: 600;
  height: 100%;
  flex: 1;
  min-width: 120px;
  padding-right: 2.5rem;
  background: transparent;
  border: none;
  outline: none;
  position: relative;
  z-index: 1;
}

.custom-date-input::-webkit-calendar-picker-indicator {
  opacity: 0.8;
}

.date-icon {
  color: rgba(0, 0, 0, 0.45);
  font-size: 1.1rem;
  cursor: pointer;
  margin-left: 4px;
  position: relative;
  z-index: 2;
}


.btn-export-inline {
  --border-radius: 8px;
  height: 100%;
  margin: 0;
  width: 100%;
}

.session-group {
  margin-bottom: 20px;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px 8px;
}

.user-title {
  font-weight: bold;
  color: #26a69a;
  font-size: 1rem;
}

.session-inner-card {
  margin: 0;
  border-radius: 8px;
}

.session-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}

.session-row:last-child {
  border-bottom: none;
}

.session-names {
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
}

.session-motiu {
  font-size: 0.8rem;
  color: #888;
  margin-top: 3px;
}

.session-time-data {
  text-align: right;
}

.s-date {
  font-size: 0.75rem;
  color: #999;
}

.s-duration {
  font-weight: bold;
  color: #333;
}

.search-item {
  --border-radius: 20px;
  --background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  margin-bottom: 10px;
}

.titol {
  text-align: center;
  margin-bottom: 24px;
  font-size: 12px;
  font-weight: 600;
}

.labelDate {
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

@media (max-width: 768px) {
  .export-flex-row {
    flex-wrap: wrap;
  }
  .flex-item-users {
    flex: 1 1 100%;
  }
  .flex-item-date {
    flex: 1 1 42%;
  }
  .flex-item-actions {
    flex: 1 1 10%;
  }
}
</style>