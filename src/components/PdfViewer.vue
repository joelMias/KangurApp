<template>
  <IonPage>
    <IonHeader>
      <IonToolbar class="capçalera">
        <IonButtons slot="start">
          <IonButton @click="router.back()">
            <IonIcon :icon="arrowBackOutline" />
          </IonButton>
        </IonButtons>
        <IonTitle>{{ title }}</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent fullscreen>
      <iframe :src="pdfUrl" :title="title"/>
    </IonContent>
  </IonPage>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { IonPage, IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonTitle, IonContent } from '@ionic/vue'
import { arrowBackOutline } from 'ionicons/icons'

const router = useRouter()

withDefaults(defineProps<{
  pdfUrl: string
  title?: string
}>(), {
  title: 'Guia per l\'usuari'
})
</script>

<style scoped>
  iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
</style>
