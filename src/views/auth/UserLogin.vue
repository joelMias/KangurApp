<template>
  <AppLayout :show-back="true" back-route="/initialPage" :scroll-y="false">
      <div class="centered-wrapper">

        <div class="logo-section">
          <img src="/src/assets/kangur_new.png" alt="KangurApp Logo" class="logo-img" />
          <h1 class="app-title">KANGURAPP</h1>
        </div>

        <div class="form-section">

          <div class="input-group">                  
            <IonLabel position="stacked" class="input-label">Correu electrònic</IonLabel>            
            <IonInput v-model="email" type="email" placeholder="usuari@exemple.com" fill="outline" class="input-box ion-margin-top ion-margin-bottom"/>        
            <IonLabel position="stacked" class="input-label">Contrasenya</IonLabel>
            <IonInput v-model="password" type="password" placeholder="Contrasenya" fill="outline" class="input-box  ion-margin-top ion-margin-bottom"/>
          </div>
          <br>
          <IonButton expand="block" size="large" fill="solid" color="primary" @click="Login">
            Inicia sessió
          </IonButton>
          
          
          <IonButton fill="outline" @click="router.push('/reset-password')" color="medium">He oblidat la contrasenya</IonButton>
          
        </div>

      </div>

      <IonLoading :is-open="loading" message="Validant credencials..." spinner="crescent"/>
      <IonToast :is-open="showToast" :message="toastMessage" duration="3000" color="danger" @didDismiss="showToast = false" />
    </AppLayout>
</template>

<script setup lang="ts">
import {IonLabel, IonInput, IonButton, IonLoading, IonToast, onIonViewWillEnter} from '@ionic/vue';
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import authService from '@/services/auth.service'
import AppLayout from '@/components/AppLayout.vue'

const router = useRouter();

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');
const showToast = ref(false)
const toastMessage = ref('')

onIonViewWillEnter(async () => {
  // Es comprova si hi ha una sessió vàlida
  const isValid = await authService.isTokenValid()
  if (isValid) {
    // Si la sessió és vàlida es va a funcionalitats directament sense haver de fer login
    router.push('/HomePage')
    return
  }
  
  // Si no, netejar els camps
  email.value = ''
  password.value = ''
})

const Login = async () => {
  error.value = ''

  if (!email.value || !password.value) {
    error.value = 'Omple tots els camps.'
    return
  }

  loading.value = true

  try {
    await authService.login({email: email.value,password: password.value})
    router.push('/HomePage')
  } catch (err: any) {
    console.error(err)
    // Show actual error message from service or fallback to generic message
    error.value = err?.message || 'Credencials incorrectes.'
    toastMessage.value = error.value
    showToast.value = true
  } finally {
    loading.value = false
  }
}
</script>