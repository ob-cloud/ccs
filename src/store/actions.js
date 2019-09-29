/*
 * @Author: eamiear
 * @Date: 2019-02-06 18:36:55
 * @Last Modified by: eamiear
 * @Last Modified time: 2019-09-29 15:36:24
 */
import HouseAPI from '@/api/house'
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
      console.log('houseId ', houseId)
      commit('SET_HOUSEID', houseId)
      resolve(houseId)
    })
  }
}
