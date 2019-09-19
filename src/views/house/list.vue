<template>
  <div class="content">
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
          <el-input @keyup.enter.native="handleSearch" class="caption-item" placeholder="养老院/社区名称" v-model="search.name"></el-input>
          <el-select clearable class="caption-item" placeholder="类型" v-model="search.type">
            <el-option label='全部' value=''></el-option>
            <el-option label='养老院' :value='0'></el-option>
            <el-option label='社区' :value='1'></el-option>
          </el-select>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">查询</el-button>
        </template>
        <template slot="actionBar">
          <el-button type="primary" icon="el-icon-plus" @click="handleCreate">添加养老院</el-button>
        </template>
      </slot>
    </base-table>
  </div>
</template>

<script>
import BaseTable from '@/assets/package/table-base'
import HouseAPI from '@/api/house'
import { PAGINATION_PAGENO, PAGINATION_PAGESIZE } from '@/common/constants'
export default {
  data () {
    return {
      tableLoading: true,
      search: {
        name: '',
        type: '',
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
    this.getHouseList()
  },
  methods: {
    fixLayout () {

    },
    getColumns () {
      return [{
        label: '序号',
        prop: 'id',
        align: 'center'
      }, {
        label: '养老院/社区名称',
        prop: 'name',
        align: 'center'
      }, {
        label: '类型',
        prop: 'type',
        align: 'center',
        formatter (val) {
          return val === 1 ? '社区' : '养老院'
        }
      }, {
        label: '地址',
        prop: 'address',
        align: 'center'
      }, {
        label: '经度',
        prop: 'lng',
        align: 'center'
      }, {
        label: '纬度',
        prop: 'lat',
        align: 'center'
      }, {
        label: '操作',
        align: 'center',
        minWidth: '180px',
        renderBody: this.getToolboxRender
      }]
    },
    getToolboxRender (h, row) {
      return [
        <el-button size="tiny" icon="el-icon-edit" onClick={() => this.handleEdit(row)}></el-button>,
        <el-button size="tiny" icon="el-icon-delete" onClick={() => this.handleDelete(row)}></el-button>
      ]
    },
    getHouseList () {
      this.tableLoading = true
      HouseAPI.getHouseList(this.search).then(resp => {
        if (resp.code === 0) {
          this.tableData = resp.data.records
          this.total = resp.data.total
        } else {
          this.$message({
            message: resp.message || '列表获取失败'
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
      this.getHouseList()
    },
    onSizeChange (pageSize) {
      this.search.pageSize = pageSize
      this.getHouseList()
    },
    handleSearch () {

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
.content{
  padding: 20px;
}
</style>
