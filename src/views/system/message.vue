<template>
  <div class="message">
    <el-tabs v-model="activeName" @tab-click="onTabClick">
      <el-tab-pane label="消息列表" name="unhandle">
        <base-table
          :row-class-name="tableRowClassName"
          :height="tableHeight"
          :tableData="tableData"
          :columns="columns"
          border
          v-loading="tableLoading"
          :pageTotal="total"
          :showPagination="true"
          :pageSize="search.pageSize"
          @row-click="dealMessage"
          @on-current-page-change="onCurrentChange"
          @on-page-size-change="onSizeChange">
        </base-table>
      </el-tab-pane>
      <el-tab-pane label="日程任务" name="daily">
        <base-table
          :row-class-name="tableRowClassName"
          :height="tableHeight - 50"
          :tableData="tableDataDaily"
          :columns="columnsDaily"
          border
          v-loading="dailyLoading"
          :pageTotal="totalDaily"
          :showPagination="true"
          :pageSize="searchDaily.pageSize"
          @row-click="dealMessageDaily"
          @on-current-page-change="onCurrentChangeDaily"
          @on-page-size-change="onSizeChangeDaily">
          <slot>
            <template slot="caption">
              <el-date-picker
              size="small"
                v-model="dailyTime"
                type="date"
                placeholder="选择日期"
                format="yyyy 年 MM 月 dd 日"
                value-format="yyyy-MM-dd">
              </el-date-picker>
              <el-button type="primary" icon="el-icon-search" @click="getMessageList" size="small" :disabled="!dailyTime">查询</el-button>
            </template>
          </slot>
        </base-table>
      </el-tab-pane>
    </el-tabs>
    <el-dialog
      title="提示"
      :visible.sync="dealDialog"
      width="20%"
      center>
      <div style="text-align:center;">
        <p>是否完成任务：{{visitInfo.info && visitInfo.info.elderName}}：{{visitInfo.info && visitInfo.info.callTaskName}}</p>
        <br>
        <el-button type="info" size="mini" @click="sendVisit">申请上门</el-button>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dealDialog = false">取 消</el-button>
        <el-button type="primary" @click="overcomeMessage">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="申请"
      :visible.sync="centerDialogVisible"
      width="300px"
      center>
      <p class="text-center">{{ ackInfo && ackInfo.productName}}：{{ ackInfo && ackInfo.info.taskName}}</p>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="sureAck">通 过</el-button>
        <el-button @click="refuseAck" type="danger">拒 绝</el-button>
        <el-button @click="centerDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import BaseTable from '@/assets/package/table-base'
import NurseAPI from '@/api/nurse'
import ElderAPI from '@/api/elder'
import dayjs from 'dayjs'
import {mapGetters} from 'vuex'
// import MessageAPI from '@/api/message'
import { PAGINATION_PAGENO, PAGINATION_PAGESIZE } from '@/common/constants'
export default {
  data () {
    return {
      activeName: 'unhandle',
      tableLoading: true,
      search: {
        pageNo: PAGINATION_PAGENO,
        pageSize: PAGINATION_PAGESIZE
      },
      total: 0,
      tableData: [],
      columns: [],
      dailyLoading: false,
      searchDaily: {
        pageNo: PAGINATION_PAGENO,
        pageSize: PAGINATION_PAGESIZE
      },
      totalDaily: 0,
      tableDataDaily: [],
      columnsDaily: [],
      dailyTime: '',
      centerDialogVisible: false,
      ackInfo: null, // 家属申请内容
      dealDialog: false,
      visitInfo: {},
    }
  },
  computed: {
    tableHeight () {
      return document.body.clientHeight - 50 - 70 - 60 - 40
    },
    ...mapGetters([
      'houseMessage',
      'serialInfo',
      'elderList'
    ])
  },
  components: { BaseTable },
  created () {
    this.columns = this.getColumns()
    this.columnsDaily = this.getcolumnsDaily()
    this.dailyTime = dayjs().format('YYYY-MM-DD')
    this.getCalltask()
    // this.getMessageList()
  },
  methods: {
    getColumns () {
      const columns = [{
        label: 'ID',
        prop: 'msgId',
        align: 'center'
      }, {
        label: '消息',
        prop: 'info',
        align: 'center',
        formatter (val) {
          return val.callTaskName || val.taskName
        }
      }, {
        label: '消息类型',
        prop: 'type',
        align: 'center',
        formatter (val) {
          return val ? 'SSO消息' : '申请消息'
        }
      }, {
        label: '消息状态',
        prop: 'status',
        align: 'center',
        formatter (val) {
          return val ? '已确认' : '未确认'
        }
      }, {
        label: '消息产生时间',
        prop: 'time',
        align: 'center'
      }, {
        label: '消息发起人',
        prop: 'productName',
        align: 'center'
      }, {
        label: '消息处理人',
        prop: 'consumName',
        align: 'center'
      }, {
        label: '处理时间',
        prop: 'completeTime',
        align: 'center'
      }]
      if (this.activeName === 'offline') {
        columns[3].label = '离线时间'
      }
      return columns
    },
    getcolumnsDaily () {
      const columns = [{
        label: 'ID',
        prop: 'taskLogId',
        align: 'center'
      }, {
        label: '日程',
        prop: 'taskName',
        align: 'center'
      }, {
        label: '老人名称',
        prop: 'elderName',
        align: 'center'
      }, {
        label: '处理人',
        prop: 'nurseName',
        align: 'center'
      }, {
        label: '是否完成',
        prop: 'status',
        align: 'center',
        formatter (val) {
          return val ? '是' : '否'
        }
      }, {
        label: '完成时间',
        prop: 'completeTime',
        align: 'center',
        formatter (val) {
          return val || '未完成'
        }
      }]
      if (this.activeName === 'offline') {
        columns[3].label = '离线时间'
      }
      return columns
    },
    getCalltask () {
      this.tableLoading = true
      NurseAPI.getCalltask({
        ...this.search,
        startTime: dayjs().format('YYYY-MM-DD'),
        endTime: dayjs().add(1, 'day').format('YYYY-MM-DD'),
      }).then(resp => {
        this.tableLoading = false
        if (resp.code === 0 && resp.data && resp.data.records) {
          this.tableData = resp.data.records.map(ele => {
            return {
              ...ele,
              info: JSON.parse(ele.content)
            }
          })
          this.total = resp.data.total
        } else {
          this.tableData = []
          this.total = 0
        }
      }).catch(err => {
        this.tableLoading = false
        console.log(err)
      })
    },
    getMessageList () {
      this.dailyLoading = true
      ElderAPI.getDailyTask({
        startTime: dayjs(this.dailyTime).format('YYYY-MM-DD'),
        endTime: dayjs(this.dailyTime).add(1, 'day').format('YYYY-MM-DD'),
        ...this.searchDaily
      }).then(res => {
        this.dailyLoading = false
        if (res.code === 0) {
          this.tableDataDaily = (res.data && res.data.records) || []
          this.totalDaily = (res.data && res.data.total) || 0
        }
      }).catch(err => {
        this.dailyLoading = false
        this.$message.error(err)
      })
    },
    onCurrentChange (pageNo) {
      this.search.pageNo = pageNo
      this.getCalltask()
    },
    onSizeChange (pageSize) {
      this.search.pageSize = pageSize
      this.getCalltask()
    },
    onCurrentChangeDaily (pageNo) {
      this.searchDaily.pageNo = pageNo
      this.getMessageList()
    },
    onSizeChangeDaily (pageSize) {
      this.searchDaily.pageSize = pageSize
      this.getMessageList()
    },
    onTabClick (tab, event) {
      if (tab.name === 'unhandle' && !this.tableData.length) {
        this.getCalltask()
      } else if (tab.name === 'daily' && !this.tableDataDaily.length) {
        this.getMessageList()
      }
    },
    tableRowClassName ({row, rowIndex}) {
      return row.completeTime ? 'color-green' : 'color-red'
    },
    dealMessage (item, column, event) {
      if (item.completeTime) return
      if (!item.type) {
        this.ackInfo = item
        this.centerDialogVisible = true
      } else {
        this.visitInfo = item
        this.dealDialog = true
      }
    },
    dealMessageDaily (item, column, event) {
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
            this.getMessageList()
            this.centerDialogVisible = false
          } else {
            this.$message.error(res.msg)
          }
        }).catch(err => {
          this.$message.error(err.msg)
        })
      }).catch(() => {})
    },
    sureAck () {
      NurseAPI.ackNurseMsg({
        msgId: this.ackInfo.msgId
      }).then(res => {
        if (res.code === 0) {
          this.$message.success('申请已通过')
          this.$store.dispatch('setHouseAlarmMessage', this.houseMessage.filter(ele => ele.msgId !== this.ackInfo.msgId))
          this.centerDialogVisible = false
          this.getCalltask()
        } else {
          this.$message.error(res.msg)
        }
      }).catch(err => {
        this.$message.error(err.msg)
        // this.centerDialogVisible = false
      })
    },
    refuseAck () {
      NurseAPI.refuseNurseMsg({
        mgsId: this.ackInfo.msgId
      }).then(res => {
        if (res.code === 0) {
          this.$message.success('申请已拒绝')
          this.$store.dispatch('setHouseAlarmMessage', this.houseMessage.filter(ele => ele.msgId !== this.ackInfo.msgId))
          this.getCalltask()
        }
        this.centerDialogVisible = false
      }).catch(err => {
        this.$message.error(err.msg)
      })
    },
    overcomeMessage () {
      NurseAPI.ackNurseMsg({
        msgId: this.visitInfo.msgId
      }).then(res => {
        if (res.code === 0) {
          console.log(this.houseMessage)
          this.$store.dispatch('setHouseAlarmMessage', this.houseMessage.filter(ele => ele.callTaskId !== this.visitInfo.info.callTaskId))
          this.$message.success(`任务 ( ${this.visitInfo.info.elderName}：${this.visitInfo.info.callTaskName} ),已确认`)
          this.dealDialog = false
          this.getCalltask()
        } else {
          this.$message.error(res.msg)
        }
      }).catch(err => {
        this.$message.error(err.msg)
      })
    },
    sendVisit () {
      NurseAPI.sendVist(this.visitInfo.info.elderId).then(resp => {
        if (resp.code === 0) {
          this.$message.success(`发送申请成功`)
        } else {
          this.$message.error(`发送申请失败：${resp.msg}`)
        }
      }).catch(err => {
        this.$message.error(`发送申请失败：${err.message}`)
      })
    },
  }
}
</script>

<style scoped>
.message{
  padding: 20px;
}
.text-center {
  text-align: center;
}
</style>
<style lang="scss">
.el-table .color-green {
  background: rgba(0, 128, 0, 0.3);
}
.el-table .color-red {
  background: rgba(255, 0, 0, 0.3);
}
</style>
