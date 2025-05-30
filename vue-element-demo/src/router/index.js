import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  },
  {
    path: '/table-scroll',
    name: 'table-scroll',
    component: () => import('../views/TableScroll.vue')
  },
  {
    path: '/table-filter',
    name: 'table-filter',
    component: () => import('../views/TableFilter/index.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
