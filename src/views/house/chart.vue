<template>
  <div id="houseChart">
    <el-tabs :tab-position="'left'" style="height: 100%;" @tab-click="handleClick">
      <el-tab-pane label="手环血压">
        <strong slot="label" style="display:inline-block;width:140px;">手环血压</strong>
        <el-row class="box-height" v-if="activeName === '1'">
          <el-col :xs="24" :md="8" class="echart-box">
            <div id="watchPressureWeek"></div>
          </el-col>
          <el-col :xs="24" :md="16" class="echart-box">
            <div id="watchPressureMonth"></div>
          </el-col>
        </el-row>
      </el-tab-pane>
      <el-tab-pane label="手环心率">
        <strong slot="label">手环心率</strong>
        <el-row class="box-height" v-if="activeName === '2'">
          <el-col :xs="24" :md="8" class="echart-box">
            <div id="watchHeartRateWeek"></div>
          </el-col>
          <el-col :xs="24" :md="16" class="echart-box">
            <div id="watchHeartRateMonth"></div>
          </el-col>
        </el-row>
      </el-tab-pane>
      <el-tab-pane label="床心率">
        <strong slot="label">床心率</strong>
        <el-row class="box-height" v-if="activeName === '3'">
          <el-col :xs="24" :md="8" class="echart-box">
            <div id="bedHeartRateWeek"></div>
          </el-col>
          <el-col :xs="24" :md="16" class="echart-box">
            <div id="bedHeartRateMonth"></div>
          </el-col>
        </el-row>
      </el-tab-pane>
      <el-tab-pane label="直播">
        <strong slot="label">直播</strong>
        <div>
          <video id="example_video_1" class="video-js vjs-default-skin" controls preload="none"
                poster="http://vjs.zencdn.net/v/oceans.png">
            <source src="http://hls.open.ys7.com/openlive/b7aa4096c0fb45c3b76dd561467c5fc6.m3u8" type="application/x-mpegURL">
          </video>
        </div>
      </el-tab-pane>
    </el-tabs>
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
        top: '8%',
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
        type: 'value'
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
      playVideo: null
    }
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
    this.serialId = this.$route.query.serialId || ''
    this.elderName = this.$route.query.elderName || ''
    // this.activeName = this.$route.query.tab + '' || '1'
    this.type = this.$route.query.type + '' || '0'
    DeviceApi.bloodPressureHistory({serialId: this.serialId}).then(res => {
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
            text: `${this.elderName}-手环血压周报`,
            left: 'center',
            top: '2%'
          },
          xAxis: {
            type: 'category',
            data: tarList.weekDayList
          },
          series: [
            {
              name: '手环低压',
              type: 'bar',
              stack: '总量',
              color: '#409EFF',
              areaStyle: {normal: {color: '#b3d8ff'}},
              data: tarList.weekDbpList
            },
            {
              name: '手环高压',
              type: 'bar',
              areaStyle: {normal: {color: '#b3d8ff'}},
              data: tarList.weekSdpList
            }
          ]
        })
        this.option2 = Object.assign({}, this.defaultOption, {
          title: {
            text: `${this.elderName}-手环血压月报`,
            left: 'center',
            top: '2%'
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: tarList.monthDayList
          },
          series: [
            {
              name: '手环低压',
              type: 'line',
              color: '#409EFF',
              // areaStyle: {normal: {color: '#b3d8ff'}},
              data: tarList.monthDbpList
            },
            {
              name: '手环高压',
              type: 'line',
              // areaStyle: {normal: {}},
              data: tarList.monthSdpList
            }
          ]
        })
        this.option3 = Object.assign({}, this.defaultOption, {
          title: {
            text: `${this.elderName}-手环心率周报`,
            left: 'center',
            top: '2%'
          },
          xAxis: {
            type: 'category',
            data: tarList.weekDayList
          },
          series: [
            {
              name: '手环心率',
              type: 'bar',
              // color: '#409EFF',
              areaStyle: {normal: {}},
              data: tarList.weekHeartRate
            }
          ]
        })
        this.option4 = Object.assign({}, this.defaultOption, {
          title: {
            text: `${this.elderName}-手环心率月报`,
            left: 'center',
            top: '2%'
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: tarList.monthDayList
          },
          series: [
            {
              name: '手环心率',
              type: 'line',
              stack: '总量',
              // color: '#409EFF',
              areaStyle: {normal: {}},
              data: tarList.monthHeartRate
            }
          ]
        })
        this.option5 && this.changeTab(this.$route.query.tab + '' || '1')
      }
    }).catch(err => {
      console.log('err', err)
    })
    DeviceApi.mattresHeartRateHistory({serialId: this.serialId}).then(res => {
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
            top: '2%'
          },
          xAxis: {
            type: 'category',
            data: tarList.bedWeekDayList
          },
          series: [
            {
              name: '床心率',
              type: 'bar',
              color: '#E6A23C',
              areaStyle: {normal: {}},
              data: tarList.bedWeekHeartRate
            }
          ]
        })
        this.option6 = Object.assign({}, this.defaultOption, {
          title: {
            text: `${this.elderName}-床心率月报`,
            left: 'center',
            top: '2%'
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: tarList.bedmonthDayList
          },
          series: [
            {
              name: '床心率',
              type: 'line',
              stack: '总量',
              color: '#E6A23C',
              areaStyle: {normal: {}},
              data: tarList.bedMonthHeartRate
            }
          ]
        })
        this.option1 && this.changeTab(this.$route.query.tab + '' || '1')
      }
    }).catch(err => {
      console.log('err', err)
    })
    window.onblur = function () {
      this.playVideo && this.playVideo.dispose()
    }
  },
  methods: {
    init () {
      const chart = echarts.init(document.getElementById('lineChart'))
      const options = this.getLineChartOptions()
      chart.setOption(options, true)
      this.getLineChartData().then(data => {
        console.log('--- ', data)
        chart.setOption({
          series: [{
            data: data
          }]
        })
      })
    },
    getLineChartOptions () {
      return {
        title: {
          text: '动态数据',
          formatter (params) {
            console.log('+++', params)
            // params = params[0]
            const date = new Date()
            return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear()
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            animation: false
          }
        },
        xAxis: {
          type: 'time',
          splitLine: {
            show: false
          }
        },
        yAxis: {
          type: 'value',
          boundaryGap: [0, '100%'],
          splitLine: {
            show: false
          }
        },
        series: [{
          name: '模拟数据',
          type: 'line',
          showSymbol: false,
          hoverAnimation: false,
          data: []
        }]
      }
    },
    handleClick (tab, event) {
      this.changeTab((tab.index * 1) + 1)
    },
    changeTab (tab = '1') {
      tab += ''
      if (this.activeName === tab) return
      this.playVideo && this.playVideo.pause()
      this.activeName = tab
      this.$nextTick(() => {
        if (tab === '1') {
          this.drawEchart(document.getElementById('watchPressureWeek'), this.option1)
          this.drawEchart(document.getElementById('watchPressureMonth'), this.option2)
        } else if (tab === '2') {
          this.drawEchart(document.getElementById('watchHeartRateWeek'), this.option3)
          this.drawEchart(document.getElementById('watchHeartRateMonth'), this.option4)
        } else if (tab === '3') {
          console.log(document.getElementById('bedHeartRateWeek'))
          this.drawEchart(document.getElementById('bedHeartRateWeek'), this.option5)
          this.drawEchart(document.getElementById('bedHeartRateMonth'), this.option6)
        } else if (tab === '4') {
          if (this.playVideo) {
            this.playVideo.play()
          } else {
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
          }
        }
      })
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
    }
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
  .echart-box {
    height: 100%;
    #watchPressureWeek,#watchPressureMonth,#watchHeartRateWeek,#watchHeartRateMonth,#bedHeartRateWeek,#bedHeartRateMonth {
      width: 100%;
      height: 100%;
    }
  }
  .box-height {
    width: 100%;
    height: calc(100vh - 100px);
  }
  .video-js {
    width: 1200px;
    height: calc(100vh - 150px);
    margin: 0 auto;
    margin-top: 40px;
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
