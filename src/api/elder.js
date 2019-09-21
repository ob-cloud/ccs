/*
 * @Author: eamiear
 * @Date: 2019-09-19 23:34:23
 * @Last Modified by: eamiear
 * @Last Modified time: 2019-09-21 18:02:34
 */
import request from '@/common/fetch'

const ElderAPI = {
  getElderList () {
    return request.get('elder/list', {})
  },
  createElder (elder) {
    return request.post({
      url: '/elder/create',
      params: elder
    })
  },
  deleteElder (id) {
    return request.post({
      url: '/elder/create',
      params: {id}
    })
  }
}
export default ElderAPI
