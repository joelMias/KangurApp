import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

// Auth
import Login from '@/views/auth/Login.vue';
import Register from '@/views/auth/Register.vue';
import ResetPassword from '@/views/auth/ResetPassword.vue';

// Onboarding
import InitialPage from '@/views/onboarding/InitialPage.vue';
import Cangurs from '@/views/onboarding/Cangurs.vue';
import Nado from '@/views/onboarding/Nado.vue';

// Session
import HomePage from '@/views/session/HomePage.vue';
import Cronometre from '@/views/session/Cronometre.vue';
import GuardarCrono from '@/views/session/GuardarCrono.vue';
import RegisterEntrada from '@/views/session/RegisterEntrada.vue';

// Profile
import Perfil from '@/views/profile/Perfil.vue';
import ConfiguracioFamilia from '@/views/profile/ConfiguracioFamilia.vue';

// Admin
import AdminPanel from '@/views/admin/AdminPanel.vue';

// Guide
import UserGuide from '@/views/guide/UserGuide.vue';

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
    component: UserGuide
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
