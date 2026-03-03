<template>
  <IonPage>
    <IonContent fullscreen :scroll-y="false">
      <div class="page-wrapper">
        <div class="centered-wrapper">
          <div class="logo-section">
            <img src="/src/assets/kangur_new.png" alt="KangurApp Logo" class="logo-img" />
            <h1 class="app-title">KANGURAPP</h1>
            <p class="app-description">
              Registra i monitoritza els moments de pell amb pell del teu nadó per fer un seguiment del seu desenvolupament i benestar.
            </p>
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
        <div class="logo-footer">
          <img src="https://icsgirona.cat/sites/default/files/logo-site/logo-ics.svg" alt="ICS Girona Logo" class="footer-logo" />
        </div>     
      </div>
    </IonContent>
  </IonPage>
</template>

<script setup lang="ts">
import { IonButton, IonPage, IonContent } from '@ionic/vue'
</script>

<style scoped>
.page-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
}

.app-description {
  text-align: center;
  font-size: 14px;
  color: #666;
  margin: 12px 0 0 0;
  max-width: 280px;
  line-height: 1.4;
  padding: 0 16px;
}

.logo-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px 0;
}

.footer-logo {
  height: 32px;
  width: auto;
  opacity: 0.7;
}
</style>