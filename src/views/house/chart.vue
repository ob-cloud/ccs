<template>
  <div>
    <div id="lineChart" style="width: 1000px; height: 600px;"></div>
  </div>
</template>

<script>
const echarts = require('echarts/lib/echarts')
require('echarts/lib/chart/line')
require('echarts/lib/component/tooltip')
require('echarts/lib/component/title')
// import HouseAPI from '@/api/house'
import Mock from './mock'
import Helper from '@/common/helper'
export default {
  data () {
    return {
      chart: null,
      serialId: '',
      ticket: null,
      data: [],
      inTimeData: []
    }
  },
  mounted () {
    this.serialId = this.$route.query.serialId || '05D6FF353937584D43196508_2'
    this.init()
  },
  methods: {
    init () {
      const chart = this.initLineChart()
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

      // this.itikect = setInterval(() => {

      // }, 1000)
      // this.ticket = setInterval(() => {
      //   this.data = this.getLineChartData()
      //   // chart.setOption({
      //   //   series: [{
      //   //     data: data
      //   //   }]
      //   // })
      // }, 30000)
    },
    initLineChart () {
      this.chart = echarts.init(document.getElementById('lineChart'))
      return this.chart
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
    async getLineChartData () {
      // let {data} = await HouseAPI.getHouseBedDeviceDataList()
      const {data} = Mock
      const result = data.data[this.serialId]
      // console.log(result.HeartbeatRates)
      let rates = result.HeartbeatRates
      // const endTime = new Date(result.EndTime)
      rates = rates.reverse()
      // console.log(rates)
      const ratesReverse = rates.map((item, index) => {
        const timeStr = Helper.parseTime(this.getTime(result.EndTime, rates.length - index))
        console.log(timeStr)
        return {
          name: timeStr,
          value: [timeStr, item]
        }
      })
      // console.log(ratesReverse.reverse())
      return ratesReverse.reverse()
    },
    getTime (time, seconds) {
      const date = new Date(time)
      date.setSeconds(date.getSeconds() - seconds)
      return date.getTime()
    }
  },
  beforeDestroy () {
    clearInterval(this.ticket)
  },
}
</script>

<style lang="scss" scoped>

</style>
