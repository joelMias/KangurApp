<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { signOut } from 'firebase/auth'
import { auth } from '@/services/firebase'
import authService from '@/services/auth.service'

const router = useRouter()

onMounted(async () => {
  // Verificar si el token ha caducat
  const isValid = await authService.isTokenValid()
  if (!isValid && auth.currentUser) {
    // Si el token està caducat o no existeix es fa logout
    await signOut(auth)
    await authService.removeToken()
    router.push('/login')
  }
})
</script>
