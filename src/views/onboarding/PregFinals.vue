<template>
    <AppLayout :show-back="true" back-route="/cangurs" content-class="ion-padding">
        <RegistrationProgress :current-step="4" />

        <IonGrid>
            <IonRow class="ion-justify-content-center">
                <IonCol size="12" size-md="6" size-lg="5">
                    <IonText color="dark">
                        <h2 class="titol">Sobre el moment del part</h2>
                    </IonText>

                    <IonCard class="mini-card ion-margin-top ion-no-margin">
                        <IonCardContent>
                            <IonLabel class="input-label ion-text-wrap">
                                <strong>Vas poder fer pell amb pell immediatament després del part/cesària?</strong>
                            </IonLabel>

                            <IonRadioGroup v-model="fetImmediat" @ionChange="fetImmediat = $event.detail.value">
                                <IonItem lines="none" @click="fetImmediat = 'si'">
                                    <IonLabel>Sí</IonLabel>
                                    <IonRadio slot="start" value="si" />
                                </IonItem>
                                <IonItem lines="none" @click="fetImmediat = 'no'">
                                    <IonLabel>No</IonLabel>
                                    <IonRadio slot="start" value="no" />
                                </IonItem>
                            </IonRadioGroup>

                            <div v-if="fetImmediat === 'si'" class="ion-margin-top">
                                <strong>
                                    <IonLabel position="stacked" class="input-label">Quant de temps (minuts)?</IonLabel>
                                </strong>
                                <IonInput v-model="tempsImmediat" type="number" placeholder="Ex: 60" fill="outline"
                                    class="input-box" />
                            </div>
                        </IonCardContent>
                    </IonCard>

                    <IonButton expand="block" size="large" @click="finalitzar" class="ion-margin-top"
                        :disabled="!isValid">
                        Finalitzar registre
                    </IonButton>
                </IonCol>
            </IonRow>
        </IonGrid>
    </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { IonText, IonGrid, IonCol, IonRow, IonLabel, IonRadio, IonRadioGroup, IonItem, IonInput, IonButton, IonCard, IonCardContent } from '@ionic/vue'
import AppLayout from '@/components/AppLayout.vue'
import RegistrationProgress from '@/components/RegistrationProgress.vue'
import { db, auth } from '@/services/firebase'
import { doc, updateDoc } from 'firebase/firestore'

const router = useRouter()
const fetImmediat = ref<string | null>(null)
const tempsImmediat = ref<number | null>(null)
const loading = ref(false)

const isValid = computed(() => {
    if (fetImmediat.value === 'no') return true
    if (fetImmediat.value === 'si' && tempsImmediat.value !== null && tempsImmediat.value > 0) return true
    return false
})

const finalitzar = async () => {
  loading.value = true
  
  const user = auth.currentUser
  const uid = user?.uid || localStorage.getItem('uid')

  if (!uid) {
    console.error("No s'ha trobat el UID de l'usuari");
    loading.value = false
    return
  }

  try {
    //objecte amb les dades de l'enquesta
    const dadesEnquesta = {
      pellAmbPellImmediat: fetImmediat.value,
      tempsPellAmbPellImmediat: fetImmediat.value === 'si' ? Number(tempsImmediat.value) : 0,
      setupCompletat: true,
      dataRegistreFinalitzat: new Date()
    }

    //Actualitzem el document de l'usuari a Firestore
    const userRef = doc(db, 'users', uid)
    await updateDoc(userRef, dadesEnquesta)

    console.log("Enquesta desada correctament")

    router.push('/HomePage')
    
  } catch (e: any) {
    console.error("Error guardant enquesta a Firestore:", e)
  } finally {
    loading.value = false
  }
}
</script>