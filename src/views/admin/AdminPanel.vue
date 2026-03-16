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

    <!-- Tabs per a navegació -->
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

    <!-- TAB: Usuaris -->
    <div v-if="currentTab === 'usuaris' && !loading" class="ion-margin-top">
      <IonCard class="mini-card users-card">
        <IonCardContent>
          <IonText color="primary">
            <h2>Gestió d'Usuaris</h2>
          </IonText>

          <IonGrid class="ion-margin-top">
            <IonRow v-if="allUsers.length">
              <IonCol size="12">
                <IonGrid>
                  <IonRow v-for="user in allUsers" :key="user.uid" class="user-row">
                    <IonCol size="12">
                      <IonCard>
                        <IonCardContent>
                          <IonGrid>
                            <IonRow class="ion-align-items-center">
                              <IonCol size="12" size-md="8">
                                <IonRow>
                                  <IonCol size="auto">
                                    <IonAvatar>
                                      <img src="/src/assets/kangur_new_petit.png" />
                                    </IonAvatar>
                                  </IonCol>
                                  <IonCol>
                                    <div><strong>{{ user.name }}</strong></div>
                                    <div>{{ user.email }}</div>
                                    <div>Creat: {{ formatDate(user.createdAt) }}</div>
                                  </IonCol>
                                </IonRow>
                              </IonCol>

                              <IonCol size="12" class="separador-mobile">
                                <div class="separador"></div>
                              </IonCol>

                              <IonCol size="12" size-md="3" class="ion-text-md-end ion-text-start">
                                <div>Nadons: <IonText><strong>{{ user.nadons.length }}</strong></IonText>
                                </div>
                                <div>Sessions: <IonText><strong>{{ user.cronometres.length }}</strong></IonText>
                                </div>
                                <div v-if="user.cangurs.length > 0">Cangurs: <IonText><strong>{{
                                      getCangursList(user.cangurs)
                                      }}</strong></IonText>
                                </div>
                              </IonCol>

                              <IonCol size="12" class="separador-mobile">
                                <div class="separador"></div>
                              </IonCol>

                              <IonCol size="12" size-md="4" class="ion-text-center ion-text-md-end">
                                <IonItem lines="none" class="select-rol-item">
                                  <IonLabel>Usuari Administrador</IonLabel>
                                  <IonToggle 
                                    :checked="user.rol === 'admin'" 
                                    @ionChange="(event) => onToggleChange(user.uid, event)">
                                  </IonToggle>
                                </IonItem>

                                <div v-if="isSavingAdminId === user.uid" class="ion-text-center">
                                  <IonSpinner name="dots" size="small" color="primary"></IonSpinner>
                                </div>
                              </IonCol>
                            </IonRow>
                          </IonGrid>
                        </IonCardContent>
                      </IonCard>
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </IonCol>
            </IonRow>

            <IonRow v-else>
              <IonCol>
                <IonText color="medium">
                  <p class="ion-text-center">No hi ha usuaris disponibles</p>
                </IonText>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonCardContent>
      </IonCard>
    </div>

    <!-- TAB: Totes les sessions -->
    <div v-if="currentTab === 'cronometres' && !loading" class="ion-margin-top">
      <IonText color="dark">
        <h2><strong>Totes les sessions</strong></h2>
      </IonText>

      <IonGrid class="ion-margin-top">
        <IonRow v-for="userGroup in cronometresByUser" :key="userGroup.userEmail" class="ion-margin-vertical">
          <IonCol size="12">
            <IonCard>
              <IonCardContent>
                <IonGrid>
                  <IonRow class="ion-align-items-center">
                    <IonCol size="12" size-md="9"><strong>{{ userGroup.userEmail }}</strong></IonCol>
                    <IonCol size="12" size-md="3" class="ion-text-end">{{ userGroup.cronometres.length }} sessions
                    </IonCol>
                  </IonRow>

                  <IonRow class="ion-margin-top">
                    <IonCol size="12" size-md="8">
                      <IonText color="medium"><strong>Cangur → Nadó:</strong></IonText>
                    </IonCol>
                  </IonRow>

                  <IonRow v-for="crono in userGroup.cronometres" :key="crono.id" class="ion-margin-top sessions">
                    <IonCol size="12" size-md="8">{{ crono.cangurNom }} → {{ crono.nadoNom }}</IonCol>
                    <IonCol size="12" size-md="4" class="ion-text-md-end ion-text-start">{{ formatDate(crono.createdAt)
                      }} •
                      <strong>{{ formatSecondsToMMSS(crono.temps) }}</strong>
                    </IonCol>
                  </IonRow>

                </IonGrid>
              </IonCardContent>
            </IonCard>
          </IonCol>
        </IonRow>
      </IonGrid>

      <IonText v-if="!cronometresByUser.length" color="medium">
        <p class="ion-text-center">No hi ha sessions disponibles</p>
      </IonText>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { IonButton, IonIcon, IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonLabel, IonSegment, IonSegmentButton, IonLoading, IonText, IonAvatar, onIonViewDidEnter, IonSpinner, IonItem, IonSelect, IonSelectOption, IonToggle } from '@ionic/vue'
import { logOutOutline, chevronDownOutline } from 'ionicons/icons'
import AppLayout from '@/components/AppLayout.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '@/services/firebase'
import { signOut } from 'firebase/auth'
import adminService from '@/services/admin.service'
import { formatSecondsToMMSS } from '@/utils/time'

const router = useRouter()
const loading = ref(true)
const currentTab = ref('usuaris')
const isSavingAdminId = ref('')
const isActive = ref(false)

interface User {
  uid: string
  name: string
  email: string
  rol: string
  createdAt: any
  cronometres: any[]
  nadons: any[]
  cangurs: any[]
}

interface Cronometres {
  id: string
  userName: string
  userEmail: string
  cangurNom: string
  nadoNom: string
  temps: number
  createdAt: any
}

interface CronometresGroup {
  userName: string
  userEmail: string
  cronometres: Cronometres[]
}

const allUsers = ref<User[]>([])
const allCronometres = ref<Cronometres[]>([])
const cronometresByUser = ref<CronometresGroup[]>([])

function onToggleChange(userId: string, event: CustomEvent) {
  const checked = event.detail.checked
  const newRole = checked ? 'admin' : 'usuari'
  toggleAdmin(userId, newRole)
}

function formatDate(date: any): string {
  if (!date) return '-'
  let d: Date
  if (date && typeof date.toDate === 'function') {
    d = date.toDate()
  } else if (typeof date === 'string') {
    d = new Date(date)
  } else if (typeof date === 'number') {
    d = new Date(date)
  } else {
    return '-'
  }
  return d.toLocaleDateString('ca-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' })
}

function getCangursList(cangurs: any[]): string {
  if (!cangurs || cangurs.length === 0) return '-'
  return cangurs.map((c: any) => c.name || c.nom || 'Desconegut').join(', ')
}

async function loadAdminData() {
  loading.value = true
  try {
    const data = await adminService.getAllUsersData()
    allUsers.value = data

    // Es construeix la llista de totes les sessions cronometrades
    const allCronosData: Cronometres[] = []
    data.forEach(user => {
      user.cronometres.forEach((crono: any) => {
        allCronosData.push({
          id: `${user.uid}-${crono.id}`,
          userName: user.name,
          userEmail: user.email,
          cangurNom: crono.cangurNom || 'Desconegut',
          nadoNom: crono.nadoNom || 'Desconegut',
          temps: crono.temps || 0,
          createdAt: crono.createdAt
        })
      })
    })

    // S'ordena per data descendent
    allCronosData.sort((a, b) => {
      let tsA = 0
      let tsB = 0
      if (a.createdAt && typeof a.createdAt.toDate === 'function') {
        tsA = a.createdAt.toDate().getTime()
      } else if (typeof a.createdAt === 'number') {
        tsA = a.createdAt
      }
      if (b.createdAt && typeof b.createdAt.toDate === 'function') {
        tsB = b.createdAt.toDate().getTime()
      } else if (typeof b.createdAt === 'number') {
        tsB = b.createdAt
      }
      return tsB - tsA
    })

    allCronometres.value = allCronosData

    // S'agrupa per usuaris
    const groupedByUser = new Map<string, Cronometres[]>()
    allCronosData.forEach(crono => {
      if (!groupedByUser.has(crono.userEmail)) {
        groupedByUser.set(crono.userEmail, [])
      }
      groupedByUser.get(crono.userEmail)!.push(crono)
    })

    // Es converteix a array i s'ordena per email d'usuari
    cronometresByUser.value = Array.from(groupedByUser.entries())
      .map(([userEmail, cronos]) => ({
        userName: cronos[0].userName,
        userEmail,
        cronometres: cronos
      }))
      .sort((a, b) => a.userEmail.localeCompare(b.userEmail))
  } catch (error) {
    console.error('Error carregant dades d\'admin:', error)
  } finally {
    loading.value = false
  }
}

async function toggleAdmin(userId: string, newRole: string) {
  if (!newRole) return

  isSavingAdminId.value = userId
  
  try {
    await adminService.updateUserRol(userId, newRole)

    const userIndex = allUsers.value.findIndex(u => u.uid === userId)
    if (userIndex !== -1) {
      allUsers.value[userIndex].rol = newRole
    }
  } catch (error) {
    console.error('Error al canviar el rol:', error)
  } finally {
    isSavingAdminId.value = ''
  }
}

async function logout() {
  try {
    await signOut(auth)
    router.push('/login')
  } catch (error) {
    console.error('Error al tancar la sessió:', error)
  }
}

onIonViewDidEnter(async () => {
  const isAdmin = await adminService.getCurrentUserAdminStatus()
  if (!isAdmin) {
    router.back()
    return
  }
  loadAdminData()
})
</script>

<style scoped>
.separador {
  border-top: 2px solid #26a69a;
  margin: 0 8px;
}

.sessions {
  box-shadow: none;
  border-bottom: 1px solid #26a69a;
}

.separador-mobile {
  display: block;
}

.select-rol-item {
  --background: transparent;
  --padding-start: 0;
  --inner-padding-end: 0;
  --min-height: 30px;
  margin-left: auto;
  display: flex;
  align-items: center;
}

ion-select::part(icon) {
  margin-inline-start: 4px;
  font-size: 16px;
  color: #26a69a;
}

.users-card {
  max-width: 98%;
  margin: 50px auto;
}

@media (min-width: 768px) {
  .separador-mobile {
    display: none;
  }

  .select-rol-item {
    margin: 5px 0;
    justify-content: flex-start;
  }
}
</style>
