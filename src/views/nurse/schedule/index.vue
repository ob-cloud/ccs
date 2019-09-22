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
          <el-input @keyup.enter.native="handleSearch" class="caption-item" placeholder="护工姓名" v-model="search.name"></el-input>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">查询</el-button>
        </template>
        <template slot="actionBar">
          <el-button type="primary" icon="el-icon-plus" @click="handleCreate">添加护工</el-button>
        </template>
      </slot>
    </base-table>
  </div>
</template>

<script>
import BaseTable from '@/assets/package/table-base'
import ScheduleAPI from '@/api/schedule'
import { PAGINATION_PAGENO, PAGINATION_PAGESIZE } from '@/common/constants'
import Helper from '@/common/helper'
export default {
  data () {
    return {
      tableHeight: 0,
      tableLoading: true,
      search: {
        name: '',
        pageNo: PAGINATION_PAGENO,
        pageSize: PAGINATION_PAGESIZE
      },
      total: 0,
      tableData: [],
      columns: [],
      nurseModel: {

      }
    }
  },
  components: { BaseTable },
  created () {
    this.columns = this.getColumns()
    this.getScheduleList()
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
        label: '护工姓名',
        prop: 'nurse',
        align: 'center'
      }, {
        label: '老人',
        prop: 'elder',
        align: 'center'
      }, {
        label: '任务',
        prop: 'taskName',
        align: 'center'
      }, {
        label: '任务内容',
        prop: 'taskContent',
        align: 'center'
      }, {
        label: '创建时间',
        prop: 'createTime',
        align: 'center'
      }, {
        label: '执行时间',
        prop: 'execTime',
        align: 'center'
      }, {
        label: '操作',
        align: 'center',
        renderBody: this.getToolboxRender
      }]
    },
    getToolboxRender (h, row) {
      return [
        <el-button size="tiny" icon="el-icon-edit" onClick={() => this.handleEdit(row)}></el-button>,
        <el-button size="tiny" icon="el-icon-delete" onClick={() => this.handleDelete(row)}></el-button>
      ]
    },
    getScheduleList () {
      this.tableLoading = true
      ScheduleAPI.getScheduleList(this.search).then(resp => {
        if (resp.code === 0) {
          this.tableData = resp.data.records
          this.total = resp.data.total
        } else {
          this.$message({
            message: resp.message || '护工列表获取失败'
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
      this.getScheduleList()
    },
    onSizeChange (pageSize) {
      this.search.pageSize = pageSize
      this.getScheduleList()
    },
    handleSearch () {
      this.getScheduleList()
    },
    handleCreate () {

    },
    handleEdit () {

    },
    handleDelete () {

    }
  }
}
</script>

<style scoped>
.device{
  padding: 20px;
}
</style>
