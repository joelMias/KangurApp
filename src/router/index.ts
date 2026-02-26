import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import HomePage from '../views/HomePage.vue'
import Login from '@/views/Login.vue'
import InitialPage from '@/views/InitialPage.vue'
import Register from '@/views/Register.vue';
import Cangurs from '@/views/Cangurs.vue';
import Nado from '@/views/Nado.vue';
import Cronometre from '@/views/Cronometre.vue';
import GuardarCrono from '@/views/GuardarCrono.vue';

import Perfil from '@/views/Perfil.vue';
import ConfiguracioFamilia from '@/views/ConfiguracioFamilia.vue';
import ResetPassword from '@/views/ResetPassword.vue';
import RegisterEntrada from '@/views/RegisterEntrada.vue';
import AdminPanel from '@/views/AdminPanel.vue';
import PdfViewer from '@/views/PdfViewer.vue';
import authService from '@/services/auth.service';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/HomePage',
  },
  {
    path: '/HomePage',
    component: HomePage
  },
  {
    path: '/initialPage',
    component: InitialPage
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
    path: '/perfil',
    component: Perfil
  }
  ,
  {
    path: '/admin-panel',
    component: AdminPanel
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
  },
  {
    path: '/pdf-viewer',
    component: PdfViewer
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Route guard
router.beforeEach(async (to, from, next) => {
  const isAuthenticated = await authService.isTokenValid()

  // Public routes (only accessible when NOT authenticated)
  const guestOnlyRoutes = ['/login', '/register', '/initialPage']

  // Protected routes (only accessible when authenticated)
  const protectedRoutes = [
    '/HomePage', '/cangurs', '/nado', '/cronometre', '/guardarCrono',
    '/registerEntrada', '/perfil', '/admin-panel', '/config-familia',
    '/reset-password', '/pdf-viewer'
  ]

  if (isAuthenticated && guestOnlyRoutes.includes(to.path)) {
    // Authenticated user trying to access login/register → go to app
    return next('/HomePage')
  }

  if (!isAuthenticated && protectedRoutes.includes(to.path)) {
    // Unauthenticated user trying to access protected page → go to login screen
    return next('/initialPage')
  }

  next()
})

export default router
