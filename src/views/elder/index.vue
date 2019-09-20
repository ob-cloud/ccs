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
      <el-form ref="elderForm" :rules="elderModelRules" :model="elderModel" label-width="100px">
        <el-tabs v-model="activeTab" type="card" class="elder">
          <el-tab-pane label="基础资料" name="basic" class="basic">
            <el-row :gutter="10">
              <el-col :span="8">
                <el-form-item label="老人编码" prop="id">
                  <el-input class="caption-item gutter w8" placeholder="老人编码" disabled v-model="elderModel.id"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="老人姓名" prop="name">
                  <el-input class="caption-item gutter w8" placeholder="老人姓名" v-model="elderModel.name"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="性别" prop="gender">
                  <el-select clearable class="caption-item gutter" placeholder="性别" v-model="elderModel.gender">
                    <el-option label='男' :value='0'></el-option>
                    <el-option label='女' :value='1'></el-option>
                    <el-option label='其他' :value='2'></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="10">
              <el-col :span="8">
                <el-form-item label="民族" prop="nation">
                  <el-select clearable class="caption-item gutter" placeholder="民族" v-model="elderModel.nation">
                    <el-option :label='item.name' :value='item.code' v-for="(item, index) in nationList" :key="index"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="身份证" prop="idcard">
                  <el-input class="caption-item gutter w8" placeholder="身份证" v-model="elderModel.idcard"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="出生日期" prop="birthday">
                  <el-date-picker
                    class="caption-item gutter"
                    v-model="elderModel.birthday"
                    type="date"
                    placeholder="选择出生日期">
                  </el-date-picker>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="10">
              <el-col :span="8">
                <el-form-item label="年龄" prop="age">
                  <el-input class="caption-item gutter w8" placeholder="年龄" v-model="elderModel.age"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="家庭固话" prop="telephone">
                  <el-input class="caption-item gutter w8" placeholder="家庭固话" v-model="elderModel.telephone"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="手机号码" prop="phoneNumber">
                  <el-input class="caption-item gutter w8" placeholder="手机号码" v-model="elderModel.phoneNumber"></el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="10">
              <el-col :span="8">
                <el-form-item label="血型" prop="bloodType">
                  <el-select clearable class="caption-item gutter" placeholder="血型" v-model="elderModel.bloodType">
                    <el-option :label='item.name' :value='item.code' v-for="(item, index) in bloodTypeList" :key="index"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="政治面貌" prop="politics">
                  <el-select clearable class="caption-item gutter" placeholder="政治面貌" v-model="elderModel.politics">
                    <el-option label='党员' value='党员'></el-option>
                    <el-option label='群众' value='群众'></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="文化程度" prop="education">
                  <el-select clearable class="caption-item gutter" placeholder="文化程度" v-model="elderModel.education">
                    <el-option label='博士' value='博士'></el-option>
                    <el-option label='硕士' value='硕士'></el-option>
                    <el-option label='本科' value='本科'></el-option>
                    <el-option label='大专' value='大专'></el-option>
                    <el-option label='中学' value='中学'></el-option>
                    <el-option label='-' value='-'></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col>
                <el-form-item label="户籍地址" prop="birthplace">
                  <el-input class="caption-item" placeholder="户籍地址" v-model="elderModel.birthplace"></el-input>
                </el-form-item>
              </el-col>
            </el-row>

             <el-row>
              <el-col>
                <el-form-item label="居住地址" prop="address">
                  <el-input class="caption-item" placeholder="居住地址" v-model="elderModel.address"></el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="10">
              <el-col :span="8">
                 <el-form-item label="原职业" prop="occupation">
                  <el-input class="caption-item gutter" placeholder="原职业" v-model="elderModel.occupation"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                 <el-form-item label="介绍人" prop="introducer">
                  <el-input class="caption-item gutter" placeholder="介绍人" v-model="elderModel.introducer"></el-input>
                </el-form-item>
              </el-col>
               <el-col :span="8">
                 <el-form-item label="入院时间" prop="checkInTime">
                  <el-date-picker
                    class="caption-item gutter"
                    v-model="elderModel.checkInTime"
                    type="date"
                    placeholder="选择入院时间">
                  </el-date-picker>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col>
                <el-form-item label="病史介绍">
                  <el-checkbox-group v-model="medicalHistory" size="small">
                    <el-checkbox class="checkbox" border v-for="item in medicalList" :label="item.code" :key="item.id">{{item.name}}</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="联系人信息" name="contact">联系人信息</el-tab-pane>
          <el-tab-pane label="入院信息" name="checkin">入院信息</el-tab-pane>
          <el-tab-pane label="服务需求" name="serviceDemand">服务需求</el-tab-pane>
          <el-tab-pane label="用药医嘱" name="medicalAdvice">用药医嘱</el-tab-pane>
          <el-tab-pane label="护理记录" name="nursingRecord">护理记录</el-tab-pane>
          <el-tab-pane label="就医记录" name="medialRecord">就医记录</el-tab-pane>
          <el-tab-pane label="老人日程" name="agenda">老人日程</el-tab-pane>
          <el-tab-pane label="零用金清单" name="pocketmoney">零用金清单</el-tab-pane>
        </el-tabs>
      </el-form>

      <div slot="footer" class="dialog-footer text-center" >
        <el-button @click="createDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="createElder">确 认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import BaseTable from '@/assets/package/table-base'
import ElderAPI from '@/api/elder'
import SystemAPI from '@/api/system'
import { PAGINATION_PAGENO, PAGINATION_PAGESIZE } from '@/common/constants'
export default {
  data () {
    return {
      tableLoading: true,
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
      nationList: [],
      bloodTypeList: [],
      medicalList: [],
      activeTab: 'basic',
      createDialogVisible: false,
      dialogAction: '添加老人',
      elderModel: {
        id: '',
        name: '',
        gender: 1,
        nation: '',
        idcard: '',
        birthday: '',
        age: '',
        telephone: '',
        phoneNumber: '',
        bloodType: '',
        politics: '',
        education: '',
        birthplace: '',
        address: '',
        occupation: '',
        introducer: '',
        checkInTime: ''
      },
      medicalHistory: [],
      elderModelRules: {

      }
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
    this.getElderList()
    this.getNationList()
    this.getBloodTypeList()
    this.getMedicalList()
  },
  methods: {
    fixLayout () {

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
    getNationList () {
      SystemAPI.getNactionList().then(res => {
        if (res.code === 0) {
          this.nationList = res.data.records
        }
      })
    },
    getBloodTypeList () {
      SystemAPI.getBloodTypeList().then(res => {
        if (res.code === 0) {
          this.bloodTypeList = res.data.records
        }
      })
    },
    getMedicalList () {
      SystemAPI.getMedicalList().then(res => {
        if (res.code === 0) {
          this.medicalList = res.data.records
        }
      })
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
    createElder () {

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
.w8{
  width: 80%;
}
.caption-item.gutter{
  width: 100%;
}
.checkbox.el-checkbox.is-bordered.el-checkbox--small{
  margin-right: 10px;
  margin-left: 0!important;
}
</style>
