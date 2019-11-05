
/*
 * @Author: eamiear
 * @Date: 2019-08-27 15:11:02
 * @Last Modified by: eamiear
 * @Last Modified time: 2019-09-22 15:08:32
 */

import request from '@/common/fetch'

const FenceAPI = {
  getFenceList () {
    return request.get('fence/list')
  },
  getLocationList (params) {
    return request.get('nursinghome/ccs/nurse/LocationList')
  },
  SetLocation (params) {
    return request.post('nursinghome/ccs/nurse/setLocation', params)
  },
  deleteLocation (params) {
    return request.post('nursinghome/ccs/nurse/deleteLocation', params)
  }
}
export default FenceAPI
