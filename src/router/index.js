import {
  createRouter,
  createWebHashHistory
} from 'vue-router'

import Warp from '../pages/Warp.vue'

const router = createRouter({

  history: createWebHashHistory(
    '/hsr-warp-simulator/'
  ),

  routes: [

    {
      path: '/',
      redirect: '/warp'
    },

    {
      path: '/warp',
      component: Warp
    }

  ]

})

export default router