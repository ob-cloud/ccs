/*
 * @Author: eamiear
 * @Date: 2019-02-19 10:38:23
 * @Last Modified by: eamiear
 * @Last Modified time: 2019-09-25 11:37:16
 */

const config = {
  dev: {
    // baseApi: 'https://easy-mock.com/mock/5d6cddc87dfbe2431cd34b7a/ccs/'
    // baseApi: 'http://127.0.0.1:7300/mock/5d8463e541d2b797c837bc82/ccs/',
    baseApi: 'http://localhost:8082'
  },
  prod: {
    baseApi: 'https://aliiot.on-bright.com'
  },
  websocket: {
    url: 'https://aliiot.on-bright.com/queueServer'
  },
  oauth: {
    url: 'https://aliiot.on-bright.com'
  }
}
export default config
