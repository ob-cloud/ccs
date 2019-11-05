/*
 * @Author: eamiear
 * @Date: 2019-09-19 11:33:40
 * @Last Modified by: eamiear
 * @Last Modified time: 2019-09-25 11:39:14
 */

import SockJS from 'sockjs-client'
import Stomp from 'stompjs'
import Storage from '@/common/cache'
import Config from '@/common/config'
import {
  SET_ELDER_LIST,
  SET_SERIAL_INFO,
  SET_WATCH_HEART_RATE,
  SET_WATCH_BLOOD_PRESSURE,
  OPEN_SOCKET
} from '../mutation-types'
import HouseAPI from '@/api/house'
import DeviceAPI from '@/api/device'
// import Storage from '@/common/cache'

const user = {
  state: {
    elderList: [], // 老人列表
    serialInfo: {}, // 设备信息
    alarm: null,
    count: 0,
    stompClient: null,
    stompClient2: null
  },
  mutations: {
    [SET_ELDER_LIST] (state, list) {
      state.elderList = list
    },
    [SET_SERIAL_INFO] (state, info) {
      state.serialInfo = Object.assign({}, state.serialInfo, {[info.serialId]: info})
    },
    [SET_WATCH_HEART_RATE] (state, count) {
      state.count = count
    },
    [SET_WATCH_BLOOD_PRESSURE] (state, count) {
      state.count = count
    },
    [OPEN_SOCKET] (state, stopm) {
      state.stompClient = stopm
    }
  },
  actions: {
    setelderList ({ dispatch, commit, state }, message) {
      return new Promise(async (resolve, reject) => {
        if (!state.stompClient) {
          await dispatch('connection')
        }
        HouseAPI.getHouseElderList({houseId: 18}).then(res => {
          if (res.code === 0) {
            commit('SET_ELDER_LIST', res.data.records)
            resolve(res)
          } else {
            reject(res.message)
          }
        }).catch(err => {
          reject(err)
        })
      })
    },
    connection ({dispatch, commit, state, getters}) {
      return new Promise((resolve, reject) => {
        try {
          const socket = new SockJS(Config.websocket.url)
          commit('OPEN_SOCKET', Stomp.over(socket))
          state.stompClient.connect(
            {},
            frame => {
              resolve()
              state.stompClient.subscribe(
                `/user/${Storage.getToken()}/remindByAli`,
                response => {
                  console.log('websock' + new Date(), response)
                  try {
                    const record = JSON.parse(response.body)
                    let tarCord = {}
                    switch (record.type) {
                      case 2:
                      case 3:
                      case 4:
                        if (record.serialId) {
                          tarCord = state.elderList.find(ele => {
                            return ele.list && ele.list.find(element => element.serialId === record.serialId)
                          })
                        }
                        record.serialId && commit('SET_SERIAL_INFO', Object.assign({}, tarCord, state.serialInfo[record.serialId] || {}, record)) // 记录设备的心率，位置，血压
                        break
                      default:
                        break
                    }
                  } catch (error) {
                    console.log('推送解析失败', error)
                  }
                },
                { ack: 'client-individual' }
              )
              state.stompClient.subscribe(
                `/user/pushmsg/remindByAli`,
                response => {
                  console.log('websock2' + new Date(), response)
                  console.log('state' + new Date(), state)
                  try {
                    const record = JSON.parse(response.body)
                    let tarCord = {}
                    switch (record.type) {
                      case 1:
                      case 5:
                      case 6:
                        state.elderList.forEach(ele => {
                          if (ele.bedId === record.bedId || ele.id === record.elderId) {
                            tarCord = ele
                          }
                        })
                        dispatch('setHouseAlarmMessage', getters.houseMessage.concat([Object.assign({}, record, tarCord)])) // 消息列表，开门推送+SSO申请
                        break
                      default:
                        break
                    }
                  } catch (error) {
                    console.log('推送解析失败', error)
                  }
                },
                { ack: 'client-individual' }
              )
            },
            err => {
              console.log('连接断开', err)
              commit('OPEN_SOCKET', null)
              dispatch('connection')
              reject()
            }
          )
        } catch (error) {
          console.log(error)
        }
      })
    },
    getWatchHeartRates ({ dispatch, commit, state }, message) {
      return new Promise(async (resolve, reject) => {
        if (!state.elderList.length) {
          await dispatch('setelderList')
        }
        const deviceList = []
        state.elderList.forEach(ele => {
          if (ele.list && ele.list.length) {
            ele.list.forEach(element => {
              (element.deviceType === 2) && deviceList.push(element.serialId)
            })
          }
        })
        if (!deviceList.length) {
          reject('暂无数据')
        } else {
          DeviceAPI.getWatchHeartRates({serialId: deviceList.join(',')}).then(res => {
            resolve(res)
          }).catch(err => {
            reject(err)
          })
        }
      })
    },
    getWatchBloodPressure ({ dispatch, commit, state }, message) {
      return new Promise(async (resolve, reject) => {
        if (!state.elderList.length) {
          await dispatch('setelderList')
        }
        const deviceList = []
        state.elderList.forEach(ele => {
          if (ele.list && ele.list.length) {
            ele.list.forEach(element => {
              (element.deviceType === 2) && deviceList.push(element.serialId)
            })
          }
        })
        if (!deviceList.length) {
          reject('暂无数据')
        } else {
          DeviceAPI.getWatchBloodPressure({serialId: deviceList.join(',')}).then(res => {
            resolve(res)
          }).catch(err => {
            reject(err)
          })
        }
      })
    },
    getWatchLocation ({ dispatch, commit, state }, message) {
      return new Promise(async (resolve, reject) => {
        if (!state.elderList.length) {
          await dispatch('setelderList')
        }
        const deviceList = []
        state.elderList.forEach(ele => {
          if (ele.list && ele.list.length) {
            ele.list.forEach(element => {
              (element.deviceType === 2) && deviceList.push(element.serialId)
            })
          }
        })
        if (!deviceList.length) {
          reject('暂无数据')
        } else {
          DeviceAPI.getWatchLocation({serialId: deviceList.join(',')}).then(res => {
            resolve(res)
          }).catch(err => {
            reject(err)
          })
        }
      })
    }
  }
}

export default user
