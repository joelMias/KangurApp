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

    <IonContent>
      <IonGrid class="full-height">
        <IonRow class="ion-justify-content-center ion-align-items-center full-height">
          <IonCol size="12" size-md="8" size-lg="6" class="center-col">
            
            <IonRow>
              <IonCol class="ion-text-center">
                <IonButton fill="outline" size="large" expand="block" @click="iniciar" class="custom-button">
                  <IonGrid>
                    <IonRow class="ion-justify-content-center">
                      <IonCol size="12" class="ion-text-center">
                        <img src="/src/assets/kangur_no_background.png" />
                      </IonCol>
                    </IonRow>
                    <IonRow class="ion-justify-content-center">
                      <IonCol size="12" class="ion-text-center">
                        <strong><IonLabel>Iniciar pell amb pell</IonLabel></strong>
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                </IonButton>
              </IonCol>
            </IonRow>

            <IonRow class="ion-margin-top">
              <IonCol  class="ion-text-center">
                <IonButton fill="outline" size="large" expand="block" @click="registre" class="custom-button">
                  <IonGrid>
                    <IonRow class="ion-justify-content-center">
                      <IonCol size="12" class="ion-text-center">
                        <IonIcon :icon="businessOutline" size="large" />
                      </IonCol>
                    </IonRow>
                    <IonRow class="ion-justify-content-center">
                      <IonCol size="12" class="ion-text-center">
                        <strong><IonLabel>Registre entrada unitat</IonLabel></strong>
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                </IonButton>
              </IonCol>
            </IonRow>
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonContent>

    <IonFooter class="footer">
      <IonToolbar>
        <IonGrid>
          <IonRow class="ion-justify-content-center">
            <IonCol size="auto">
              <IonButton fill="outline" class="footer-button">
                <IonLabel>Per saber-ne més</IonLabel>
                <IonIcon :icon="documentTextOutline" size="large" slot="end"/>
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonToolbar>
    </IonFooter>
  </IonPage>
</template>


<script setup lang="ts">
import { IonPage, IonHeader, IonButtons, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonFooter, IonLabel, IonCol, IonRow, IonGrid} from '@ionic/vue'
import { businessOutline, documentTextOutline, menuOutline } from 'ionicons/icons'
import { useRouter } from 'vue-router'


const router = useRouter()

const iniciar = () => {
router.push('/cronometre')
}

const registre = async () => {
router.push('/registerEntrada')
}

</script>

<style scoped>

.full-height {
  height: 100%;
}

.custom-button {
  --background: #e6f3f2;
  --color: #4b9b90;
  --border-radius: 16px;
  --border-color: #377c73;
  --border-width: 1px;
  text-transform: none;
  font-size: 20px;
  --ion-font-family: "Nunito", sans-serif;
}

.footer-button {
  --border-color: #000;
  --border-width: 1px;
  --color: #000;
  --border-radius: 12px;
  text-transform: none;
  font-weight: 500;
  font-size: 14px;
}
</style>

