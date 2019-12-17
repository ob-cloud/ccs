<template>
  <div class="content elder-index">
    <el-row class="echart_height">
      <el-col :span="12">
        <div id="main" ref="main" style="width: 100%;height:500px;"></div>
      </el-col>
      <el-col :span="12">
        <baidu-map class="bm-view" ak="3779aed6a37117a6b4a0b0dcb3e20b8d" :center="center" :zoom="15" :scroll-wheel-zoom="true">
          <bm-navigation anchor="BMAP_ANCHOR_TOP_LEFT"></bm-navigation>
          <!-- tableDataEchart showPolygonPath-->
          <div v-for="item in tableDataEchart" :key="item.id">
            <bm-marker :position="{lng: item.lng, lat: item.lat}" :dragging="false" >
            </bm-marker>
          </div>
          <bm-polygon :path="polygonPath" stroke-color="blue" :stroke-opacity="0.5" :stroke-weight="2" fillColor="#fff"  :fillOpacity="0.12" @lineupdate="updatePolygonPath"/>
          <bm-geolocation anchor="BMAP_ANCHOR_BOTTOM_RIGHT" :showAddressBar="true" :autoLocation="true"></bm-geolocation>
        </baidu-map>
      </el-col>
    </el-row>
    <base-table
      :row-class-name="tableRowClassName"
      :tableData="tableData"
      :columns="columns"
      v-loading="tableLoading"
      :pageTotal="total"
      :pageSize="search.pageSize"
      :pageNo="search.pageNo"
      @on-current-page-change="onCurrentChange"
      @on-page-size-change="onSizeChange">
      <slot>
        <template slot="caption">
          <el-input @keyup.enter.native="handleSearch" class="caption-item" placeholder="老人名称" v-model="search.name"></el-input>
          <el-select clearable class="caption-item" placeholder="机构类型" v-model="search.type">
            <el-option label='机构老人' :value='0'></el-option>
            <el-option label='居家老人' :value='1'></el-option>
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
    <el-dialog top="5%" width="85%" :title="dialogAction" :visible.sync="createDialogVisible" :close-on-click-modal="false">
      <elder-create :model="elderModel" @data-ready="createElder" @close="flag => createDialogVisible = flag" v-if="createDialogVisible"></elder-create>
    </el-dialog>

    <el-dialog top="10%" width="760px" title="绑定床位" :visible.sync="checkinDialogVisible" :close-on-click-modal="false">
      <el-form ref="checkInForm" :model="checkInModel" label-width="100px">
        <el-form-item label="姓名">
          <el-input class="caption-item w8" placeholder="老人姓名" disabled v-model="checkInModel.elder"></el-input>
        </el-form-item>
        <!-- <el-form-item label="养老院">
          <el-input class="caption-item w8" placeholder="养老院" v-model="checkInModel.houseName"></el-input>
        </el-form-item> -->
        <el-form-item label="房间" prop="roomId">
          <el-select clearable class="caption-item w8" placeholder="选择房间" v-model="checkInModel.roomId" @change="onChangeRoom">
            <el-option :label='room.room' :value='room.id' v-for="(room, index) in roomList" :key="index"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="床" prop="bedNo">
          <el-radio-group v-model="checkInModel.bedNo">
             <el-radio-button type="plain" :label="item.bedId" :value="item.bedId" v-for="(item, index) in bedList" :key="index">{{item.no}}</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer text-center" >
        <el-button @click="checkinDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="doCheckIn">确 认</el-button>
      </div>
    </el-dialog>

    <el-dialog top="2%" width="1060px" title="日程安排" center :visible.sync="programmeDialogVisible" :close-on-click-modal="false">
      <el-form :inline="true" :model="orderForm" class="demo-form-inline" size="small">
        <el-form-item label="日期">
          <el-date-picker
            style="width:300px"
            v-model="orderForm.dateList"
            type="daterange"
            unlink-panels
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="时间">
          <el-time-select
            v-model="orderForm.fromTime"
            :picker-options="{
              start: '00:00',
              step: '00:30',
              end: '24:00'
            }"
            placeholder="选择时间">
          </el-time-select>
        </el-form-item>
        <el-form-item label="事件">
          <el-input v-model="orderForm.taskName" placeholder="事件"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :disabled="!(orderForm.dateList.length && orderForm.fromTime && orderForm.taskName)" @click="addOrder">{{orderForm.taskId ? '更新' : '新增'}}</el-button>
          <el-button v-if="orderForm.taskId" plain @click="cancelOrderUpdate">取消更新</el-button>
        </el-form-item>
      </el-form>
      <base-table
        :tableData="tableData2"
        :columns="columns2"
        border
        v-loading="tableLoading2"
        :pageTotal="total2"
        :pageSize="search2.pageSize"
        @on-current-page-change="onOrderCurrentChange"
        @on-page-size-change="onOrderSizeChange">
      </base-table>
    </el-dialog>
    <el-dialog top="2%" width="1100px" title="家属管理" center :visible.sync="familyDialogVisible" :close-on-click-modal="false">
      <el-form ref="familyForm" :inline="true" :model="familyFrom" :rules="familyRules" class="demo-form-inline" size="small" label-width="66px">
        <el-form-item label="姓名" prop="name">
          <el-input placeholder="家属名称"  v-model="familyFrom.name"></el-input>
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select clearable class="caption-item gutter" placeholder="性别" v-model="familyFrom.gender" style="width:184px">
            <el-option label='男' :value='0'></el-option>
            <el-option label='女' :value='1'></el-option>
            <el-option label='其他' :value='2'></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="民族" prop="nation">
          <el-select clearable class="caption-item gutter" placeholder="民族" v-model="familyFrom.nation" style="width:184px">
            <el-option :label='item.name' :value='item.name' v-for="(item, index) in nationList" :key="index" :selected="familyFrom.nation === item.name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="号码" prop="phoneNumber">
          <el-input placeholder="手机号码"  v-model="familyFrom.phoneNumber"></el-input>
        </el-form-item>
        <el-form-item label="身份证" prop="idcard">
          <el-input placeholder="身份证号码"  v-model="familyFrom.idcard"></el-input>
        </el-form-item>
        <el-form-item label="关系" prop="relation">
          <el-input placeholder="老人与家属关系(父子...)"  v-model="familyFrom.relation"></el-input>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input placeholder="家属地址" style="width:284px;" v-model="familyFrom.address"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-if="!famlilyTableFrom.edit"  @click="addFamily">新增</el-button>
          <template v-else>
            <el-button type="primary" plain @click="updateContact">更新</el-button>
            <el-button plain @click="cancelfamilyEdit">取消更新</el-button>
          </template>
        </el-form-item>
      </el-form>
      <base-table
        :tableData="familyList"
        :columns="columns3"
        border
        v-loading="familyLoading"
        :pageTotal="famlilyTableFrom.total"
        :pageSize="famlilyTableFrom.pageSize"
        @on-current-page-change="familyCurrentChange"
        @on-page-size-change="familySizeChange">
      </base-table>
    </el-dialog>
  </div>
</template>

<script>
import BaseTable from '@/assets/package/table-base'
import ElderAPI from '@/api/elder'
import RoomAPI from '@/api/room'
import SystemAPI from '@/api/system'
// import echarts from 'echarts'

const echarts = require('echarts/lib/echarts')
require('echarts/lib/chart/bar')
require('echarts/lib/chart/pie')
require('echarts/lib/component/tooltip')
require('echarts/lib/component/title')
import elderCreate from './create/index'
import { PAGINATION_PAGENO, PAGINATION_PAGESIZE } from '@/common/constants'
import Helper from '@/common/helper'
import BaiduMap from 'vue-baidu-map/components/map/Map.vue'
import BmNavigation from 'vue-baidu-map/components/controls/Navigation.vue'
import BmMarker from 'vue-baidu-map/components/overlays/Marker.vue'
import BmPolygon from 'vue-baidu-map/components/overlays/Polygon.vue'
import BmGeolocation from 'vue-baidu-map/components/controls/Geolocation.vue'
import { mapGetters } from 'vuex'
import dayjs from 'dayjs'
export default {
  data () {
    return {
      tableLoading: true,
      tableLoading2: true,
      tableHeight: 0,
      search: {
        name: '',
        type: '',
        status: '',
        pageNo: PAGINATION_PAGENO,
        pageSize: PAGINATION_PAGESIZE
      },
      search2: {
        pageNo: PAGINATION_PAGENO,
        pageSize: PAGINATION_PAGESIZE
      },
      total: 0,
      total2: 0,
      tableData: [],
      columns: [],
      columns2: [],
      orderForm: {
        'dateList': [],
        'fromTime': '',
        'taskName': '',
        'elderId': '',
        'taskId': ''
      },
      createDialogVisible: false,
      dialogAction: '添加老人',
      elderModel: null,
      checkinDialogVisible: false,
      roomList: [],
      bedList: [],
      checkInModel: {
        type: 0,
        elderId: '',
        elder: '',
        houseId: 18,
        houseName: '',
        roomId: '',
        bedNo: ''
      },
      programmeDialogVisible: false,
      tableData2: [],
      // 地图的数据
      center: {
        lng: 113.8385127760,
        lat: 23.3861140903
      },
      circlePath: {
        min: 100,
        max: 5000,
        radius: 400
      },
      tableDataEchart: [],
      polygonPath: [
        { 'lng': 113.836608, 'lat': 23.384655 },
        { 'lng': 113.832907, 'lat': 23.388668 },
        { 'lng': 113.838225, 'lat': 23.391985 },
        { 'lng': 113.841136, 'lat': 23.389531 },
        { 'lng': 113.84207, 'lat': 23.387872 },
        { 'lng': 113.835782, 'lat': 23.378651 }
      ],
      showPolygonPath: [],
      // 家属管理
      familyDialogVisible: false,
      familyFrom: {
        name: '',
        phoneNumber: '',
        idcard: '',
        nation: '',
        gender: '',
        relation: '',
        address: ''
      },
      familyRules: {
        name: [{ required: true, trigger: 'blur', message: '姓名不能为空'}],
        phoneNumber: [{ required: true, trigger: 'blur', message: '电话号码不能为空'}],
        idcard: [{ required: true, trigger: 'blur', message: '身份证不能为空'}],
        nation: [{ required: true, trigger: 'blur', message: '民族不能为空'}],
        gender: [{ required: true, trigger: 'blur', message: '性别不能为空'}],
        relation: [{ required: true, trigger: 'blur', message: '地址不能为空'}],
        address: [{ required: true, trigger: 'blur', message: '居住地址不能为空'}]
      },
      familyList: [],
      famlilyTableFrom: {
        pageNo: 1,
        pageSize: 10,
        total: 0,
        edit: false // 编辑模式
      },
      familyLoading: false,
      columns3: [],
      nationList: []
    }
  },
  components: {BaseTable, elderCreate, BaiduMap, BmNavigation, BmMarker, BmPolygon, BmGeolocation},
  created () {
    this.columns = this.getColumns()
    this.columns2 = this.getColumns2()
    this.columns3 = this.getColumns3()
    this.getNationList()
    this.getElderList()
    this.tableDataEchart.push({
      'id': 1,
      'lng': '113.8385127760',
      'lat': '23.3861140903'
    }, {
      'id': 2,
      'lng': '113.8394127760',
      'lat': '23.3861140903'
    }, {
      'id': 3,
      'lng': '113.8395127760',
      'lat': '23.3870140903'
    }, {
      'id': 4,
      'lng': '113.8382127760',
      'lat': '23.3855840903'
    }, {
      'id': 5,
      'lng': '113.8382027760',
      'lat': '23.3861540903'
    }, {
      'id': 6,
      'lng': '113.8381127760',
      'lat': '23.3861240903'
    }
    )
  },
  mounted () {
    Helper.windowOnResize(this, this.fixLayout)
    this.drawelder()
    this.$store.dispatch('getWatchLocation').catch(err => {})
  },
  computed: {
    ...mapGetters([
      'elderList',
      'serialInfo'
    ]),
    elderEchartInfo () {
      const elderEchartInfo = {
        manNum: 0,
        womenNum: 0,
        fiftyNum: 0,
        sixty: 0,
        seventy: 0,
        eighty: 0,
        eightyMore: 0
      }
      for (let index = 0; index < this.elderList.length; index++) {
        const element = this.elderList[index]
        // 处理年龄分布以及男女比例（暂无）
        if (element.gender === 1) {
          elderEchartInfo.womenNum += 1
        } else {
          elderEchartInfo.manNum += 1
        }
        if (element.age > 80) {
          elderEchartInfo.eightyMore += 1
        } else if (element.age > 70) {
          elderEchartInfo.eighty += 1
        } else if (element.age > 60) {
          elderEchartInfo.seventy += 1
        } else if (element.age > 50) {
          elderEchartInfo.sixty += 1
        } else {
          elderEchartInfo.fiftyNum += 1
        }
      }
      return elderEchartInfo
    }
  },
  watch: {
    serialInfo: {
      deep: true,
      handler (val, oldVal) {
        const tarObj = Object.keys(val)
        const path = []
        if (!tarObj.length) return
        for (let index = 0; index < tarObj.length; index++) {
          const tarObjItem = val[tarObj[index]]
          if (tarObjItem.id && tarObjItem.lat && tarObjItem.lon) {
            path.push({
              ...tarObjItem,
              'id': tarObjItem.id,
              'lng': tarObjItem.lon,
              'lat': tarObjItem.lat
            })
          }
        }
        this.showPolygonPath = path
      }
    },
    elderEchartInfo: {
      deep: true,
      handler (val, oldVal) {
        this.drawelder()
      }
    }
  },
  methods: {
    fixLayout () {
      this.tableHeight = Helper.calculateTableHeight()
    },
    getColumns () {
      return [{
        type: 'expand',
        renderBody (h, row) {
          return [
            <el-form label-position="left" inline class="elder-table__detail">
              <el-row>
                <el-col span={8}>
                  <el-form-item label="性别" class="detail-item">
                    <span>{row.gender === 1 ? '女' : '男'}</span>
                  </el-form-item>
                </el-col>
                <el-col span={8}>
                  <el-form-item label="年龄">
                    <span>{row.age}</span>
                  </el-form-item>
                </el-col>
                <el-col span={8}>
                  <el-form-item label="生日">
                    <span>{row.birthday}</span>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col span={8}>
                  <el-form-item label="民族">
                    <span>{row.nation}</span>
                  </el-form-item>
                </el-col>
                <el-col span={8}>
                  <el-form-item label="身份证">
                    <span>{row.idcard}</span>
                  </el-form-item>
                </el-col>
                <el-col span={8}>
                  <el-form-item label="联系人">
                    <span>{row.contacts}</span>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col span={8}>
                  <el-form-item label="入住时间">
                    <span>{row.checkInTime && Helper.parseTime(row.checkInTime)}</span>
                  </el-form-item>
                </el-col>
                <el-col span={8}>
                  <el-form-item label="退院时间">
                    <span>{row.checkOutTime && Helper.parseTime(row.checkOutTime)}</span>
                  </el-form-item>
                </el-col>
                <el-col span={8}>
                  <el-form-item label="联系人号码">
                    <span>{row.contactsPhone}</span>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          ]
        }
      }, {
        label: '老人姓名',
        prop: 'name',
        width: '90px',
        align: 'center'
      }, {
        label: '手机号码',
        prop: 'phoneNumber',
        width: '120px',
        align: 'center'
      }, {
        label: '机构类型',
        prop: 'type',
        align: 'center',
        width: '90px',
        formatter (val) {
          return val === 1 ? '居家老人' : '机构老人'
        }
      }, {
        label: '房床号',
        prop: 'bedNo',
        align: 'center',
        width: '120px',
        formatter (val, row) {
          return `${row.roomNo || ''} - ${val || ''}`
        }
      }, {
        label: '住院状态',
        prop: 'status',
        align: 'center',
        width: '90px',
        formatter (val) {
          return val === 1 ? '在住' : '退院'
        }
      }, {
        label: '费用状况',
        prop: 'feeStatus',
        align: 'center',
        width: '90px',
        formatter (val) {
          return val === 1 ? '无欠费' : '欠费'
        }
      }, {
        label: '住址',
        prop: 'address',
        minWidth: '160px',
        align: 'center'
      },
      {
        label: '操作',
        align: 'center',
        minWidth: '100px',
        renderBody: this.getToolboxRender
      }]
    },
    getToolboxRender (h, row) {
      if (row.status === 1) {
        return [
          <el-button size="tiny" title="编辑老人" icon="el-icon-user" onClick={() => this.handleEdit(row)}></el-button>,
          <el-button size="tiny" title="安排床位" disabled icon="el-icon-s-help" onClick={() => this.handleCheckIn(row)}></el-button>,
          <el-button size="tiny" title="日程安排" icon="el-icon-date" onClick={() => this.getTaskList(row)}></el-button>,
          <el-button size="tiny" title="家属管理" icon="el-icon-s-comment" onClick={() => this.familyEdit(row)}></el-button>,
          <el-button size="tiny" title="老人离院" icon="el-icon-circle-close" onClick={() => this.leaveEdit(row)}></el-button>,
          <el-button size="tiny" title="历史数据" icon="el-icon-tickets" onClick={() => this.tohistory(row)}></el-button>
          // <el-button size="tiny" title="删除" disabled icon="el-icon-delete" onClick={() => this.handleDelete(row)}></el-button>
        ]
      }
      return [
        <el-button size="tiny" title="编辑老人" icon="el-icon-user" onClick={() => this.handleEdit(row)}></el-button>,
        <el-button size="tiny" title="安排床位" icon="el-icon-s-help" onClick={() => this.handleCheckIn(row)}></el-button>,
        <el-button size="tiny" title="日程安排" icon="el-icon-date" onClick={() => this.getTaskList(row)}></el-button>,
        <el-button size="tiny" title="家属管理" icon="el-icon-s-comment" onClick={() => this.familyEdit(row)}></el-button>,
        <el-button size="tiny" title="老人离院" disabled icon="el-icon-circle-close" onClick={() => this.leaveEdit(row)}></el-button>,
        <el-button size="tiny" title="历史数据" icon="el-icon-tickets" onClick={() => this.tohistory(row)}></el-button>
        // <el-button size="tiny" title="删除" disabled icon="el-icon-delete" onClick={() => this.handleDelete(row)}></el-button>
      ]
    },
    getElderList () {
      this.tableLoading = true
      const sendDate = {...this.search}
      sendDate.name === '' && delete sendDate.name
      sendDate.type === '' && delete sendDate.type
      sendDate.status === '' && delete sendDate.status
      ElderAPI.getElderList(sendDate).then(resp => {
        if (resp.code === 0 && resp.data && resp.data.records) {
          this.tableData = resp.data.records
          this.total = resp.data.total
        } else {
          this.tableData = []
          this.total = 0
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
        if (resp.code === 0 && resp.data && resp.data.records.length) {
          const tarObj = []
          resp.data.records.forEach((ele, index) => {
            const list = ele.bed.filter(ele2 => !ele2.status)
            if (list.length) {
              tarObj.push(Object.assign(ele, {
                bed: list
              }))
            }
          })
          console.log('tarObj', tarObj)
          this.roomList = tarObj
        }
      })
    },
    onChangeRoom (roomId) {
      const room = this.roomList.find(roomItem => roomItem.id === roomId)
      this.bedList = room ? room.bed : []
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
      this.search.pageNo = 1
      this.getElderList()
    },
    handleCreate () {
      this.createDialogVisible = true
      this.dialogAction = '添加老人'
      this.elderModel = {}
    },
    createElder (model, dialogVisible) {
      console.log('model', model)
      if (!model.telephone) (delete model.telephone)
      this.elderModel = model
      if (this.dialogAction === '添加老人') {
        ElderAPI.createElder(this.elderModel).then(res => {
          if (res.code === 201) {
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
      } else if (this.dialogAction === '编辑老人') {
        ElderAPI.updateElder({elderId: this.elderModel.id, ...this.elderModel}).then(res => {
          if (res.code === 0) {
            this.$message({
              type: 'success',
              message: res.msg || '老人更新成功'
            })
            this.createDialogVisible = dialogVisible
            this.getElderList()
          } else {
            this.$message({
              type: 'error',
              message: res.msg || '老人更新失败'
            })
          }
        }).catch(err => {
          this.$message({
            type: 'error',
            message: '服务异常' + err
          })
        })
      }
    },
    handleCheckIn (row) {
      this.checkinDialogVisible = true
      this.getRoomList()
      this.checkInModel.elder = row.name
      this.checkInModel.elderId = row.id
      this.bedList = []
      this.checkInModel.roomId = ''
    },
    doCheckIn () {
      this.$refs.checkInForm.validate(valid => {
        if (valid) {
          ElderAPI.bindBed({elderId: this.checkInModel.elderId, bedId: this.checkInModel.bedNo}).then(res => {
            if (res.code === 0) {
              this.$message({
                type: 'success',
                message: res.msg || '安排床位成功'
              })
              this.checkinDialogVisible = false
              this.$store.dispatch('setelderList').catch(err => {})
              this.getElderList()
            } else {
              this.$message({
                type: 'error',
                message: res.msg || '安排床位失败'
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
      }).catch(err => {
        console.log('err', err)
        console.log('取消删除')
      })
    },
    leaveEdit (row) {
      this.$confirm('确认出院？', '确认提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false
      }).then(() => {
        ElderAPI.leaveElder({elderId: row.id}).then(res => {
          if (res.code === 0) {
            this.$message({
              type: 'success',
              message: res.msg || '出院操作成功'
            })
            this.$store.dispatch('setelderList').catch(err => {})
            this.getElderList()
          } else {
            this.$message({
              type: 'error',
              message: res.msg || '出院操作失败'
            })
          }
        }).catch(err => {
          this.$message({
            type: 'error',
            message: '服务异常' + err
          })
        })
      }).catch(() => {
        console.log('取消删除')
      })
    },
    doDelete (id) {
      ElderAPI.deleteElder(id).then(res => {
        if (res.code === 516) {
          this.$message({
            type: 'success',
            message: res.msg || '老人删除成功'
          })
          this.getElderList()
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
    },
    tableRowClassName ({row, rowIndex}) {
      return row.feeStatus === 1 ? '' : 'color-red'
    },
    drawelder () {
      const myChart = echarts.init(this.$refs.main)
      const option = {
        title: [{
          text: '年龄分布',
          x: '25%',
          textAlign: 'center'
        }, {
          text: '男女比例',
          x: '75%',
          y: '20%',
          textAlign: 'center'
        }],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '50%',
          bottom: '3%',
          top: '15%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: ['50岁以下', '50-60岁', '60-70岁', '70-80岁', '80岁以上'],
            axisTick: {
              alignWithLabel: true
            }
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ],
        series: [
          {
            type: 'bar',
            barWidth: '60%',
            data: [this.elderEchartInfo.fiftyNum, this.elderEchartInfo.sixty, this.elderEchartInfo.seventy, this.elderEchartInfo.eighty, this.elderEchartInfo.eightyMore]
          },
          {
            name: '访问来源',
            type: 'pie',
            radius: '40%',
            center: ['75%', '50%'],
            data: [
              {value: this.elderEchartInfo.manNum, name: '男性'},
              {value: this.elderEchartInfo.womenNum, name: '女性'}
            ],
            label: {
              formatter: '{b}: {@2012} ({d}%)'
            },
            itemStyle: {
              emphasis: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
      myChart.setOption(option)
    },
    formatTooltip (val) {
      return val >= 1000 ? (val / 1000) + 'km' : val + 'm'
    },
    updatePolygonPath (e) {
      this.polygonPath = e.target.getPath()
    },
    getTaskList (row) {
      console.log('row', row)
      this.search2.pageNo = 1
      this.total2 = 0
      this.tableData2 = []
      this.orderForm.elderId = row.elderId || row.id
      this.programmeDialogVisible = true
      this.getOrderList()
    },
    getColumns2 () {
      return [{
        label: '开始日期',
        prop: 'startTime',
        align: 'center',
        formatter (val) {
          return dayjs(val).format('YYYY-MM-DD')
        }
      }, {
        label: '结束日期',
        prop: 'endTime',
        align: 'center',
        formatter (val) {
          return dayjs(val).format('YYYY-MM-DD')
        }
      }, {
        label: '开始时间',
        prop: 'fromTime',
        align: 'center',
      }, {
        label: '事件',
        prop: 'taskName',
        minWidth: '160px',
        align: 'center'
      },
      {
        label: '操作',
        align: 'center',
        minWidth: '100px',
        renderBody: this.getOrderRender
      }]
    },
    getOrderRender (h, row) {
      return [
        <el-button size="tiny" title="编辑日程" icon="el-icon-edit" onClick={() => this.editOrder(row)}></el-button>,
        <el-button size="tiny" title="删除" icon="el-icon-delete" onClick={() => this.delectOrder(row)}></el-button>
      ]
    },
    getOrderList () {
      this.tableLoading2 = true
      ElderAPI.getTaskList({elderId: this.orderForm.elderId, ...this.search2}).then(res => {
        if (res.code === 0 && res.data) {
          this.total2 = res.data.total
          this.tableData2 = res.data.records
        }
        this.tableLoading2 = false
      }).catch(err => {
        this.tableLoading2 = false
        this.$message.error(err.msg || '获取失败')
      })
    },
    onOrderCurrentChange (pageNo) {
      this.search2.pageNo = pageNo
      this.getOrderList()
    },
    onOrderSizeChange (pageSize) {
      this.search2.pageSize = pageSize
      this.getOrderList()
    },
    addOrder () {
      ElderAPI.updateTask({
        'elderId': this.orderForm.elderId,
        'taskName': this.orderForm.taskName,
        'startTime': this.orderForm.dateList[0],
        'endTime': this.orderForm.dateList[1],
        'fromTime': this.orderForm.fromTime,
        'taskId': this.orderForm.taskId,
      }).then(res => {
        if (res.code === 0) {
          if (this.orderForm.taskId) {
            this.cancelOrderUpdate()
          }
          this.$message.success(`${this.orderForm.taskId ? '更新' : '添加'}成功`)
          this.getOrderList()
        }
      }).catch(err => {
        this.$message.error(err.msg || '操作失败')
        this.getOrderList()
      })
    },
    cancelOrderUpdate () {
      this.orderForm.dateList = []
      this.orderForm.fromTime = ''
      this.orderForm.taskName = ''
      this.orderForm.taskId = ''
    },
    editOrder (item, index) {
      this.orderForm.dateList = [item.startTime, item.endTime]
      this.orderForm.fromTime = item.fromTime
      this.orderForm.taskName = item.taskName
      this.orderForm.elderId = item.elderId
      this.orderForm.taskId = item.taskId
    },
    delectOrder (row) {
      ElderAPI.deleteTask({taskId: row.taskId}).then(res => {
        if (res.code === 0) {
          this.$message.success('删除成功')
          if (this.tableData2.length === 1 && this.search2.pageNo > 1) {
            this.search2.pageNo -= 1
          }
          this.getOrderList()
        } else {
          this.$message.error(res.msg)
        }
      }).catch(err => {
        this.$message.error(err.msg || '删除失败')
      })
    },
    familyEdit (row) {
      this.elderModel = {...row}
      this.familyDialogVisible = true
      this.famlilyTableFrom.edit = false
      this.famlilyTableFrom.pageNo = 1
      this.famlilyTableFrom.pageSize = 10
      this.famlilyTableFrom.total = 0
      this.familyList = []
      Object.keys(this.familyFrom).forEach(ele => (this.familyFrom[ele] = ''))
      this.getContactList()
    },
    getContactList () {
      this.familyLoading = true
      ElderAPI.getContactList({
        elderId: this.elderModel.id,
        pageNo: this.famlilyTableFrom.pageNo,
        pageSize: this.famlilyTableFrom.pageSize
      }).then(res => {
        this.familyLoading = false
        if (res.code === 0) {
          if (res.data) {
            this.familyList = res.data.records
            this.famlilyTableFrom.total = res.data.total
          } else {
            this.familyList = []
            this.famlilyTableFrom.total = 0
          }
        } else {
          this.$message.error(res.msg)
        }
      }).catch(err => {
        this.familyLoading = false
        this.$message.error(err.msg || '获取失败')
      })
    },
    addFamily () {
      this.$refs.familyForm.validate(valid => {
        if (valid) {
          ElderAPI.bindContactCreat({
            elderId: this.elderModel.id,
            list: [this.familyFrom]
          }).then(res => {
            if (res.code === 0) {
              this.$message.success('添加成功')
              this.getContactList()
            } else {
              this.$message.error(res.msg)
            }
          }).catch(err => {
            this.$message.error(err.msg || '添加失败')
          })
        }
      })
    },
    familyCurrentChange (pageNo) {
      this.famlilyTableFrom.pageNo = pageNo
      this.getContactList()
    },
    familySizeChange (pageSize) {
      this.famlilyTableFrom.pageSize = pageSize
      this.getContactList()
    },
    delectFamily (row) {
      this.$confirm('确认删除家属？', '确认提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false
      }).then(() => {
        ElderAPI.delectContact({
          elderId: this.elderModel.id,
          relationId: row.relationId
        }).then(res => {
          if (res.code === 0) {
            if (this.familyList.length === 1 && this.famlilyTableFrom.pageNo > 1) {
              this.famlilyTableFrom.pageNo -= 1
            }
            this.$message.success('删除成功')
            this.famlilyTableFrom.edit = false
            this.getContactList()
          } else {
            this.$message.error(res.msg)
          }
        }).catch(err => {
          this.$message.error(err.msg || '删除失败')
        })
      }).catch(err => {
        console.log('err', err)
        console.log('取消删除')
      })
    },
    editFamily (row) {
      this.familyFrom = {...row, phoneNumber: row.phone}
      this.famlilyTableFrom.edit = true
    },
    cancelfamilyEdit () {
      this.famlilyTableFrom.edit = false
      Object.keys(this.familyFrom).forEach(ele => (this.familyFrom[ele] = ''))
    },
    updateContact () {
      this.$refs.familyForm.validate(valid => {
        if (valid) {
          ElderAPI.updateContact({
            elderId: this.elderModel.id,
            ...this.familyFrom
          }).then(res => {
            if (res.code === 0) {
              this.$message.success('更新成功')
              this.cancelfamilyEdit()
              this.getContactList()
            } else {
              this.$message.error(res.msg)
            }
          }).catch(err => {
            this.$message.error(err.msg || '更新失败')
          })
        }
      })
    },
    getColumns3 () {
      return [{
        label: '姓名',
        prop: 'name',
        align: 'center'
      }, {
        label: '性别',
        prop: 'gender',
        align: 'center',
        formatter (val) {
          return val === 1 ? '女' : val === 0 ? '男' : '其它'
        }
      }, {
        label: '民族',
        prop: 'nation',
        align: 'center',
      }, {
        label: '号码',
        prop: 'phone',
        minWidth: '160px',
        align: 'center'
      }, {
        label: '身份证',
        prop: 'idcard',
        minWidth: '160px',
        align: 'center'
      }, {
        label: '关系',
        prop: 'relation',
        minWidth: '80px',
        align: 'center'
      }, {
        label: '地址',
        prop: 'address',
        minWidth: '160px',
        align: 'center'
      },
      {
        label: '操作',
        align: 'center',
        minWidth: '100px',
        renderBody: (h, row) => {
          return [
            <el-button size="tiny" title="编辑家属" icon="el-icon-edit" onClick={() => this.editFamily(row)}></el-button>,
            <el-button size="tiny" title="删除" icon="el-icon-delete" onClick={() => this.delectFamily(row)}></el-button>
          ]
        }
      }]
    },
    getNationList () {
      SystemAPI.getdictList({type: 3}).then(res => {
        if (res && res.code === 0 && res.data) {
          this.nationList = res.data.records
        }
      })
    },
    tohistory (row) {
      this.$router.push({
        path: '/elder/history.html',
        query: {
          elderId: row.id,
          name: row.name
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.content{
  padding: 20px;
}
.echart_height {
  height: 500px;
  background-color: #fff;
}
.bm-view {
  width: 100%;
  height: 500px;
}
.line-height_28 {
  line-height: 28px;
}
.order-list {
  border: 1px solid #f5efef;
  margin-bottom: 10px;
  padding: 10px;
  .flex-width_360 {
    width: 360px;
    font-weight: bold;
    .order_open_edit {
      margin-top: 10px;
    }
  }
  .flex-others {
    flex-grow: 1;
    text-decoration: none;
    list-style: none;
    text-align: center;
    .order-item {
      font-size: 14px;
      margin-bottom: 6px;
    }
  }
}
</style>
<style lang="scss">
.elder-index {
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
  .elder-table__detail .el-form-item{
    margin-bottom: 0;
  }
  .elder-table__detail .el-form-item span{
    color: #999;
  }
  .el-table .color-green {
    background: rgba(0, 128, 0, 0.3);
  }
  .el-table .color-red {
    background: rgba(255, 5, 5, 0.432);
  }
}
</style>
