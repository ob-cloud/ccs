/*
 * @Author: eamiear
 * @Date: 2019-09-18 18:02:46
 * @Last Modified by: eamiear
 * @Last Modified time: 2019-09-21 22:30:01
 */

const home = [
  {
    name: '/house/index.html',
    path: '/house/index.html',
    desc: '首页',
    component: () => import('views/house/index.vue'),
    isShow: true
  }
]
const house = [
  {
    name: '/house/list.html',
    path: '/house/list.html',
    desc: '养老院',
    component: () => import('views/house/list.vue'),
    isShow: true
  }
]

const room = [
  {
    name: '/room/index.html',
    path: '/room/index.html',
    desc: '房间管理',
    component: () => import('views/house/room/index.vue'),
    isShow: true
  }
]
const roomtype = [
  {
    name: '/roomtype/index.html',
    path: '/roomtype/index.html',
    desc: '房型管理',
    component: () => import('views/house/roomtype/index.vue'),
    isShow: true
  }
]

export default [
  {
    name: '/house.html',
    path: '/house.html',
    desc: '养老院',
    component: () => import('views/layout/SidebarLayout.vue'),
    redirect: { path: '/house/list.html' },
    children: [
      ...house,
      ...room,
      ...roomtype
    ]
  },
  ...home
]
