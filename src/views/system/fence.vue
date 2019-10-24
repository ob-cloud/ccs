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
            <span class="label fl mrg">范围</span>
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
          <bm-local-search :panel="false" :keyword="keyword" :auto-viewport="true"></bm-local-search>
        </div>
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
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addBeadHouseDialog = false">取 消</el-button>
        <el-button type="primary" @click="addCrawl" :disabled="!(formBeadhouse.name && formBeadhouse.lng && formBeadhouse.lat)">确 定</el-button>
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

// import FenceAPI from '@/api/fence'
import BaseTable from '@/assets/package/table-base'
// import FenceAPI from '@/api/fence'
export default {
  data () {
    const generateData = _ => {
      const data = []
      for (let i = 1; i <= 15; i++) {
        data.push({
          key: i,
          label: `人员 ${i}`,
          id: i + 1
        })
      }
      return data
    }
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
        lat: ''
      },
      setConsumerDialog: false, // 分配老人
      editbeadhouse: {},
      consumerList: generateData(),
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
  // computed: {
  //   activeFence () {

  //   }
  // },
  watch: {
    activeAnchor (val) {
      const fence = this.tableData.find(item => this.activeAnchor === item.id)
      this.activeFence = fence
    },
    'circlePath.radius' (val) {
      this.activeFence.radius = val
    }
  },
  components: {BaseTable, BaiduMap, BmNavigation, BmControl, BmMarker, BmCircle, BmLabel, BmLocalSearch},
  created () {
    this.columns = this.getColumns()
    this.getFenceList()
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
      const fence = {
        'data': {
          'records': [
            {
              'id': 1,
              'name': '增城小楼养老院',
              'lng': '113.8385127760',
              'lat': '23.3861140903',
              'type': 1,
              'radius': 200
            },
            {
              'id': 2,
              'name': 'XX小楼养老院',
              'lng': '113.9385127760',
              'lat': '23.3861140903',
              'type': 1,
              'radius': 300
            }
          ],
          'total': 1
        }
      }
      this.tableData = fence.data.records
      // this.activeAnchor = this.tableData[0].id
      this.tableLoading = false
      this.tableData.length && this.located(this.tableData[0])
      // FenceAPI.getFenceList(this.search).then(resp => {
      //   if (resp.code === 0) {
      //     this.tableData = resp.data.records
      //     this.activeAnchor = this.tableData[0].id
      //     // this.activeFence = this.tableData[0]
      //     // this.activeAnchor = this.tableData[0].id
      //     // this.center.lng = +this.tableData[0].lng
      //     // this.center.lat = +this.tableData[0].lat
      //   } else {
      //     this.$message({
      //       message: resp.message || '列表获取失败'
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
    },
    addCrawl () {
      this.tableData.push(
        {
          'id': this.tableData.length + 1,
          'name': this.formBeadhouse.name,
          'lng': this.formBeadhouse.lng,
          'lat': this.formBeadhouse.lat,
          'radius': 300
        }
      )
      this.$message.success('添加成功')
      this.addBeadHouseDialog = false
      this.located(this.tableData[this.tableData.length - 1])
    },
    remove (row) {
      this.tableData = this.tableData.filter(ele => ele.id !== row.id)
      if (row.id === this.activeAnchor && this.tableData.length) {
        this.located(this.tableData[0])
      }
    },
    setConsumer (row) {
      // 打开人员编辑页面
      this.setConsumerDialog = true
      this.editbeadhouse = row
    },
    consumerListChange (value, direction, movedKeys) {
      // this.editBeadhouseLoad = true
      console.log(value, direction, movedKeys)
      if (direction === 'left') {
        console.log('删除', movedKeys)
      } else {
        console.log('添加', movedKeys)
      }
    },
    rightClick (type, target, point, pixel, overlay) {
      console.log('type', type)
      this.mapBtn.show = true
      this.mapBtn.pageX = type.offsetX - 10
      this.mapBtn.pageY = type.offsetY + 30
      this.mapBtn.point = type.point
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
  background: #fff;
  position: fixed;
  top: 51px;
  left: 0;
  width: 400px;
  height: 100%;
  overflow: hidden;
  padding: 5px;
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
<style lang="css">
.el-button--tiny{
  padding: 5px;
}
</style>
