/*
 * @Author: eamiear
 * @Date: 2019-09-18 18:02:46
 * @Last Modified by: eamiear
 * @Last Modified time: 2019-09-19 20:59:12
 */

export default [
  {
    name: '/house/index.html',
    path: '/house/index.html',
    desc: '首页',
    component: () => import('views/house/index.vue'),
    isShow: true
  },
  {
    name: '/house/list.html',
    path: '/house/list.html',
    desc: '养老院',
    component: () => import('views/house/list.vue'),
    isShow: true
  }
]
