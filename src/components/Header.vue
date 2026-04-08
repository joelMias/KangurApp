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
                <IonTitle class="capçalera"> <img src="/src/assets/kangur_new_petit.png" class="header-logo">KANGURAPP</IonTitle>
                <IonButtons slot="end">
                    <IonButton @click="router.push('/perfil')">
                        <IonIcon :icon="menuOutline"></IonIcon>
                    </IonButton>
                </IonButtons>
            </IonToolbar>
        </IonHeader>
    </IonPage>
</template>

<style scoped>
/* Respect safe area insets (notch / status bar) and ensure header isn't covered */
ion-header {
    padding-top: env(safe-area-inset-top);
    -webkit-padding-start: 0;
    box-sizing: border-box;
}

.capçalera {
    display: flex;
    align-items: center;
}

.header-logo {
    height: 28px;
    margin-right: 8px;
}
</style>