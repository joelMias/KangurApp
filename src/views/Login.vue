<template>
  <IonPage>
    <IonHeader>
      <IonToolbar class="capçalera">
        <IonButtons slot="start">
          <IonButton @click="router.push('/inici')">
            <IonIcon :icon="arrowBackOutline"></IonIcon>
          </IonButton>
        </IonButtons>
        <IonTitle> <img src="/src/assets/kangur_resized.jpg" class="header-logo">KANGURAPP</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent class="ion-padding">
      <IonGrid>
        <IonRow class="ion-justify-content-center">
          <IonCol size="12" size-md="6" size-lg="5">
            <IonText color="dark">
              <h2 class="form-title">Inicia sessió</h2>
            </IonText>

            <strong><IonLabel position="stacked" class="input-label">Correu electrònic</IonLabel></strong>
            <IonInput v-model="email" type="email" placeholder="usuari@exemple.com" fill="outline" class="input-box"/>

            <strong><IonLabel position="stacked" class="input-label">Contrasenya</IonLabel></strong>
            <IonInput v-model="password" type="password" placeholder="Contrasenya" fill="outline" class="input-box"/>
          </IonCol>
        </IonRow>
        
        <IonRow class="ion-justify-content-center">
          <IonCol size="12" size-md="6" size-lg="5">
            <IonButton fill="outline" expand="full" size="large" shape="round" class="continuar-button" @click="Login">
              Continuar
            </IonButton>
            <div style="text-align:center; margin-top:8px;">
              <IonButton fill="clear" size="small" @click="router.push('/reset-password')">He oblidat la contrasenya</IonButton>
            </div>
          </IonCol>
        </IonRow>
      </IonGrid>

      <IonLoading :is-open="loading" message="Validant credencials..." spinner="crescent"/>
      <IonToast :is-open="showToast" :message="toastMessage" duration="3000" color="danger" @didDismiss="showToast = false" />
    </IonContent>
  </IonPage>
</template>

<script setup lang="ts">
import {IonPage, IonContent, IonIcon, IonButtons, IonLabel, IonInput, IonButton, IonHeader, IonToolbar, IonTitle, IonGrid, IonRow, IonCol, IonText, IonLoading, IonToast} from '@ionic/vue';
import { ref } from 'vue'
import { arrowBackOutline } from 'ionicons/icons'
import { useRouter } from 'vue-router'
import authService from '@/services/auth.service'
import { onIonViewWillEnter } from '@ionic/vue'

const router = useRouter();

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');
const showToast = ref(false)
const toastMessage = ref('')

onIonViewWillEnter(() => {
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
    router.push('/funcionalitats')
  } catch (err) {
    console.error(err)
    error.value = 'Credencials incorrectes.'
    toastMessage.value = error.value
    showToast.value = true
  } finally {
    loading.value = false
  }
}
</script>


<style scoped>

.form-title {
  text-align: center;
  margin-bottom: 32px;
  font-size: 22px;
  font-weight: 600;
}

.input-label {
  color:grey;
  font-family: 'Nunito', sans-serif;
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