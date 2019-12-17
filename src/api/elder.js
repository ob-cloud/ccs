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
  updateElder (elder) {
    return request.post('nursinghome/ccs/elder/update', elder)
  },
  deleteElder (id) {
    return request.post('nursinghome/ccs/elder/delete', {elderId: id})
  },
  leaveElder (params) {
    return request.post('nursinghome/ccs/elder/leave', {...params})
  },
  bindBed (params) {
    return request.post('nursinghome/ccs/elder/bindBed', params)
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
  },
  bindContactCreat (params) { // 绑定家属
    return request.post('nursinghome/ccs/contact/create', params)
  },
  getContactList (params) { // 获取家属列表
    return request.get('nursinghome/ccs/contact/list', params)
  },
  delectContact (params) { // 绑定家属
    return request.post('nursinghome/ccs/contact/delete', params)
  },
  updateContact (params) { // 更新家属
    return request.post('nursinghome/ccs/contact/update', params)
  },
  getDeviceHistory (params) { // 获取历史数据
    return request.get('nursinghome/ccs/elder/device/history', params)
  }
}
export default ElderAPI
