<template>
  <AppLayout :show-back="true" back-route="/HomePage" :scroll-y="false">
    <div class="centered-wrapper">
      <h2 class="titol">Iniciar pell amb pell</h2>
      <div class="ion-text-center">
        <img src="/src/assets/kangur.jpg" alt="KangurApp Logo"
              :class="{ 'imatge_pulse': estaActiu }"
              class="crono-img" />
      </div>

      <div class="ion-text-center">
        <h1 class="crono-time">{{ formatTime(temps) }}</h1>
      </div>

      <div class="ion-text-center crono-btn-row">
        <!-- <IonButton size="large" shape="round" fill="outline"
          :color="estaActiu ? 'danger' : 'primary'"
          @click="toggleCronometre">
          {{ estaActiu ? 'Aturar' : 'Iniciar' }}
        </IonButton> -->
        <IonButton expand="block" fill="outline" 
          :class="estaActiu ? 'big-button danger-outline-button negreta' : 'big-button green-button negreta'"
          @click="toggleCronometre">
          {{ estaActiu ? 'Aturar' : 'Iniciar' }}
        </IonButton>
      </div>

      <!-- <div v-if="estaActiu" class="ion-text-center">
        <transition name="slide" mode="out-in">
          <IonCard class="marquesina-card" :key="messageKey">
            <IonCardContent class="ion-text-center">
              <strong>{{ currentMessage }}</strong>
            </IonCardContent>
          </IonCard>
        </transition>
      </div> -->
    </div>

    <template #footer>
      <IonFooter class="footer" v-if="estaActiu">
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

      <IonFooter class="footer" v-if="!estaActiu">
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
    </template>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { IonIcon, IonLabel, IonToolbar, IonButton, IonFooter, IonGrid, IonRow, IonCol, IonCard, IonCardContent } from '@ionic/vue'
import { documentTextOutline } from 'ionicons/icons'
import AppLayout from '@/components/AppLayout.vue'
import { useRouter } from 'vue-router'
import { setCronoTemp } from '@/stores/temps'
import marquesinaData from '@/data/marquesina.json'

const router = useRouter()
const temps = ref(0)
const estaActiu = ref(false)

let cronoInterval: ReturnType<typeof setInterval> | null = null
let messageInterval: ReturnType<typeof setInterval> | null = null

const messages = marquesinaData.messages

const messageIndex = ref(0)
const currentMessage = ref(messages[0])
const messageKey = ref(`msg-${messageIndex.value}`)

const openUserGuide = () => {
  //window.open('/Guia per l\'usuari.pdf', '_blank')
  router.push('/pdf-viewer')
}

function startCrono() {
  estaActiu.value = true
  cronoInterval = setInterval(() => { temps.value += 1 }, 1000)
  messageIndex.value = 0
  currentMessage.value = messages[0]
  messageKey.value = `msg-0`
  messageInterval = setInterval(() => {
    messageIndex.value = (messageIndex.value + 1) % messages.length
    currentMessage.value = messages[messageIndex.value]
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
    startCrono()
  }
}

const formatTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`
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
</style>
