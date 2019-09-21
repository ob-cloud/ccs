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
          <el-input @keyup.enter.native="handleSearch" class="caption-item" placeholder="房号" v-model="search.room"></el-input>
          <el-select clearable class="caption-item w8" placeholder="房型" v-model="search.roomType">
            <el-option label='单间' :value='0'></el-option>
            <el-option label='双人房' :value='1'></el-option>
          </el-select>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">查询</el-button>
        </template>
        <template slot="actionBar">
          <el-button type="primary" icon="el-icon-plus" @click="handleCreate">添加房间</el-button>
        </template>
      </slot>
    </base-table>
    <el-dialog top="10%" width="760px" :title="dialogAction" :visible.sync="createDialogVisible" :close-on-click-modal="false">
      <el-form ref="roomForm" :rules="roomModelRules" :model="roomModel" label-width="100px">
        <el-form-item label="房号" prop="room">
          <el-input class="caption-item w8" placeholder="输入房间号" v-model="roomModel.room"></el-input>
        </el-form-item>
        <el-form-item label="养老院" prop="houseId">
          <el-select clearable class="caption-item w8" placeholder="选择养老院" v-model="roomModel.houseId">
            <el-option label='养老院1' :value='0'></el-option>
            <el-option label='养老院2' :value='1'></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="楼栋"  prop="building">
          <el-input class="caption-item w8" placeholder="输入楼栋" v-model="roomModel.building"></el-input>
        </el-form-item>
        <el-form-item label="楼层"  prop="floor">
          <el-input class="caption-item w8" placeholder="输入楼层" v-model="roomModel.floor"></el-input>
        </el-form-item>
        <el-form-item label="房型"  prop="roomType">
          <el-select clearable class="caption-item w8" placeholder="选择房型" v-model="roomModel.roomType">
            <el-option label='房型1' :value='0'></el-option>
            <el-option label='房型2' :value='1'></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="床" prop="beds">
          <div class="bed-list w8">
            <div class="bed-item" v-for="(item, index) in roomModel.bed" :key="index">
              <el-input class="caption-item w8" placeholder="床号" v-model="item.no"></el-input>
              <el-select clearable class="caption-item w8" placeholder="状态" v-model="item.status">
                <el-option label='空闲' :value='0'></el-option>
                <el-option label='使用中' :value='1'></el-option>
              </el-select>
              <el-button size="tiny" type="plain" icon="el-icon-minus" @click="removeBedHandler(index)"></el-button>
            </div>
            <el-button class="add-btn" size="small" type="plain" icon="el-icon-plus" @click="addBedHandler"></el-button>
          </div>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer text-center" >
        <el-button @click="createDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="createHouse">确 认</el-button>
      </div>
    </el-dialog>

    <el-dialog top="10%" width="760px" title="绑定设备" :visible.sync="bindingDialogVisible" :close-on-click-modal="false">
      <el-form ref="bindingForm" :rules="bindingModelRules" :model="bindingModel" label-width="100px">
        <el-form-item label="房号">
          <el-input class="caption-item w8" placeholder="房号" disabled v-model="bindingModel.room"></el-input>
        </el-form-item>
        <el-form-item label="设备" prop="deviceId">
          <el-select clearable class="caption-item w8" placeholder="选择设备" v-model="bindingModel.deviceId">
            <el-option :label='item.name' :value='item.id' v-for="(item, index) in deviceList" :key="index"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="床" prop="bedNo">
          <el-radio-group v-model="bindingModel.bedNo">
             <el-radio-button type="plain" :label="item.no" v-for="(item, index) in bingdingBedList" :key="index">{{item.no}}</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer text-center" >
        <el-button @click="bindingDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="connectDevice">确 认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import BaseTable from '@/assets/package/table-base'
import RoomAPI from '@/api/room'
import DeviceAPI from '@/api/device'
import { PAGINATION_PAGENO, PAGINATION_PAGESIZE } from '@/common/constants'
import Helper from '@/common/helper'
export default {
  data () {
    const that = this
    const validateBeds = (rule, value, callback) => {
      const empty = that.beds.find(bed => {
        return !bed.no || (bed.status === '')
      })
      if (!that.beds.length || empty) {
        callback(new Error('请补全床信息'))
      } else {
        callback()
      }
    }
    return {
      tableLoading: true,
      tableHeight: 0,
      total: 0,
      tableData: [],
      columns: [],
      search: {
        room: '',
        roomType: '',
        pageNo: PAGINATION_PAGENO,
        pageSize: PAGINATION_PAGESIZE
      },
      roomModel: {
        room: '',
        houseId: '',
        building: '',
        floor: '',
        roomType: '',
        bed: [{
          no: '',
          status: 0
        }]
      },
      beds: [],
      roomModelRules: {
        room: [{ required: true, trigger: 'blur', message: '房号不能为空'}],
        houseId: [{ required: true, trigger: 'blur', message: '请选择机构'}],
        building: [{ required: true, trigger: 'blur', message: '楼栋不能为空'}],
        floor: [{ required: true, trigger: 'blur', message: '楼层不能为空'}],
        roomType: [{ required: true, trigger: 'blur', message: '请选择房型'}],
        beds: [{ required: true, trigger: 'blur', validator: validateBeds}]
      },
      dialogAction: '添加房间',
      createDialogVisible: false,
      bindingDialogVisible: false,
      bindingModel: {
        room: '',
        roomId: '',
        deviceId: '',
        bedNo: ''
      },
      bindingModelRules: {
        deviceId: [{ required: true, trigger: 'blur', message: '请选择设备'}]
      },
      bingdingBedList: [],
      deviceList: []
    }
  },
  computed: {

  },
  components: { BaseTable },
  created () {
    this.columns = this.getColumns()
    this.getRoomList()
  },
  watch: {
    'roomModel.bed': {
      deep: true,
      handler (val) {
        this.beds = val
      }
    }
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
        label: '房号',
        prop: 'room',
        align: 'center'
      }, {
        label: '养老院',
        prop: 'houseName',
        align: 'center'
      }, {
        label: '楼栋',
        prop: 'building',
        align: 'center'
      }, {
        label: '层',
        prop: 'floor',
        align: 'center'
      }, {
        label: '房型',
        prop: 'roomType',
        align: 'center'
      }, {
        label: '操作',
        align: 'center',
        renderBody: this.getToolboxRender
      }]
    },
    getToolboxRender (h, row) {
      return [
        <el-button size="tiny" icon="el-icon-connection" onClick={() => this.handleConnect(row)}></el-button>,
        <el-button size="tiny" icon="el-icon-edit" onClick={() => this.handleEdit(row)}></el-button>,
        <el-button size="tiny" icon="el-icon-delete" onClick={() => this.handleDelete(row)}></el-button>
      ]
    },
    getRoomList () {
      this.tableLoading = true
      RoomAPI.getRoomList(this.search).then(resp => {
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
    getDeviceList () {
      DeviceAPI.getDeviceList().then(resp => {
        if (resp.code === 0) {
          this.deviceList = resp.data.records
        }
      })
    },
    onCurrentChange (pageNo) {
      this.search.pageNo = pageNo
      this.getRoomList()
    },
    onSizeChange (pageSize) {
      this.search.pageSize = pageSize
      this.getRoomList()
    },
    handleSearch () {
      this.getRoomList()
    },
    handleCreate () {
      this.createDialogVisible = true
      this.dialogAction = '添加房间'
      this.roomModel = {
        bed: [{
          no: '',
          status: 0
        }]
      }
    },
    createHouse () {
      this.$refs.roomForm.validate(valid => {
        if (valid) {
          RoomAPI.createRoom(this.roomModel).then(res => {
            if (res.code === 0) {
              this.$message({
                type: 'success',
                message: res.msg || '房间创建成功'
              })
              this.createDialogVisible = false
              this.getRoomList()
            } else {
              this.$message({
                type: 'error',
                message: res.msg || '房间创建失败'
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
    handleConnect (row) {
      this.bindingDialogVisible = true
      this.bingdingBedList = row.bed
      this.bindingModel.room = row.room
      this.bindingModel.roomId = row.roomId
      !this.deviceList.length && this.getDeviceList()
    },
    connectDevice () {
      this.$refs.bindingForm.validate(valid => {
        if (valid) {
          RoomAPI.connectDevice(this.bindingModel).then(res => {
            if (res.code === 0) {
              this.$message({
                type: 'success',
                message: res.msg || '设备绑定成功'
              })
              this.bindingDialogVisible = false
              this.getRoomList()
            } else {
              this.$message({
                type: 'error',
                message: res.msg || '设备绑定失败'
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
      this.dialogAction = '编辑房间'
      this.createDialogVisible = true
      this.roomModel = {...row}
    },
    handleDelete (row) {
      this.$confirm('确认删除房间？', '确认提示', {
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
      RoomAPI.deleteRoom(id).then(res => {
        if (res.code === 0) {
          this.$message({
            type: 'success',
            message: res.msg || '房间删除成功'
          })
          this.getRoomList()
        } else {
          this.$message({
            type: 'error',
            message: res.msg || '房间删除失败'
          })
        }
      }).catch(err => {
        this.$message({
          type: 'error',
          message: '服务异常' + err
        })
      })
    },
    addBedHandler () {
      this.roomModel.bed.push({
        no: '',
        status: 0
      })
    },
    removeBedHandler (index) {
      this.roomModel.bed.splice(index, 1)
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
.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}
.clearfix:after {
  clear: both
}
.fr{
  float: right;
}
.bed-list{
  position: relative;
}
.bed-list .bed-item{
  display: inline-block;
}
.bed-list .bed-item + .bed-item{
  margin-top: 5px;
}
.bed-list .bed-item .caption-item{
  position: relative;
  width: 40%;
  margin-right: 5px;
  margin-left: 4px;
}
/* .bed-list .bed-item .caption-item:first-child:before{
  content: '*';
  color: #F56C6C;
  position: absolute;
  left: -8px;
}
.bed-list .add-btn{
  position: absolute;
  top: 0;
} */
</style>
