<template>
  <div class="fence">
    <div class="aside">
      <el-tabs v-model="activeTabName">
        <el-tab-pane label="" name="fenceList">
          <span slot="label">电子围栏列表 <i class="el-icon-plus" @click="addNews"></i>  </span>
          <base-table
            :tableData="tableData"
            :columns="columns"
            :showPagination="false"
            v-loading="tableLoading">
          </base-table>
        </el-tab-pane>
      </el-tabs>
    </div>
    <div class="content">
      <p size="mini" v-if="mapBtn.show" @click="addNews"  @mouseleave="mapBtn.show = false" :style="{top:mapBtn.pageY + 'px', left:mapBtn.pageX + 'px'}" class="map-btn" type="primary">新增养老院</p>
      <el-input v-model="keyword" placeholder="请输入搜索内容"></el-input>
      <baidu-map class="bm-view" ak="3779aed6a37117a6b4a0b0dcb3e20b8d"
        :center="center"
        :zoom="17"
        :scroll-wheel-zoom="true"
        @rightclick="rightClick"
        :map-click="true">
        <bm-navigation anchor="BMAP_ANCHOR_TOP_LEFT"></bm-navigation>
        <bm-control anchor="BMAP_ANCHOR_TOP_RIGHT">
          <div class="slider-container">
            <span class="label fl mrg">
              <el-button v-if="circlePath.radius !== activeFence.radii" @click="updateArea" size="mini">更新</el-button>
              <span v-else>范围</span>
            </span>
            <span class="label fl">{{circlePath.radius}}</span>
            <span class="label fr">5km</span>
            <el-slider class="slider" v-model="circlePath.radius" :min="circlePath.min" :max="circlePath.max" :format-tooltip="formatTooltip"></el-slider>
          </div>
        </bm-control>
        <div v-for="item in tableData" :key="item.id">
          <bm-marker :position="{lng: item.lng, lat: item.lat}" :dragging="false" :animation="item.id === activeAnchor ? 'BMAP_ANIMATION_BOUNCE' : 'AMAP_ANIMATION_NONE'">
            <bm-label :content="item.name" :labelStyle="{color: '#666', border: '1px solid #ccc', borderRadius: '4px', padding: '4px', background: '#fff', boxShadow: '1px 1px 3px #999', fontSize : '14px'}" :offset="{width: -65, height: 30}"/>
          </bm-marker>
          <bm-circle :center="{lng: item.lng, lat: item.lat}" :radius="item.radius" stroke-color="blue" :stroke-opacity="0.5" :stroke-weight="2"></bm-circle>
        </div>
          <bm-local-search :panel="false" :keyword="keyword" :auto-viewport="true"></bm-local-search>
          <bm-geolocation anchor="BMAP_ANCHOR_BOTTOM_RIGHT" :showAddressBar="true" :autoLocation="true"></bm-geolocation>
      </baidu-map>
    </div>
    <el-dialog
      :title="editbeadhouse.name + '电子围栏设置'"
      :visible.sync="setConsumerDialog"
      center
      v-loading="editBeadhouseLoad"
      element-loading-text="设置中"
      width="40%">
        <div class="text_center">
          <el-transfer
            v-model="headhousePeople"
            :data="consumerList"
            @change="consumerListChange"
            style="text-align: left; display: inline-block"
            :button-texts="['取消', '设置']"
            :titles="['未分配人员', '已分配人员']">
          </el-transfer>
        </div>
    </el-dialog>
     <el-dialog
      title="新增围栏"
      :visible.sync="addBeadHouseDialog"
      center
      width="30%">
      <el-form :model="formBeadhouse" label-width="90px" class="demo-form-inline">
        <el-form-item label="名称">
          <el-input v-model="formBeadhouse.name" placeholder="名称"></el-input>
        </el-form-item>
        <el-form-item label="经度">
          <el-input v-model="formBeadhouse.lng" placeholder="经度"></el-input>
        </el-form-item>
        <el-form-item label="纬度">
          <el-input v-model="formBeadhouse.lat" placeholder="纬度"></el-input>
        </el-form-item>
        <el-form-item label="范围">
          <el-input v-model="formBeadhouse.radii" placeholder="范围"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addBeadHouseDialog = false">取 消</el-button>
        <el-button type="primary" @click="addCrawl" :disabled="!(formBeadhouse.name && formBeadhouse.lng && formBeadhouse.lat && formBeadhouse.radii)">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import BaiduMap from 'vue-baidu-map/components/map/Map.vue'
import BmNavigation from 'vue-baidu-map/components/controls/Navigation.vue'
import BmControl from 'vue-baidu-map/components/controls/Control.vue'
import BmMarker from 'vue-baidu-map/components/overlays/Marker.vue'
import BmLabel from 'vue-baidu-map/components/overlays/Label.vue'
import BmCircle from 'vue-baidu-map/components/overlays/Circle.vue'
import BmLocalSearch from 'vue-baidu-map/components/search/LocalSearch.vue'
import BmGeolocation from 'vue-baidu-map/components/controls/Geolocation.vue'

// import FenceAPI from '@/api/fence'
import BaseTable from '@/assets/package/table-base'
import FenceAPI from '@/api/fence'
import { mapGetters } from 'vuex'
export default {
  data () {
    return {
      activeTabName: 'fenceList',
      tableLoading: true,
      tableData: [],
      columns: [],
      circlePath: {
        min: 100,
        max: 5000,
        radius: 400
      },
      center: {
        lng: 113.8385127760,
        lat: 23.3861140903
      },
      activeAnchor: 0,
      activeFence: {
        radius: 0
      },
      addBeadHouseDialog: false, // 新增围栏
      formBeadhouse: {
        name: '',
        lng: '',
        lat: '',
        radii: ''
      },
      setConsumerDialog: false, // 分配老人
      editbeadhouse: {},
      consumerList: null,
      headhousePeople: [],
      editBeadhouseLoad: false,
      keyword: '',
      mapBtn: {
        show: false,
        pageX: 0,
        pageY: 0,
        point: {}
      }
    }
  },
  computed: {
    ...mapGetters([
      'elderList',
      'serialInfo'
    ])
  },
  watch: {
    activeAnchor (val) {
      const fence = this.tableData.find(item => this.activeAnchor === item.id)
      this.activeFence = fence
    },
    'circlePath.radius' (val) {
      this.activeFence.radius = val
    }
  },
  components: {BaseTable, BaiduMap, BmNavigation, BmControl, BmMarker, BmCircle, BmLabel, BmLocalSearch, BmGeolocation},
  created () {
    this.columns = this.getColumns()
    this.getFenceList()
    this.consumerList = this.elderList.map(ele => {
      return {
        ...ele,
        'key': ele.bedId,
        'label': ele.elderName,
        'id': ele.bedId
      }
    })
  },
  mounted () {
  },
  methods: {
    updateCirclePath (e) {
      // this.center = e.target.getCenter()
      this.circlePath.radius = e.target.getRadius()
    },
    formatTooltip (val) {
      return val >= 1000 ? (val / 1000) + 'km' : val + 'm'
    },
    getFenceList () {
      this.tableLoading = true
      FenceAPI.getLocationList(this.search).then(resp => {
        if (resp.code === 0) {
          this.tableData = resp.data.records.map(ele => {
            return {
              ...ele,
              'id': ele.locationId,
              'lng': ele.lon,
              'radius': ele.radii
            }
          })
          this.located(this.tableData[0])
          this.tableLoading = false
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
    getColumns () {
      return [{
        label: '序号',
        prop: 'id',
        align: 'center',
        width: '50px'
      }, {
        label: '名称',
        prop: 'name',
        align: 'center',
        width: '100px'
      }, {
        label: '半径/m',
        prop: 'radius',
        align: 'center',
        width: '70px'
      }, {
        label: '操作',
        align: 'center',
        renderBody: this.getToolboxRender
      }]
    },
    getToolboxRender (h, row) {
      return [
        <el-button size="tiny" icon="el-icon-location-outline" title="定位" onClick={() => this.located(row)}></el-button>,
        <el-button size="tiny" icon="el-icon-setting" title="设置" onClick={() => this.setConsumer(row)}></el-button>,
        <el-button size="tiny" icon="el-icon-delete" title="删除" onClick={() => this.remove(row)}></el-button>
      ]
    },
    located (row) {
      this.activeAnchor = row.id
      this.center.lng = row.lng
      this.center.lat = row.lat
      this.circlePath.radius = row.radius
    },
    addNews () {
      this.keyword = ''
      this.addBeadHouseDialog = true
      this.formBeadhouse.name = ''
      this.formBeadhouse.lng = this.mapBtn.point.lng
      this.formBeadhouse.lat = this.mapBtn.point.lat
      this.formBeadhouse.radii = 300
    },
    addCrawl () {
      FenceAPI.SetLocation({
        lat: this.formBeadhouse.lat,
        lon: this.formBeadhouse.lng,
        name: this.formBeadhouse.name,
        radii: this.formBeadhouse.radii * 1,
      }).then(resp => {
        console.log('resp', resp)
        if (resp.code === 0) {
          this.$message.success('添加成功')
          this.addBeadHouseDialog = false
          this.getFenceList()
        }
      }).catch(err => {
      })
    },
    remove (row) {
      FenceAPI.deleteLocation({locationId: row.locationId}).then(res => {
        if (res.code === 0) {
          this.$message.success('删除成功')
          this.tableData = this.tableData.filter(ele => ele.id !== row.id)
          if (row.id === this.activeAnchor && this.tableData.length) {
            this.located(this.tableData[0])
          }
        }
      }).catch(err => {
        console.log('err', err)
      })
    },
    setConsumer (row) {
      // 打开人员编辑页面
      this.setConsumerDialog = true
      this.headhousePeople = row.elderList || []
      this.editbeadhouse = row
    },
    consumerListChange (value, direction, movedKeys) {
      FenceAPI.SetLocation({
        elderList: this.headhousePeople || [],
        lat: this.editbeadhouse.lat,
        lon: this.editbeadhouse.lng,
        name: this.editbeadhouse.name,
        radii: this.editbeadhouse.radii * 1,
        locationId: this.editbeadhouse.locationId * 1,
      }).then(resp => {
        console.log('resp', resp)
        if (resp.code === 0) {
          this.$message.success('更新成功')
          this.addBeadHouseDialog = false
          this.getFenceList()
        }
      }).catch(err => {
      })
      if (direction === 'left') {
        console.log('删除', movedKeys)
      } else {
        console.log('添加', movedKeys)
      }
    },
    rightClick (type, target, point, pixel, overlay) {
      this.mapBtn.show = true
      this.mapBtn.pageX = type.offsetX - 10
      this.mapBtn.pageY = type.offsetY + 30
      this.mapBtn.point = type.point
    },
    updateArea () {
      FenceAPI.SetLocation({
        elderList: this.activeFence.elderList || [],
        lat: this.activeFence.lat,
        lon: this.activeFence.lng,
        name: this.activeFence.name,
        radii: this.circlePath.radius * 1,
        locationId: this.activeFence.locationId * 1,
      }).then(resp => {
        if (resp.code === 0) {
          this.$message.success('更新成功')
          this.addBeadHouseDialog = false
          this.getFenceList()
        }
      }).catch(err => {
      })
    }
  }
}
</script>

<style lang="scss" scoped>

.bm-view {
  width: 100%;
  height: calc(100% - 40px);
}
.fence {
  width: 100%;
  height: 100%;
}
.content {
  position: relative;
  margin-left: 400px;
  width: calc(100% - 400px);
  height: 100%;
  .map-btn {
    position: absolute;
    z-index: 1;
    padding: 7px 15px;
    font-size: 12px;
    border-radius: 3px;
    color: #FFFFFF;
    cursor: pointer;
    background-color: #409EFF;
  }
}
.aside {
  background: #1A2C6B;
  position: fixed;
  top: 51px;
  left: 0;
  width: 400px;
  height: 100%;
  overflow: hidden;
  padding: 5px;
  .el-table {
    background-color: #1A2C6B;
  }
}
.slider-container{
  padding: 10px;
  width: 500px;
  background: #fff;
  margin: 10px;
  border-radius: 6px;
  box-shadow: 1px 1px 5px 0 #ddd;
}
.slider{
  padding: 0 10px;
  width: 87%;
  margin: 0 auto;
  padding-left: 62px;
}
.fl{
  float: left;
}
.fr{
  float: right;
}
.label{
  line-height: 35px;
  font-size: 14px;
  color: #999;
}
.mrg{
  margin-right: 12px;
  color: #333;
}
.text_center {
  text-align: center;
}
</style>
<style lang="scss">
.fence {
  .el-button--tiny{
    padding: 5px;
  }
  .aside {
    .el-table {
      background-color: #1A2C6B;
      .el-table__header tr,.el-table__body tr{
        background-color: #1A2C6B;
        th {
          color: #fff;
          background-color: #1A2C6B;
        }
        .cell {
          color: #fff;
        }
      }
      .el-table__body tr:hover > td .cell{
        color: #1A2C6B
      }
    }
  }
}
</style>
