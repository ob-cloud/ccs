<template>
  <section class="app-container">
    <section class="app-body clearfix">
      <div class="box-container" style="overflow: auto" :style="{height: `${boxContainerHeight}px`}">
        <div class="box">
          <div class="box-content">
            <el-card class="box-card" v-for="(item, idx) in elderList" :key="idx">
              <div slot="header" class="clearfix title" :style="{background: parseStatusBackground(item.status, item.deviceStatus)}">
                <span>{{item.status | statusFilter(item.deviceStatus)}}</span>
              </div>
              <div class="text item">
                {{item.roomNo}} {{item.bedNo}} {{item.elderName}}
              </div>
              <div class="bottom clearfix">
                <el-button type="text" icon="obicon obicon-cexinshuai" style="float:left;" title="心率">{{item.heartRate}}</el-button>
                <el-button type="text" icon="obicon obicon-xieya" style="float:right;" title="血压">{{item.bloodPressure}}</el-button>
              </div>
            </el-card>
          </div>
        </div>
      </div>
    </section>
  </section>
</template>

<script>
import HouseAPI from '@/api/house'
import Config from '@/common/config'
import SockJS from 'sockjs-client'
import Stomp from 'stompjs'
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
    }
  },
  mounted () {
    this.fixLayout()
    this.getElderList()
    this.initWebSocket()
  },
  watch: {
    records: {
      deep: true,
      handler (val) {
        const target = this.elderList.find(item => item.serialId === val.serialId)
        if (target) {
          target.deviceStatus = val.deviceStatus
        }
      }
    }
  },
  methods: {
    fixLayout () {
      this.boxContainerHeight = window.document.body.clientHeight - 50 - 20 - 10
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
                  that.records = JSON.parse(response.body)
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
  /* float: left; */
  /* width: calc(100% - 270px); */
}
/* .box-aside{
  float: right;
  width: 270px;
  padding-left: 10px;
} */
.box-header{
  padding: 20px;
  text-align: center;
}
.box-content .box-card{
  width: 140px;
  height: 132px;
  display: inline-block;
  margin-left: 10px;
  margin-bottom: 10px;
}
.box-card .title{
  padding: 10px 20px;
  font-size: 14px;
  text-align: center;
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
.data-card.info{
  margin-top: 10px;
}
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
