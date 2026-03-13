<template>
  <AppLayout :show-back="true" :scroll-y="false" back-route="/nado" content-class="ion-padding">
    <RegistrationProgress :current-step="3" />
    
    <IonGrid>
      <IonRow class="ion-justify-content-center">
        <IonCol size="12" size-md="6" size-lg="5">
          <IonText color="dark">
            <h2 class="titol">3. Afegeix cangurs</h2>
          </IonText>

          <div v-if="error">
            <IonText color="danger">
              <p class="error-message">{{ error }}</p>
            </IonText>
          </div>

          <IonList v-if="cangurs.length">
            <IonItem v-for="(cangur, index) in cangurs" :key="cangur.id">
              <IonIcon :icon="personOutline" slot="start" />
              <IonLabel>{{ cangur.nom }} <small>({{ cangur.parentesc }})</small></IonLabel>
              <IonButton fill="clear" color="dark" slot="end" @click="eliminarCangur(index)">
                <IonIcon :icon="trashOutline" />
              </IonButton>
            </IonItem>
          </IonList>

          <IonGrid class="ion-margin-top">
            <IonRow>
              <IonCol size="5">
                <IonInput v-model="nouCangur" placeholder="Afegeix un cangur" fill="outline" class="input-box"/>
              </IonCol>
              <IonCol size="5">
                    <IonSelect v-model="nouParentesc" placeholder="Parentesc" interface="alert" required>
                      <IonSelectOption value="pare">Pare</IonSelectOption>
                      <IonSelectOption value="mare">Mare</IonSelectOption>
                      <IonSelectOption value="avi">Avi</IonSelectOption>
                      <IonSelectOption value="àvia">Àvia</IonSelectOption>
                      <IonSelectOption value="tieta">Tiet</IonSelectOption>
                      <IonSelectOption value="tiet">Tieta</IonSelectOption>
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

          <br>
          <IonButton expand="block" size="large" fill="outline" @click="guardarCangurs" class="ion-margin-top" :disabled="loading">
            <IonSpinner v-if="loading" name="crescent"></IonSpinner>
            <span v-else>Continuar</span>
          </IonButton>
        </IonCol>
      </IonRow>
    </IonGrid>
  </AppLayout>
</template>

<script setup lang="ts">
import { IonGrid, IonText, IonLabel, IonCol, IonRow, IonItem, IonList, IonInput, IonButton, IonIcon, IonSpinner, onIonViewWillEnter, IonSelect, IonSelectOption } from '@ionic/vue'
import { ref, onMounted } from 'vue'
import { addOutline, personOutline, trashOutline } from 'ionicons/icons'
import { useRouter } from 'vue-router'
import { db, auth } from '@/services/firebase'
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore'
import offlineService from '@/services/offline.service'
import AppLayout from '@/components/AppLayout.vue'
import RegistrationProgress from '@/components/RegistrationProgress.vue'

const router = useRouter()

// Ara cada cangur té { id, nom, parentesc }
const cangurs = ref<{ id: string; nom: string; parentesc: string }[]>([])
const nouCangur = ref('')
const error = ref('')
const loading = ref(false)
const nouParentesc = ref('')

onIonViewWillEnter(() => {
  nouCangur.value = ''
  nouParentesc.value = ''
  cangurs.value = []
  error.value = ''
  loading.value = false
})

// Carregar cangurs de Firestore
onMounted(async () => {
  const user = auth.currentUser
  if (!user) return

  let loadedCangurs: { id: string; nom: string; parentesc: string }[] = []

  if (navigator.onLine) {
    try {
      const snapshot = await getDocs(collection(db, 'users', user.uid, 'cangurs'))
      loadedCangurs = snapshot.docs.map(d => ({
        id: d.id,
        nom: d.data().name,
        parentesc: d.data().parentesc || ''
      }))
      
      localStorage.setItem('localCangurs', JSON.stringify(loadedCangurs))
    } catch (error) {
      console.error('Error carregant cangurs de Firebase:', error)
    }
  } 

  if (loadedCangurs.length === 0) {
    const raw = localStorage.getItem('localCangurs')
    if (raw) {
      try { 
        loadedCangurs = JSON.parse(raw) 
      } catch(e) { 
        console.warn('Error parsejant localCangurs', e) 
      }
    }
  }

  try {
    const regName = (localStorage.getItem('name') || '').trim()
    if (regName) {
      const exists = loadedCangurs.some(c => (c.nom || '').toLowerCase() === regName.toLowerCase())
      if (!exists) {
        loadedCangurs.unshift({ 
          id: `local-reg-${Date.now()}`, 
          nom: regName, 
          parentesc: ''
        })
      }
    }
  } catch (e) { console.warn(e) }
  cangurs.value = loadedCangurs
})

// Afegir nous cangur
const afegirCangur = async () => {
  if (!nouCangur.value.trim() || !nouParentesc.value.trim()) return

  const user = auth.currentUser
  const fallbackUid = localStorage.getItem('uid')
  const userIdToUse = user?.uid ?? fallbackUid ?? ''
  const name = nouCangur.value.trim()
  if (navigator.onLine && userIdToUse) {
    const docRef = await addDoc(collection(db, 'users', userIdToUse, 'cangurs'), {
      name,
      parentesc: nouParentesc.value,
      createdAt: new Date()
    })
    cangurs.value.push({ id: docRef.id, nom: name, parentesc: nouParentesc.value })
  } else {
    const tempId = `local-${Date.now()}-${Math.random().toString(36).slice(2,6)}`
    cangurs.value.push({ id: tempId, nom: name, parentesc: nouParentesc.value })

    localStorage.setItem('localCangurs', JSON.stringify(cangurs.value))
    offlineService.addPending('cangurs', { name, parentesc: nouParentesc.value, createdAt: new Date() }, userIdToUse)
  }
  nouCangur.value = ''
  nouParentesc.value = ''
}

// Eliminar cangurs
const eliminarCangur = async (index: number) => {
  const user = auth.currentUser
  if (!user) return
  const cangur = cangurs.value[index]
  if (!cangur) return
  await deleteDoc(doc(db, 'users', user.uid, 'cangurs', cangur.id))
  cangurs.value.splice(index, 1)
}

// Guardar les dades i passar a la pàgina del nadó
const guardarCangurs = async () => {
  loading.value = true
 
  const user = auth.currentUser
  const fallbackUid = localStorage.getItem('uid')
  const userIdToUse = user?.uid ?? fallbackUid ?? ''

  if (!userIdToUse) {
    router.push('/HomePage')
    return
  }

  for (let i = 0; i < cangurs.value.length; i++) {
    const c = cangurs.value[i]
    if (!c.id || c.id.startsWith('local-') || c.id.startsWith('local-reg-')) {
      const payload = { name: c.nom, parentesc: c.parentesc, createdAt: new Date() }
      try {
        if (navigator.onLine) {
          const docRef = await addDoc(collection(db, 'users', userIdToUse, 'cangurs'), payload)
          cangurs.value[i].id = docRef.id
        } else {
          offlineService.addPending('cangurs', payload, userIdToUse)
          if (!c.id || !c.id.startsWith('local-')) cangurs.value[i].id = `local-${Date.now()}-${Math.random().toString(36).slice(2,6)}`
        }
      } catch (err) {
        console.warn('No s\'ha pogut desar cangur, es mantindrà localment', err)
      }
    }
  }

  try { 
    localStorage.setItem('localCangurs', JSON.stringify(cangurs.value)) 
  } catch (e) { console.warn(e) }

  router.push('/perfil')
}
</script>

<style scoped>

.titol {
  text-align: center;
  margin-bottom: 20px;
  font-size: 22px;
  font-weight: 600;
}

.add-button { 
  --background: #64b8af;
  height: 100%;
}

</style>