
/*
 * @Author: eamiear
 * @Date: 2019-08-27 15:11:02
 * @Last Modified by: eamiear
 * @Last Modified time: 2019-08-27 15:59:10
 */

import request from '@/common/fetch'

const FenceAPI = {
  getFenceList () {
    return request.post({
      url: 'fence/list'
    })
  }
}
export default FenceAPI
