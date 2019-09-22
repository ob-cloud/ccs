/*
 * @Author: eamiear
 * @Date: 2019-09-19 11:32:16
 * @Last Modified by: eamiear
 * @Last Modified time: 2019-09-22 14:28:16
 */
// export default [
//   {
//     name: '/nurse/index.html',
//     path: '/nurse/index.html',
//     desc: '护工管理',
//     component: () => import('views/nurse/index.vue')
//   }
// ]

export default [
  {
    name: '/nurse.html',
    path: '/nurse.html',
    desc: '护工管理',
    meta: {type: 'nurse'},
    component: () => import('views/layout/SidebarLayout.vue'),
    redirect: { path: '/nurse/index.html' },
    children: [
      {
        name: '/nurse/index.html',
        path: '/nurse/index.html',
        desc: '护工管理',
        component: () => import('views/nurse/index.vue')
      },
      {
        name: '/nurse/schedule/index.html',
        path: '/nurse/schedule/index.html',
        desc: '排班计划',
        component: () => import('views/nurse/schedule/index.vue')
      },
      {
        name: '/nurse/task/index.html',
        path: '/nurse/task/index.html',
        desc: '日常护理',
        component: () => import('views/nurse/task/index.vue')
      }
    ]
  }
]
