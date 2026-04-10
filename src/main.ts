import { createApp } from 'vue'
import App from './App.vue'
import router from './router';

import { IonicVue } from '@ionic/vue';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* @import '@ionic/vue/css/palettes/dark.always.css'; */
/* @import '@ionic/vue/css/palettes/dark.class.css'; */
import '@ionic/vue/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import offlineService from '@/services/offline.service'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/services/firebase'
import { Capacitor } from '@capacitor/core'

const app = createApp(App)
  .use(IonicVue, {
    mode: 'ios'
  })
  .use(router);

router.isReady().then(async () => {
  app.mount('#app');
  
  // Assegura que la webview no sobreposi la barra d'estat nativa al mòbil
  // Això fa que el contingut comenci sota la barra d'estat, com en una app normal
  // Només ho intentem en plataformes natives
  if (Capacitor.isNativePlatform()) {
    try {
      const { StatusBar } = await import('@capacitor/status-bar');
      StatusBar.setOverlaysWebView({ overlay: false });
    } catch (e) {
      // El plugin no està disponible
      console.debug('StatusBar.setOverlaysWebView no està disponible', e);
    }
  }
  // Intenta buidar les escriptures pendents fora de línia quan tornem a estar en línia
  window.addEventListener('online', () => {
    offlineService.processQueue().catch(err => console.error(err))
  })
  // També ho intentem quan l'autenticació ja està disponible
  onAuthStateChanged(auth, (user) => {
    if (user && navigator.onLine) offlineService.processQueue().catch(err => console.error(err))
  })
  // I també ho provem immediatament si ara mateix tenim connexió
  if (navigator.onLine) {
    offlineService.processQueue().catch(err => console.error(err))
  }
});
