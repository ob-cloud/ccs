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
      <slot>
        <template slot="caption">
          <el-input @keyup.enter.native="handleSearch" class="caption-item" placeholder="设备名" v-model="search.name"></el-input>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">查询</el-button>
        </template>
        <template slot="actionBar">
          <el-button type="primary" icon="el-icon-plus" @click="handleCreate">添加设备</el-button>
        </template>
      </slot>
    </base-table>
  </div>
</template>

<script>
import BaseTable from '@/assets/package/table-base'
// import DeviceAPI from '@/api/device'
import { PAGINATION_PAGENO, PAGINATION_PAGESIZE } from '@/common/constants'
import Helper from '@/common/helper'
export default {
  data () {
    return {
      tableHeight: 0,
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
  components: { BaseTable },
  created () {
    this.columns = this.getColumns()
    this.getDeviceList()
  },
  mounted () {
    Helper.windowOnResize(this, this.fixLayout)
  },
  methods: {
    fixLayout () {
      this.tableHeight = Helper.calculateTableHeight()
    },
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
        align: 'center',
        formatter (val) {
          return val === 0 ? '离线' : '在线'
        }
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
      const device = {
        'data': {
          'records': [
            {
              'id': '1',
              'status': 0,
              'createTime': '1983-03-24 02:42:08',
              'updateTime': '1997-04-04 20:48:20',
              'name': '血压仪'
            },
            {
              'id': '2',
              'status': 1,
              'createTime': '2015-11-09 13:17:25',
              'updateTime': '1972-07-03 23:27:29',
              'name': '小夜灯'
            },
            {
              'id': '3',
              'status': 0,
              'createTime': '1987-07-29 13:55:50',
              'updateTime': '1992-08-03 16:53:07',
              'name': '烟感'
            },
            {
              'id': '4',
              'status': 2,
              'createTime': '2016-06-25 07:48:36',
              'updateTime': '1970-12-24 17:00:58',
              'name': '雷达'
            },
            {
              'id': '5',
              'status': 1,
              'createTime': '1991-05-10 01:47:44',
              'updateTime': '1990-12-05 12:19:57',
              'name': '燃气探测'
            },
            {
              'id': '6',
              'status': 1,
              'createTime': '1991-05-10 01:47:44',
              'updateTime': '1990-12-05 12:19:57',
              'name': '洗澡灯'
            },
            {
              'id': '7',
              'status': 1,
              'createTime': '1991-05-10 01:47:44',
              'updateTime': '1990-12-05 12:19:57',
              'name': '雷达探测'
            },
            {
              'id': '8',
              'status': 1,
              'createTime': '1991-05-10 01:47:44',
              'updateTime': '1990-12-05 12:19:57',
              'name': '无线呼叫报警'
            },
            {
              'id': '9',
              'status': 1,
              'createTime': '1991-05-10 01:47:44',
              'updateTime': '1990-12-05 12:19:57',
              'name': '睡眠监控仪'
            },
            {
              'id': '10',
              'status': 1,
              'createTime': '1991-05-10 01:47:44',
              'updateTime': '1990-12-05 12:19:57',
              'name': '尿床检测垫'
            },
            {
              'id': '11',
              'status': 1,
              'createTime': '1991-05-10 01:47:44',
              'updateTime': '1990-12-05 12:19:57',
              'name': '摄像头'
            }
          ],
          'total': 11
        }
      }
      this.tableData = device.data.records
      this.total = device.data.total
      this.tableLoading = false
      // DeviceAPI.getDeviceList(this.search).then(resp => {
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
      this.getDeviceList()
    },
    onSizeChange (pageSize) {
      this.search.pageSize = pageSize
      this.getDeviceList()
    },
    handleSearch () {
      this.getDeviceList()
    },
    handleCreate () {

    }
  }
}
</script>

<style scoped>
.device{
  padding: 20px;
}
</style>
