<template>
  <AppLayout :scroll-y="false">
    <div class="centered-wrapper">
      <div class="logo-section">
        <img src="/src/assets/kangur.jpg" alt="KangurApp Logo" class="logo-img" />
        <h1 class="app-title">KANGURAPP</h1>
      </div>
      <div class="form-section">
        <IonButton expand="block" size="large" size-md="5" fill="outline" color="primary" router-link="/register">
          Registrar-se
        </IonButton>
        <IonButton expand="block" size="large" size-md="5" fill="outline" color="primary" router-link="/login">
          Iniciar sessió
        </IonButton>
      </div>     
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { IonButton } from '@ionic/vue'
import AppLayout from '@/components/AppLayout.vue'
</script>