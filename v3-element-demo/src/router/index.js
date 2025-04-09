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
  },
  {
    path: '/vtable',
    name: 'vtable',
    component: () => import('@/views/edit-table/vtable.vue')
  },
  {
    path: '/ag-grid',
    name: 'ag-grid',
    component: () => import('@/views/ag-grid/index.vue')
  }

]

const router = createRouter({
  routes: routes,
  history: createWebHashHistory()
})

export default router