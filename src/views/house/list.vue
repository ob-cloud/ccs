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
      <el-form ref="houseForm" :rules="houseModelRules" :model="houseModel" label-width="100px">
        <el-form-item label="名称" prop="name">
          <el-input class="caption-item w8" placeholder="养老院名称" v-model="houseModel.name"></el-input>
        </el-form-item>
        <el-form-item label="性质">
          <el-radio-group v-model="houseModel.type" prop="type">
            <el-radio :label="0">公办</el-radio>
            <el-radio :label="1">民营</el-radio>
            <el-radio :label="2">公办民营</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="位置" class="address" prop="address">
           <el-cascader
            :options="addressOptions"
            v-model="houseModel.address"
            @change="onAddressChange">
          </el-cascader>
          <el-input class="caption-item detail" placeholder="详细地址" v-model="houseModel.addressDetail"></el-input>
        </el-form-item>
        <el-form-item label="经纬度" class="coors" prop="lng">
          <el-input class="caption-item w8" placeholder="经度" v-model="houseModel.lng"></el-input>
          <el-input class="caption-item w8" placeholder="纬度" v-model="houseModel.lat"></el-input>
        </el-form-item>
        <el-form-item label="联系人"  prop="contact">
          <el-input class="caption-item w8" placeholder="联系人" v-model="houseModel.contact"></el-input>
        </el-form-item>
        <el-form-item label="联系电话"  prop="phone">
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
import SystemAPI from '@/api/system'
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
        address: '',
        addressDetail: '',
        lng: '',
        lat: '',
        contact: '',
        phone: ''
      },
      houseModelRules: {
        name: [{ required: true, trigger: 'blur', message: '名称不能为空'}],
        type: [{ required: true, trigger: 'blur', message: '机构性质不能为空'}],
        address: [{ required: true, trigger: 'blur', message: '地址不能为空'}],
        lng: [{ required: true, trigger: 'blur', message: '经纬度不能为空'}],
        contact: [{ required: true, trigger: 'blur', message: '联系人不能为空'}],
        phone: [{ required: true, trigger: 'blur', message: '联系电话不能为空'}]
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
    this.getAddressList()
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
        label: '联系人',
        prop: 'contact',
        align: 'center'
      }, {
        label: '联系电话',
        prop: 'phone',
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
    getAddressList () {
      SystemAPI.getAddressList().then(res => {
        this.addressOptions = res.data.records
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
      this.getHouseList()
    },
    handleCreate () {
      this.createDialogVisible = true
      this.dialogAction = '添加养老院'
      this.houseModel = {}
    },
    createHouse () {
      this.$refs.houseForm.validate(valid => {
        if (valid) {
          HouseAPI.createHouse(this.houseModel).then(res => {
            if (res.code === 0) {
              this.$message({
                type: 'success',
                message: res.msg || '养老院创建成功'
              })
              this.createDialogVisible = false
              this.getHouseList()
            } else {
              this.$message({
                type: 'error',
                message: res.msg || '养老院创建失败'
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
      this.dialogAction = '编辑养老院'
      this.createDialogVisible = true
      this.houseModel = {...row}
    },
    handleDelete (row) {
      this.$confirm('确认删除养老院？', '确认提示', {
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
      HouseAPI.deleteHouse(id).then(res => {
        if (res.code === 0) {
          this.$message({
            type: 'success',
            message: res.msg || '养老院删除成功'
          })
          this.getHouseList()
        } else {
          this.$message({
            type: 'error',
            message: res.msg || '养老院删除失败'
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
.w8{
  width: 80%;
}
.address .detail{
  width: 47%;
  margin-left: 5px;
}
.coors .caption-item{
  width: 39%;
}
.coors .caption-item:last-of-type{
  margin-left: 12px;
}
</style>
