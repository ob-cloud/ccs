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
  return Promise.reject(error)
})

const _defaults = (method, url, params, headers, type, configOption = {}) => {
  let config = {
    method,
    url,
    params: ['GET', 'DELETE'].includes(method.toUpperCase()) ? params : {},
    data: ['POST', 'PUT'].includes(method.toUpperCase()) ? params : {}
  }
  config = {...config, ...configOption}
  if (headers) {
    config.headers = headers
  }
  config.transformRequest = type === 'json' ? [function (data) {
    return JSON.stringify(data)
  }] : [function (data) {
    return QS.stringify(data)
  }]
  return config
}

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
  // post (url, params, setting = {}) {
  //   const config = {
  //     method: 'post',
  //     url: url,
  //     data: params
  //   }
  //   if (setting.json) {
  //     config.headers = {
  //       'Content-Type': 'application/json; charset=utf-8'
  //     }
  //     config.transformRequest = [function (data) {
  //       // 对 data 进行任意转换处理
  //       // 后台使用@RequestParam接收参数时，post请求需要接收 username=xxx&password=xxx的格式
  //       return JSON.stringify(data)
  //     }]
  //   } else { // 表单
  //     config.headers = setting.headers && {...setting.headers}
  //     config.transformRequest = [function (data) {
  //       // 对 data 进行任意转换处理
  //       // 后台使用@RequestParam接收参数时，post请求需要接收 username=xxx&password=xxx的格式
  //       return QS.stringify(data)
  //     }]
  //   }
  //   return service(config)
  // },
  post (url, params, headers = {}) {
    const defaultHeaders = {
      'Content-Type': 'application/json; charset=utf-8'
    }
    return service(_defaults('post', url, params, {...defaultHeaders, ...headers}, 'json'))
  },
  postJson (url, params, headers = {}) {
    const defaultHeaders = {
      'Content-Type': 'application/json; charset=utf-8'
    }
    return service(_defaults('post', url, params, {...defaultHeaders, ...headers}, 'json'))
  },
  postForm (url, params, headers = {}, configOption = {}) {
    const defaultHeaders = {
      Authorization: 'Basic d2ViQXBwOndlYkFwcA==',
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'cache-control': 'no-cache'
    }
    return service(_defaults('post', url, params, {...defaultHeaders, ...headers}, '', configOption))
  }
}
export default request
