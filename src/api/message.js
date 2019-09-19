/*
 * @Author: eamiear
 * @Date: 2019-08-27 15:11:02
 * @Last Modified by: eamiear
 * @Last Modified time: 2019-08-27 15:25:09
 */

import request from '@/common/fetch'

const MessageAPI = {
  getUnhandleMessage () {
    return request.post({
      url: 'message/list/unhandle'
    })
  },
  getDaysMessage () {
    return request.post({
      url: 'message/list/days'
    })
  },
  getOfflineMessage () {
    return request.post({
      url: 'message/list/offline'
    })
  }
}
export default MessageAPI
