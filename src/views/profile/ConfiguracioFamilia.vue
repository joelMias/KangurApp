<template>
  <AppLayout :show-back="true" content-class="ion-padding">

      <IonGrid>
        <IonRow class="ion-justify-content-center">
          <IonCol size="12" size-md="6" size-lg="5">
            <IonText color="dark">
              <h2 class="form-title">Configuracio de la familia</h2>
            </IonText>
          </IonCol>
        </IonRow>
      </IonGrid>

      <IonList>
        <IonItem v-for="(c, i) in cangurs" :key="c.id">
          <IonIcon :icon="personOutline" slot="start" />
          <IonLabel>{{ c.nom }}</IonLabel>
          <IonButton fill="clear" color="dark" slot="end" @click="eliminarCangur(i)">
            <IonIcon :icon="trashOutline" />
          </IonButton>
        </IonItem>
      </IonList>

      <IonGrid class="ion-margin-top">
        <IonRow>
          <IonCol size="9">
            <IonInput v-model="nouCangur" placeholder="Afegeix un cangur" />
          </IonCol>
          <IonCol size="3">
            <IonButton class="add-button" expand="block" :disabled="!nouCangur.trim()" @click="afegirCangur">
              <IonIcon :icon="addOutline" />
            </IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>

    <IonButton expand="full" size="large" shape="round" fill="outline" slot="fixed" class="continuar-button" @click="guardar">
      Guardar
    </IonButton>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { IonButton, IonText, IonIcon, IonList, IonItem, IonLabel, IonInput, IonGrid, IonRow, IonCol } from '@ionic/vue'
import { addOutline, personOutline, trashOutline } from 'ionicons/icons'
import AppLayout from '@/components/AppLayout.vue'

// Firebase
import { db, auth } from '@/services/firebase'
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore'
import offlineService from '@/services/offline.service'

const router = useRouter()

const cangurs = ref<{ id: string; nom: string }[]>([])
const nouCangur = ref('')

onMounted(async () => {
  const user = auth.currentUser

  if (!user) return

  if (navigator.onLine) {
    const snapshot = await getDocs(collection(db, 'users', user.uid, 'cangurs'))
    cangurs.value = snapshot.docs.map(d => ({ id: d.id, nom: d.data().name }))
    localStorage.setItem('localCangurs', JSON.stringify(cangurs.value))
  } else {
    const raw = localStorage.getItem('localCangurs')
    if (raw) cangurs.value = JSON.parse(raw)
  }
})

const afegirCangur = async () => {
  if (!nouCangur.value.trim()) return

  const user = auth.currentUser
  const fallbackUid = localStorage.getItem('uid')
  const userIdToUse = user?.uid ?? fallbackUid ?? ''
  const name = nouCangur.value.trim()

  if (navigator.onLine && userIdToUse) {
    const docRef = await addDoc(collection(db, 'users', userIdToUse, 'cangurs'), { name, createdAt: new Date() })
    cangurs.value.push({ id: docRef.id, nom: name })
  } else {
    const tempId = `local-${Date.now()}-${Math.random().toString(36).slice(2,6)}`
    cangurs.value.push({ id: tempId, nom: name })
    localStorage.setItem('localCangurs', JSON.stringify(cangurs.value))
    offlineService.addPending('cangurs', { name, createdAt: new Date() }, userIdToUse)
  }

  nouCangur.value = ''
}

const eliminarCangur = async (index: number) => {
  const user = auth.currentUser

  if (!user) return

  const c = cangurs.value[index]

  if (!c) return

  if (c.id && !c.id.startsWith('local-')) {
    await deleteDoc(doc(db, 'users', user.uid, 'cangurs', c.id))
  }
  cangurs.value.splice(index, 1)
}

const guardar = async () => {

  const user = auth.currentUser
  const fallbackUid = localStorage.getItem('uid')
  const userIdToUse = user?.uid ?? fallbackUid ?? ''

  for (let i = 0; i < cangurs.value.length; i++) {
    const c = cangurs.value[i]
    if (!c.id || c.id.startsWith('local-') || c.id.startsWith('local-reg-')) {
      const payload = { name: c.nom, createdAt: new Date() }
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
  try { localStorage.setItem('localCangurs', JSON.stringify(cangurs.value)) } catch(e) {}
  router.back()
}
</script>

<style scoped>
.continuar-button {
  --background: #e3f2fd;
  --color: #26a69a;
  --border-radius: 10px;
  --border-width: 1px;
  --border-color:#26a69a;
  font-weight: 600;
  width: 30%;
  text-transform: none;
  margin: 0 auto 18px auto;
}

.add-button { 
    --background: #64b8af; 
}

</style>
