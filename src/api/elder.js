/*
 * @Author: eamiear
 * @Date: 2019-09-19 23:34:23
 * @Last Modified by: eamiear
 * @Last Modified time: 2019-09-22 17:22:03
 */
import request from '@/common/fetch'

const ElderAPI = {
  getElderList (params) {
    return request.get('ccs/elder/list', {...params})
  },
  createElder (elder) {
    return request.post({
      url: '/elder/create',
      params: elder
    })
  },
  deleteElder (id) {
    return request.post({
      url: '/elder/create',
      params: {id}
    })
  },
  checkIn (params) {
    return request.post({
      url: 'checkin/create',
      ...params
    })
  }
}
export default ElderAPI
