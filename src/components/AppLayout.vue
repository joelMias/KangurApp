<template>
  <IonPage>
    <IonHeader>
      <IonToolbar class="capçalera">
        <IonButtons v-if="showBack" slot="start">
          <IonButton @click="handleBack">
            <IonIcon :icon="arrowBackOutline" />
          </IonButton>
        </IonButtons>

        <IonTitle>
          <img src="/src/assets/kangur_resized.jpg" class="header-logo" alt="logo" />
          KANGURAPP
        </IonTitle>

        <IonButtons v-if="$slots.actions" slot="end">
          <slot name="actions" />
        </IonButtons>
      </IonToolbar>
    </IonHeader>

    <IonContent :class="contentClass">
      <slot />
    </IonContent>

    <slot name="footer" />
  </IonPage>
</template>

<script setup lang="ts">
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonButton, IonIcon
} from '@ionic/vue'
import { arrowBackOutline } from 'ionicons/icons'
import { useRouter } from 'vue-router'

const props = withDefaults(defineProps<{
  showBack?: boolean
  backRoute?: string
  contentClass?: string
}>(), {
  showBack: false,
  backRoute: '',
  contentClass: ''
})

const router = useRouter()

const handleBack = () => {
  if (props.backRoute) {
    router.push(props.backRoute)
  } else {
    router.back()
  }
}
</script>

<style scoped>
.capçalera {
  color: #26a69a;
}

.header-logo {
  vertical-align: middle;
}
</style>
