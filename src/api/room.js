/*
 * @Author: eamiear
 * @Date: 2019-09-21 21:41:59
 * @Last Modified by: eamiear
 * @Last Modified time: 2019-09-29 16:20:48
 */

import request from '@/common/fetch'
import store from '@/store'
const RoomAPI = {
  getRoomList (params) {
    return request.get('nursinghome/ccs/room/list', {
      houseId: store.state.house.id,
      ...params
    })
  },
  createRoom (room) {
    return request.post('nursinghome/ccs/room/create', room)
  },
  updateRoom (room) {
    return request.post('nursinghome/ccs/room/update', room)
  },
  deleteRoom (id, houseId) {
    return request.post('nursinghome/ccs/room/delete', {id, houseId})
  },
  connectDevice (params) {
    return request.post('nursinghome/ccs/room/device', params)
  }
}
export default RoomAPI
