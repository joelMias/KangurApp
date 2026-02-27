<template>
  <IonPage>
    <IonHeader>
      <IonToolbar class="capçalera">
        <IonButtons slot="start">
          <IonButton @click="router.back()">
            <IonIcon :icon="arrowBackOutline" />
          </IonButton>
        </IonButtons>
        <IonTitle>Guia d'usuari</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent class="ion-padding">

      <div class="guide-header">
        <img src="/src/assets/kangur.png" alt="KangurApp Logo" class="guide-logo" />
        <h1>Guia d'usuari</h1>
        <p>Manual d'ús de l'aplicació de registre de sessions pell amb pell.</p>
      </div>

      <!-- Index -->
      <IonCard class="index-card">
        <IonCardHeader>
          <IonCardTitle>Contingut</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonList lines="none">
            <IonItem v-for="item in sections" :key="item.id" button @click="scrollTo(item.id)">
              <IonIcon :icon="chevronForwardOutline" slot="start" color="primary" />
              <IonLabel>{{ item.label }}</IonLabel>
            </IonItem>
          </IonList>
        </IonCardContent>
      </IonCard>

      <!-- 1. Pàgina inicial -->
      <IonCard :id="'inici'" class="section-card">
        <IonCardHeader>
          <IonCardTitle><span class="section-num">1.</span> Pàgina inicial</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <p>En obrir l'aplicació trobaràs dues opcions principals:</p>
          <IonList lines="none">
            <IonItem><IonIcon :icon="ellipseOutline" slot="start" /><IonLabel><strong>Registrar-se</strong></IonLabel></IonItem>
            <IonItem><IonIcon :icon="ellipseOutline" slot="start" /><IonLabel><strong>Login</strong></IonLabel></IonItem>
          </IonList>
        </IonCardContent>
      </IonCard>

      <!-- 2. Crear un compte -->
      <IonCard :id="'registre'" class="section-card">
        <IonCardHeader>
          <IonCardTitle><span class="section-num">2.</span> Crear un compte</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <div class="step-block">
            <h3 class="step-title"><IonIcon :icon="personAddOutline" /> Pas 1 — Dades de l'usuari</h3>
            <IonList lines="none">
              <IonItem><IonIcon :icon="ellipseOutline" slot="start" /><IonLabel>Correu electrònic</IonLabel></IonItem>
              <IonItem><IonIcon :icon="ellipseOutline" slot="start" /><IonLabel>Nom complet</IonLabel></IonItem>
              <IonItem><IonIcon :icon="ellipseOutline" slot="start" /><IonLabel>Contrasenya</IonLabel></IonItem>
            </IonList>
          </div>
          <div class="step-block">
            <h3 class="step-title"><IonIcon :icon="peopleOutline" /> Pas 2 — Afegir cangurs</h3>
            <p>Afegeix els familiars que faran sessions pell amb pell.</p>
            <IonList lines="none">
              <IonItem><IonIcon :icon="ellipseOutline" slot="start" /><IonLabel>Introdueix el nom</IonLabel></IonItem>
              <IonItem><IonIcon :icon="ellipseOutline" slot="start" /><IonLabel>Pots afegir-ne tants com necessitis</IonLabel></IonItem>
            </IonList>
          </div>
          <div class="step-block">
            <h3 class="step-title"><IonIcon :icon="heartOutline" /> Pas 3 — Dades del nadó</h3>
            <IonList lines="none">
              <IonItem><IonIcon :icon="ellipseOutline" slot="start" /><IonLabel>Nom del nadó</IonLabel></IonItem>
              <IonItem><IonIcon :icon="ellipseOutline" slot="start" /><IonLabel>Setmanes de vida</IonLabel></IonItem>
              <IonItem><IonIcon :icon="ellipseOutline" slot="start" /><IonLabel>Dies addicionals</IonLabel></IonItem>
            </IonList>
            <p class="note">En finalitzar, accediràs a la pàgina de funcionalitats.</p>
          </div>
        </IonCardContent>
      </IonCard>

      <!-- 3. Iniciar sessió -->
      <IonCard :id="'login'" class="section-card">
        <IonCardHeader>
          <IonCardTitle><span class="section-num">3.</span> Iniciar sessió</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonList lines="none">
            <IonItem><IonBadge color="primary" class="step-badge">1</IonBadge><IonLabel class="ion-margin-start">Prem <strong>Login</strong></IonLabel></IonItem>
            <IonItem><IonBadge color="primary" class="step-badge">2</IonBadge><IonLabel class="ion-margin-start">Introdueix correu i contrasenya</IonLabel></IonItem>
            <IonItem><IonBadge color="primary" class="step-badge">3</IonBadge><IonLabel class="ion-margin-start">Prem <strong>Continuar</strong></IonLabel></IonItem>
          </IonList>
          <div class="step-block ion-margin-top">
            <h3 class="step-title"><IonIcon :icon="lockClosedOutline" /> Recuperar contrasenya</h3>
            <p>Si no recordes la contrasenya:</p>
            <IonList lines="none">
              <IonItem><IonIcon :icon="ellipseOutline" slot="start" /><IonLabel>Prem "He oblidat la contrasenya?"</IonLabel></IonItem>
              <IonItem><IonIcon :icon="ellipseOutline" slot="start" /><IonLabel>Introdueix el teu correu electrònic</IonLabel></IonItem>
              <IonItem><IonIcon :icon="ellipseOutline" slot="start" /><IonLabel>Rebràs un email amb l'enllaç per restablir-la</IonLabel></IonItem>
            </IonList>
          </div>
        </IonCardContent>
      </IonCard>

      <!-- 4. Funcionalitats -->
      <IonCard :id="'funcionalitats'" class="section-card">
        <IonCardHeader>
          <IonCardTitle><span class="section-num">4.</span> Funcionalitats</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <p>Un cop dins trobaràs:</p>
          <IonList lines="none">
            <IonItem><IonIcon :icon="timerOutline" slot="start" color="primary"/><IonLabel><strong>Iniciar pell amb pell</strong></IonLabel></IonItem>
            <IonItem><IonIcon :icon="businessOutline" slot="start" color="primary"/><IonLabel><strong>Registre entrada unitat</strong></IonLabel></IonItem>
          </IonList>
          <p class="note">A la capçalera: accés a l'Historial.</p>
          <p class="note">Al peu de pàgina: botó <em>Per saber-ne més</em>.</p>
        </IonCardContent>
      </IonCard>

      <!-- 5. Iniciar pell amb pell -->
      <IonCard :id="'pell'" class="section-card">
        <IonCardHeader>
          <IonCardTitle><span class="section-num">5.</span> Iniciar pell amb pell</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <div class="step-block">
            <h3 class="step-title"><IonIcon :icon="playOutline" /> Iniciar cronòmetre</h3>
            <IonList lines="none">
              <IonItem><IonIcon :icon="ellipseOutline" slot="start" /><IonLabel>Prem <strong>Iniciar</strong></IonLabel></IonItem>
              <IonItem><IonIcon :icon="ellipseOutline" slot="start" /><IonLabel>El cronòmetre començarà a comptar</IonLabel></IonItem>
            </IonList>
          </div>
          <div class="step-block">
            <h3 class="step-title"><IonIcon :icon="stopOutline" /> Parar cronòmetre</h3>
            <IonList lines="none">
              <IonItem><IonIcon :icon="ellipseOutline" slot="start" /><IonLabel>Prem <strong>Parar</strong></IonLabel></IonItem>
              <IonItem><IonIcon :icon="ellipseOutline" slot="start" /><IonLabel>Selecciona el cangur</IonLabel></IonItem>
            </IonList>
          </div>
          <div class="step-block">
            <h3 class="step-title"><IonIcon :icon="saveOutline" /> Guardar sessió</h3>
            <IonList lines="none">
              <IonItem><IonIcon :icon="ellipseOutline" slot="start" /><IonLabel>Prem <strong>Registrar</strong></IonLabel></IonItem>
              <IonItem><IonIcon :icon="ellipseOutline" slot="start" /><IonLabel>Es guardarà i tornaràs a funcionalitats</IonLabel></IonItem>
            </IonList>
          </div>
        </IonCardContent>
      </IonCard>

      <!-- 6. Registre entrada unitat -->
      <IonCard :id="'unitat'" class="section-card">
        <IonCardHeader>
          <IonCardTitle><span class="section-num">6.</span> Registre entrada unitat</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonList lines="none">
            <IonItem><IonBadge color="primary" class="step-badge">1</IonBadge><IonLabel class="ion-margin-start">Selecciona hora d'entrada</IonLabel></IonItem>
            <IonItem><IonBadge color="primary" class="step-badge">2</IonBadge><IonLabel class="ion-margin-start">Selecciona hora de sortida</IonLabel></IonItem>
            <IonItem><IonBadge color="primary" class="step-badge">3</IonBadge><IonLabel class="ion-margin-start">Prem <strong>Registrar</strong></IonLabel></IonItem>
          </IonList>
          <IonNote class="important-note">
            <IonIcon :icon="warningOutline" /> <strong>Important:</strong> l'hora de sortida no pot ser anterior a l'hora d'entrada.
          </IonNote>
        </IonCardContent>
      </IonCard>

      <!-- 7. Historial de sessions -->
      <IonCard :id="'historial'" class="section-card">
        <IonCardHeader>
          <IonCardTitle><span class="section-num">7.</span> Historial de sessions</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <p>Accedeix-hi des del botó a la capçalera.</p>
          <div class="step-block">
            <h3 class="step-title"><IonIcon :icon="barChartOutline" /> Formats disponibles</h3>
            <IonList lines="none">
              <IonItem><IonIcon :icon="ellipseOutline" slot="start" /><IonLabel>Vista gràfica</IonLabel></IonItem>
              <IonItem><IonIcon :icon="ellipseOutline" slot="start" /><IonLabel>Vista llista</IonLabel></IonItem>
            </IonList>
          </div>
          <div class="step-block">
            <h3 class="step-title"><IonIcon :icon="calendarOutline" /> Filtrat</h3>
            <p>Les dades es poden consultar per setmanes i canviar amb els botons de navegació.</p>
          </div>
          <div class="step-block">
            <h3 class="step-title"><IonIcon :icon="listOutline" /> Mode llista mostra:</h3>
            <IonList lines="none">
              <IonItem><IonIcon :icon="ellipseOutline" slot="start" /><IonLabel>Data i hora de la sessió</IonLabel></IonItem>
              <IonItem><IonIcon :icon="ellipseOutline" slot="start" /><IonLabel>Nom del cangur</IonLabel></IonItem>
              <IonItem><IonIcon :icon="ellipseOutline" slot="start" /><IonLabel>Nom del nadó</IonLabel></IonItem>
              <IonItem><IonIcon :icon="ellipseOutline" slot="start" /><IonLabel>Durada de la sessió</IonLabel></IonItem>
            </IonList>
          </div>
        </IonCardContent>
      </IonCard>

      <!-- 8. Configuració de família -->
      <IonCard :id="'configuracio'" class="section-card">
        <IonCardHeader>
          <IonCardTitle><span class="section-num">8.</span> Configuració de família</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <p>Permet gestionar els cangurs:</p>
          <IonList lines="none">
            <IonItem><IonIcon :icon="addCircleOutline" slot="start" color="success"/><IonLabel>Afegir nous cangurs</IonLabel></IonItem>
            <IonItem><IonIcon :icon="trashOutline" slot="start" color="danger"/><IonLabel>Eliminar cangurs existents</IonLabel></IonItem>
          </IonList>
        </IonCardContent>
      </IonCard>

      <!-- 9. Tancar sessió -->
      <IonCard :id="'logout'" class="section-card">
        <IonCardHeader>
          <IonCardTitle><span class="section-num">9.</span> Tancar sessió</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <p>Prem el botó <strong>Tancar sessió</strong> a la capçalera per sortir del compte.</p>
        </IonCardContent>
      </IonCard>

    </IonContent>
  </IonPage>
</template>

<script setup lang="ts">
import {
  IonPage, IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonTitle,
  IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonList, IonItem, IonLabel, IonBadge, IonNote
} from '@ionic/vue'
import {
  arrowBackOutline, chevronForwardOutline, ellipseOutline, personAddOutline,
  peopleOutline, heartOutline, lockClosedOutline, timerOutline, businessOutline,
  playOutline, stopOutline, saveOutline, warningOutline, barChartOutline,
  calendarOutline, listOutline, addCircleOutline, trashOutline
} from 'ionicons/icons'
import { useRouter } from 'vue-router'

const router = useRouter()

const sections = [
  { id: 'inici', label: '1. Pàgina inicial' },
  { id: 'registre', label: '2. Crear un compte' },
  { id: 'login', label: '3. Iniciar sessió' },
  { id: 'funcionalitats', label: '4. Funcionalitats' },
  { id: 'pell', label: '5. Iniciar pell amb pell' },
  { id: 'unitat', label: '6. Registre entrada unitat' },
  { id: 'historial', label: '7. Historial de sessions' },
  { id: 'configuracio', label: '8. Configuració de família' },
  { id: 'logout', label: '9. Tancar sessió' },
]

function scrollTo(id: string) {
  const el = document.getElementById(id)
  el?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
.guide-header {
  text-align: center;
  padding: 16px 0 8px;
}

.guide-logo {
  width: 120px;
  height: auto;
  margin-bottom: 12px;
}

.guide-header h1 {
  font-size: 1.6rem;
  font-weight: 800;
  color: #26a69a;
  margin-bottom: 4px;
}

.guide-header p {
  color: #666;
  font-size: 0.95rem;
}

.index-card {
  border-left: 4px solid #26a69a;
  margin-bottom: 12px;
}

.section-card {
  margin-bottom: 12px;
  border-left: 4px solid #e0e0e0;
}

.section-num {
  color: #26a69a;
  font-weight: 700;
}

.step-block {
  margin-top: 12px;
}

.step-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #444;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.step-badge {
  min-width: 24px;
  text-align: center;
  border-radius: 50%;
}

.note {
  font-size: 0.88rem;
  color: #888;
  margin-top: 8px;
  font-style: italic;
}

.important-note {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fff8e1;
  border-left: 3px solid #f9a825;
  padding: 8px 12px;
  margin-top: 12px;
  border-radius: 4px;
  font-size: 0.9rem;
  color: #555;
}
</style>
