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
  }
}
export default NurseAPI
