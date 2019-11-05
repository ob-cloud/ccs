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

    <el-dialog top="2%" width="60%" title="日程安排" :visible.sync="programmeDialogVisible" :close-on-click-modal="false">
     <el-table
      :data="tableData2"
      style="width: 100%">
      <el-table-column
        prop="date"
        label="日期"
        width="200">
        <template slot-scope="scope">
          {{scope.row.startDate}} 至 {{scope.row.endDate}}
        </template>
      </el-table-column>
      <el-table-column
        prop="address"
        label="日程">
        <template slot-scope="scope">
            <el-table
            :data="scope.row.orderList"
            border
            style="width: 100%">
            <el-table-column
              prop="startHouse"
              label="开始时间"
              width="180">
            </el-table-column>
            <el-table-column
              prop="endHouse"
              label="结束时间"
              width="180">
            </el-table-column>
            <el-table-column
              prop="order"
              label="事件">
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
    </el-table>
      <div slot="footer" class="dialog-footer text-center" >
        <el-button @click="programmeDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="programmeDialogVisible = false">确 认</el-button>
      </div>
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
      tableData2: [{
        startDate: '2016-05-02',
        endDate: '2016-05-18',
        orderList: [
          {
            startHouse: '07:00',
            endHouse: '8:00',
            order: '晨读'
          },
          {
            startHouse: '08:00',
            endHouse: '11:00',
            order: '清洁卫生'
          },
          {
            startHouse: '11:00',
            endHouse: '12:00',
            order: '午餐'
          },
          {
            startHouse: '12:30',
            endHouse: '13:00',
            order: '吃药'
          },
          {
            startHouse: '17:00',
            endHouse: '18:00',
            order: '晚餐'
          },
          {
            startHouse: '19:30',
            endHouse: '20:00',
            order: '洗澡'
          }
        ]
      }, {
        startDate: '2016-06-04',
        endDate: '2016-07-04',
        orderList: [
          {
            startHouse: '08:00',
            endHouse: '11:00',
            order: '清洁卫生'
          },
          {
            startHouse: '11:00',
            endHouse: '12:00',
            order: '午餐'
          },
          {
            startHouse: '17:00',
            endHouse: '18:00',
            order: '晚餐'
          },
          {
            startHouse: '19:30',
            endHouse: '20:00',
            order: '洗澡'
          }
        ]
      }],
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
      elderEchartInfo: {
        manNum: 0,
        womenNum: 0,
        fiftyNum: 0,
        sixty: 0,
        seventy: 0,
        eighty: 0,
        eightyMore: 0
      }
    }
  },
  components: {BaseTable, elderCreate, BaiduMap, BmNavigation, BmMarker, BmPolygon, BmGeolocation},
  created () {
    this.columns = this.getColumns()
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
    ])
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
    elderList: {
      deep: true,
      handler  (val, oldVal) {
        for (let index = 0; index < val.length; index++) {
          // const element = val[index]
          // 处理年龄分布以及男女比例（暂无）
        }
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
      // {
      //   label: '联系人',
      //   prop: 'contacts',
      //   align: 'center'
      // }, {
      //   label: '联系人号码',
      //   prop: 'contactsPhone',
      //   align: 'center'
      // },
      // {
      //   label: '入住时间',
      //   prop: 'checkInTime',
      //   align: 'center',
      //   formatter (val) {
      //     return val && Helper.parseTime(val)
      //   }
      // },
      // {
      //   label: '退院时间',
      //   prop: 'checkOutTime',
      //   align: 'center',
      //   formatter (val) {
      //     return val && Helper.parseTime(val)
      //   }
      // },
      {
        label: '操作',
        align: 'center',
        minWidth: '100px',
        renderBody: this.getToolboxRender
      }]
    },
    getToolboxRender (h, row) {
      return [
        <el-button size="tiny" title="日程安排" icon="el-icon-tickets" onClick={() => { this.programmeDialogVisible = true }}></el-button>,
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
            data: ['50岁以下', '50-60岁', '60-70岁', '70-80岁', '70岁以上'],
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
            data: [10, 52, 20, 23, 32, 31, 22]
          },
          {
            name: '访问来源',
            type: 'pie',
            radius: '40%',
            center: ['75%', '50%'],
            data: [
              {value: 51, name: '男性'},
              {value: 20, name: '女性'}
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
  }
}
</script>

<style scoped>
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
