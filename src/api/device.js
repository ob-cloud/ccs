
/*
 * @Author: eamiear
 * @Date: 2019-08-27 15:11:02
 * @Last Modified by: eamiear
 * @Last Modified time: 2019-08-27 17:17:45
 */

import request from '@/common/fetch'

const DeviceAPI = {
  getDeviceList () {
    return request.post({
      url: 'device/list'
    })
  }
}
export default DeviceAPI
