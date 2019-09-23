/*
 * @Author: eamiear
 * @Date: 2019-09-19 23:34:23
 * @Last Modified by: eamiear
 * @Last Modified time: 2019-09-23 17:09:00
 */
import request from '@/common/fetch'

const ElderAPI = {
  getElderList (params) {
    return request.get('ccs/elder/list', {...params})
  },
  createElder (elder) {
    return request.post('ccs/elder/create', elder)
  },
  deleteElder (id) {
    return request.post('ccs/elder/delete', {id})
  },
  checkIn (params) {
    return request.post('ccs/checkin/create', params)
  }
}
export default ElderAPI
