import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/editor',
  },
  {
    path: '/editor',
    name: 'editor-view',
    component: () => import('@/views/editor-view/index.vue')
  }
]

const router = createRouter({
  routes: routes,
  history: createWebHashHistory()
})

export default router