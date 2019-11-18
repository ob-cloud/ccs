/*
 * @Author: eamiear
 * @Date: 2019-09-22 11:46:10
 * @Last Modified by: eamiear
 * @Last Modified time: 2019-09-22 11:46:35
 */

import request from '@/common/fetch'

const NurseAPI = {
  getNurseList (params) {
    return request.get('/nurse/list', {...params})
  },
  createNurse (nurse) {
    return request.post({
      url: '/nurse/create',
      params: nurse
    })
  },
  deleteNurse (id) {
    return request.post({
      url: '/nurse/create',
      params: {id}
    })
  },
  getSsoList (id) {
    return request.post({
      url: '/message/sso/list',
      params: {id}
    })
  },
  updateTask (id) {
    return request.post('/nursinghome/css/nurse/calltask/update', {callTaskId: id})
  },
  getCalltask (params) {
    return request.get('/nursinghome/css/msg/list', params)
  },
  sendVist (elderId) {
    return request.post('/nursinghome/css/nurse/vist', {elderId})
  },
  ackNurseMsg (params) {
    return request.post('/nursinghome/css/nurse/msg/ack', params)
  },
  refuseNurseMsg (params) {
    return request.post('/nursinghome/css/nurse/msg/refuse', params)
  }
}
export default NurseAPI
