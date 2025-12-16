import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import HomePage from '../views/HomePage.vue'
import Login from '@/views/Login.vue'
import Inici from '@/views/Inici.vue'
import Register from '@/views/Register.vue';
import Cangurs from '@/views/Cangurs.vue';
import Nado from '@/views/Nado.vue';
import Funcionalitats from '@/views/Funcionalitats.vue';
import Cronometre from '@/views/Cronometre.vue';
import GuardarCrono from '@/views/GuardarCrono.vue';

import Historial from '@/views/Historial.vue';
import ConfiguracioFamilia from '@/views/ConfiguracioFamilia.vue';
import ResetPassword from '@/views/ResetPassword.vue';
import RegisterEntrada from '@/views/RegisterEntrada.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/inici',
  },
  {
    path: '/inici',
    component: Inici
  },
  {
    path: '/register',
    component: Register
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/cangurs',
    component: Cangurs
  },
  {
    path: '/nado',
    component: Nado
  },
  {
    path: '/funcionalitats',
    component: Funcionalitats
  },
  {
    path: '/cronometre',
    component: Cronometre
  },
  {
    path: '/guardarCrono',
    component: GuardarCrono
  },
  {
    path: '/registerEntrada',
    component: RegisterEntrada
  },
  {
    path: '/historial',
    component: Historial
  }
  ,
  {
    path: '/config-familia',
    component: ConfiguracioFamilia
  }
  ,
  {
    path: '/reset-password',
    component: ResetPassword
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
