/*
 * @Author: eamiear
 * @Date: 2019-02-06 18:36:47
 * @Last Modified by: eamiear
 * @Last Modified time: 2019-09-21 19:02:53
 */

import {COLLAPSE_SIDEBAR, UPDATE_DOCUMENT_CLIENT_HEIGHT} from './mutation-types'

export default {
  [COLLAPSE_SIDEBAR] (state, sidebarCollapse) {
    state.sidebarCollapse = sidebarCollapse
  },
  [UPDATE_DOCUMENT_CLIENT_HEIGHT] (state, height) {
    state.documentClientHeight = height
  }
}
