<template>
  <AppLayout :show-back="true" :scroll-y="false" back-route="/initialPage" content-class="ion-padding">
      <RegistrationProgress :current-step="1" />
      
      <IonGrid>
        <IonRow class="ion-justify-content-center">
          <IonCol size="12" size-md="6" size-lg="5">
            <IonText color="dark">
              <h2 class="titol">1. Crea el teu compte</h2>
            </IonText>

            <div v-if="error">
              <IonText color="danger">
                <p class="error-message">{{ error }}</p>
              </IonText>
            </div>

            <strong><IonLabel position="stacked" class="input-label">Correu electrònic</IonLabel></strong>
            <IonInput v-model="email" type="email" placeholder="usuari@exemple.com" fill="outline" class="input-box"/>

            <strong><IonLabel position="stacked" class="input-label">Nom complet</IonLabel></strong>
            <IonInput v-model="name" type="text" placeholder="Escriu el teu nom complet" fill="outline" class="input-box"/>

            <strong><IonLabel position="stacked" class="input-label">Contrasenya</IonLabel></strong>
            <IonInput v-model="password" type="password" placeholder="Contrasenya" fill="outline" class="input-box"/>

            <strong><IonLabel position="stacked" class="input-label">Confirma la teva contrasenya</IonLabel></strong>
            <IonInput v-model="passwordConfirm" type="password" placeholder="Confirma la contrasenya" fill="outline" class="input-box"/>
            <br>
            <IonButton expand="block" size="large" fill="outline" @click="Register" class="ion-margin-top" :disabled="loading">
              <IonSpinner v-if="loading" name="crescent"></IonSpinner>
              <span v-else>Continuar</span>
            </IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>

    </AppLayout>
</template>

<script setup lang="ts">
import { IonText, IonGrid, IonCol, IonRow, IonLabel, IonInput, IonButton, IonSpinner, onIonViewWillEnter } from '@ionic/vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import authService from '@/services/auth.service'
import AppLayout from '@/components/AppLayout.vue'
import RegistrationProgress from '@/components/RegistrationProgress.vue'

const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const loading = ref(false)
const error = ref('')

onIonViewWillEnter(() => {
  // Neteja els camps del formulari quan s'entra a la pàgina de registre
  name.value = ''
  email.value = ''
  password.value = ''
  passwordConfirm.value = ''
  error.value = ''
  // Elimina les dades d'usuari emmagatzemades localment durant el registre anterior 
  // per poder guardar després les noves dades
  try {
    localStorage.removeItem('uid')
    localStorage.removeItem('name')
    localStorage.removeItem('email')
    localStorage.removeItem('selectedNado')
    localStorage.removeItem('selectedNadoName')
  } catch (e) { console.warn(e) }
})

const Register = async () => {
  if (!name.value || !email.value || !password.value || !passwordConfirm.value) {
    error.value = 'Omple tots els camps.'
    return
  }

  if (password.value !== passwordConfirm.value) {
    error.value = 'Les contrasenyes no coincideixen.'
    return
  }

  loading.value = true
  error.value = ''

  try {
  const user = await authService.register({
    name: name.value,
    email: email.value,
    password: password.value
  })

  console.log('Usuari creat:', user)

  localStorage.setItem('uid', user.uid)
  localStorage.setItem('name', user.displayName || name.value)
  localStorage.setItem('email', user.email || email.value)
  localStorage.setItem('admin', 'false')

  console.log('Navegant cap a /nado...')
  router.push('/nado')
} catch (err: any) {
  console.error('Error en el registre:', err)
  error.value = err.message || 'Error en el registre. Torna-ho a intentar.'
} finally {
  console.log('Finalitzant registre, loading = false')
  loading.value = false
}

}
</script>