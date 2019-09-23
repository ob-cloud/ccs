/*
 * @Author: eamiear
 * @Date: 2019-02-06 21:34:24
 * @Last Modified by: eamiear
 * @Last Modified time: 2019-09-23 10:34:17
 */

import request from '@/common/fetch'
// import qs from 'qs'

const SystemAPI = {
  getAddressList () {
    return request.get('/common/address')
  },
  getNactionList () {
    return request.get('/dict/nation/list')
  },
  getBloodTypeList () {
    return request.get('/dict/blood/list')
  },
  getMedicalList () {
    return request.get('/dict/disease/list')
  },
  login (username, password) {
    // return request.post({
    //   url: 'login',
    //   params: {
    //     account,
    //     password
    //   }
    // })
    return request.post('/oauth/token', {password, username, grant_type: 'password'}, {
      headers: {
        Authorization: 'Basic d2ViQXBwOndlYkFwcA==',
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'cache-control': 'no-cache'
      }
    })
  },
  logout (accessToken) {
    // return request.post({
    //   url: 'logout',
    //   params: {accessToken}
    // })
    return request.post('ccs/logout')
  },
  reNewAcessToken (oldAccessToken) {
    return request.post({
      url: 'renewToken',
      params: {accessToken: oldAccessToken}
    })
  },
  resetPassword (params) {
    return request.post({
      url: 'resetPassword',
      params
    })
  }
}
export default SystemAPI
