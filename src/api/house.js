/*
 * @Author: eamiear
 * @Date: 2019-09-19 22:07:27
 * @Last Modified by: eamiear
 * @Last Modified time: 2019-09-19 22:28:48
 */
import request from '@/common/fetch'

const HouseAPI = {
  getHouseElderList () {
    return request.get('beadhouse/elder/list', {})
  },
  getHouseList () {
    return request.get('beadhouse/list', {})
  }
}
export default HouseAPI
