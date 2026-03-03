<template>
  <IonPage>
    <IonHeader>
      <IonToolbar class="capçalera">
        <IonTitle> <img src="/src/assets/kangur_no_background.png" class="header-logo">KANGURAPP</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent class="ion-padding">

      <IonGrid>
        <IonRow class="ion-justify-content-center">
          <IonCol size="12" size-md="6" size-lg="5">
            <IonText class="lletra" color="dark">
              <h2 class="titol"><strong>Crea el teu compte</strong></h2>
            </IonText>

            <IonText class="lletra" color="dark">
              <h3><strong>Cangurs</strong></h3>
            </IonText>

            <IonList v-if="cangurs.length">
              <IonItem v-for="(cangur, index) in cangurs" :key="index">
                <IonIcon :icon="personOutline" slot="start" />
                <IonLabel>{{ cangur.nom }}</IonLabel>
                <IonButton v-if="index != 0" fill="clear" color="dark" slot="end" @click="eliminarCangur(index)">
                  <IonIcon :icon="trashOutline" />
                </IonButton>
              </IonItem>
            </IonList>

            <IonGrid class="ion-no-padding ion-margin-top">
              <IonRow class="ion-align-items-stretch">
                <IonCol size="11" class="ion-padding-end">
                  <IonInput v-model="nouCangur" placeholder="Afegeix un cangur" class="input-box"/>
                </IonCol>
                <IonCol size="1">
                  <IonButton class="add-button ion-no-margin" expand="block" @click="afegirCangur">
                    <IonIcon :icon="addOutline" />
                  </IonButton>
                </IonCol>
              </IonRow>
            </IonGrid>

            <IonButton expand="block" size="large" shape="round" fill="outline" class="default-button ion-margin-top" @click="guardarCangurs">
              Continuar
            </IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>

    </IonContent>
  </IonPage>
</template>

<script setup lang="ts">
import { IonPage, IonGrid, IonText, IonLabel, IonCol, IonRow, IonItem, IonList, IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonButton, IonIcon, onIonViewWillEnter } from '@ionic/vue'
import { ref, onMounted } from 'vue'
import { addOutline, personOutline, trashOutline } from 'ionicons/icons'
import { useRouter } from 'vue-router'
import { db, auth } from '@/services/firebase'
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore'
import offlineService from '@/services/offline.service'

const router = useRouter()

// Ara cada cangur té { id, nom }
const cangurs = ref<{ id: string; nom: string }[]>([])
const nouCangur = ref('')

onIonViewWillEnter(() => {
  nouCangur.value = ''
  cangurs.value = []
})

// Carregar cangurs de Firestore
onMounted(async () => {
  const user = auth.currentUser
  if (!user) return
  if (navigator.onLine) {
    const snapshot = await getDocs(collection(db, 'users', user.uid, 'cangurs'))
    cangurs.value = snapshot.docs.map(d => ({
      id: d.id,
      nom: d.data().name
    }))
    try {
      const regName = (localStorage.getItem('name') || '').trim()
      if (regName) {
        const idx = cangurs.value.findIndex(c => (c.nom || '').toLowerCase() === regName.toLowerCase())
        if (idx > 0) {
          const [item] = cangurs.value.splice(idx, 1)
          cangurs.value.unshift(item)
        } else if (idx === -1) {
          cangurs.value.unshift({ id: `local-reg-${Date.now()}`, nom: regName })
        }
      }
    } catch (e) {  }

    localStorage.setItem('localCangurs', JSON.stringify(cangurs.value))
  } else {
    const raw = localStorage.getItem('localCangurs')
    if (raw) {
      try { cangurs.value = JSON.parse(raw) } catch(e) { console.warn(e) }
    }
  }

    try {
      const regName = (localStorage.getItem('name') || '').trim()
      if (regName && cangurs.value.length) {
        const idx = cangurs.value.findIndex(c => (c.nom || '').toLowerCase() === regName.toLowerCase())
        if (idx > 0) {
          const [item] = cangurs.value.splice(idx, 1)
          cangurs.value.unshift(item)
        } else if (idx === -1) {
          cangurs.value.unshift({ id: `local-reg-${Date.now()}`, nom: regName })
        }
      }
    } catch (e) { }
})

// Afegir nous cangur
const afegirCangur = async () => {
  if (!nouCangur.value.trim()) return
  const user = auth.currentUser
  const fallbackUid = localStorage.getItem('uid')
  if (!user && !fallbackUid) return
  const userIdToUse = user?.uid ?? fallbackUid ?? ''
  const name = nouCangur.value.trim()
  if (navigator.onLine) {
    const docRef = await addDoc(collection(db, 'users', userIdToUse, 'cangurs'), {
      name,
      createdAt: new Date()
    })
    cangurs.value.push({ id: docRef.id, nom: name })
  } else {
    const tempId = `local-${Date.now()}-${Math.random().toString(36).slice(2,6)}`
    cangurs.value.push({ id: tempId, nom: name })
    // actualitzar cache local
    localStorage.setItem('localCangurs', JSON.stringify(cangurs.value))
    offlineService.addPending('cangurs', { name, createdAt: new Date() }, userIdToUse)
    console.log('Cangur afegit localment (offline)')
  }
  nouCangur.value = ''
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
 
  const user = auth.currentUser
  const fallbackUid = localStorage.getItem('uid')
  const userIdToUse = user?.uid ?? fallbackUid ?? ''

  if (!userIdToUse) {
    router.push('/nado')
    return
  }

  for (let i = 0; i < cangurs.value.length; i++) {
    const c = cangurs.value[i]
    if (!c.id || c.id.startsWith('local-') || c.id.startsWith('local-reg-')) {
      const payload = { name: c.nom, createdAt: new Date() }
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

  try { localStorage.setItem('localCangurs', JSON.stringify(cangurs.value)) } catch (e) { }

  router.push('/nado')
}
</script>

<style scoped>

.titol {
  text-align: center;
  margin-bottom: 20px;
  font-size: 22px;
  font-weight: 600;
}

.input-box {
  border: 1px solid #26a69a;
  border-radius: 8px;
  --highlight-height: 0;
  --padding-start: 10px;
}

.add-button { 
  --background: #64b8af;
  height: 100%;
}

</style>