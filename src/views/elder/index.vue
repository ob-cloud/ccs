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
          <el-input @keyup.enter.native="handleSearch" class="caption-item" placeholder="老人名称" v-model="search.name"></el-input>
          <el-select clearable class="caption-item" placeholder="机构类型" v-model="search.type">
            <el-option label='养老院' :value='0'></el-option>
            <el-option label='社区' :value='1'></el-option>
          </el-select>
          <el-select clearable class="caption-item" placeholder="住院状态" v-model="search.status">
            <el-option label='退院' :value='0'></el-option>
            <el-option label='在住' :value='1'></el-option>
          </el-select>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">查询</el-button>
        </template>
        <template slot="actionBar">
          <el-button type="primary" icon="el-icon-plus" @click="handleCreate">添加老人</el-button>
        </template>
      </slot>
    </base-table>
    <el-dialog top="10%" width="85%" :title="dialogAction" :visible.sync="createDialogVisible" :close-on-click-modal="false">
      <elder-create @data-ready="createElder" @close="flag => createDialogVisible = flag"></elder-create>
    </el-dialog>
  </div>
</template>

<script>
import BaseTable from '@/assets/package/table-base'
import ElderAPI from '@/api/elder'
import elderCreate from './create/index'
import { PAGINATION_PAGENO, PAGINATION_PAGESIZE } from '@/common/constants'
import Helper from '@/common/helper'
export default {
  data () {
    return {
      tableLoading: true,
      tableHeight: 0,
      search: {
        name: '',
        type: '',
        status: '',
        pageNo: PAGINATION_PAGENO,
        pageSize: PAGINATION_PAGESIZE
      },
      total: 0,
      tableData: [],
      columns: [],
      createDialogVisible: false,
      dialogAction: '添加老人',
    }
  },
  components: { BaseTable, elderCreate },
  created () {
    this.columns = this.getColumns()
    this.getElderList()
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
        label: '老人姓名',
        prop: 'name',
        align: 'center'
      }, {
        label: '手机号码',
        prop: 'phoneNumber',
        align: 'center'
      }, {
        label: '机构类型',
        prop: 'phoneNumber',
        align: 'center',
        formatter (val) {
          return val === 1 ? '居家老人' : '机构老人'
        }
      }, {
        label: '房号',
        prop: 'roomNo',
        align: 'center'
      }, {
        label: '床号',
        prop: 'bedNo',
        align: 'center'
      }, {
        label: '住院状态',
        prop: 'status',
        align: 'center',
        formatter (val) {
          return val === 1 ? '在住' : '退院'
        }
      }, {
        label: '费用状况',
        prop: 'feeStatus',
        align: 'center',
        formatter (val) {
          return val === 1 ? '无欠费' : '欠费'
        }
      }, {
        label: '住址',
        prop: 'address',
        align: 'center'
      }, {
        label: '联系人',
        prop: 'contacts',
        align: 'center'
      }, {
        label: '联系人号码',
        prop: 'contactsPhone',
        align: 'center'
      }, {
        label: '入住时间',
        prop: 'checkInTime',
        align: 'center'
      }, {
        label: '退院时间',
        prop: 'checkOutTime',
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
    getElderList () {
      this.tableLoading = true
      ElderAPI.getElderList(this.search).then(resp => {
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
      this.getElderList()
    },
    onSizeChange (pageSize) {
      this.search.pageSize = pageSize
      this.getElderList()
    },
    handleSearch () {
      this.getElderList()
    },
    handleCreate () {
      this.createDialogVisible = true
      this.dialogAction = '添加老人'
      this.elderModel = {}
    },
    createElder (model, dialogVisible) {
      console.log('eldermodel', model)
      this.createDialogVisible = dialogVisible
    },
    handleEdit (row) {
      this.createDialogVisible = true
      this.dialogAction = '编辑老人'
      this.elderModel = {...row}
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
