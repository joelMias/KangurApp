<template>
  <IonPage>
    <IonHeader>
      <IonToolbar class="capçalera">
        <IonButtons slot="start">
          <IonButton @click="router.back()">
            <IonIcon :icon="arrowBackOutline" />
          </IonButton>
        </IonButtons>
        <IonTitle>Guia per l'usuari</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent fullscreen>
      <iframe :src="pdfUrl" title="Guia per l'usuari"/>
    </IonContent>
  </IonPage>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonTitle, IonContent } from '@ionic/vue'
import { arrowBackOutline } from 'ionicons/icons'

const router = useRouter()
const pdfUrl = ref('/Guia per l\'usuari.pdf')
</script>

<style scoped>
iframe {
  width: 100%;
  height: 100%;
  border: none;
}
</style>
