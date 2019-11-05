<template>
  <div id="houseChart">
    <el-row type="flex" justify="center">
      <el-button :type="activeName === '1' ? 'primary' : ''" @click="changeTab('1')" plain>手环血压</el-button>
      <el-button :type="activeName === '2' ? 'danger' : ''" @click="changeTab('2')" plain>手环心率</el-button>
    </el-row>
    <el-row v-if="activeName === '1'" style="width: 100%; height: calc(100vh - 100px);">
      <el-col :xs="24" :md="8" class="echart-box">
        <div id="watchPressureWeek"></div>
      </el-col>
      <el-col :xs="24" :md="16" class="echart-box">
        <div id="watchPressureMonth"></div>
      </el-col>
    </el-row>
    <el-row v-if="activeName === '2'" style="width: 100%; height: calc(100vh - 100px);" class="echart-box">
      <el-col :xs="24" :md="8" class="echart-box">
        <div id="watchHeartRateWeek"></div>
      </el-col>
      <el-col :xs="24" :md="16" class="echart-box">
        <div id="watchHeartRateMonth"></div>
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
export default {
  data () {
    const option1 = {
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
      activeName: '1',
      serialId: '',
      elderName: '',
      option1,
      option2: null,
      option3: null,
      option4: null,
      chart: null,
      data: [],
    }
  },
  mounted () {
    const tarList = {
      weekDayList: [],
      weekDbpList: [],
      weekSdpList: [],
      weekHeartRate: [],
      monthDayList: [],
      monthDbpList: [],
      monthSdpList: [],
      monthHeartRate: []
    }
    this.serialId = this.$route.query.serialId || '05D6FF353937584D43196508_2'
    this.elderName = this.$route.query.elderName || ''
    this.activeName = this.$route.query.tab + '' || '1'
    DeviceApi.bloodPressureHistory({serialId: this.$route.query.serialId}).then(res => {
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
        this.option1 = Object.assign({}, this.option1, {
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
        this.option2 = Object.assign({}, this.option1, {
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
        this.option3 = Object.assign({}, this.option1, {
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
        this.option4 = Object.assign({}, this.option1, {
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
        this.changeTab(this.activeName)
      }
    }).catch(err => {
      console.log('err', err)
    })
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
      console.log(tab, event)
    },
    changeTab (tab = '1') {
      this.activeName = tab
      this.$nextTick(() => {
        if (tab === '1') {
          this.drawEchart(document.getElementById('watchPressureWeek'), this.option1)
          this.drawEchart(document.getElementById('watchPressureMonth'), this.option2)
        } else {
          this.drawEchart(document.getElementById('watchHeartRateWeek'), this.option3)
          this.drawEchart(document.getElementById('watchHeartRateMonth'), this.option4)
        }
      })
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
  },
}
</script>

<style lang="scss" scoped>
#houseChart {
  background-color: #fff;
  padding-top: 10px;
  .echart-box {
    height: 100%;
    #watchPressureWeek,#watchPressureMonth,#watchHeartRateWeek,#watchHeartRateMonth {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
