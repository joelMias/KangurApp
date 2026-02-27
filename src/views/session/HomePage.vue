<template>
  <AppLayout>
    <template #actions>
      <IonButton @click="router.push('/perfil')">
        <IonIcon :icon="menuOutline"></IonIcon>
      </IonButton>
    </template>
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
    
    <hr>
    
    <template #footer>
      <IonFooter class="footer">
        <IonToolbar>
          <IonGrid>
            <IonRow class="ion-justify-content-center">
              <IonCol size="auto">
                <IonButton fill="outline" class="footer-button" @click="openUserGuide">
                  <IonLabel>Per saber-ne més</IonLabel>
                  <IonIcon :icon="documentTextOutline" size="large" slot="end"/>
                </IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonToolbar>
      </IonFooter>
    </template>
  </AppLayout>
</template>


<script setup lang="ts">
import { IonButton, IonIcon, IonFooter, IonToolbar, IonLabel, IonCol, IonRow, IonGrid} from '@ionic/vue'
import AppLayout from '@/components/AppLayout.vue'
import { businessOutline, documentTextOutline, menuOutline } from 'ionicons/icons'
import { useRouter } from 'vue-router'


const router = useRouter()

const iniciar = () => {
router.push('/cronometre')
}

const registre = async () => {
router.push('/registerEntrada')
}

const openUserGuide = () => {
  router.push('/pdf-viewer')
}

</script>

<style scoped>
</style>

