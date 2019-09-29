/*
 * @Author: eamiear
 * @Date: 2019-02-06 18:36:47
 * @Last Modified by: eamiear
 * @Last Modified time: 2019-09-29 15:30:38
 */

import {COLLAPSE_SIDEBAR, UPDATE_DOCUMENT_CLIENT_HEIGHT, SET_HOUSELIST, SET_HOUSEID} from './mutation-types'

export default {
  [COLLAPSE_SIDEBAR] (state, sidebarCollapse) {
    state.sidebarCollapse = sidebarCollapse
  },
  [UPDATE_DOCUMENT_CLIENT_HEIGHT] (state, height) {
    state.documentClientHeight = height
  },
  [SET_HOUSELIST] (state, houseList) {
    state.houseList = houseList
  },
  [SET_HOUSEID] (state, houseId) {
    state.houseId = houseId
  }
}
