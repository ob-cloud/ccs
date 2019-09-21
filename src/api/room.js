/*
 * @Author: eamiear
 * @Date: 2019-09-21 21:41:59
 * @Last Modified by: eamiear
 * @Last Modified time: 2019-09-21 22:18:08
 */

import request from '@/common/fetch'

const RoomAPI = {
  getRoomList (params) {
    return request.get('/room/list', {
      ...params
    })
  },
  createRoom (room) {
    return request.post({
      url: '/room/create',
      params: room
    })
  },
  deleteRoom (id) {
    return request.post({
      url: '/room/delete',
      params: {id}
    })
  }
}
export default RoomAPI
