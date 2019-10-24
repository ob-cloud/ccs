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
          :showPagination="false"
          :pageSize="search.pageSize"
          @row-click="dealMessage"
          @on-current-page-change="onCurrentChange"
          @on-page-size-change="onSizeChange">
        </base-table>
      </el-tab-pane>
      <!-- <el-tab-pane label="三天消息" name="days">
        <base-table
          :height="tableHeight"
          :tableData="tableData"
          :columns="columns"
          stripe border
          v-loading="tableLoading"
          :pageTotal="total"
          :pageSize="search.pageSize"
          @on-current-page-change="onCurrentChange"
          @on-page-size-change="onSizeChange">
        </base-table>
      </el-tab-pane>
      <el-tab-pane label="离线消息" name="offline">
        <base-table
          :height="tableHeight"
          :tableData="tableData"
          :columns="columns"
          stripe border
          v-loading="tableLoading"
          :pageTotal="total"
          :pageSize="search.pageSize"
          @on-current-page-change="onCurrentChange"
          @on-page-size-change="onSizeChange">
        </base-table>
      </el-tab-pane> -->
    </el-tabs>
  </div>
</template>

<script>
import BaseTable from '@/assets/package/table-base'
import NurseAPI from '@/api/nurse'
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
      columns: []
    }
  },
  computed: {
    tableHeight () {
      return document.body.clientHeight - 50 - 70 - 60 - 40
    }
  },
  components: { BaseTable },
  created () {
    this.columns = this.getColumns()
    // this.getMessageList()
    this.getCalltask()
  },
  methods: {
    getColumns () {
      const columns = [{
        label: '任务ID',
        prop: 'callTaskId',
        align: 'center'
      }, {
        label: '姓名',
        prop: 'elderName',
        align: 'center'
      }, {
        label: '事件',
        prop: 'callTaskName',
        align: 'center'
      }, {
        label: '报警时间',
        prop: 'execTime',
        align: 'center'
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
    getMessageList () {
      this.tableLoading = true
      const message = {
        'data': {
          'records': [
            {
              'id': '710000199501225215',
              'deviceName': '燃气探测',
              'nurse': '乔强',
              'elder': '梁军',
              'imie': '710000199501225215',
              'nurseId': '710000199501225215',
              'type': 2,
              alarmType: '离线报警',
              noticeTime: '2009-09-21 08:17:59',
              'locationTime': '2009-09-21 08:17:59',
              'alarmTime': '1991-12-18 15:31:25',
              'model': 'a5c8eCd4-e31d-68FF-fDaD-C6Ddd222Fec5',
              'status': 0
            }
          ],
          'total': 1
        }
      }
      this.tableData = message.data.records
      this.total = message.data.total
      this.tableLoading = false
      // const methods = {
      //   'unhandle': 'getUnhandleMessage',
      //   'days': 'getDaysMessage',
      //   'offline': 'getOfflineMessage'
      // }
      // MessageAPI[methods[this.activeName]](this.search).then(resp => {
      //   if (resp.code === 0) {
      //     this.tableData = resp.data.records
      //     this.total = resp.data.total
      //   } else {
      //     this.$message({
      //       message: resp.message || '设备获取失败'
      //     })
      //   }
      //   this.tableLoading = false
      // }).catch(err => {
      //   this.$message({
      //     title: '失败',
      //     message: err.message || '服务出错',
      //     type: 'error'
      //   })
      //   this.tableLoading = false
      // })
    },
    onCurrentChange (pageNo) {
      this.search.pageNo = pageNo
      this.getMessageList()
    },
    onSizeChange (pageSize) {
      this.search.pageSize = pageSize
      this.getMessageList()
    },
    onTabClick () {
      this.tableLoading = true
      this.columns = this.getColumns()
      this.tableData = []
      this.getMessageList()
    },
    getCalltask () {
      this.tableLoading = true
      NurseAPI.getCalltask().then(resp => {
        console.log(resp)
        this.tableLoading = false
        if (resp.code === 0 && resp.data && resp.data.records) {
          this.tableData = resp.data.records || []
        }
      }).catch(err => {
        this.tableLoading = false
        console.log(err)
      })
    },
    tableRowClassName ({row, rowIndex}) {
      return row.completeTime ? 'color-green' : 'color-red'
    },
    dealMessage (item, column, event) {
      if (item.completeTime) return
      this.$confirm(`是否完成任务 ( ${item.elderName}：${item.callTaskName} )`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        NurseAPI.updateTask(item.callTaskId).then(resp => {
          this.$message.success(`任务 ( ${item.elderName}：${item.callTaskName} ),已确认`)
          this.getCalltask()
        }).catch(err => {
          this.$message.error(`确认失败：${err.message}`)
        })
      }).catch(err => {
        console.log(err)
        console.log('cancel')
      })
    }
  }
}
</script>

<style scoped>
.message{
  padding: 20px;
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
