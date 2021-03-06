<template>
  <div class="content house-index">
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
          <el-input @keyup.enter.native="handleSearch" class="caption-item" placeholder="养老院/社区名称" v-model="search.name"></el-input>
          <el-select clearable class="caption-item w8" placeholder="机构类型" v-model="search.type">
            <el-option label='养老院' :value='0'></el-option>
            <el-option label='社区' :value='1'></el-option>
          </el-select>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">查询</el-button>
        </template>
        <template slot="actionBar">
          <el-dropdown trigger="click" @command="handleCommand">
            <el-button type="primary" icon="el-icon-plus">
              添加<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="house">添加养老院</el-dropdown-item>
              <el-dropdown-item command="community">添加社区</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <!-- <el-button type="primary" icon="el-icon-plus" @click="handleCreate">添加养老院</el-button> -->
        </template>
      </slot>
    </base-table>
    <el-dialog top="10%" width="760px" :title="dialogAction" :visible.sync="createDialogVisible" :close-on-click-modal="false">
      <el-form ref="houseForm" :rules="houseModelRules" :model="houseModel" label-width="100px">
        <el-form-item label="名称" prop="name">
          <el-input class="caption-item w8" placeholder="养老院名称" v-model="houseModel.name"></el-input>
        </el-form-item>
        <el-form-item label="类型" prop="original">
          <span class="caption-item w8">{{houseModel.original | originalFilter}}</span>
        </el-form-item>
        <el-form-item label="性质">
          <el-radio-group v-model="houseModel.type" prop="type">
            <el-radio :label="0">公办</el-radio>
            <el-radio :label="1">民营</el-radio>
            <el-radio :label="2">公办民营</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="位置" class="address" prop="addressDetail">
           <el-cascader
            filterable
            :options="addressOptions"
            v-model="houseModel.addressDetail"
            @change="onAddressChange">
          </el-cascader>
          <el-input class="caption-item detail" placeholder="详细地址" v-model="houseModel.address"></el-input>
        </el-form-item>
        <el-form-item label="经纬度" class="coors" prop="lng">
          <el-input class="caption-item w8" placeholder="经度" v-model="houseModel.lng"></el-input>
          <el-input class="caption-item w8" placeholder="纬度" v-model="houseModel.lat"></el-input>
        </el-form-item>
        <el-form-item label="联系人"  prop="contacter">
          <el-input class="caption-item w8" placeholder="联系人" v-model="houseModel.contacter"></el-input>
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
        provinceId: '',
        original: 0,
        cityId: '',
        areaId: '',
        address: '',
        addressDetail: '',
        lng: '',
        lat: '',
        contacter: '',
        phone: ''
      },
      houseModelRules: {
        name: [{ required: true, trigger: 'blur', message: '名称不能为空'}],
        type: [{ required: true, trigger: 'blur', message: '机构性质不能为空'}],
        // address: [{ required: true, trigger: 'blur', message: '地址不能为空'}],
        lng: [{ required: true, trigger: 'blur', message: '经纬度不能为空'}],
        contacter: [{ required: true, trigger: 'blur', message: '联系人不能为空'}],
        phone: [{ required: true, trigger: 'blur', message: '联系电话不能为空'}]
      },
      addressOptions: [],
      dialogAction: '添加养老院',
      createDialogVisible: false
    }
  },
  computed: {

  },
  filters: {
    originalFilter (val) {
      return val === 0 ? '养老院' : '社区'
    }
  },
  watch: {
    'houseModel.addressDetail' (val) {
      if (val && val.length) {
        this.houseModel.provinceId = val[0]
        this.houseModel.cityId = val[1]
        this.houseModel.areaId = val[2]
      }
    },
    createDialogVisible (val) {
      if (val === false) {
        this.$refs.houseForm.resetFields()
      }
    }
  },
  components: { BaseTable },
  created () {
    this.columns = this.getColumns()
    this.getHouseList()
    // this.getAddressList()
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
        prop: 'contacter',
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
        <el-button size="tiny" icon="el-icon-tickets" title="查看房间" onClick={() => this.handleCheckRoom(row)}></el-button>,
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
        this.addressOptions = Helper.formatAreaTree(res.data)
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
      !this.addressOptions.length && this.getAddressList()
    },
    createHouse () {
      this.$refs.houseForm.validate(valid => {
        if (valid) {
          const methods = {
            '添加养老院': 'createHouse',
            '添加社区': 'createHouse',
            '编辑养老院': 'updateHouse'
          }[this.dialogAction]
          // this.houseModel.address = this.houseModel.address
          HouseAPI[methods]({...this.houseModel, ...{lng: +this.houseModel.lng, lat: +this.houseModel.lat}}).then(res => {
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
      !this.addressOptions.length && this.getAddressList()
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
    },
    handleCheckRoom (house) {
      this.$router.push({path: '/room/index.html', query: {id: house.id, path: this.$route.path, name: house.name}})
    },
    handleCommand (command) {
      // this.houseModel = {}
      if (command === 'house') {
        this.dialogAction = '添加养老院'
        this.houseModel.original = 0
      } else {
        this.dialogAction = '添加社区'
        this.houseModel.original = 1
      }
      this.createDialogVisible = true
      !this.addressOptions.length && this.getAddressList()
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
<style  lang="scss">
.house-index {
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
