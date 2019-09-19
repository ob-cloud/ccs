<template>
  <div class="message">
    <el-tabs v-model="activeName" @tab-click="onTabClick">
      <el-tab-pane label="未处理消息" name="unhandle">
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
      <el-tab-pane label="三天消息" name="days">
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
      </el-tab-pane>
    </el-tabs>

  </div>
</template>

<script>
import BaseTable from '@/assets/package/table-base'
import MessageAPI from '@/api/message'
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
    this.getMessageList()
  },
  methods: {
    getColumns () {
      const columns = [{
        label: '设备名称',
        prop: 'deviceName',
        align: 'center'
      }, {
        label: 'IMIE号',
        prop: 'imie',
        align: 'center'
      }, {
        label: '报警类型',
        prop: 'alarmType',
        align: 'center'
      }, {
        label: '报警时间',
        prop: 'datetime',
        align: 'center'
      }, {
        label: '定位时间',
        prop: 'loctime',
        align: 'center'
      }, {
        label: '型号',
        prop: 'model',
        align: 'center'
      }, {
        label: '状态',
        align: 'center',
        prop: 'status'
      }]
      if (this.activeName === 'offline') {
        columns[3].label = '离线时间'
      }
      return columns
    },
    getMessageList () {
      this.tableLoading = true
      const methods = {
        'unhandle': 'getUnhandleMessage',
        'days': 'getDaysMessage',
        'offline': 'getOfflineMessage'
      }
      MessageAPI[methods[this.activeName]](this.search).then(resp => {
        if (resp.code === 0) {
          this.tableData = resp.data.records
          this.total = resp.data.total
        } else {
          this.$message({
            message: resp.message || '设备获取失败'
          })
        }
        this.tableLoading = false
      }).catch(err => {
        this.$message({
          title: '失败',
          message: err.message || '服务出错',
          type: 'error'
        })
        this.tableLoading = false
      })
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
    }
  }
}
</script>

<style scoped>
.message{
  padding: 20px;
}
</style>
