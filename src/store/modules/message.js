/*
 * @Author: eamiear
 * @Date: 2019-09-19 11:33:40
 * @Last Modified by: eamiear
 * @Last Modified time: 2019-09-25 11:39:14
 */

import {
  SET_ALARM,
  SET_HOUSE_MESSAGE,
  SET_MESSAGE_COUNT
} from '../mutation-types'
// import Storage from '@/common/cache'

const user = {
  state: {
    alarm: null,
    houseMessage: [],
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
    setHouseAlarmMessage ({ commit, state }, message) {
      return new Promise(resolve => {
        commit('SET_HOUSE_MESSAGE', message)
        resolve(message)
      })
    }
  }
}

export default user
