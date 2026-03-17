<template>
  <AppLayout :show-back="true" back-route="/HomePage" :scroll-y="false">
    <div class="centered-wrapper">
      <h2 class="titol">Iniciar pell amb pell</h2>
      <div class="ion-text-center">
        <img src="/src/assets/kangur_new.png" alt="KangurApp Logo"
              :class="{ 'imatge_pulse': estaActiu }"
              class="crono-img" />
      </div>

      <div class="ion-text-center">
        <h1 class="crono-time">{{ formatTime(temps) }}</h1>
      </div>

      <div class="ion-text-center crono-btn-row">     
        <IonButton expand="block"
          :fill="estaActiu ? 'outline' : 'solid'"
          :color="estaActiu ? 'danger' : 'primary'"
          size="large"     
          @click="toggleCronometre">
          {{ estaActiu ? 'Aturar' : 'Iniciar' }}
        </IonButton>
      </div>
    </div>

    <template #footer>
      <IonFooter class="footer" v-show="estaActiu">
        <IonToolbar>
          <IonGrid>
            <IonRow class="ion-justify-content-center">
              <IonCol size="auto">
                <transition name="slide" mode="out-in">
                  <IonCard class="marquesina-card" :key="messageKey">
                    <IonCardContent class="ion-text-center">
                      <strong>{{ currentMessage }}</strong>
                    </IonCardContent>
                  </IonCard>
                </transition>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonToolbar>
      </IonFooter>

      <IonFooter class="footer" v-show="!estaActiu">
        <IonToolbar>
          <IonGrid>
            <IonRow class="ion-justify-content-center">
              <IonCol size="auto">
                <IonButton fill="outline" class="footer-button" @click="openUserGuide">
                  <IonLabel>Per saber-ne més</IonLabel>
                  <IonIcon :icon="documentTextOutline" size="large" slot="end"/>
                </IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonToolbar>
      </IonFooter>

      <IonToast :is-open="showErrorToast" :message="errorMessage" :duration="3000" position="bottom" @didDismiss="showErrorToast = false" color="danger" />
    </template>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onUnmounted, onMounted } from 'vue'
import { IonIcon, IonLabel, IonToolbar, IonButton, IonFooter, IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonToast } from '@ionic/vue'
import { documentTextOutline } from 'ionicons/icons'
import AppLayout from '@/components/AppLayout.vue'
import { useRouter } from 'vue-router'
import { setCronoTemp } from '@/stores/temps'

// Firebase
import { db, auth } from '@/services/firebase'
import { collection, getDocs } from 'firebase/firestore'

const router = useRouter()
const temps = ref(0)
const estaActiu = ref(false)
const cangurs = ref<{ id: string; name: string }[]>([])
const showErrorToast = ref(false)
const errorMessage = ref('')

let cronoInterval: ReturnType<typeof setInterval> | null = null
let messageInterval: ReturnType<typeof setInterval> | null = null

const messages = ref<string[]>([])

const messageIndex = ref(0)
const currentMessage = ref('')
const messageKey = ref(`msg-${messageIndex.value}`)

onMounted(async () => {
  const user = auth.currentUser
  if (!user) return

  try {
    const snapshot = await getDocs(collection(db, 'users', user.uid, 'cangurs'))
    cangurs.value = snapshot.docs.map(d => ({ id: d.id, name: d.data().name }))

    //Recollida de marquesines de firebase colection
    const marquesinesSnapshot = await getDocs(collection(db, 'marquesines'))
    messages.value = marquesinesSnapshot.docs.map(d => d.data().missatge)

    if (messages.value.length > 0) {
      currentMessage.value = messages.value[0]
      messageKey.value = `msg-0`
    }
  } catch (e) {
    console.warn('Error loading data:', e)
  }
})

const openUserGuide = () => {
  //window.open('/Guia per l\'usuari.pdf', '_blank')
  router.push('/pdf-viewer')
}

function startCrono() {
  if(messages.value.length === 0) return

  estaActiu.value = true
  cronoInterval = setInterval(() => { temps.value += 1 }, 1000)

  messageIndex.value = 0
  currentMessage.value = messages.value[0]
  messageKey.value = `msg-0`

  messageInterval = setInterval(() => {
    messageIndex.value = (messageIndex.value + 1) % messages.value.length
    currentMessage.value = messages.value[messageIndex.value]
    messageKey.value = `msg-${messageIndex.value}`
  }, 8000)
}

function stopCrono() {
  estaActiu.value = false
  if (cronoInterval) clearInterval(cronoInterval)
  if (messageInterval) clearInterval(messageInterval)
  cronoInterval = null
  messageInterval = null
}

const toggleCronometre = () => {
  if (estaActiu.value) {
    stopCrono()
    setCronoTemp(temps.value)
    router.push({ path: '/guardarCrono', query: { temps: String(temps.value) } })
    temps.value = 0
  } else {
    // Check if any cangurs are defined
    if (cangurs.value.length === 0) {
      errorMessage.value = 'Has de definir almenys un cangur a la configuració'
      showErrorToast.value = true
      return
    }
    startCrono()
  }
}

const formatTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`
}

onUnmounted(() => stopCrono())
</script>

<style scoped>

.crono-img {
  max-width: 220px;
  width: 100%;
}

.crono-time {
  font-size: 2.8rem;
  font-weight: 700;
  letter-spacing: 2px;
  margin: 0;
}

.crono-btn-row {
  width: 100%;
  max-width: 260px;
}

.marquesina-card {
  border: 2px solid var(--ion-color-primary, #26a69a);
  border-radius: 12px;
  margin: 0 auto;
   z-index: 1;
}

.imatge_pulse {
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.15); opacity: 1; }
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.6s ease;
}
.slide-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}
.slide-enter-to {
  transform: translateX(0);
  opacity: 1;
}
.slide-leave-from {
  transform: translateX(0);
  opacity: 1;
}
.slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.footer{
   z-index: 10;
}
</style>
