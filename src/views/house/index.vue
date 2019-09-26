<template>
  <section class="app-container">
    <section class="app-body clearfix">
      <div class="box-container" style="overflow: auto" :style="{height: `${boxContainerHeight}px`}">
        <div class="box">
          <div class="box-content">
            <el-card class="box-card" v-for="(item, idx) in elderList" :key="idx" :class="{'breath-mode': records.bedId === item.bedId}">
              <div slot="header" class="clearfix title" :style="{background: backgroundFilter(item.deviceStatus)}">
                <span>{{item.deviceStatus}}</span>
              </div>
              <div class="text item">
                {{item.roomNo}}-{{item.bedNo}} {{item.elderName}}
              </div>
              <div class="bottom clearfix">
                <el-button type="text" icon="obicon obicon-cexinshuai" style="float:left;" title="心率">{{item.heartRate | deviceDataFilter}}</el-button>
                <el-button type="text" icon="obicon obicon-xieya" style="float:right;" title="血压">{{item.bloodPressure | deviceDataFilter}}</el-button>
              </div>
            </el-card>
          </div>
        </div>
      </div>
      <div class="box-aside">
        <el-card class="data-card info" style="overflow: auto" :style="{height: `${boxContainerHeight}px`}">
          <div slot="header" class="">
            <span>消息</span>
          </div>
          <div class="list">
           <div class="item" v-for="(item, index) in houseMessage" :key="index">
             <p class="desc">{{item.roomNo}}-{{item.bedNo}} {{item.elderName}}：{{item.deviceType}}</p>
             <span class="time">{{item.alarmTime | timeFormatFilter}}</span>
           </div>
          </div>
        </el-card>
      </div>
    </section>
  </section>
</template>

<script>
import HouseAPI from '@/api/house'
import Config from '@/common/config'
import SockJS from 'sockjs-client'
import Stomp from 'stompjs'
import Helper from '@/common/helper'
import { mapGetters } from 'vuex'
export default {
  data () {
    return {
      elderList: [],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      records: {},
      boxContainerHeight: 700
    }
  },
  filters: {
    statusFilter (val, preset) {
      const statusMap = {
        0: '离床未归',
        1: '床上无人',
        2: '床上有人'
      }
      const deviceStatus = {
        0: '设备离线',
        1: '设备在线',
        2: '设备未绑定'
      }
      return preset === 1 ? statusMap[val] : deviceStatus[preset]
    },
    deviceDataFilter (val) {
      return val ? val.toFixed(2) : 0
    },
    timeFormatFilter (val) {
      return Helper.parseTime(val)
    }
  },
  computed: {
    ...mapGetters([
      'houseMessage'
    ])
  },
  mounted () {
    this.fixLayout()
    this.getElderList()
    this.initWebSocket()
    Helper.windowOnResize(this, this.fixLayout)
    // setInterval(() => {
    //   this.records = {
    //     bedId: [42, 41, 43, 39, 38, 37, 40][Math.floor(Math.random() * 4)]
    //   }
    //   console.log('push ', this.records)
    // }, 5000)
  },
  watch: {
    records: {
      deep: true,
      handler (val) {
        const target = this.elderList.find(item => item.bedId === val.bedId)
        if (target) {
          target.deviceStatus = val.deviceStatus
        }
      }
    }
  },
  methods: {
    // fixLayout () {
    //   this.boxContainerHeight = window.document.body.clientHeight - 50 - 20 - 10
    // },
    fixLayout () {
      this.boxContainerHeight = Helper.calculateTableHeight() + 60
    },
    getElderList () {
      HouseAPI.getHouseElderList({houseId: 18}).then(res => {
        if (res.code === 0) {
          this.elderList = res.data.records
        }
      })
    },
    handleNodeClick (e) {
      console.log(e)
    },
    parseStatusBackground (val, preset) {
      const statusMap = {
        0: '#eca8a8',
        1: '#a2a2d4',
        2: '#82e282'
      }
      const deviceStatus = {
        0: '#b9b992',
        1: '#82e282',
        2: '#d0d0d0'
      }
      return preset === 1 ? statusMap[val] : deviceStatus[preset]
    },
    initWebSocket () {
      const that = this
      this.connection()
      this.timer = setInterval(() => {
        try {
          that.stompClient.send('test')
        } catch (err) {
          that.connection()
        }
      }, 3600000)
    },
    connection () {
      const that = this
      try {
        const socket = new SockJS(Config.websocket.url)
        this.stompClient = Stomp.over(socket)
        this.stompClient.connect(
          {},
          frame => {
            this.stompClient.subscribe(
              `/user/pushmsg/remindByAli`,
              response => {
                console.log('----- ', response)
                try {
                  const record = JSON.parse(response.body)
                  if (record.type === 1) {
                    const target = this.elderList.find(item => item.bedId === record.bedId) || {}
                    this.houseMessage.unshift({...target, ...record})
                    that.$store.dispatch('setHouseAlarmMessage', this.houseMessage)
                  } else {
                    that.records = record
                  }
                  console.log(that.records)
                } catch (error) {
                  console.log('推送解析失败', error)
                }
              },
              { ack: 'client-individual' }
            )
          },
          err => {
            console.log(err)
          }
        )
      } catch (error) {
        console.log(error)
      }
    },
    disconnect () {
      if (this.stompClient) {
        this.stompClient.disconnect()
      }
    },
    backgroundFilter (val) {
      return {
        '水浸': '#13dbe6',
        '在床（静卧）': '#82e282',
        '在床（体卧）': '#82e282',
        '用户上床': '#82e282',
        '用户离床': '#a2a2d4',
        '离床': '#a2a2d4',
        '离床未归': '#eca8a8',
        '历史数据传输': 'azure',
        '设备上传数据，正在分析状态': '#58e4e4',
        '设备在线，暂时无响应': '#58e4e4',
        '设备离线': '#b9b992',
        '设备下线': '#b9b992',
        '设备意外下线': '#b9b992',
        '设备上线': '#58e4e4',
        '心率过低（低于40次/分）': '#f7aeae',
        '心率过高（高于110次/分）': '#f76d6d',
        '心率异常（2分钟内变化超过50%）': '#ff3d3d',
        '翻身护理提醒：体动过少': 'antiquewhite',
        '翻身护理提醒：体动过多': '#ec931b',
        '手动报警': '#ec2349',
      }[val]
    },
    showBedChartInfo (serialId) {
      this.$router.push({path: '/dashboard/chart.html', query: {serialId}})
    }
  },
  beforeDestroy () {
    this.disconnect()
    clearInterval(this.timer)
  }
}
</script>

<style scoped>
.app-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}
.app-container .app-sidebar{
  top: 51px;
  background: #fff;
}
.app-sidebar{
  position: fixed;
  top: 0;
  left: 0;
  width: 200px;
  height: 100%;
  overflow: hidden;
}
.app-body{
  /* margin-left: 200px; */
}
.box-container{
  background: #fff;
  padding: 20px;
  float: left;
  width: calc(100% - 270px);
}
.box-aside{
  float: right;
  width: 270px;
  padding-left: 10px;
}
.box-header{
  padding: 20px;
  text-align: center;
}
.box-content .box-card{
  /* width: 140px;
  height: 132px; */
  width: 160px;
  height: 140px;
  display: inline-block;
  margin-left: 10px;
  margin-bottom: 10px;
}
.box-card .title{
  padding: 10px 20px;
  font-size: 14px;
  text-align: center;

  text-overflow: ellipsis;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
}
.box-card .text{
  font-size: 14px;
  text-align: center;
  padding-bottom: 10px;
}
.box-card .bottom{
  padding-top: 10px;
}
.box-card .bottom .el-button{
  padding: 0;
  color: #999;
}
.clearfix:after{
  content: " ";
  width: 1px;
  height: 1px;
  visibility: hidden;
  display: inline-block;
  clear: both;
}
.data-card p {
  font-size: 14px;
  padding: 5px;
}
.data-card p span{
  margin-right: 5px;
}
/* .data-card.info{
  margin-top: 10px;
} */
.data-card.info .item{
  margin-bottom: 10px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}
.data-card.info .item .desc{
  font-size: 12px;
}
.data-card.info .item .time{
  font-size: 12px;
  color: #999;
}
.breath-mode {
  animation-timing-function: ease-in-out;
  animation-name: breathe;
  animation-duration: 2700ms;
  animation-iteration-count: 2;
  animation-direction: alternate;
}
@keyframes breathe {
  0% {
    opacity: .7;
    /* box-shadow: 0 1px 2px rgba(255, 255, 255, 0.1); */
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }

  100% {
    opacity: 1;
    /* border: 1px solid rgba(59, 235, 235, 1);
    box-shadow: 0 1px 30px rgba(59, 255, 255, 1); */
    border: 1px solid rgb(243, 68, 68);
    box-shadow: 0 1px 30px rgb(243, 68, 68);
  }
}
</style>
<style lang="scss">
.box-card .el-card__body{
  padding: 20px 20px 10px 20px;
}
.box-card .el-card__header{
  padding: 0;
}
.data-card .el-card__header{
  padding: 20px 20px 10px;
  border-bottom: none;
}
.data-card .el-card__body{
  padding: 0px 20px 20px 20px;
}
.obicon{
  font-size: 14px;
  margin-right: 3px;
}
</style>
