/*
 * @Author: eamiear
 * @Date: 2019-09-19 22:07:27
 * @Last Modified by: eamiear
 * @Last Modified time: 2019-09-21 21:53:04
 */
import request from '@/common/fetch'

const HouseAPI = {
  getHouseElderList (params) {
    return request.get('beadhouse/elder/list', {...params})
  },
  getHouseList (params) {
    return request.get('beadhouse/list', {...params})
  },
  createHouse (house) {
    return request.post({
      url: 'beadhouse/create',
      params: house
    })
  },
  updateHouse (house) {
    return request.post({
      url: 'beadhouse/update',
      params: house
    })
  },
  deleteHouse (id) {
    return request.post({
      url: 'beadhouse/delete',
      params: {id}
    })
  }
}
export default HouseAPI
