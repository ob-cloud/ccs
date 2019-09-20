/*
 * @Author: eamiear
 * @Date: 2019-09-19 22:07:27
 * @Last Modified by: eamiear
 * @Last Modified time: 2019-09-20 15:14:09
 */
import request from '@/common/fetch'

const HouseAPI = {
  getHouseElderList () {
    return request.get('beadhouse/elder/list', {})
  },
  getHouseList () {
    return request.get('beadhouse/list', {})
  },
  createHouse (house) {
    return request.post({
      url: '/beadhouse/create',
      params: house
    })
  },
  updateHouse (house) {
    return request.post({
      url: '/beadhouse/update',
      params: house
    })
  },
  deleteHouse (id) {
    return request.post({
      url: '/beadhouse/delete',
      params: {id}
    })
  }
}
export default HouseAPI
