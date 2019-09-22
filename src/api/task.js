import request from '@/common/fetch'

const TaskAPI = {
  getTaskList (params) {
    return request.get('/task/list', {...params})
  },
  createTask (task) {
    return request.post({
      url: '/task/create',
      params: task
    })
  },
  deleteTask (id) {
    return request.post({
      url: '/task/create',
      params: {id}
    })
  }
}
export default TaskAPI
