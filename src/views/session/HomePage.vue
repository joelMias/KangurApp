<template>
  <AppLayout :scroll-y="false">
    <template #actions>
      <IonButton @click="router.push('/perfil')">
        <IonIcon :icon="menuOutline"></IonIcon>
      </IonButton>
    </template>

    <div class="centered-wrapper">
      <div class="centered-content">
        <IonButton fill="outline" size="large" expand="block" @click="iniciar" class="big-button green-button">
          <div class="button-content">
            <div class="button-icon">
              <img src="/src/assets/kangur_new_petit.png" />
            </div>
            <strong><IonLabel>Iniciar pell amb pell</IonLabel></strong>
          </div>
        </IonButton>

        <!--<IonButton fill="outline" size="large" expand="block" @click="registre" class="big-button green-button">
          <div class="button-content">
            <div class="button-icon">
              <IonIcon :icon="businessOutline" size="large" />
            </div>
            <strong><IonLabel>Registre entrada unitat</IonLabel></strong>
          </div>
        </IonButton>-->
      </div>
    </div>
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
