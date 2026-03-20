<template>
  <AppLayout :show-back="true">
    <div class="config-content-wrapper">
      <IonGrid>
        <IonRow class="ion-justify-content-center">
          <IonCol size="12">
            <IonText color="dark">
              <h2 class="titol">Configuració de la familia</h2>
            </IonText>
            <IonText color="medium" v-if="userEmail">
              <h2 class="user-email negreta">{{ userEmail }}</h2>
            </IonText>
          </IonCol>
        </IonRow>
      </IonGrid>
      
      <!-- Seccio Nadó -->
      <IonCard class="mini-card">        
        <IonGrid>
          <IonRow class="ion-text-start">
            <IonCol size="12" size-md="6" size-lg="5">
              <IonText color="primary">
                <h2>Nadó</h2>
              </IonText>
            </IonCol>
          </IonRow>          
          <IonRow>
            <IonCol size="12" class="ion-margin-bottom">
              <IonText color="medium">
                Edita la informació del nadó, com el seu nom i l'edat en setmanes i dies.
              </IonText>
            </IonCol>
          </IonRow>
          <IonRow class="ion-justify-content-center">
            <IonCol size="12">
              <IonLabel position="stacked" class="input-label">Nom del nadó</IonLabel>
              <IonInput v-model="nadoName" placeholder="Nom" fill="outline" class="input-box ion-margin-top ion-margin-bottom" />
            </IonCol>
          </IonRow>
          <IonRow class="ion-justify-content-center">
            <IonCol size="6">
              <IonLabel position="stacked" class="input-label">Setmanes</IonLabel>
              <IonInput v-model="setmanesName" placeholder="Setmanes" fill="outline" class="input-box ion-margin-top ion-margin-bottom" />
            </IonCol>
            <IonCol size="6">
              <IonLabel position="stacked" class="input-label">Dies</IonLabel>
              <IonInput v-model="diesName" placeholder="Dies" fill="outline" class="input-box ion-margin-top ion-margin-bottom" />
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonCard>

      <!-- Seccio Estada Unitat
      <IonCard class="mini-card">        
        <IonGrid>
          <IonRow class="ion-text-start">
            <IonCol size="12" size-md="6" size-lg="5">
              <IonText color="primary">
                <h2>Estada a la unitat</h2>
              </IonText>
            </IonCol>
          </IonRow>          
          <IonRow>
            <IonCol size="12" class="ion-margin-bottom">
              <IonText color="medium">
                Registra l'entrada i sortida del nadó de la unitat.
              </IonText>
            </IonCol>
          </IonRow>
          <IonRow class="ion-justify-content-center">
            <IonCol size="12">
              <IonLabel position="stacked" class="input-label">Entrada</IonLabel>
              <IonInput v-model="estadaEntrada" type="time" fill="outline" class="input-box ion-margin-top ion-margin-bottom" />
            </IonCol>
          </IonRow>
          <IonRow class="ion-justify-content-center">
            <IonCol size="12">
              <IonLabel position="stacked" class="input-label">Sortida</IonLabel>
              <IonInput v-model="estadaSortida" type="time" fill="outline" class="input-box ion-margin-top ion-margin-bottom" />
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonCard>-->

      <!-- Seccio Cangurs -->
      <IonCard class="mini-card">
        <IonGrid>
          <IonRow class="ion-text-start">
            <IonCol size="12">
              <IonText color="primary">
                <h2>Cangurs</h2>
              </IonText>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="12" class="ion-margin-bottom">
              <IonText color="medium">
                Afegeix els noms dels cangurs que cuidaran el nadó. Pots afegir-ne tants com vulguis.
              </IonText>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="12">
              <IonList>
                <IonItem v-for="(c, i) in cangurs" :key="c.id">
                  <IonIcon :icon="personOutline" slot="start" />
                  <IonLabel>{{ c.nom }} <small>({{ c.parentesc }})</small></IonLabel>
                  <IonButton fill="clear" color="dark" slot="end" @click="confirmDeleteCangur(i)">
                    <IonIcon :icon="trashOutline" />
                  </IonButton>
                </IonItem>
              </IonList>

              <IonGrid class="ion-margin-top">
                <IonRow>
                  <IonCol size="5">
                    <IonInput v-model="nouCangur" placeholder="Afegeix un cangur" />
                  </IonCol>
                  <IonCol size="5">
                    <IonSelect v-model="nouParentesc" placeholder="Parentesc" interface="alert" required>
                      <IonSelectOption value="pare">Pare</IonSelectOption>
                      <IonSelectOption value="mare">Mare</IonSelectOption>
                      <IonSelectOption value="avi">Avi</IonSelectOption>
                      <IonSelectOption value="àvia">Àvia</IonSelectOption>
                      <IonSelectOption value="tiet">Tiet</IonSelectOption>
                      <IonSelectOption value="tieta">Tieta</IonSelectOption>
                      <IonSelectOption value="altres">Altres</IonSelectOption>
                    </IonSelect>
                </IonCol>
                  <IonCol size="2">
                    <IonButton class="add-button" expand="block" :disabled="!nouCangur.trim() || !nouParentesc.trim()" @click="afegirCangur">
                      <IonIcon :icon="addOutline" />
                    </IonButton>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonCol>
          </IonRow>
        </IonGrid>      
      </IonCard>

      <div class="button-container">
        <IonButton expand="block" size="large" fill="solid" color="primary" @click="desar">
          Desar
        </IonButton>
      </div>
    </div>
  <IonAlert
    :is-open="showDeleteCangurAlert"
    header="Confirmació"
    sub-header="Esborrar cangur"
    :message="deleteCangurMessage"
    :buttons="deleteCangurButtons"
    @didDismiss="() => { showDeleteCangurAlert = false; pendingDeleteCangur = null }"
  />

  <IonToast :is-open="estaOk" :icon="checkbox" :message="toastMessage" :duration="3000" position="bottom" @didDismiss="estaOk = false" color="primary"/>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { IonButton, IonText, IonIcon, IonList, IonItem, IonLabel, IonInput, IonGrid, IonRow, IonCol, IonToast, IonAlert, IonCard, IonSelect, IonSelectOption } from '@ionic/vue'
import { addOutline, personOutline, trashOutline, checkbox } from 'ionicons/icons'
import AppLayout from '@/components/AppLayout.vue'

// Firebase
import { db, auth } from '@/services/firebase'
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import offlineService from '@/services/offline.service'

const router = useRouter()
const toastMessage = ref('')
const estaOk = ref(false)
const showDeleteCangurAlert = ref(false)
const pendingDeleteCangur = ref<{ index: number; nom: string } | null>(null)
const cangurs = ref<{ id: string; nom: string; parentesc: string; eliminado?: boolean }[]>([])

const deleteCangurMessage = computed(() => {
  if (!pendingDeleteCangur.value) return ''
  return `Segur que vols eliminar el cangur ${pendingDeleteCangur.value.nom}?`
})

const deleteCangurButtons = computed(() => [
  {
    text: 'Cancel·lar',
    role: 'cancel',
    cssClass: 'secondary',
    handler: () => {
      showDeleteCangurAlert.value = false
      pendingDeleteCangur.value = null
    }
  },
  {
    text: 'Eliminar',
    handler: () => deleteCangurConfirmed()
  }
])

const nouCangur = ref('')
const nadoName = ref('')
const nadoId = ref<string | null>(null)
const userEmail = ref('')
const setmanes = ref<any[]>([])
const dies = ref<any[]>([])
const setmanesName = ref('')
const setmanesId = ref<string | null>(null)
const diesName = ref('')
const diesId = ref<string | null>(null)
const estadaEntrada = ref('')
const estadaSortida = ref('')
const estadaId = ref<string | null>(null)
const nouParentesc = ref('')

onMounted(async () => {
  const user = auth.currentUser

  if (!user) return

  userEmail.value = user.email || ''

  try {
    if (navigator.onLine) {
      // Load cangurs
      const cangursSnapshot = await getDocs(collection(db, 'users', user.uid, 'cangurs'))
      cangurs.value = cangursSnapshot.docs
        .filter(d => !d.data().eliminado)
        .map(d => ({ id: d.id, nom: d.data().name, parentesc: d.data().parentesc || '', eliminado: !!d.data().eliminado }))
      const nadonsSnapshot = await getDocs(collection(db, 'users', user.uid, 'nadons'))
      const validNadons = nadonsSnapshot.docs.filter(d => !d.data().eliminado)
      if (validNadons.length) {
        const nadoDoc = validNadons[0]
        nadoId.value = nadoDoc.id
        nadoName.value = nadoDoc.data().name || ''
        setmanesName.value = nadoDoc.data().setmanes?.toString() || ''
        diesName.value = nadoDoc.data().dies?.toString() || ''
        console.log('Nadó loaded:', { name: nadoName.value, setmanes: setmanesName.value, dies: diesName.value })
        localStorage.setItem('selectedNado', nadoDoc.id)
        localStorage.setItem('selectedNadoName', nadoDoc.data().name)
        localStorage.setItem('selectedSetmanes', nadoDoc.data().setmanes?.toString() || '')
        localStorage.setItem('selectedDies', nadoDoc.data().dies?.toString() || '')
      }
      
      // Load estada_unitat (only one)
      const estadaSnapshot = await getDocs(collection(db, 'users', user.uid, 'estada_unitat'))
      if (!estadaSnapshot.empty) {
        const estadaDoc = estadaSnapshot.docs[0]
        estadaId.value = estadaDoc.id
        estadaEntrada.value = estadaDoc.data().horaEntrada || ''
        estadaSortida.value = estadaDoc.data().horaSortida || ''
        console.log('Estada unitat loaded:', { horaEntrada: estadaEntrada.value, horaSortida: estadaSortida.value })
        localStorage.setItem('selectedEstada', estadaDoc.id)
        localStorage.setItem('selectedEstadaEntrada', estadaDoc.data().horaEntrada || '')
        localStorage.setItem('selectedEstadaSortida', estadaDoc.data().horaSortida || '')
      }      
    } else {
      // Load from localStorage when offline
      const rawCangurs = localStorage.getItem('localCangurs')
      if (rawCangurs) cangurs.value = JSON.parse(rawCangurs)

      const rawSetmanes = localStorage.getItem('localSetmanes')
      if (rawSetmanes) setmanes.value = JSON.parse(rawSetmanes)

      const rawDies = localStorage.getItem('localDies')
      if (rawDies) dies.value = JSON.parse(rawDies)

      nadoId.value = localStorage.getItem('selectedNado')
      nadoName.value = localStorage.getItem('selectedNadoName') || ''
      setmanesId.value = localStorage.getItem('selectedSetmanes')
      setmanesName.value = localStorage.getItem('selectedSetmanesName') || ''
      diesId.value = localStorage.getItem('selectedDies')
      diesName.value = localStorage.getItem('selectedDiesName') || ''
      
      // Load estada_unitat from localStorage when offline
      estadaId.value = localStorage.getItem('selectedEstada')
      estadaEntrada.value = localStorage.getItem('selectedEstadaEntrada') || ''
      estadaSortida.value = localStorage.getItem('selectedEstadaSortida') || ''
    }
  } catch (e) {
    console.error('Error loading data in onMounted:', e)
  }
})

const afegirCangur = async () => {
  if (!nouCangur.value.trim() || !nouParentesc.value.trim()) return
  
  const user = auth.currentUser
  const fallbackUid = localStorage.getItem('uid')
  const userIdToUse = user?.uid ?? fallbackUid ?? ''
  const name = nouCangur.value.trim()
  const parentesc = nouParentesc.value

  if (navigator.onLine && userIdToUse) {
    const docRef = await addDoc(collection(db, 'users', userIdToUse, 'cangurs'), { 
      name, 
      parentesc, 
      createdAt: new Date(),
      eliminado: false
    })
    cangurs.value.push({ id: docRef.id, nom: name, parentesc: parentesc, eliminado: false })
  } else {
    const tempId = `local-${Date.now()}-${Math.random().toString(36).slice(2,6)}`
    cangurs.value.push({ id: tempId, nom: name, parentesc: parentesc, eliminado: false })
    localStorage.setItem('localCangurs', JSON.stringify(cangurs.value))

    offlineService.addPending('cangurs', { name, parentesc, createdAt: new Date(), eliminado: false }, userIdToUse)
  }

  nouCangur.value = ''
  nouParentesc.value = ''
}

const confirmDeleteCangur = (index: number) => {
  const c = cangurs.value[index]
  if (!c) return

  pendingDeleteCangur.value = { index, nom: c.nom }
  showDeleteCangurAlert.value = true
}

const deleteCangurConfirmed = async () => {
  if (!pendingDeleteCangur.value) return
  const { index, nom } = pendingDeleteCangur.value

  const c = cangurs.value[index]
  if (!c) {
    pendingDeleteCangur.value = null
    showDeleteCangurAlert.value = false
    return
  }

  const user = auth.currentUser
  if (!user) return

  if (c.id && !c.id.startsWith('local-')) {
    try {
      await updateDoc(doc(db, 'users', user.uid, 'cangurs', c.id), { eliminado: true })
    } catch (e) {
      console.error('Error marcant cangur com eliminat:', e)
      toastMessage.value = 'No s\'ha pogut eliminar el cangur. Torna-ho a intentar.'
      estaOk.value = true
      pendingDeleteCangur.value = null
      showDeleteCangurAlert.value = false
      return
    }
  }

  cangurs.value.splice(index, 1)
  localStorage.setItem('localCangurs', JSON.stringify(cangurs.value))
  toastMessage.value = `Cangur ${nom} eliminat correctament.`
  estaOk.value = true
  pendingDeleteCangur.value = null
  showDeleteCangurAlert.value = false
}

const desar = async () => {

  const user = auth.currentUser
  const fallbackUid = localStorage.getItem('uid')
  const userIdToUse = user?.uid ?? fallbackUid ?? ''

  // Save cangurs
  for (let i = 0; i < cangurs.value.length; i++) {
    const c = cangurs.value[i]
    if (!c.id || c.id.startsWith('local-') || c.id.startsWith('local-reg-')) {
      const payload = { name: c.nom, parentesc: c.parentesc, createdAt: new Date(), eliminado: false }
      try {
        if (navigator.onLine && userIdToUse) {
          const docRef = await addDoc(collection(db, 'users', userIdToUse, 'cangurs'), payload)
          cangurs.value[i].id = docRef.id
        } else {
          offlineService.addPending('cangurs', payload, userIdToUse)
          if (!c.id || !c.id.startsWith('local-')) cangurs.value[i].id = `local-${Date.now()}-${Math.random().toString(36).slice(2,6)}`
        }
      } catch (e) { console.warn('No s\'ha pogut desar cangur', e) }
    }
  }

  // Save nadó (update existing or create new)
  if (nadoName.value.trim()) {
    try {
      const nadoData = {
        name: nadoName.value,
        setmanes: setmanesName.value ? parseInt(setmanesName.value) : null,
        dies: diesName.value ? parseInt(diesName.value) : null,
        eliminado: false
      }
      console.log('Saving nadó:', { nadoId: nadoId.value, data: nadoData, userIdToUse, isOnline: navigator.onLine })
      if (nadoId.value) {
        // Update existing nadó with setmanes and dies
        if (navigator.onLine && userIdToUse) {
          console.log('Updating nadó with ID:', nadoId.value)
          await updateDoc(doc(db, 'users', userIdToUse, 'nadons', nadoId.value), nadoData)
          console.log('Nadó updated successfully')
        } else {
          offlineService.addPending('nadons', { ...nadoData, id: nadoId.value }, userIdToUse)
        }
        localStorage.setItem('selectedNadoName', nadoName.value)
        localStorage.setItem('selectedSetmanes', setmanesName.value)
        localStorage.setItem('selectedDies', diesName.value)
      } else {
        // Create new nadó if it doesn't exist
        if (navigator.onLine && userIdToUse) {
          console.log('Creating new nadó')
          const docRef = await addDoc(collection(db, 'users', userIdToUse, 'nadons'), { ...nadoData, createdAt: new Date() })
          nadoId.value = docRef.id
          localStorage.setItem('selectedNado', docRef.id)
          console.log('Nadó created with ID:', nadoId.value)
        } else {
          const tempId = `local-${Date.now()}`
          nadoId.value = tempId
          offlineService.addPending('nadons', { ...nadoData, createdAt: new Date() }, userIdToUse)
          localStorage.setItem('selectedNado', tempId)
        }
        localStorage.setItem('selectedNadoName', nadoName.value)
        localStorage.setItem('selectedSetmanes', setmanesName.value)
        localStorage.setItem('selectedDies', diesName.value)
      }
    } catch (e) { console.warn('No s\'ha pogut desar nadó', e) }
  }

  // Save estada_unitat (update existing or create new)
  if (estadaEntrada.value || estadaSortida.value) {
    try {
      const estadaData = {
        horaEntrada: estadaEntrada.value,
        horaSortida: estadaSortida.value,
      }
      console.log('Saving estada_unitat:', { estadaId: estadaId.value, data: estadaData, userIdToUse, isOnline: navigator.onLine })
      if (estadaId.value && !estadaId.value.startsWith('local-')) {
        // Update existing estada_unitat
        if (navigator.onLine && userIdToUse) {
          console.log('Updating estada_unitat with ID:', estadaId.value)
          await updateDoc(doc(db, 'users', userIdToUse, 'estada_unitat', estadaId.value), estadaData)
          console.log('Estada_unitat updated successfully')
        } else {
          offlineService.addPending('estada_unitat', { ...estadaData, id: estadaId.value }, userIdToUse)
        }
        localStorage.setItem('selectedEstadaEntrada', estadaEntrada.value)
        localStorage.setItem('selectedEstadaSortida', estadaSortida.value)
        console.log('Estada_unitat updated localStorage:', { selectedEstadaEntrada: estadaEntrada.value, selectedEstadaSortida: estadaSortida.value })
      } else {
        // Create new estada_unitat if it doesn't exist
        if (navigator.onLine && userIdToUse) {
          console.log('Creating new estada_unitat')
          const docRef = await addDoc(collection(db, 'users', userIdToUse, 'estada_unitat'), { ...estadaData, createdAt: new Date() })
          estadaId.value = docRef.id
          localStorage.setItem('selectedEstada', docRef.id)
          console.log('Estada_unitat created with ID:', estadaId.value)
        } else {
          const tempId = `local-${Date.now()}`
          estadaId.value = tempId
          offlineService.addPending('estada_unitat', { ...estadaData, createdAt: new Date() }, userIdToUse)
          localStorage.setItem('selectedEstada', tempId)
        }
        localStorage.setItem('selectedEstadaEntrada', estadaEntrada.value)
        localStorage.setItem('selectedEstadaSortida', estadaSortida.value)
        console.log('Estada_unitat created localStorage:', { selectedEstadaEntrada: estadaEntrada.value, selectedEstadaSortida: estadaSortida.value })
      }
    } catch (e) { console.warn('No s\'ha pogut desar estada_unitat', e) }
  }

  try { localStorage.setItem('localCangurs', JSON.stringify(cangurs.value)) } catch(e) { console.warn(e) }
  router.back()
}
</script>

<style scoped>

.add-button { 
    --background: var(--ion-color-primary); 
}

.user-email {
  text-align: center;
  margin-top: 4px;
  margin-bottom: 16px;
}

</style>
