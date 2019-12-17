<template>
  <div class="nurse">
    <base-table
      :height="tableHeight"
      :tableData="tableData"
      :columns="columns"
      stripe
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
// import NurseAPI from '@/api/nurse'
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
    this.getNurseList()
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
        prop: 'name',
        align: 'center'
      }, {
        label: '性别',
        prop: 'gender',
        align: 'center',
        formatter (val) {
          const map = {
            0: '男',
            1: '女',
            2: '其他'
          }
          return map[val]
        }
      }, {
        label: '入职时间',
        prop: 'hiredate',
        align: 'center'
      }, {
        label: '离职时间',
        prop: 'leavedate',
        align: 'center'
      }, {
        label: '在职状态',
        prop: 'status',
        align: 'center',
        formatter (val) {
          return val === 0 ? '离职' : '在职'
        }
      }, {
        label: '职称',
        prop: 'rank',
        align: 'center'
      }, {
        label: '看护老人',
        prop: 'elder',
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
    getNurseList () {
      const nurse = {
        'records': [
          {
            'id': '1',
            'name': '石洁珊',
            'gender': 1,
            'hiredate': '2019-05-05',
            'leavedate': '',
            'status': 1,
            'rank': '护工',
            'task': '',
            'elder': '',
            'houseId': '',
            'houseName': ''
          },
          {
            'id': '2',
            'name': '童显会',
            'gender': 1,
            'hiredate': '2019-06-05',
            'leavedate': '',
            'status': 1,
            'rank': '护工',
            'task': '',
            'elder': '',
            'houseId': '',
            'houseName': ''
          },
          {
            'id': '3',
            'name': '陈体添',
            'gender': 1,
            'hiredate': '2019-03-05',
            'leavedate': '',
            'status': 1,
            'rank': '护工',
            'task': '',
            'elder': '',
            'houseId': '',
            'houseName': ''
          },
          {
            'id': '4',
            'name': '潘桂平',
            'gender': 1,
            'hiredate': '2019-05-05',
            'leavedate': '',
            'status': 1,
            'rank': '护工',
            'task': '',
            'elder': '',
            'houseId': '',
            'houseName': ''
          },
          {
            'id': '5',
            'name': '温玉姨',
            'gender': 1,
            'hiredate': '2019-06-05',
            'leavedate': '',
            'status': 1,
            'rank': '护工',
            'task': '',
            'elder': '',
            'houseId': '',
            'houseName': ''
          }
        ],
        'total': 1
      }
      this.tableData = nurse.records
      this.total = nurse.total
      this.tableLoading = false

      // this.tableLoading = true
      // NurseAPI.getNurseList(this.search).then(resp => {
      //   if (resp.code === 0) {
      //     this.tableData = resp.data.records
      //     this.total = resp.data.total
      //   } else {
      //     this.$message({
      //       message: resp.message || '护工列表获取失败'
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
      this.getNurseList()
    },
    onSizeChange (pageSize) {
      this.search.pageSize = pageSize
      this.getNurseList()
    },
    handleSearch () {
      this.getNurseList()
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

<style lang="scss">
.nurse{
  padding: 20px;
  .el-table__header {
    tr {
      th {
        background-color: #1C3386;
        color:#FFFFFF;
      }
    }
  }
   .el-pagination__total, .el-pagination__jump {
    color: #fff;
  }
}
</style>
