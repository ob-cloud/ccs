/*
 * @Author: eamiear
 * @Date: 2019-02-06 21:34:24
 * @Last Modified by: eamiear
 * @Last Modified time: 2019-10-11 17:44:25
 */

import request from '@/common/fetch'
// import qs from 'qs'

const SystemAPI = {
  getAddressList () {
    return request.get('nursinghome/ccs/common/queryarea')
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
    return request.postForm('nursinghome/oauth/token', {password, username, grant_type: 'password'})
  },
  logout (accessToken) {
    // return request.post({
    //   url: 'logout',
    //   params: {accessToken}
    // })
    return request.post('nursinghome/ccs/logout')
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
