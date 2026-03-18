<template>
  <AppLayout :show-back="true" content-class="ion-padding">
      <IonGrid>
        <IonRow class="ion-justify-content-center">
          <IonCol size="12" size-md="6" size-lg="5">
            <IonText color="dark">
              <h2 class="titol">Restablir contrasenya</h2>
            </IonText>
            <strong><IonLabel position="stacked" class="input-label">Correu electrònic</IonLabel></strong>
            <IonInput v-model="email" type="email" placeholder="Introdueix el correu electrònic" fill="outline" class="input-box" />
            <IonButton fill="outline" expand="full" size="large" shape="round" class="continuar-button" @click="sendReset">
              Enviar correu de recuperació
            </IonButton>
            <IonToast :is-open="showToast" :message="toastMessage" color="primary" duration="3000" @didDismiss="showToast = false" />
          </IonCol>
        </IonRow>
      </IonGrid>
    </AppLayout>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/services/firebase'
import { IonButton, IonGrid, IonRow, IonCol, IonText, IonLabel, IonInput, IonToast } from '@ionic/vue'
import AppLayout from '@/components/AppLayout.vue'


const router = useRouter()
const email = ref('')
const showToast = ref(false)
const toastMessage = ref('')
const toastColor = ref<'success'|'danger'>('success')



const sendReset = async () => {
  if (!email.value) {
    toastMessage.value = 'Introdueix un correu vàlid.'
    showToast.value = true
    return
  }
  try {
    await sendPasswordResetEmail(auth, email.value)
    toastMessage.value = 'S\'ha enviat un correu de recuperació. Revisa el correu brossa per trobar el correu per restablir la contrasenya.'
    showToast.value = true
    setTimeout(() => router.back(), 1200)
  } catch (e: any) {
    console.error('password reset error', e)
    toastMessage.value = e?.message || 'Error a l\'hora d\'envianr el correu.'
    showToast.value = true
  }
}
</script>

<style scoped>
.header-logo{
  vertical-align: middle;
}

.titol {
    text-align: center;
    margin-bottom: 24px;
    font-size: 20px;
    font-weight: 600
}

.input-box {
    --border-color: #26a69a;
    --highlight-color: #26a69a;
    --border-radius: 10px;
    margin-bottom: 16px
}

.capçalera {
    color: #26a69a
}
</style>