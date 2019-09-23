/*
 * @Author: eamiear
 * @Date: 2019-09-21 21:41:59
 * @Last Modified by: eamiear
 * @Last Modified time: 2019-09-23 17:10:55
 */

import request from '@/common/fetch'

const RoomAPI = {
  getRoomList (params) {
    return request.get('ccs/room/list', {
      houseId: 18,
      ...params
    })
  },
  createRoom (room) {
    return request.post('ccs/room/create', room)
  },
  updateRoom (room) {
    return request.post('ccs/room/update', room)
  },
  deleteRoom (id, houseId) {
    return request.post('ccs/room/delete', {id, houseId})
  },
  connectDevice (params) {
    return request.post('ccs/room/device', params)
  }
}
export default RoomAPI
