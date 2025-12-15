<template>
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle class="capçalera"> <img src="/src/assets/kangur_resized.jpg" class="header-logo">KANGURAPP</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent class="ion-padding">
      <IonText class="lletra" color="dark">
        <h2 class="ion-text-center"> 
          <strong>Crea el teu compte</strong>
        </h2>
      </IonText>

      <IonGrid>
        <!-- Nom del nadó -->
        <IonRow>
          <IonCol size="12" size-md="6" offset-md="3">
            <IonLabel class="section-title">Nom del nadó</IonLabel>
            <IonInput v-model="nomNado" placeholder="Nom del nadó" class="input-box" />
          </IonCol>
        </IonRow>

        <!-- Edat gestacional -->
        <IonRow>
          <IonCol size="7" size-md="3" offset-md="3">
            <IonLabel class="section-title">Edat gestacional del nadó</IonLabel>
            <IonRow>
              <IonCol class="ion-no-padding">
                <IonLabel class="input-label">Setmanes</IonLabel>
                <IonInput v-model.number="setmanes" class="custom-input" />
              </IonCol>
              <IonCol class="ion-no-padding ion-padding-horizontal">
                <IonLabel class="input-label">Dies</IonLabel>
                <IonInput v-model.number="dies" class="custom-input" />
              </IonCol>
            </IonRow>
          </IonCol>
        </IonRow>

        
      </IonGrid>
    </IonContent>

    <IonFooter class="footer">
      <IonToolbar>
        <IonGrid>
          <IonRow>
            <IonCol size="12" size-lg="6" offset-lg="3">
              <IonButton fill="outline" expand="block" size="large" shape="round" class="register-button" @click="Registre">
                Continuar
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonToolbar>
    </IonFooter>
    
  </IonPage>
</template>

<script setup lang="ts">
import {
  IonPage, IonFooter, IonContent, IonHeader, IonGrid, IonCol, IonRow,
  IonText, IonToolbar, IonTitle, IonItem, IonInput, IonLabel,
  IonCard, IonButton, IonCardContent
} from '@ionic/vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// Firebase
import { db, auth } from '@/services/firebase'
import { collection, addDoc } from 'firebase/firestore'
import offlineService from '@/services/offline.service'

const router = useRouter()

const nomNado = ref('')
const setmanes = ref<number | null>(null)
const dies = ref<number | null>(null)

const Registre = async () => {
  try {
    const user = auth.currentUser
    if (!user) throw new Error('Usuari no autenticat')

    // Guardem el nadó dins la subcol·lecció "nados" de l’usuari
    const nadoData = {
      name: nomNado.value,
      setmanes: setmanes.value,
      dies: dies.value,
      createdAt: new Date()
    }

    const fallbackUid = localStorage.getItem('uid')
    const userIdToUse = user.uid ?? fallbackUid ?? ''
    if (navigator.onLine) {
      const docRef = await addDoc(collection(db, 'users', userIdToUse, 'nados'), nadoData)
      console.log('Nadó desat:', nadoData)
      // Guardem l'id del nadó per reutilitzar-lo
      localStorage.setItem('selectedNado', docRef.id)
      localStorage.setItem('selectedNadoName', nomNado.value)
      
      try {
        const raw = localStorage.getItem('localNados')
        const list = raw ? JSON.parse(raw) : []
        list.push({ id: docRef.id, name: nomNado.value })
        localStorage.setItem('localNados', JSON.stringify(list))
      } catch (e) { console.warn('Error caching local nados', e) }
    } else {
      // Crear id temporal local
      const tempId = `local-${Date.now()}-${Math.random().toString(36).slice(2,6)}`
      localStorage.setItem('selectedNado', tempId)
      localStorage.setItem('selectedNadoName', nomNado.value)
      try {
        const raw = localStorage.getItem('localNados')
        const list = raw ? JSON.parse(raw) : []
        list.push({ id: tempId, name: nomNado.value })
        localStorage.setItem('localNados', JSON.stringify(list))
      } catch (e) { console.warn('Error caching local nados', e) }
      // include temp id so processor can map it to the created server id
      offlineService.addPending('nados', { ...nadoData, __tempId: tempId }, userIdToUse)
      console.log('Nadó guardat localment per sincronitzar després')
    }

    router.push('/funcionalitats')
  } catch (err: any) {
    console.error('Error desant el nadó:', err)
    alert('Error desant el nadó: ' + err.message)
  }
}
</script>

<style scoped>

.capçalera{
  color: #26a69a;
}

.header-logo{
  vertical-align: middle;
}

.title, .section-title {
  font-weight: bold;
  font-family: "Nunito",sans-serif;
}

.input-label {
  font-weight: bold;
  font-family: "Nunito",sans-serif;
  color: grey;
}

.section-title {
  display: block;
  margin-bottom: 8px;
}

.input-item {
  border: 1px solid #38ffcd;
  border-radius: 10px;
  --background: #fff;
}

.input-box, .custom-input {
  font-size: 16px;
  --highlight-height: 0;
  --padding-start: 10px;
  border: 1px solid #38ffcd;
  border-radius: 10px;
}

.footer{
  box-shadow: none;
}

.register-button {
  --background: #e3f2fd;
  --color: #26a69a;
  --border-radius: 10px;
  --border-width: 1px;
  --border-color: #90caf9;
  font-weight: 600;
  text-transform: none;
  height: 70px;
}
</style>
