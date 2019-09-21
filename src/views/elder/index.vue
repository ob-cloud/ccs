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
      <elder-create :model="elderModel" @data-ready="createElder" @close="flag => createDialogVisible = flag"></elder-create>
    </el-dialog>

    <el-dialog top="10%" width="760px" title="安排入住" :visible.sync="checkinDialogVisible" :close-on-click-modal="false">
      <el-form ref="checkInForm" :rules="checkInModelRules" :model="checkInModel" label-width="100px">
        <el-form-item label="姓名">
          <el-input class="caption-item w8" placeholder="老人姓名" disabled v-model="checkInModel.elder"></el-input>
        </el-form-item>
        <el-form-item label="养老院">
          <el-input class="caption-item w8" placeholder="养老院" v-model="checkInModel.houseName"></el-input>
        </el-form-item>
        <el-form-item label="房间" prop="roomId">
          <el-select clearable class="caption-item w8" placeholder="选择房间" v-model="checkInModel.roomId" @change="onChangeRoom">
            <el-option :label='item.name' :value='item.id' v-for="(item, index) in roomList" :key="index"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="床" prop="bedNo">
          <el-radio-group v-model="checkInModel.bedNo">
             <el-radio-button type="plain" :label="item.no" v-for="(item, index) in bedList" :key="index">{{item.no}}</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer text-center" >
        <el-button @click="checkinDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="doCheckIn">确 认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import BaseTable from '@/assets/package/table-base'
import ElderAPI from '@/api/elder'
import RoomAPI from '@/api/room'
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
      elderModel: null,
      roomList: [],
      bedList: [],
      checkInModel: {
        elder: '',
        houseName: '',
        roomId: '',
        bedNo: ''
      }
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
        <el-button size="tiny" icon="el-icon-s-help" onClick={() => this.handleCheckIn(row)}></el-button>,
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
    getRoomList () {
      RoomAPI.getRoomList().then(resp => {
        if (resp.code === 0) {
          this.roomList = resp.data.records

        }
      })
    },
    onChangeRoom (room) {
      this.bedList = room.bed
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
      this.elderModel = model
      ElderAPI.createElder(this.elderModel).then(res => {
        if (res.code === 0) {
          this.$message({
            type: 'success',
            message: res.msg || '老人创建成功'
          })
          this.createDialogVisible = dialogVisible
          this.getElderList()
        } else {
          this.$message({
            type: 'error',
            message: res.msg || '老人创建失败'
          })
        }
      }).catch(err => {
        this.$message({
          type: 'error',
          message: '服务异常' + err
        })
      })
    },
    handleCheckIn (row) {
      this.checkinDialogVisible = true
    },
    doCheckIn () {
      this.$refs.checkInForm.validate(valid => {
        if (valid) {
          ElderAPI.checkIn(this.checkInModel).then(res => {
            if (res.code === 0) {
              this.$message({
                type: 'success',
                message: res.msg || '安排入住成功'
              })
              this.createDialogVisible = false
              this.getElderList()
            } else {
              this.$message({
                type: 'error',
                message: res.msg || '入住失败'
              })
            }
          }).catch(err => {
            this.$message({
              type: 'error',
              message: '服务异常' + err
            })
          })
        }
      })
    },
    handleEdit (row) {
      this.dialogAction = '编辑老人'
      this.createDialogVisible = true
      this.elderModel = {...row}
    },
    handleDelete (row) {
      this.$confirm('确认删除老人？', '确认提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false
      }).then(() => {
        this.doDelete(row.id)
      }).catch(() => {
        console.log('取消删除')
      })
    },
    doDelete (id) {
      ElderAPI.deleteElder(id).then(res => {
        if (res.code === 0) {
          this.$message({
            type: 'success',
            message: res.msg || '老人删除成功'
          })
          this.getHouseList()
        } else {
          this.$message({
            type: 'error',
            message: res.msg || '老人删除失败'
          })
        }
      }).catch(err => {
        this.$message({
          type: 'error',
          message: '服务异常' + err
        })
      })
    }
  }
}
</script>

<style scoped>
.content{
  padding: 20px;
}

</style>
