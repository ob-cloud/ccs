<template>
  <section class="app-container">
    <section class="app-body clearfix">
      <div class="box-container" style="overflow: auto" :style="{height: `${boxContainerHeight}px`}">
        <div class="box">
          <el-row type="flex" class="row-bg box_title" justify="center">
            <p class="box_title-left">
              <i class="el-icon-tickets text-number"></i>
              组织数：<span class="text-number">2</span>
              <br>
              <i class="el-icon-news text-number"></i>
              员工数：<span class="text-number">31</span>
            </p>
             <p class="box_title-center">
              工单总数：<span class="text-number">21546</span><sub> 个</sub>
              <br>
              床位总数：<span class="text-number">251</span> <sub> 个</sub>
            </p>
            <p  class="box_title-right">
              服务总时间：<span class="text-number">{{userHourse}}</span> <sub> 小时</sub>
              <br>
              一周工单数：<span class="text-number">321</span> <sub> 个</sub>
            </p>
          </el-row>
          <div class="box-content" v-if="elderList.length">
            <p class="type-title">养老院老人</p>
            <el-card class="box-card" v-for="(item, idx) in elderList.filter(ele => ele.type !== 1)" :key="idx" :class="{'breath-mode': records.bedId === item.bedId}">
              <div slot="header" class="clearfix title" :style="{background: backgroundFilter(item.deviceStatus)}" :title="item.deviceStatus">
                <span>{{item.deviceStatus}}</span>
              </div>
              <div @click="showChart(item, '1', item.elderName)" class="handle-point">
                <div class="text item" :title="item.roomNo+'-'+item.bedNo+'-'+item.elderName">
                  {{item.roomNo}}-{{item.bedNo}} {{item.elderName}}
                </div>
                <div class="bottom clearfix">
                  <el-button type="text" icon="obicon obicon-cexinshuai" style="float:left;" title="床心率"><i class="obicon obicon-chuang"></i> {{item.heartRate | deviceDataFilter}}</el-button>
                  <el-button type="text" icon="obicon obicon-cexinshuai" style="float:right;" title="手表心率"><i class="obicon obicon-huaban"></i> {{getbedInfo(item.list)}}</el-button>
                </div>
                <div class="bottom clearfix">
                  <el-button type="text" icon="obicon obicon-xieya" style="float:left;" title="手表血压"><i class="obicon obicon-huaban"></i> {{getbedInfo(item.list, 'dbp')}}-{{getbedInfo(item.list, 'sdp')}}</el-button>
                </div>
              </div>
            </el-card>
            <p class="type-title">居家老人</p>
            <el-card class="box-card" v-for="(item, idx) in elderList.filter(ele => ele.type === 1)" :key="idx + '-1'" :class="{'breath-mode': records.bedId === item.bedId}">
              <div slot="header" class="clearfix title" :style="{background: backgroundFilter(item.deviceStatus)}" :title="item.deviceStatus">
                <span>{{item.deviceStatus}}</span>
              </div>
              <div @click="showChart(item, '1', item.elderName)" class="handle-point">
                <div class="text item" :title="item.roomNo+'-'+item.bedNo+'-'+item.elderName">
                  <el-button icon="el-icon-video-camera-solid" size="mini" circle title="实时监控" @click.stop="showVedio(item)"></el-button> {{item.roomNo}}-{{item.bedNo}} {{item.elderName}}
                </div>
                <div class="bottom clearfix">
                  <el-button type="text" icon="obicon obicon-cexinshuai" style="float:left;" title="床心率"><i class="obicon obicon-chuang"></i> {{item.heartRate | deviceDataFilter}}</el-button>
                  <el-button type="text" icon="obicon obicon-cexinshuai" style="float:right;" title="手表心率"><i class="obicon obicon-huaban"></i> {{getbedInfo(item.list)}}</el-button>
                </div>
                <div class="bottom clearfix">
                  <el-button type="text" icon="obicon obicon-xieya" style="float:left;" title="手表血压"><i class="obicon obicon-huaban"></i> {{getbedInfo(item.list, 'dbp')}}-{{getbedInfo(item.list, 'sdp')}}</el-button>
                </div>
              </div>
            </el-card>
          </div>
          <div  class="reload-news" v-else >
            <el-button type="primary"  size="small" title="心率" @click="getElderList">重新获取数据....</el-button>
          </div>
        </div>
      </div>
      <div class="box-aside" :style="{height: `${boxContainerHeight}px`}">
        <el-card class="data-card info" style="overflow: auto;height: 49%" >
          <div slot="header" class="">
            <span>今日服务数据</span>
          </div>
          <div class="list-parent" id="wrapper" ref="listParent" @mouseenter="clearScroll2"  @mouseleave="ifScroll2">
            <div class="list scroll-test" ref="list2" v-bind:class="{ 'open-scroll' : openSroll2}">
              <div class="item" v-for="(item, index) in todayServerList" :key="index" @click="sureServer(item)">
                <p class="desc">{{item.roomNo}}-{{item.bedNo}} {{item.elderName}}：{{item.taskName}}</p>
                <span class="time">&nbsp;{{item.completeTime ? '(已确认)' + item.completeTime : '待确认'}}</span>
              </div>
              <div v-if="!todayServerList.length" class="text-center">
                <br>
                <el-button type="primary" size="mini" @click="getDailyTask">重新获取数据</el-button>
              </div>
            </div>
          </div>
        </el-card>
        <el-card class="data-card info" style="overflow: auto;height: 49%" >
          <div slot="header" class="">
            <span>消息</span>
          </div>
          <div class="list-parent"  id="wrapper2" ref="listParent">
            <div class="list" v-bind:class="{ 'open-scroll' : openSroll}" ref="list">
              <div class="item" v-for="(item, index) in houseMessage" :key="index" @click="dealMessage(item)">
                <p class="desc">{{item.roomNo}}-{{item.bedNo}} {{item.elderName}}：{{item.callTaskName || item.taskName}}</p>
                <span class="time">&nbsp;{{item.execTime || item.time || '未处理'}}</span>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </section>
    <el-dialog
      title="提示"
      :visible.sync="dealDialog"
      width="20%"
      center>
      <div style="text-align:center;">
        <p>是否完成任务：{{visitInfo.elderName}}：{{visitInfo.callTaskName}}</p>
        <br>
        <el-button type="info" size="mini" @click="sendVisit">申请上门</el-button>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dealDialog = false">取 消</el-button>
        <el-button type="primary" @click="overcomeMessage">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="提示"
      :visible.sync="centerDialogVisible"
      width="300px"
      center>
      <p class="text-center"><strong>{{ackInfo && ackInfo.elderName}}：{{ackInfo && (ackInfo.callTaskName || ackInfo.taskName)}}</strong></p>
      <br>
      <p class="text-center">时间：{{ackInfo && ackInfo.startTime}} ~ {{ackInfo && ackInfo.endTime}}</p>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="sureAck">通 过</el-button>
        <el-button @click="refuseAck" type="danger">拒 绝</el-button>
        <el-button @click="centerDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
  </section>
</template>

<script>
// import HouseAPI from '@/api/house'
import ElderAPI from '@/api/elder'
import NurseAPI from '@/api/nurse'
// import IScroll from 'iscroll'
import { mapGetters } from 'vuex'
import { setInterval } from 'timers'
import dayjs from 'dayjs'
import Helper from '@/common/helper'
// import videojs from 'video.js'
import 'videojs-contrib-hls'
export default {
  data () {
    return {
      // elderList: [],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      records: {},
      ticket: null,
      boxContainerHeight: 700,
      scrollTime: null,
      scrollTime2: null,
      openSroll: false,
      openSroll2: false,
      todayServerList: [],
      myScroll: null,
      myScroll2: null,
      dealDialog: false,
      visitInfo: {},
      userHourse: 0,
      newsScrollTime: {
        firstTime: null,
        secendTime: null,
        threeTime: null,
      },
      false: true,
      centerDialogVisible: false,
      ackInfo: null, // 家属申请内容
      Player: null
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
      'houseMessage',
      'serialInfo',
      'elderList'
    ])
  },
  created () {
    this.userHourse = (dayjs(new Date() - dayjs('2019-9-1')) / 3600000).toFixed(2)
    this.getDailyTask()
    console.log(this.houseMessage)
  },
  mounted () {
    this.fixLayout()
    Helper.windowOnResize(this, this.fixLayout)
    this.ticket = setInterval(() => {
      // this.getElderList()
    }, 20000)
    this.getSerialInfo()
    this.$nextTick(() => {
      this.ifScroll()
    })
    // 播放器
    // var options = {};
    // var player = videojs('example_video_1', options, function onPlayerReady() {
    //   console.log('播放器已经准备好了!');
    //   setTimeout(() => {
    //     this.play().catch(err => {
    //       console.log(err)
    //     })
    //   }, 2000)
    //   this.on('canplay', function() {//可以播放，但中途可能因为加载而暂停
    //       console.log("可以播放，但中途可能因为加载而暂停")
    //   });
    //   this.on('ended', function() {
    //     console.log('播放结束了!');
    //   });
    //   this.on('error', function() {
    //     console.log('播放结束了!');
    //   });
    // },err => {
    //   console.log('player', err)
    // });
  },
  watch: {
    houseMessage (val, eldValue) {
      if (val.length !== eldValue.length) {
        this.$nextTick(() => {
          this.ifScroll()
        })
      }
    }
  },
  methods: {
    fixLayout () {
      this.boxContainerHeight = Helper.calculateTableHeight() + 80
      this.$store.dispatch('updateDocumentClientHeight', document.documentElement.clientHeight)
    },
    getElderList () {
      this.$store.dispatch('setelderList').then(res => {
        // this.getSerialInfo()
      }).catch(err => {})
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
    backgroundFilter (val) {
      return {
        '水浸': '#13dbe6',
        '在床（静卧）': '#82e282',
        '在床（体卧）': '#82e282',
        '在床（体动）': '#82e282',
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
    },
    ifScroll () {
      const parentH = this.$refs.listParent.offsetHeight
      const listH = this.$refs.list.offsetHeight
      this.scrollTime && clearTimeout(this.scrollTime)
      this.scrollTime2 && clearTimeout(this.scrollTime2)
      this.openSroll = false
      if (listH > parentH) {
        // 开启滚动定时器
        this.scrollTime = setTimeout(() => {
          this.openSroll = true
          this.scrollTime2 = setTimeout(() => {
            this.openSroll = false
            this.$store.dispatch('setHouseAlarmMessage', [...this.houseMessage.slice(1), ...this.houseMessage.slice(0, 1)])
            this.$nextTick(() => {
              this.ifScroll()
            })
          }, 2000)
        }, 10000)
      }
    },
    ifScroll2 () {
      // 开启滚动定时器
      this.clearScroll2()
      this.openSroll2 = false
      if (!this.todayServerList.length) return
      this.newsScrollTime.firstTime = setTimeout(() => {
        this.openSroll2 = true
        this.newsScrollTime.secendTime = setTimeout(() => {
          this.openSroll2 = false
          this.todayServerList.push(this.todayServerList.shift())
          this.newsScrollTime.threeTime = setTimeout(() => {
            this.ifScroll2()
          }, 6000)
        }, 2000)
      }, 4000)
    },
    clearScroll2 () {
      const key = Object.keys(this.newsScrollTime)
      key.forEach(ele => {
        this.newsScrollTime[ele] && clearTimeout(this.newsScrollTime[ele])
      })
    },
    dealMessage (item) {
      switch (item.type) {
        case 1:
          this.visitInfo = item
          this.dealDialog = true
          break
        case 7:
          this.ackInfo = item
          this.centerDialogVisible = true
          break
        default:
          break
      }
    },
    sureAck () {
      NurseAPI.ackNurseMsg({
        msgId: this.ackInfo.msgId
      }).then(res => {
        if (res.code === 0) {
          this.$message.success('申请已通过')
          this.$store.dispatch('setHouseAlarmMessage', this.houseMessage.filter(ele => ele.msgId !== this.ackInfo.msgId))
          this.centerDialogVisible = false
        } else {
          this.$message.error(res.msg)
        }
      }).catch(err => {
        this.$message.error(err.msg)
      })
    },
    refuseAck () {
      NurseAPI.refuseNurseMsg({
        mgsId: this.ackInfo.msgId
      }).then(res => {
        if (res.code === 0) {
          this.$message.success('申请已拒绝')
          this.$store.dispatch('setHouseAlarmMessage', this.houseMessage.filter(ele => ele.msgId !== this.ackInfo.msgId))
          this.centerDialogVisible = false
        } else {
          this.$message.error(res.msg)
        }
      }).catch(err => {
        this.$message.error(err.msg)
      })
    },
    sendVisit () {
      NurseAPI.sendVist(this.visitInfo.elderId).then(resp => {
        if (resp.code === 0) {
          this.$message.success(`发送申请成功`)
        } else {
          this.$message.error(`发送申请失败：${resp.msg}`)
        }
      }).catch(err => {
        this.$message.error(`发送申请失败：${err.message}`)
      })
    },
    overcomeMessage () {
      NurseAPI.updateTask(this.visitInfo.callTaskId).then(resp => {
        this.$store.dispatch('setHouseAlarmMessage', this.houseMessage.filter(ele => ele !== this.visitInfo))
        this.$message.success(`任务 ( ${this.visitInfo.elderName}：${this.visitInfo.callTaskName} ),已确认`)
        this.dealDialog = false
      }).catch(err => {
        this.$message.error(`确认失败：${err.message}`)
      })
    },
    getSerialInfo () {
      this.$store.dispatch('getWatchHeartRates').then(res => {}).catch(err => {})
      this.$store.dispatch('getWatchBloodPressure').then(res => {}).catch(err => {})
      this.$store.dispatch('getWatchLocation').then(res => {}).catch(err => {})
    },
    getbedInfo (list, type = 'heartRate') {
      if (list && list.length && Object.keys(this.serialInfo).length) {
        for (let index = 0; index < list.length; index++) {
          if (this.serialInfo[list[index].serialId]) return this.serialInfo[list[index].serialId][type]
        }
      }
      return '-'
    },
    showChart (row, tab, elderName) {
      const tarDevice = row.list.find(ele => ele.deviceType === 2)
      if (tarDevice) {
        this.$router.push({
          path: '/dashboard/chart.html',
          query: {
            serialId: tarDevice.serialId,
            tab,
            elderName,
            type: row.type
          }
        })
      } else {
        this.$message.error('老人未绑定手表，请绑定之后再查询')
      }
    },
    showVedio (item) {
      this.$message.info('功能开发中')
    },
    getDailyTask () {
      ElderAPI.getDailyTask({
        startTime: dayjs(new Date()).format('YYYY-MM-DD'),
        endTime: dayjs(new Date()).add(1, 'day').format('YYYY-MM-DD')
      }).then(res => {
        if (res.code === 0) {
          this.todayServerList = res.data.records
          this.ifScroll2()
        } else {
          this.$message.error(res.msg)
        }
      }).catch(err => {
        this.$message.error('获取服务数据失败')
        console.log('err', err)
      })
    },
    sureServer (item) {
      if (item.status) return
      this.$confirm(`确认完成任务${item.elderName}:${item.taskName}`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        ElderAPI.ackDailyTask({
          taskLogId: item.taskLogId,
        }).then(res => {
          if (res.code === 0) {
            this.$message.success('已确认完成')
            this.getDailyTask()
          }
        }).catch(err => {
          this.$message.error(err.msg)
        })
      }).catch(() => {})
    }
  },
  beforeDestroy () {
    this.ticket && clearInterval(this.ticket._id)
    this.timer && clearInterval(this.timer._id)
    this.scrollTime && clearTimeout(this.scrollTime)
    this.scrollTime2 && clearTimeout(this.scrollTime2)
    this.clearScroll2()
  }
}
</script>

<style lang="scss" scoped>
$ob-blue: rgb(0, 91, 172);
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
.reload-news {
  text-align: center;
  margin-top: 50px;
}
.box-container{
  background: #fff;
  background: linear-gradient(to bottom, rgb(11, 20, 27) 0%, rgb(39, 45, 83) 50%, rgb(17, 33, 46) 100%);
  padding: 20px;
  float: left;
  width: calc(100% - 270px);
  .box_title {
    background-color: rgba(11, 20, 27, 0.3);
    margin: 0 10px 20px;
    padding: 10px 0;
    .box_title-left,.box_title-right,.box_title-center {
      line-height: 30px;
      font-size: 24px;
      font-weight: bold;
      .text-number {
        color:#fff;
      }
      color: #fff;
    }
    .box_title-center {
      padding: 0 60px;
    }
  }
}
.box-aside{
  float: right;
  width: 260px;
  margin-left: 10px;
  background: linear-gradient(to bottom, rgb(3, 22, 37) 0%, rgb(16, 25, 88) 50%, rgb(17, 33, 46) 100%);
}
.box-aside .el-card {
  transition: 0ms;
  margin-bottom: 1%;
  background-color: transparent;
  border: none;
  color: #fff;
}
.box-aside .list-parent {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(252, 252, 252, 0.3);
}
#wrapper:hover .scroll-test{
  animation-play-state: paused;
}
.text-center {
  text-align: center;
}
.box-aside .list-parent .open-scroll{
  position:relative;
  animation:mymove 2s 1;
  /* animation-fill-mode:forwards; */
}
.box-header{
  padding: 20px;
  text-align: center;
}
.box-content .box-card{
  /* width: 140px;
  height: 132px; */
  width: 160px;
  height: 160px;
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
  overflow: hidden;
  text-overflow:ellipsis;
  white-space: nowrap;
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
  cursor: pointer;
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
@keyframes back
{
to {top: 0px;}
}
@keyframes mymove
{
from {top:0px;}
to {top:-68px;}
}
.type-title {
  color: #fff;
  font-size: 24px;
  text-indent: 1em;
  margin-bottom: 20px;
}
.handle-point {
  cursor: pointer;
}
</style>
<style lang="scss">
.box-card .el-card__body{
  padding: 15px 10px 10px;
}
.box-card .el-card__header{
  padding: 0;
}
.data-card .el-card__header{
  padding: 20px 20px 10px;
  border-bottom: none;
  color: #fff;
  font-weight: bold;
  margin-bottom: 2%;
}
.data-card .el-card__body{
  padding: 0;
  margin: 10px 20px 20px 20px;
  height: calc(100% - 83px);
}
.obicon{
  font-size: 14px;
}
</style>
