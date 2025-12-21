<script setup lang="ts">
import { IonHeader, IonPage, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon } from '@ionic/vue';
import { menuOutline } from 'ionicons/icons'
import { useRouter } from 'vue-router'

const router = useRouter()

</script>

<template>
    <IonPage>
        <IonHeader>
            <IonToolbar>
                <IonTitle class="capçalera"> <img src="/src/assets/kangur_resized.jpg" class="header-logo">KANGURAPP</IonTitle>
                <IonButtons slot="end">
                <IonButton @click="router.push('/historial')">
                    <IonIcon :icon="menuOutline"></IonIcon>
                </IonButton>
                </IonButtons>
            </IonToolbar>
        </IonHeader>
    </IonPage>
</template>