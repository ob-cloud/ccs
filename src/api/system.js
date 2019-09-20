/*
 * @Author: eamiear
 * @Date: 2019-02-06 21:34:24
 * @Last Modified by: eamiear
 * @Last Modified time: 2019-09-20 16:56:42
 */

import request from '@/common/fetch'


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
  login (account, password) {
    return request.post({
      url: 'login',
      params: {
        account,
        password
      }
    })
  },
  logout (accessToken) {
    return request.post({
      url: 'logout',
      params: {accessToken}
    })
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
