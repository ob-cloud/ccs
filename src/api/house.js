/*
 * @Author: eamiear
 * @Date: 2019-09-19 22:07:27
 * @Last Modified by: eamiear
 * @Last Modified time: 2019-09-23 14:49:36
 */
import request from '@/common/fetch'

const HouseAPI = {
  getHouseElderList (params) {
    return request.get('/ccs/beadhouse/room/list', {...params})
  },
  getHouseList (params) {
    return request.get('/ccs/beadhouse/list', {...params})
  },
  createHouse (house) {
    return request.post('ccs/beadhouse/create', house)
  },
  updateHouse (house) {
    return request.post('ccs/beadhouse/update', house)
  },
  deleteHouse (id) {
    return request.post('ccs/beadhouse/delete', {id})
  }
}
export default HouseAPI
