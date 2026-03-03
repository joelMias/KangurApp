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
          <img src="/src/assets/kangur_no_background.png" class="header-logo" alt="logo" />
          <strong>KANGURAPP</strong>
        </IonTitle>

        <IonButtons v-if="$slots.actions" slot="end">
          <slot name="actions" />
        </IonButtons>
      </IonToolbar>
    </IonHeader>

    <IonContent :class="contentClass" fullscreen :scroll-y="scrollY">
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
  scrollY?: boolean
}>(), {
  showBack: false,
  backRoute: '',
  contentClass: '',
  scrollY: true
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
  --min-height: 70px;
  height: 70px;
}

.header-logo {
  vertical-align: middle;
}

hr {
  border: none;
  height: 8px;
  background-color: #b3e5fc;
  border-radius: 4px;
  margin: 16px auto;
  width: 90%;
  max-width: 300px;
}
</style>
