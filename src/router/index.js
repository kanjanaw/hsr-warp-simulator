import { createRouter, createWebHistory } from 'vue-router'

import Home from '../pages/Home.vue'
import Warp from '../pages/Warp.vue'

const routes = [
  {
    path: '/',
    component: Home
  },
  {
    path: '/warp',
    component: Warp
  }
]

export default createRouter({
  history: createWebHistory(),
  routes
})