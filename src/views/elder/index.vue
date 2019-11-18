<template>
  <div class="content">
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
      border
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
      <el-form ref="checkInForm" :model="checkInModel" label-width="100px">
        <el-form-item label="姓名">
          <el-input class="caption-item w8" placeholder="老人姓名" disabled v-model="checkInModel.elder"></el-input>
        </el-form-item>
        <el-form-item label="养老院">
          <el-input class="caption-item w8" placeholder="养老院" v-model="checkInModel.houseName"></el-input>
        </el-form-item>
        <el-form-item label="房间" prop="roomId">
          <el-select clearable class="caption-item w8" placeholder="选择房间" v-model="checkInModel.roomId" @change="onChangeRoom">
            <el-option :label='room.room' :value='room.id' v-for="(room, index) in roomList" :key="index"></el-option>
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
  </div>
</template>

<script>
import BaseTable from '@/assets/package/table-base'
import ElderAPI from '@/api/elder'
import RoomAPI from '@/api/room'
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
    }
  },
  components: {BaseTable, elderCreate, BaiduMap, BmNavigation, BmMarker, BmPolygon, BmGeolocation},
  created () {
    this.columns = this.getColumns()
    this.columns2 = this.getColumns2()
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
        // width: '90px',
        align: 'center'
      }, {
        label: '手机号码',
        prop: 'phoneNumber',
        // width: '120px',
        align: 'center'
      }, {
        label: '机构类型',
        prop: 'type',
        align: 'center',
        // width: '90px',
        formatter (val) {
          return val === 1 ? '居家老人' : '机构老人'
        }
      }, {
        label: '房床号',
        prop: 'bedNo',
        align: 'center',
        // width: '120px',
        formatter (val, row) {
          return `${row.roomNo || ''} - ${val || ''}`
        }
      }, {
        label: '住院状态',
        prop: 'status',
        align: 'center',
        // width: '90px',
        formatter (val) {
          return val === 1 ? '在住' : '退院'
        }
      }, {
        label: '费用状况',
        prop: 'feeStatus',
        align: 'center',
        // width: '90px',
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
      return [
        <el-button size="tiny" title="日程安排" icon="el-icon-tickets" onClick={() => this.getTaskList(row)}></el-button>,
        <el-button size="tiny" title="安排入住" icon="el-icon-s-help" onClick={() => this.handleCheckIn(row)}></el-button>,
        <el-button size="tiny" title="编辑老人" icon="el-icon-edit" onClick={() => this.handleEdit(row)}></el-button>,
        <el-button size="tiny" title="删除" icon="el-icon-delete" onClick={() => this.handleDelete(row)}></el-button>
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
      !this.roomList.length && this.getRoomList()
      this.checkInModel.elder = row.name
      this.checkInModel.elderId = row.id
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
        if (res.code === 0) {
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
<style>
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
</style>
