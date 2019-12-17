<template>
  <div id="houseChart">
    <el-row class="house-center">
      <el-col class="house-item" :span="12">
        <div class="person-info">
          <p class="person-info-title">实时监测数据</p>
          <p class="person-info-details">
            <span class="pdr10">姓名：{{perSonInfo.elderName}}</span>
            <span class="pdr10">年龄：{{perSonInfo.age}}岁</span>
            <span class="pdr10">性别：{{perSonInfo.gender === 1 ? '女' : '男'}}</span>
            <span class="pdr10">房号：{{perSonInfo.roomNo}}</span>
            <span class="pdr10">类型：{{perSonInfo.type  === 1 ? '居家' : '养老院'}}</span>
          </p>
          <div class="person-info-real-time">
            <div class="info-img">
              <img src="../../assets/personImg.png" alt="图片">
            </div>
            <div class="person-real-info">
              <p class="person-info-title">状态<br><strong>{{perSonInfo.deviceStatus}}</strong></p>
              <p class="person-info-details">
                <span class="pdr10">床心率<br><strong>{{(perSonInfo.heartRate || 0).toFixed(2)}}</strong></span>
                <span class="pdr10">手环心率<br><strong>{{((serialInfo[serialId] && serialInfo[serialId].heartRate) || 0).toFixed(2)}}</strong></span>
                <span class="pdr10">手环血压<br><strong>{{((serialInfo[serialId] && serialInfo[serialId].dbp) || 0).toFixed(2)}}~{{((serialInfo[serialId] && serialInfo[serialId].sdp) || 0).toFixed(2)}}</strong></span>
              </p>
              <div>
                <video id="example_video_1" class="video-js vjs-default-skin" controls preload="none" v-show="vidioUrl">
                  <source :src="vidioUrl" type="application/x-mpegURL">
                </video>
              </div>
            </div>
          </div>
        </div>
      </el-col>
      <el-col class="house-item" :span="12">
        <el-col :xs="24" class="echart-box">
          <div id="watchPressureWeek" v-if="option1"></div>
          <span v-else class="not-data">暂无数据</span>
        </el-col>
        <el-col :xs="24" class="echart-box">
          <div id="watchPressureMonth"  v-if="option2"></div>
          <span v-else class="not-data">暂无数据</span>
        </el-col>
      </el-col>
      <el-col class="house-item" :span="12">
        <el-col :xs="24" class="echart-box">
          <div id="watchHeartRateWeek" v-if="option3"></div>
          <span v-else class="not-data">暂无数据</span>
        </el-col>
        <el-col :xs="24" class="echart-box">
          <div id="watchHeartRateMonth" v-if="option4"></div>
          <span v-else class="not-data">暂无数据</span>
        </el-col>
      </el-col>
      <el-col class="house-item" :span="12">
        <el-col :xs="24" class="echart-box">
          <div id="bedHeartRateWeek" v-if="option5"></div>
          <span v-else class="not-data">暂无数据</span>
        </el-col>
        <el-col :xs="24" class="echart-box">
          <div id="bedHeartRateMonth" v-if="option6"></div>
          <span v-else class="not-data">暂无数据</span>
        </el-col>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import dayjs from 'dayjs'
const echarts = require('echarts/lib/echarts')
require('echarts/lib/chart/line')
require('echarts/lib/chart/bar')
require('echarts/lib/component/tooltip')
require('echarts/lib/component/title')
import DeviceApi from '@/api/device'
import videojs from 'video.js'
import {mapGetters} from 'vuex'
import 'video.js/dist/video-js.min.css'
import 'videojs-contrib-hls'
export default {
  data () {
    const defaultOption = {
      title: {
        text: '黄观勤-手环血压周报',
        left: 'center',
        top: '2%'
      },
      tooltip: {
        trigger: 'axis'
      },
      grid: {
        left: '4%',
        right: '4%',
        bottom: '8%',
        top: '18%',
        containLabel: true
      },
      toolbox: {
        feature: {
          saveAsImage: {}
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['2019-10-20', '2019-10-21', '2019-10-22', '2019-10-23', '2019-10-24', '2019-10-25', '2019-10-26']
      },
      yAxis: {
        type: 'value',
        axisLine: {
          onZero: false,
          lineStyle: {
            color: '#fff'
          }
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
            color: 'rgba(255,255,255,0.3)'
          }
        }
      },
      series: [
        {
          name: '手环血压',
          type: 'line',
          stack: '总量',
          color: '#409EFF',
          areaStyle: {normal: {color: '#b3d8ff'}},
          data: [82, 93, 90, 93, 120, 110, 100]
        }
      ]
    }
    return {
      activeName: '0',
      serialId: '',
      watchId: '',
      beadId: '',
      tvId: '',
      elderName: '',
      type: 0,
      defaultOption,
      option1: null,
      option2: null,
      option3: null,
      option4: null,
      option5: null,
      option6: null,
      chart: null,
      data: [],
      playVideo: null,
      perSonInfo: {},
      vidioUrl: null
    }
  },
  computed: {
    ...mapGetters([
      'elderList',
      'serialInfo'
    ])
  },
  mounted () {
    const tarList = {
      // 手表心率数据
      weekDayList: [],
      weekDbpList: [],
      weekSdpList: [],
      weekHeartRate: [],
      monthDayList: [],
      monthDbpList: [],
      monthSdpList: [],
      monthHeartRate: [],
      // 床心率数据
      bedWeekDayList: [],
      bedWeekHeartRate: [],
      bedmonthDayList: [],
      bedMonthHeartRate: []
    }
    this.serialId = this.$route.query.watchId || ''
    this.watchId = this.$route.query.watchId || ''
    this.beadId = this.$route.query.beadId || ''
    this.tvId = this.$route.query.tvId || ''
    this.elderName = this.$route.query.elderName || ''
    this.type = this.$route.query.type + '' || '0'
    window.onblur = function () {
      this.playVideo && this.playVideo.dispose()
    }
    // 获取个人信息
    this.perSonInfo = this.elderList.find(ele => {
      return ele.elderName === this.$route.query.elderName
    })
    if (this.watchId) {
      this.$store.dispatch('getWatchHeartRates', this.watchId).then(res => {}).catch(err => {})
      this.$store.dispatch('getWatchBloodPressure', this.watchId).then(res => {}).catch(err => {})
      this.$store.dispatch('getWatchLocation', this.watchId).then(res => {}).catch(err => {})
      DeviceApi.bloodPressureHistory({serialId: this.watchId}).then(res => {
        if (res.code === 0) {
          res.data.week.forEach(element => {
            tarList.weekDayList.unshift(element.time)
            tarList.weekDbpList.unshift(element.dbp.toFixed(2) * 1)
            tarList.weekSdpList.unshift(element.sdp.toFixed(2) * 1)
            tarList.weekHeartRate.unshift(element.heartRate.toFixed(2) * 1)
          })
          res.data.month.forEach(element => {
            tarList.monthDayList.unshift(element.time)
            tarList.monthDbpList.unshift(element.dbp.toFixed(2) * 1)
            tarList.monthSdpList.unshift(element.sdp.toFixed(2) * 1)
            tarList.monthHeartRate.unshift(element.heartRate.toFixed(2) * 1)
          })
          this.option1 = Object.assign({}, this.defaultOption, {
            title: {
              text: `${this.elderName}-手环血压 周报`,
              left: 'center',
              top: '0%',
              textStyle: {
                color: '#fff'
              }
            },
            xAxis: {
              type: 'category',
              boundaryGap: false,
              data: tarList.weekDayList,
              axisLabel: {
                formatter: function (value, index) {
                  const tar = value.split('-')
                  return tar[1] + '.' + tar[2]
                },
              },
              axisLine: {
                onZero: false,
                lineStyle: {
                  color: '#fff'
                }
              }
            },
            series: [
              {
                name: '手环低压',
                type: 'line',
                stack: '总量',
                color: '#0076FF',
                data: tarList.weekDbpList,
                symbolSize: 6
              },
              {
                name: '手环高压',
                type: 'line',
                color: '#FF5900',
                data: tarList.weekSdpList,
                symbolSize: 6
              }
            ]
          })
          this.option2 = Object.assign({}, this.defaultOption, {
            title: {
              text: `${this.elderName}-手环血压 月报`,
              left: 'center',
              top: '0%',
              textStyle: {
                color: '#fff'
              }
            },
            xAxis: {
              type: 'category',
              boundaryGap: false,
              data: tarList.monthDayList,
              axisLabel: {
                formatter: function (value, index) {
                  const tar = value.split('-')
                  return tar[1] + '/' + tar[2]
                },
              },
              axisLine: {
                onZero: false,
                lineStyle: {
                  color: '#fff'
                }
              }
            },
            series: [
              {
                name: '手环低压',
                type: 'line',
                color: '#0076FF',
                data: tarList.monthDbpList,
                symbolSize: 6
              },
              {
                name: '手环高压',
                type: 'line',
                color: '#FF5900',
                data: tarList.monthSdpList,
                symbolSize: 6
              }
            ]
          })
          this.option3 = Object.assign({}, this.defaultOption, {
            title: {
              text: `${this.elderName}-手环心率周报`,
              left: 'center',
              top: '0%',
              textStyle: {
                color: '#fff'
              }
            },
            xAxis: {
              type: 'category',
              data: tarList.weekDayList,
              boundaryGap: false,
              axisLabel: {
                formatter: function (value, index) {
                  const tar = value.split('-')
                  return tar[1] + '.' + tar[2]
                },
              },
              axisLine: {
                onZero: false,
                lineStyle: {
                  color: '#fff'
                }
              }
            },
            series: [
              {
                name: '手环心率',
                type: 'line',
                color: '#FF5900',
                areaStyle: {color: 'rgba(255,89,0,0.1)'},
                data: tarList.weekHeartRate,
                symbolSize: 6
              }
            ]
          })
          this.option4 = Object.assign({}, this.defaultOption, {
            title: {
              text: `${this.elderName}-手环心率月报`,
              left: 'center',
              top: '0%',
              textStyle: {
                color: '#fff'
              }
            },
            xAxis: {
              type: 'category',
              boundaryGap: false,
              data: tarList.monthDayList,
              axisLabel: {
                formatter: function (value, index) {
                  const tar = value.split('-')
                  return tar[1] + '/' + tar[2]
                },
              },
              axisLine: {
                onZero: false,
                lineStyle: {
                  color: '#fff'
                }
              }
            },
            series: [
              {
                name: '手环心率',
                type: 'line',
                color: '#FF5900',
                areaStyle: {color: 'rgba(255,89,0,0.1)'},
                data: tarList.monthHeartRate,
                symbolSize: 6
              }
            ]
          })
          // this.option5 && this.changeTab(this.$route.query.tab + '' || '1')
          this.$nextTick(() => {
            this.drawEchart(document.getElementById('watchPressureWeek'), this.option1)
            this.drawEchart(document.getElementById('watchPressureMonth'), this.option2)
            this.drawEchart(document.getElementById('watchHeartRateWeek'), this.option3)
            this.drawEchart(document.getElementById('watchHeartRateMonth'), this.option4)
          })
        }
      }).catch(err => {
        console.log('err', err)
      })
    }
    if (this.beadId) {
      DeviceApi.mattresHeartRateHistory({serialId: this.beadId}).then(res => {
        if (res.code === 0) {
          res.data.week.forEach(element => {
            tarList.bedWeekDayList.unshift(element.time)
            tarList.bedWeekHeartRate.unshift(element.heartRate.toFixed(2) * 1)
          })
          res.data.month.forEach(element => {
            tarList.bedmonthDayList.unshift(element.time)
            tarList.bedMonthHeartRate.unshift(element.heartRate.toFixed(2) * 1)
          })
          this.option5 = Object.assign({}, this.defaultOption, {
            title: {
              text: `${this.elderName}-床心率周报`,
              left: 'center',
              top: '0%',
              textStyle: {
                color: '#fff'
              }
            },
            xAxis: {
              type: 'category',
              data: tarList.bedWeekDayList,
              boundaryGap: false,
              axisLabel: {
                formatter: function (value, index) {
                  const tar = value.split('-')
                  return tar[1] + '.' + tar[2]
                },
              },
              axisLine: {
                onZero: false,
                lineStyle: {
                  color: '#fff'
                }
              }
            },
            series: [
              {
                name: '床心率',
                type: 'line',
                color: '#0076FF',
                areaStyle: {color: 'rgba(0,118,255,0.1)'},
                data: tarList.bedWeekHeartRate,
                symbolSize: 6
              }
            ]
          })
          this.option6 = Object.assign({}, this.defaultOption, {
            title: {
              text: `${this.elderName}-床心率月报`,
              left: 'center',
              top: '0%',
              textStyle: {
                color: '#fff'
              }
            },
            xAxis: {
              type: 'category',
              boundaryGap: false,
              data: tarList.bedmonthDayList,
              axisLabel: {
                formatter: function (value, index) {
                  const tar = value.split('-')
                  return tar[1] + '.' + tar[2]
                },
              },
              axisLine: {
                onZero: false,
                lineStyle: {
                  color: '#fff'
                }
              }
            },
            series: [
              {
                name: '床心率',
                type: 'line',
                stack: '总量',
                color: '#0076FF',
                areaStyle: {color: 'rgba(0,118,255,0.1)'},
                data: tarList.bedMonthHeartRate,
                symbolSize: 6
              }
            ]
          })
          // this.option1 && this.changeTab(this.$route.query.tab + '' || '1')
          this.$nextTick(() => {
            this.drawEchart(document.getElementById('bedHeartRateWeek'), this.option5)
            this.drawEchart(document.getElementById('bedHeartRateMonth'), this.option6)
          })
        }
      }).catch(err => {
        console.log('err', err)
      })
    }
    if (this.tvId) {
      const videoObj = this.perSonInfo.list.find(ele => ele.deviceType === 3)
      if (videoObj) {
        this.vidioUrl = videoObj.serialId
        this.$nextTick(() => {
          this.openTV()
        })
      }
    }
  },
  methods: {
    openTV () {
      const options = {}
      this.playVideo = videojs('example_video_1', options, function onPlayerReady () {
        console.log('播放器已经准备好了!')
        setTimeout(() => {
          this.play().catch(err => {
            console.log(err)
          })
        }, 2000)
        this.on('canplay', function () {
          console.log('可以播放，但中途可能因为加载而暂停')
        })
        this.on('ended', function () {
          console.log('播放结束了!')
        })
        this.on('error', function () {
          console.log('播放结束了!')
        })
      }, err => {
        console.log('player', err)
      })
      this.playVideo.play()
    },
    closeVedio () {
      this.playVideo.dispose()
    },
    drawEchart (dom, options) {
      const chart = echarts.init(dom)
      chart.setOption(options, true)
    },
    getDayRandomNum (day, totle, randomNum) {
      const dayList = []
      const randomList = []
      for (let index = 0; index < totle; index++) {
        dayList.unshift(dayjs(day).add(index * -1, 'day').format('YYYY-MM-DD'))
        randomList.push(Math.ceil(Math.random() * 10) + randomNum)
      }
      return {
        dayList,
        randomList
      }
    },
    getSerialInfo (serialId) {
      this.$store.dispatch('getWatchHeartRates', serialId).then(res => {}).catch(err => {})
      this.$store.dispatch('getWatchBloodPressure', serialId).then(res => {}).catch(err => {})
      this.$store.dispatch('getWatchLocation', serialId).then(res => {}).catch(err => {})
    },
  },
  beforeDestroy () {
    this.playVideo && this.playVideo.dispose()
  },
}
</script>

<style lang="scss" scoped>
#houseChart {
  height: 100%;
  background-color: #fff;
  .box-height {
    width: 100%;
    height: calc(100vh - 100px);
  }
  .house-center {
    background-color: red;
    height: calc(100vh - 50px);
    background-color: #0C1A49;
    padding: 10px 30px;
    .house-item {
      height: 50%;
      min-height: 430px;
      background-color: #1A2C6B;
      border: 5px solid #0C1A49;
      .echart-box {
        height: 50%;
        padding: 6px 14px;
        text-align: center;
        #watchPressureWeek,#watchPressureMonth,#watchHeartRateWeek,#watchHeartRateMonth,#bedHeartRateWeek,#bedHeartRateMonth {
          width: 100%;
          height: 100%;
        }
        .not-data {
          font-size: 12px;
          display: inline-block;
          height: 100%;
          line-height: 100%;
          color: rgba(107, 107, 107, 0.637);
        }
      }
      .person-info {
        color: #fff;
        padding: 14px 30px;
        height: 100%;
        background-color: #1A2C6B;
        .person-info-title {
          font-size:14px;
          font-family:OPPOSans-B,OPPOSans;
          font-weight:normal;
          color:rgba(255,255,255,1);
          line-height:22px;
          margin-bottom: 14px;
        }
        .person-info-details {
          display: flex;
          justify-content: space-between;
        }
        .person-info-real-time {
          display: flex;
          margin-top: 35px;
          min-height: 300px;
          .info-img {
            text-align: center;
            width: 40%;
            img {
              width: auto;
              height: 300px;
            }
          }
          .person-real-info {
            min-height: 300px;
            padding: 23px 0 0 35px;
            flex-grow: 1;
            .video-js {
              margin-top: 15px;
              width: 100%;
              max-width: 400px;
              height: 160px;
            }
          }
        }
      }
    }
  }
}
</style>

<style lang="scss">
#houseChart {
  .el-tabs__item.is-active {
    background: #409EFF;
    color: #fff;
  }
  .el-tabs__item.is-active:hover {
    color: #fff;
  }
}
</style>
