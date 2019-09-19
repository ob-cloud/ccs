/*
 * @Author: eamiear
 * @Date: 2019-09-19 11:33:40
 * @Last Modified by: eamiear
 * @Last Modified time: 2019-09-19 11:39:21
 */

import {
  SET_ALARM,
  SET_HOUSE_MESSAGE,
} from '../mutation-types'
import Storage from '@/common/cache'

const user = {
  state: {
    alarm: null,
    houseMessage: null,
    count: 0
  },
  mutations: {
    [SET_ALARM] (state, alarm) {
      state.alarm = alarm
    },
    [SET_HOUSE_MESSAGE] (state, message) {
      state.houseMessage = message
    },
    [SET_MESSAGE_COUNT] (state, count) {
      state.count = count
    }
  },
  actions: {
    getUserInfo ({ commit, state }) {

    }
  }
}

export default user
