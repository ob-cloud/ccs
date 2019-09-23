import axios from 'axios'
import QS from 'qs'
import Storage from '@/common/cache'
import Router from '@/router'
import envConfig from '@/common/config'

const isProduct = process.env.NODE_ENV !== 'development'
const requestBaseUrl = !isProduct ? envConfig.dev.baseApi : envConfig.prod.baseApi

const service = axios.create({
  baseURL: requestBaseUrl,
  withCredentials: true,
  // headers: {
  //   'Content-Type': 'application/json; charset=utf-8'
  // },
  timeout: 16000
})

service.interceptors.request.use(config => {
  // setHeader()
  // config.headers.token = Storage.getToken()
  // config.headers.access_token = Storage.getToken()
  if (!config.params) config.params = {}
  config.params.access_token = Storage.getToken()
  return config
}, error => {
  Promise.reject(error)
})

service.interceptors.response.use(({data}) => {
  if (data.code === 1002) { // invalid token
    Storage.removeToken()
    Router.push({path: '/login'})
  }
  return data
}, error => {
  // TODO alert exception
  Promise.reject(error)
})

service.getRequestUrl = url => requestBaseUrl + url

const request = {
  getRequestUrl (url) {
    return requestBaseUrl + url
  },
  get (url, params) {
    return service({
      method: 'get',
      url,
      params
    })
  },
  // url, data, json = false, serials = true
  post (url, params, setting = {}) {
    const config = {
      method: 'post',
      url: url,
      data: params
    }
    if (setting.json) {
      config.headers = {
        'Content-Type': 'application/json; charset=utf-8'
      }
      config.transformRequest = [function (data) {
        // 对 data 进行任意转换处理
        // 后台使用@RequestParam接收参数时，post请求需要接收 username=xxx&password=xxx的格式
        return JSON.stringify(data)
      }]
    } else {
      config.headers = setting.headers && {...setting.headers}
      config.transformRequest = [function (data) {
        // 对 data 进行任意转换处理
        // 后台使用@RequestParam接收参数时，post请求需要接收 username=xxx&password=xxx的格式
        return QS.stringify(data)
      }]
    }
    return service(config)
    // return service({
    //   method: 'post',
    //   url,
    //   data: data,
    //   // `transformRequest` 允许在向服务器发送前，修改请求数据
    //   // 只能用在 'PUT', 'POST' 和 'PATCH' 这几个请求方法
    //   // 后面数组中的函数必须返回一个字符串，或 ArrayBuffer，或 Stream
    //   transformRequest: [function (data) {
    //     // 对 data 进行任意转换处理
    //     // 后台使用@RequestParam接收参数时，post请求需要接收 username=xxx&password=xxx的格式
    //     return serials ? (json ? JSON.stringify(data) : QS.stringify(data)) : data
    //   }]
    // })
  }
}
export default request
