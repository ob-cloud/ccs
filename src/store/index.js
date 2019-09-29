/*
 * @Author: eamiear
 * @Date: 2019-02-06 18:38:53
 * @Last Modified by: eamiear
 * @Last Modified time: 2019-09-29 15:29:14
 */

import Vue from 'vue'
import Vuex from 'vuex'
import user from './modules/user'
import menu from './modules/menu'
import message from './modules/message'
import getters from './getters'
import actions from './actions'
import mutations from './mutations'

Vue.use(Vuex)

const state = {
  sidebarCollapse: false,
  documentClientHeight: 0,
  houseList: [],
  houseId: ''
}

const store = new Vuex.Store({
  modules: {
    user,
    menu,
    message
  },
  state,
  getters,
  mutations,
  actions
})

export default store
