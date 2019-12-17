/*
 * @Author: eamiear
 * @Date: 2019-02-06 21:24:22
 * @Last Modified by: eamiear
 * @Last Modified time: 2019-09-19 10:42:39
 */

export default [
  {
    name: '/elder/index.html',
    path: '/elder/index.html',
    desc: '老人管理',
    component: () => import('views/elder/index.vue')
  },
  {
    name: '/elder/history.html',
    path: '/elder/history.html',
    desc: '老人历史记录',
    component: () => import('views/elder/history.vue')
  }
]

