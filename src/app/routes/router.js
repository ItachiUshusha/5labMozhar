import { createRouter, createWebHistory } from 'vue-router';
import AuthPage from '@/pages/AuthPage.vue';
import UserPage from '@/pages/UserPage.vue';
import AdminPage from '@/pages/AdminPage.vue';

const routes = [
  {
    path: '/',
    name: 'Auth',
    component: AuthPage,
  },
  {
    path: '/user',
    name: 'User',
    component: UserPage,
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminPage,
  },
];

const router = createRouter({
  routes,
  history: createWebHistory(),
});

export default router;
