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
import { StatusBar } from '@capacitor/status-bar';

const app = createApp(App)
  .use(IonicVue, {
    mode: 'ios'
  })
  .use(router);

router.isReady().then(() => {
  app.mount('#app');
  // Ensure the webview does not overlay the native status bar on mobile
  // This makes the app content start below the status bar like a normal app.
  try {
    StatusBar.setOverlaysWebView({ overlay: false });
  } catch (e) {
    // plugin not available (e.g., running in a desktop browser)
    console.debug('StatusBar.setOverlaysWebView unavailable', e);
  }
  // Try to flush any queued offline writes when we become online
  window.addEventListener('online', () => {
    offlineService.processQueue().catch(err => console.error(err))
  })
  // Also try to flush when auth becomes available
  onAuthStateChanged(auth, (user) => {
    if (user && navigator.onLine) offlineService.processQueue().catch(err => console.error(err))
  })
  // Also attempt immediately if we're online now
  if (navigator.onLine) {
    offlineService.processQueue().catch(err => console.error(err))
  }
});
