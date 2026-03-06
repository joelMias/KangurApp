<template>
  <AppLayout :show-back="true" :scroll-y="false" back-route="/register" content-class="ion-padding">
    <RegistrationProgress :current-step="2" />
    
    <IonGrid>
      <IonRow class="ion-justify-content-center">
        <IonCol size="12" size-md="6" size-lg="5">
          <IonText color="dark">
            <h2 class="titol">2. Registra el nadó</h2>
          </IonText>

          <div v-if="error">
            <IonText color="danger">
              <p class="error-message">{{ error }}</p>
            </IonText>
          </div>

          <strong><IonLabel position="stacked" class="input-label">Nom del nadó</IonLabel></strong>
          <IonInput v-model="nomNado" placeholder="Nom del nadó" fill="outline" class="input-box"/>
          
          <strong><IonLabel position="stacked" class="input-label">Edat gestacional del nadó (Setmanes)</IonLabel></strong>
          <IonInput v-model.number="setmanes" placeholder="Setmanes" fill="outline" class="input-box"/>

          <strong><IonLabel position="stacked" class="input-label">Edat gestacional del nadó (Dies)</IonLabel></strong>
          <IonInput v-model.number="dies" placeholder="Dies" fill="outline" class="input-box"/>

          <br>
          <IonButton expand="block" size="large" fill="outline" @click="Registre" class="ion-margin-top" :disabled="loading">
            <IonSpinner v-if="loading" name="crescent"></IonSpinner>
            <span v-else>Continuar</span>
          </IonButton>
        </IonCol>
      </IonRow>
    </IonGrid>
  </AppLayout>
</template>

<script setup lang="ts">
import { IonGrid, IonCol, IonRow, IonText, IonInput, IonLabel, IonButton, IonSpinner, onIonViewWillEnter } from '@ionic/vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { db, auth } from '@/services/firebase'
import { collection, addDoc } from 'firebase/firestore'
import offlineService from '@/services/offline.service'
import AppLayout from '@/components/AppLayout.vue'
import RegistrationProgress from '@/components/RegistrationProgress.vue'

const router = useRouter()

const nomNado = ref('')
const setmanes = ref<number | null>(null)
const dies = ref<number | null>(null)
const error = ref('')
const loading = ref(false)

onIonViewWillEnter(() => {
  nomNado.value = ''
  setmanes.value = null
  dies.value = null
  error.value = ''
  loading.value = false
})

const Registre = async () => {
  if (!nomNado.value || !setmanes.value || !dies.value) {
    error.value = 'Omple tots els camps.'
    return
  }

  error.value = ''
  loading.value = true

  try {
    const user = auth.currentUser
    if (!user) throw new Error('Usuari no autenticat')

    // Guardem el nadó dins la subcol·lecció "nadons" de l’usuari
    const nadoData = {
      name: nomNado.value,
      setmanes: setmanes.value,
      dies: dies.value,
      createdAt: new Date()
    }

    const fallbackUid = localStorage.getItem('uid')
    const userIdToUse = user.uid ?? fallbackUid ?? ''
    if (navigator.onLine) {
      //Si tenim connexió, guardem el nado a la base de dades directament
      const docRef = await addDoc(collection(db, 'users', userIdToUse, 'nadons'), nadoData)
      console.log('Nadó desat:', nadoData)
      // Guardem l'id del nadó per reutilitzar-lo
      localStorage.setItem('selectedNado', docRef.id)
      localStorage.setItem('selectedNadoName', nomNado.value)
      
      try {
        const raw = localStorage.getItem('localnadons')
        const list = raw ? JSON.parse(raw) : []
        list.push({ id: docRef.id, name: nomNado.value })
        localStorage.setItem('localnadons', JSON.stringify(list))
      } catch (e) { console.warn('Error caching local nadons', e) }
    } else {
      // Si no hi ha connexió, es crea id temporal local
      const tempId = `local-${Date.now()}-${Math.random().toString(36).slice(2,6)}`
      localStorage.setItem('selectedNado', tempId)
      localStorage.setItem('selectedNadoName', nomNado.value)
      try {
        const raw = localStorage.getItem('localnadons')
        const list = raw ? JSON.parse(raw) : []
        list.push({ id: tempId, name: nomNado.value })
        localStorage.setItem('localnadons', JSON.stringify(list))
      } catch (e) { 
        console.warn('Error al guardar el nado en local', e) 
      }
      offlineService.addPending('nadons', { ...nadoData, __tempId: tempId }, userIdToUse)
      console.log('Nadó guardat localment per sincronitzar després')
    }

    router.push('/cangurs')
  } catch (err: any) {
    console.error('Error desant el nadó:', err)
    error.value = err.message || 'Error desant el nadó. Torna-ho a intentar.'
    loading.value = false
  }
}
</script>

<style scoped>

.input-label {
  font-weight: bold;
  font-family: "Nunito",sans-serif;
  color: grey;
}


</style>
