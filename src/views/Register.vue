<template>
  <IonPage>
    <IonHeader>
      <IonToolbar class="capçalera">
        <IonButtons slot="start">
          <IonButton @click="router.push('/inici')">
            <IonIcon :icon="arrowBackOutline"></IonIcon>
          </IonButton>
        </IonButtons>
        <IonTitle> <img src="/src/assets/kangur.jpg" class="header-logo">KANGURAPP</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent class="ion-padding">
      <IonGrid>
        <IonRow class="ion-justify-content-center">
          <IonCol size="12" size-md="6" size-lg="5">
            <IonText color="dark">
              <h2 class="form-title">Crea el teu compte</h2>
            </IonText>

            <strong><IonLabel position="stacked" class="input-label">Correu electrònic</IonLabel></strong>
            <IonInput v-model="email" type="email" placeholder="usuari@exemple.com" fill="outline" class="input-box"/>

            <strong><IonLabel position="stacked" class="input-label">Nom complet</IonLabel></strong>
            <IonInput v-model="name" type="text" placeholder="Escriu el teu nom complet" fill="outline" class="input-box"/>

            <strong><IonLabel position="stacked" class="input-label">Contrasenya</IonLabel></strong>
            <IonInput v-model="password" type="password" placeholder="Contrasenya" fill="outline" class="input-box"/>

            <strong><IonLabel position="stacked" class="input-label">Confirma la teva contrasenya</IonLabel></strong>
            <IonInput v-model="passwordConfirm" type="password" placeholder="Confirma la contrasenya" fill="outline" class="input-box"/>

            <IonButton expand="block" size="large" fill="outline" class="continuar-button" @click="Register">
              Continuar
            </IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>

      <!--<IonLoading :is-open="loading" message="Creant el compte..." spinner="crescent"/>-->

    </IonContent>
  </IonPage>
</template>

<script setup lang="ts">
import {
  IonPage, IonButtons, IonIcon, IonText, IonGrid, IonCol, IonRow,
  IonHeader, IonTitle, IonContent, IonLabel, IonInput, IonButton,
  IonToolbar, IonLoading
} from '@ionic/vue'
import { ref } from 'vue'
import { arrowBackOutline } from 'ionicons/icons'
import { useRouter } from 'vue-router'
import authService from '@/services/auth.service'

const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const loading = ref(false)
const error = ref('')

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

  console.log('Navegant cap a /cangurs...')
  router.push('/cangurs')
} catch (err: any) {
  console.error('Error en el registre:', err)
  error.value = err.message || 'Error en el registre. Torna-ho a intentar.'
} finally {
  console.log('Finalitzant registre, loading = false')
  loading.value = false
}

}
</script>

<style scoped>

.capçalera{
  color: #26a69a;
}

.header-logo{
  height: 40px;
  width: auto;
  vertical-align: middle;
}

.form-title {
  text-align: center;
  margin-bottom: 0px;
  font-size: 22px;
  font-weight: 600;
}

.input-label {
  color:grey;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  font-size: 18px;
  margin-bottom: 6px;
}

.input-box {
  --border-color: #26a69a;
  --highlight-color: #26a69a;
  --border-radius: 10px;
  --background: #fff;
  margin-bottom: 20px;
}

.continuar-button {
  --background: #e3f2fd;
  --color: #26a69a;
  --border-radius: 10px;
  --border-width: 1px;
  --border-color: #90caf9;
  font-weight: 600;
  text-transform: none;
}
</style>