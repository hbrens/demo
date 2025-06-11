import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/ag-grid2',
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
  },
  {
    path: '/ag-grid2',
    name: 'ag-grid2',
    component: () => import('@/views/ag-grid2/index.vue')
  },
  {
    path: '/el-table',
    name: 'el-table',
    component: () => import('@/views/el-table-view/index.vue')
  }

]

const router = createRouter({
  routes: routes,
  history: createWebHashHistory()
})

export default router