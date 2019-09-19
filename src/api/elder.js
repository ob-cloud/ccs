/*
 * @Author: eamiear
 * @Date: 2019-09-19 23:34:23
 * @Last Modified by: eamiear
 * @Last Modified time: 2019-09-19 23:37:15
 */
import request from '@/common/fetch'

const ElderAPI = {
  getElderList () {
    return request.get('elder/list', {})
  }
}
export default ElderAPI
