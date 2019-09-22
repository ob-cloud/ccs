/*
 * @Author: eamiear
 * @Date: 2019-09-22 14:57:21
 * @Last Modified by: eamiear
 * @Last Modified time: 2019-09-22 14:58:00
 */
import request from '@/common/fetch'

const ScheduleAPI = {
  getScheduleList (params) {
    return request.get('/schedule/list', {...params})
  },
  createSchedule (task) {
    return request.post({
      url: '/schedule/create',
      params: task
    })
  },
  deleteSchedule (id) {
    return request.post({
      url: '/schedule/create',
      params: {id}
    })
  }
}
export default ScheduleAPI
