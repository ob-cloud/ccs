/*
 * @Author: eamiear
 * @Date: 2019-09-19 23:34:23
 * @Last Modified by: eamiear
 * @Last Modified time: 2019-09-24 18:03:18
 */
import request from '@/common/fetch'

const ElderAPI = {
  getElderList (params) {
    return request.get('nursinghome/ccs/elder/list', {...params})
  },
  createElder (elder) {
    return request.post('nursinghome/ccs/elder/create', elder)
  },
  deleteElder (id) {
    return request.post('nursinghome/ccs/elder/delete', {id})
  },
  checkIn (params) {
    return request.post('nursinghome/ccs/checkin/create', params)
  },
  getTaskList (params) {
    return request.get('nursinghome/css/elder/task/list', params)
  },
  updateTask (params) {
    return request.post('nursinghome/css/dailyTask/create', params)
  },
  deleteTask (params) {
    return request.post('nursinghome/css/task/delete', params)
  },
  getDailyTask (params) {
    return request.get('nursinghome/css/nurse/dailyTask/list', params)
  },
  ackDailyTask (params) {
    return request.post('nursinghome/css/nurse/dailyTask/ack', params)
  }
}
export default ElderAPI
