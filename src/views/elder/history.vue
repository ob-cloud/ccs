<template>
  <div id="elderHistory">
    <el-row type="flex" justify="center" class="top-title">
      <p class="top-title_name">{{name}}-历史记录</p>
      <el-date-picker
        size="small"
        v-model="value1"
        type="daterange"
        format="yyyy 年 MM 月 dd 日"
        value-format="yyyy-MM-dd"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期">
      </el-date-picker>
      <el-button type="primary" size="small" @click="getList" :disabled="!value1">查询</el-button>
    </el-row>
    <el-row>
      <el-col :span="12">
        <div class="echart-box" id="watchInfo"></div>
      </el-col>
      <el-col :span="12">
        <div class="echart-box" id="beadInfo"></div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import ElderAPI from '@/api/elder'
import dayjs from 'dayjs'
const echarts = require('echarts/lib/echarts')
require('echarts/lib/chart/line')
require('echarts/lib/chart/bar')
require('echarts/lib/component/tooltip')
require('echarts/lib/component/dataZoom')
require('echarts/lib/component/title')
require('echarts/lib/component/legend')
export default {
  data () {
    return {
      value1: '',
      name: '',
      elderId: '',
      watchDbp: [],
      watchSdp: [],
      watchHeartRate: [],
      watchDate: [],
      beadHeartRate: [],
      beadDate: []
    }
  },
  created () {
    this.name = this.$route.query.name
    this.elderId = this.$route.query.elderId
    this.value1 = [dayjs().add(-31, 'day').format('YYYY-MM-DD'), dayjs().add(-1, 'day').format('YYYY-MM-DD')]
    this.getList()
  },
  methods: {
    getList () {
      ElderAPI.getDeviceHistory({
        elderId: this.elderId,
        startTime: this.value1[0],
        endTime: this.value1[1],
      }).then(resp => {
        // 0:OB设备1:床垫 2:手环 3:视频(临时)
        if (resp.code === 0 && resp.data && resp.data.list) {
          const list = resp.data.list
          const leng = list.length
          const watchDbp = []
          const watchSdp = []
          const watchHeartRate = []
          const watchDate = []
          const beadHeartRate = []
          const beadDate = []
          for (let index = 0; index < leng; index++) {
            const item = list[index]
            switch (item.deviceType) {
              case 1:
                if (item.heartRate) {
                  beadHeartRate.push(item.heartRate)
                  beadDate.push(item.time)
                }
                break
              case 2:
                if (item.dbp && item.sdp && item.heartRate) {
                  watchDbp.push(item.dbp)
                  watchSdp.push(item.sdp)
                  watchHeartRate.push(item.heartRate)
                  watchDate.push(item.time)
                }
                break
            }
          }
          this.watchDbp = watchDbp
          this.watchSdp = watchSdp
          this.watchHeartRate = watchHeartRate
          this.watchDate = watchDate
          this.beadHeartRate = beadHeartRate
          this.beadDate = beadDate
          this.drawWatch()
          this.drawBead()
        }
      }).catch(err => {
      })
    },
    drawWatch () {
      const options = {
        title: {
          text: `手环数据`,
          left: '6%',
          top: '0%',
          textStyle: {
            color: '#fff'
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            crossStyle: {
              color: '#999'
            }
          }
        },
        toolbox: {
          feature: {
            dataView: {show: true, readOnly: false},
            magicType: {show: true, type: ['line', 'bar']},
            restore: {show: true},
            saveAsImage: {show: true}
          }
        },
        legend: {
          data: ['手环Dbp', '手环Sdp', '手环心率'],
          textStyle: {
            color: '#fff'
          }
        },
        xAxis: [
          {
            type: 'category',
            data: this.watchDate,
            axisPointer: {
              type: 'shadow'
            },
            axisLine: {
              onZero: false,
              lineStyle: {
                color: '#fff'
              }
            },
          }
        ],
        grid: {
          bottom: 90
        },
        dataZoom: [{
          type: 'inside'
        }, {
          type: 'slider'
        }],
        yAxis: [
          {
            type: 'value',
            name: '血压',
            min: 0,
            axisLabel: {
              formatter: '{value}',
              color: '#fff',
            },
            axisLine: {
              onZero: false,
              lineStyle: {
                color: '#fff'
              }
            },
          },
          {
            type: 'value',
            name: '心率',
            min: 0,
            axisLabel: {
              formatter: '{value}',
              color: '#fff'
            },
            axisLine: {
              onZero: false,
              lineStyle: {
                color: '#fff'
              }
            },
          }
        ],
        series: [
          {
            name: '手环Dbp',
            type: 'bar',
            color: '#0076FF',
            data: this.watchDbp
          },
          {
            name: '手环Sdp',
            type: 'bar',
            // color: '#FF5900',
            data: this.watchSdp
          },
          {
            name: '手环心率',
            type: 'line',
            yAxisIndex: 1,
            color: '#fff',
            data: this.watchHeartRate
          }
        ]
      }
      const chart = echarts.init(document.getElementById('watchInfo'))
      chart.setOption(options, true)
    },
    drawBead () {
      const options = {
        title: {
          text: `床位数据`,
          left: '6%',
          top: '0%',
          textStyle: {
            color: '#fff'
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            crossStyle: {
              color: '#999'
            }
          }
        },
        toolbox: {
          feature: {
            dataView: {show: true, readOnly: false},
            magicType: {show: true, type: ['line', 'bar']},
            restore: {show: true},
            saveAsImage: {show: true}
          }
        },
        legend: {
          data: ['床位心率'],
          textStyle: {
            color: '#fff'
          }
        },
        xAxis: [
          {
            type: 'category',
            data: this.beadDate,
            axisPointer: {
              type: 'shadow'
            },
            axisLine: {
              onZero: false,
              lineStyle: {
                color: '#fff'
              }
            },
          }
        ],
        grid: {
          bottom: 90
        },
        dataZoom: [{
          type: 'inside'
        }, {
          type: 'slider'
        }],
        yAxis: [
          {
            type: 'value',
            name: '心率',
            min: 0,
            axisLabel: {
              formatter: '{value}',
              color: '#fff'
            },
            axisLine: {
              onZero: false,
              lineStyle: {
                color: '#fff'
              }
            },
          }
        ],
        series: [
          {
            name: '手环心率',
            type: 'line',
            yAxisIndex: 0,
            color: '#fff',
            data: this.beadHeartRate
          }
        ]
      }
      const chart = echarts.init(document.getElementById('beadInfo'))
      chart.setOption(options, true)
    }
  },
  components: {}
}
</script>

<style scoped lang="scss">
#elderHistory {
  min-height: 100%;
  .top-title {
    padding-top: 20px;
    padding-bottom: 20px;
    height: 72px;
    color: #fff;
    .top-title_name {
      line-height: 32px;
      padding: 0 30px;
      font-weight: bold;
    }
  }
  .echart-box {
    width: 100%;
    height: calc(100vh - 122px);
  }
}
</style>
