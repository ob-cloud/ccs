/*
 * @Author: eamiear
 * @Date: 2019-02-20 15:14:15
 * @Last Modified by: eamiear
 * @Last Modified time: 2019-09-19 11:30:35
 */


export default [
  {
    name: '/system/device.html',
    path: '/system/device.html',
    desc: '设备管理',
    component: () => import('views/system/device.vue')
  }, {
    name: '/system/message.html',
    path: '/system/message.html',
    desc: '系统消息',
    component: () => import('views/system/message.vue')
  }, {
    name: '/system/fence.html',
    path: '/system/fence.html',
    desc: '电子围栏',
    component: () => import('views/system/fence.vue')
  }, {
    name: '/system/setting.html',
    path: '/system/setting.html',
    desc: '系统配置',
    component: () => import('views/system/setting.vue')
  }
]
