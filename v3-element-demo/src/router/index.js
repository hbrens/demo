import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/yaml-editor',
  },
  {
    path: '/yaml-editor',
    component: () => import('@/views/yaml-editor/index.vue')
  },
  {
    path: '/yaml-config',
    component: () => import('@/views/yaml-config/index.vue')
  },
  {
    path: '/tree-menu',
    name: 'tree-menu',
    component: () => import('@/views/tree-menu/index.vue')
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
  },
  {
    path: '/img',
    name: '/img',
    component: () => import('@/views/img-compare/index.vue')
  },
  {
    path: '/img-zoom',
    name: 'img-zoom',
    component: () => import('@/views/img-zoom/index.vue')
  },
  {
    path: '/img-zoom2',
    name: 'img-zoom2',
    component: () => import('@/views/img-zoom/index2.vue')
  }

]

const router = createRouter({
  routes: routes,
  history: createWebHashHistory()
})

export default router