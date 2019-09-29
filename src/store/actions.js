/*
 * @Author: eamiear
 * @Date: 2019-02-06 18:36:55
 * @Last Modified by: eamiear
 * @Last Modified time: 2019-09-29 16:18:53
 */
import HouseAPI from '@/api/house'
import {cacher} from '@/common/cache'
export default {
  updateDocumentClientHeight ({commit}, height) {
    commit('UPDATE_DOCUMENT_CLIENT_HEIGHT', height)
  },
  setHouseList ({commit}) {
    return new Promise((resolve, reject) => {
      HouseAPI.getHouseList().then(res => {
        let houseList = []
        if (res.code === 0) {
          houseList = res.data.records
          commit('SET_HOUSELIST', houseList)
        }
        resolve(houseList)
      }).catch(error => {
        reject(error)
      })
    })
  },
  setHouseId ({commit}, houseId) {
    return new Promise(resolve => {
      commit('SET_HOUSEID', houseId)
      resolve(houseId)
    })
  },
  setHouse ({commit}, house) {
    return new Promise(resolve => {
      commit('SET_HOUSE', house)
      cacher.setStrategy('sessionStorage').set('active_house', house)
      resolve(house)
    })
  }
}
