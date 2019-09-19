/*
 * @Author: eamiear
 * @Date: 2019-02-06 18:06:02
 * @Last Modified by: eamiear
 * @Last Modified time: 2019-09-19 18:17:07
 */

import common from './common'
import house from './house'
import elder from './elder'
import nurse from './nurse'
import system from './system'
const menuRoutes = {
  name: 'home',
  path: '/',
  desc: '首页',
  component: () => import('views/layout/Layout.vue'),
  redirect: { path: '/house/index.html' },
  children: [
    ...system,
    ...house,
    ...elder,
    ...nurse,
    ...common
  ]
}

export default [
  {
    name: 'login',
    path: '/login',
    desc: '登录页',
    component: () => import('views/login/index.vue')
  },
  menuRoutes,
  {
    path: '*',
    redirect: '/404'
  }
]
