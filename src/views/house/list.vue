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
          <el-select clearable class="caption-item w8" placeholder="类型" v-model="search.type">
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
    <el-dialog top="10%" width="760px" :title="dialogAction" :visible.sync="createDialogVisible" :close-on-click-modal="false">
      <el-form ref="houseForm" :model="houseModel" label-width="100px">
        <el-form-item label="名称">
          <el-input class="caption-item w8" placeholder="养老院名称" v-model="houseModel.name"></el-input>
        </el-form-item>
        <el-form-item label="性质">
          <el-radio-group v-model="houseModel.type">
            <el-radio :label="0">公办</el-radio>
            <el-radio :label="1">民营</el-radio>
            <el-radio :label="2">公办民营</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="位置">
           <el-cascader
            :options="addressOptions"
            v-model="houseModel.address"
            @change="onAddressChange">
          </el-cascader>
        </el-form-item>
        <el-form-item label="联系人">
          <el-input class="caption-item w8" placeholder="联系人" v-model="houseModel.contact"></el-input>
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input class="caption-item w8" placeholder="联系电话" v-model="houseModel.phone"></el-input>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer text-center" >
        <el-button @click="createDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="createHouse">确 认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import BaseTable from '@/assets/package/table-base'
import HouseAPI from '@/api/house'
import { PAGINATION_PAGENO, PAGINATION_PAGESIZE } from '@/common/constants'
import Helper from '@/common/helper'
export default {
  data () {
    return {
      tableLoading: true,
      tableHeight: 0,
      total: 0,
      tableData: [],
      columns: [],
      search: {
        name: '',
        type: '',
        pageNo: PAGINATION_PAGENO,
        pageSize: PAGINATION_PAGESIZE
      },
      houseModel: {
        name: '',
        address: ''
      },
      addressOptions: [],
      dialogAction: '添加养老院',
      createDialogVisible: false
    }
  },
  computed: {

  },
  components: { BaseTable },
  created () {
    this.columns = this.getColumns()
    this.getHouseList()
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
    onAddressChange () {

    },
    handleSearch () {

    },
    handleCreate () {
      this.createDialogVisible = true
    },
    createHouse () {

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
.w8{
  width: 80%;
}
</style>
