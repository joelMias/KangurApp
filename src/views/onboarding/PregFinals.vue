<template>
  <AppLayout :show-back="true" back-route="/cangurs" content-class="ion-padding">
    <RegistrationProgress :current-step="4" />

    <IonGrid>
      <IonRow class="ion-justify-content-center">
        <IonCol size="12" size-md="6" size-lg="5">
          <IonText color="dark">
            <h2 class="titol">Sobre el moment del part</h2>
          </IonText>

          <IonCard class="mini-card ion-margin-top ion-no-margin">
            <IonCardContent>
              <IonLabel class="input-label ion-text-wrap">
                <strong>Vas poder fer pell amb pell immediatament després del part/cesària?</strong>
              </IonLabel>

              <IonRadioGroup v-model="fetImmediat">
                <IonItem lines="none">
                  <IonLabel>Sí</IonLabel>
                  <IonRadio slot="start" value="si" color="primary"/>
                </IonItem>
                <IonItem lines="none">
                  <IonLabel>No</IonLabel>
                  <IonRadio slot="start" value="no" />
                </IonItem>
              </IonRadioGroup>

              <div v-if="fetImmediat === 'si'" class="ion-margin-top">
                <IonLabel position="stacked" class="input-label"><strong>Quant de temps (minuts)?</strong></IonLabel>
                <IonInput 
                  v-model="tempsImmediat" 
                  type="number" 
                  placeholder="Ex: 60" 
                  fill="outline"
                  class="input-box" 
                />
              </div>
            </IonCardContent>
          </IonCard>

          <IonButton expand="block" size="large" @click="finishRegister" class="ion-margin-top" :disabled="!isValid || loading">
            <IonSpinner v-if="loading" name="crescent" />
            <span v-else>Finalitzar registre</span>
          </IonButton>
        </IonCol>
      </IonRow>
    </IonGrid>

    <IonModal :is-open="showSummaryModal" @didDismiss="showSummaryModal = false">
      <IonContent class="ion-padding">
        <h2 style="text-align: center;">Resum del registre</h2>
        <hr />
        <p><strong>Nom:</strong> {{ userSummary.name }}</p>
        <p><strong>Email:</strong> {{ userSummary.email }}</p>

        <h3>Nadons</h3>
        <ul v-if="userSummary.nadons.length">
          <li v-for="n in userSummary.nadons" :key="n.id">{{ n.name }}</li>
        </ul>
        <p v-else>-</p>

        <h3>Cangurs</h3>
        <ul v-if="userSummary.cangurs.length">
          <li v-for="c in userSummary.cangurs" :key="c.id">{{ c.nom }} ({{ c.parentesc }})</li>
        </ul>
        <p v-else>-</p>

        <IonButton expand="block" class="ion-margin-top" @click="confirmFinish" :disabled="loading">
          <IonSpinner v-if="loading" name="crescent" />
          <span v-else>Confirmar i finalitzar</span>
        </IonButton>
        
        <IonButton fill="clear" expand="block" @click="showSummaryModal = false" :disabled="loading">
          Tornar enrere
        </IonButton>
      </IonContent>
    </IonModal>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  IonText, IonGrid, IonCol, IonRow, IonLabel, IonRadio, 
  IonRadioGroup, IonItem, IonInput, IonButton, IonCard, 
  IonCardContent, IonContent, IonModal, IonSpinner 
} from '@ionic/vue'
import AppLayout from '@/components/AppLayout.vue'
import RegistrationProgress from '@/components/RegistrationProgress.vue'
import { db, auth } from '@/services/firebase'
import { doc, updateDoc } from 'firebase/firestore'

const router = useRouter()
const fetImmediat = ref<string | null>(null)
const tempsImmediat = ref<number | null>(null)
const loading = ref(false)
const showSummaryModal = ref(false)

const userSummary = ref({
  name: '',
  email: '',
  nadons: [] as any[],
  cangurs: [] as any[]
})

onMounted(() => {
  userSummary.value.name = localStorage.getItem('name') || ''
  userSummary.value.email = localStorage.getItem('email') || ''

  try {
    const nadonsRaw = localStorage.getItem('localnadons') || '[]'
    const cangursRaw = localStorage.getItem('localCangurs') || '[]'
    
    userSummary.value.nadons = JSON.parse(nadonsRaw)
    userSummary.value.cangurs = JSON.parse(cangursRaw)
  } catch (e) {
    console.warn("Error al parsejar dades del localStorage", e)
  }
})

function finishRegister() {
  showSummaryModal.value = true
}

async function confirmFinish() {
  if (loading.value) return;
  
  await finalitzar()
  showSummaryModal.value = false
  router.replace('/login')
}

const isValid = computed(() => {
    if (fetImmediat.value === 'no') return true
    if (fetImmediat.value === 'si' && tempsImmediat.value !== null && Number(tempsImmediat.value) > 0) return true
    return false
})

const finalitzar = async () => {
  loading.value = true
  
  const user = auth.currentUser
  const uid = user?.uid || localStorage.getItem('uid')

  if (!uid) {
    console.error("No s'ha trobat el UID de l'usuari")
    loading.value = false
    return
  }

  try {
    const dadesEnquesta = {
      pellAmbPellImmediat: fetImmediat.value,
      tempsPellAmbPellImmediat: fetImmediat.value === 'si' ? Number(tempsImmediat.value) : 0,
      setupCompletat: true,
      dataRegistreFinalitzat: new Date()
    }

    const userRef = doc(db, 'users', uid)
    await updateDoc(userRef, dadesEnquesta)
    
    console.log("Registre finalitzat amb èxit")
    
  } catch (e: any) {
    console.error("Error guardant enquesta:", e)
    alert("Error al finalitzar: " + e.message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
ion-radio {
    --size: 20px;
  --color: #ccc;
  --color-checked: var(--ion-color-primary);
  width: 20px;
  height: 20px;
}

ion-radio::part(container) {
  border: 2px solid var(--color);
  border-radius: 50%;
  width: 20px;
  height: 20px;
}

ion-radio.radio-checked::part(container) {
  border-color: var(--color-checked);
}
</style>