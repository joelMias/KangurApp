<template>
  <IonPage>
    <IonContent fullscreen>
      <IonGrid>
        <IonRow class="ion-justify-content-center ion-align-items-center">
          <IonCol size="8" size-md="6" size-lg="4" class="ion-text-center">
            <img src="/src/assets/kangur.jpg" alt="KangurApp Logo" />
          </IonCol>

          <IonCol size="12" class="ion-text-center">
            <h1>KANGURAPP</h1>
          </IonCol>
        </IonRow>

        <IonRow>
          
        </IonRow>
      </IonGrid>

      <IonGrid>
        <IonRow class="ion-justify-content-center ion-padding">
          <IonCol size="5" size-sm="3">
            <IonButton expand="block" size="small" fill="clear" color="medium" router-link="/register">
              Registrar-se
            </IonButton>
          </IonCol>
          <IonCol size="5" size-sm="3">
            <IonButton expand="block" size="small" fill="clear" color="medium" router-link="/login">
              Iniciar sessió
            </IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonContent>
  </IonPage>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonButton, IonGrid, IonRow, IonCol } from '@ionic/vue'
</script>