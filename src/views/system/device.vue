<template>
  <div class="device">
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
  </div>
</template>

<script>
import BaseTable from '@/assets/package/table-base'
import DeviceAPI from '@/api/device'
import { PAGINATION_PAGENO, PAGINATION_PAGESIZE } from '@/common/constants'
export default {
  data () {
    return {
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
      return document.body.clientHeight - 50 - 60 - 40
    }
  },
  components: { BaseTable },
  created () {
    this.columns = this.getColumns()
    this.getDeviceList()
  },
  methods: {
    getColumns () {
      return [{
        label: '序号',
        prop: 'id',
        align: 'center'
      }, {
        label: '设备名称',
        prop: 'name',
        align: 'center'
      }, {
        label: '状态',
        prop: 'status',
        align: 'center'
      }, {
        label: '创建时间',
        prop: 'createTime',
        align: 'center'
      }, {
        label: '更新时间',
        prop: 'updateTime',
        align: 'center'
      }]
    },
    getDeviceList () {
      this.tableLoading = true
      DeviceAPI.getDeviceList(this.search).then(resp => {
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
      this.getDeviceList()
    },
    onSizeChange (pageSize) {
      this.search.pageSize = pageSize
      this.getDeviceList()
    }
  }
}
</script>

<style scoped>
.device{
  padding: 20px;
}
</style>
