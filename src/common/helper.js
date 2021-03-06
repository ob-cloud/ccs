/*
 * @Author: eamiear
 * @Date: 2019-02-19 10:38:33
 * @Last Modified by: eamiear
 * @Last Modified time: 2019-09-26 10:38:42
 */

const _toString = Object.prototype.toString

export const Helper = {
  isObject (obj) {
    return obj !== null && typeof obj === 'object'
  },
  isArray (arr) {
    return _toString.call(arr) === '[object Array]'
  },
  sort (val) {
    const keys = Object.keys(val).sort()
    const sortParam = {}
    keys.forEach(key => {
      sortParam[key] = val[key]
    })
    return sortParam
  },
  deepSort (params) {
    for (const k in params) {
      if (this.isArray(params[k])) { // 数组
        for (let i = 0; i < params[k].length; i++) {
          if (this.isObject(params[k][i])) {
            params[k][i] = this.deepSort(params[k][i])
          }
        }
      } else if (this.isObject(params[k])) { // JSON
        params[k] = this.deepSort(params[k])
      }
    }
    return this.sort(params)
  },
  deepClone (source) {
    if (!source && typeof source !== 'object') {
      throw new Error('error arguments', 'shallowClone')
    }
    const targetObj = source.constructor === Array ? [] : {}
    for (const keys in source) {
      if (source.hasOwnProperty(keys)) {
        if (source[keys] && typeof source[keys] === 'object') {
          targetObj[keys] = source[keys].constructor === Array ? [] : {}
          targetObj[keys] = this.deepClone(source[keys])
        } else {
          targetObj[keys] = source[keys]
        }
      }
    }
    return targetObj
  },
  param2Obj (url) {
    const search = url.split('?')[1]
    if (!search) {
      return {}
    }
    return JSON.parse('{"' + decodeURIComponent(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}')
  },
  getRouteNameByUrl (url) {
    const val = /.*\/(.*)\.html/.exec(url)
    return val && val.length >= 1 ? val[1] : ''
  },
  getRequest (name) {
    const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`, 'i')
    const path = window.location.href
    const r = path.slice(path.indexOf('?') + 1).match(reg)
    return (r && r.length) && r[2]
  },
  parseTime (time, fmt) {
    if (arguments.length === 0) {
      return null
    }
    const format = fmt || '{y}-{m}-{d} {h}:{i}:{s}'
    let date
    if (typeof time === 'object') {
      date = time
    } else {
      if (('' + time).length === 10) time = parseInt(time) * 1000
      date = new Date(time)
    }
    const formatObj = {
      y: date.getFullYear(),
      m: date.getMonth() + 1,
      d: date.getDate(),
      h: date.getHours(),
      i: date.getMinutes(),
      s: date.getSeconds(),
      a: date.getDay()
    }
    const timeStr = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
      let value = formatObj[key]
      if (key === 'a') return ['一', '二', '三', '四', '五', '六', '日'][value - 1]
      if (result.length > 0 && value < 10) {
        value = '0' + value
      }
      return value || 0
    })
    return timeStr
  },
  nextTick (fn) {
    fn && this.$nextTick(fn)
  },
  calculateTableHeight () {
    const winH = document.body.clientHeight
    const navH = 50
    const tableHeader = document.querySelector('.el-table-plus__header')
    const searchBarH = (tableHeader && tableHeader.clientHeight) || 0
    const paginationH = 60
    return winH - navH - searchBarH - paginationH - 40
  },
  windowOnResize (context, fn) {
    setTimeout(() => {
      this.nextTick.call(context, fn)
      window.onresize = () => {
        return (() => {
          this.nextTick.call(context, fn)
        })()
      }
    }, 0)
  },
  responseHandler (res, msg) {
    let message = `${msg}失败`
    let type = 'error'
    if (res.code === 0) {
      type = 'success'
      message = `${msg}成功`
    }
    this.$message({
      type,
      message
    })
  },
  formatAreaTree (areaList) {
    if (!areaList || !areaList.length) return
    const areaMap = []
    const areaTreeList = []
    areaList.forEach(area => {
      if (areaMap.indexOf(area.provinceId) === -1) {
        areaMap.push(area.provinceId)
        areaTreeList.push({
          value: area.provinceId,
          label: area.provinceName,
          children: [{
            value: area.cityId,
            label: area.cityName,
            children: [{
              value: area.areaId,
              label: area.areaName
            }]
          }]
        })
      } else {
        const citys = areaTreeList[areaMap.indexOf(area.provinceId)].children
        const currentCity = citys.find(city => city.value === area.cityId)
        if (currentCity) {
          currentCity.children.push({
            value: area.areaId,
            label: area.areaName
          })
        } else {
          citys.push({
            value: area.cityId,
            label: area.cityName,
            children: [{
              value: area.areaId,
              label: area.areaName
            }]
          })
        }
      }
    })
    return areaTreeList
  }
}

export default Helper
