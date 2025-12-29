<template>
  <IonPage>
    <IonHeader>
      <IonToolbar class="capçalera">
        <IonTitle> <img src="/src/assets/kangur_resized.jpg" class="header-logo">KANGURAPP</IonTitle>
        <IonButtons slot="start">
          <IonButton @click="router.push('/funcionalitats')">
            <IonIcon :icon="arrowBackOutline"></IonIcon>
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>

    <IonContent fullscreen class="ion-text-center">
      <IonGrid>
        <IonRow class="ion-justify-content-center">
          <IonCol size="12">
            <img src="/src/assets/kangur.jpg" alt="KangurApp Logo"
                 :class="{ 'imatge_pulse': estaActiu }"
                 style="max-width:300px" />
          </IonCol>
        </IonRow>

        <IonRow class="ion-justify-content-center">
          <IonCol size="7">
            <IonButton expand="block" size="large" shape="round" fill="outline" :color="estaActiu ? 'danger' : 'success'" @click="toggleCronometre">
              {{ estaActiu ? 'Aturar' : 'Iniciar' }}
            </IonButton>
          </IonCol>
        </IonRow>

        <IonRow>
          <IonCol class="ion-text-center">
            <h1>{{ formatTime(temps) }}</h1>
          </IonCol>
        </IonRow>

        <IonRow v-if="estaActiu" class="ion-justify-content-center">
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
    </IonContent>

    <IonFooter class="footer" v-if="!estaActiu">
      <IonToolbar>
        <IonGrid>
          <IonRow class="ion-justify-content-center">
            <IonCol size="auto">
              <IonButton fill="outline" class="footer-button">
                <IonLabel>Per saber-ne més</IonLabel>
                <IonIcon :icon="documentTextOutline" size="large" slot="end"/>
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonToolbar>
    </IonFooter>
  </IonPage>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { IonPage, IonButtons, IonIcon, IonLabel, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonFooter, IonGrid, IonRow, IonCol, IonCard, IonCardContent } from '@ionic/vue'
import { arrowBackOutline, documentTextOutline } from 'ionicons/icons'
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

.capçalera{
  color: #26a69a;
}

.header-logo{
  vertical-align: middle;
}

.marquesina-card {
  border: 2px solid #26a69a;
  border-radius: 12px;
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
  box-shadow: none;
}

.footer-button{
  --border-color: #000;
  --border-width: 1px;
  --color: #000;
  --border-radius: 12px;
  text-transform: none;
  font-weight: 500;
  font-size: 14px;
}
</style>
