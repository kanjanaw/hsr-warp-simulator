import {
  createRouter,
  createWebHashHistory
} from 'vue-router'

import Home from '../pages/Home.vue'
import Warp from '../pages/Warp.vue'

const router = createRouter({

  history: createWebHashHistory(
    '/hsr-warp-simulator/'
  ),

  routes: [

    {
      path: '/',
      component: Home
    },

    {
      path: '/warp',
      component: Warp
    }

  ]

})

export default router