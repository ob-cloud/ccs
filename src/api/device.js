
/*
 * @Author: eamiear
 * @Date: 2019-08-27 15:11:02
 * @Last Modified by: eamiear
 * @Last Modified time: 2019-09-21 23:55:42
 */

import request from '@/common/fetch'

const DeviceAPI = {
  getDeviceList (params = {}) {
    return request.get('device/list', {...params})
  },
  getBloodPressureList (params = {}) {
    return request.get('/nursinghome/css/watch/bloodPressure', {...params})
  }
}
export default DeviceAPI
