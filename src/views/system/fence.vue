<template>
  <div class="fence">
    <div class="aside">
      <el-tabs v-model="activeTabName">
        <el-tab-pane label="电子围栏列表" name="fenceList">
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
      <baidu-map class="bm-view" ak="3779aed6a37117a6b4a0b0dcb3e20b8d" :center="center" :zoom="17" :scroll-wheel-zoom="false">
        <bm-navigation anchor="BMAP_ANCHOR_TOP_LEFT"></bm-navigation>
        <bm-control anchor="BMAP_ANCHOR_TOP_RIGHT">
          <div class="slider-container">
            <span class="label fl mrg">范围</span>
            <span class="label fl">200m</span>
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
        <!-- <bm-marker :position="center" :dragging="false" animation="BMAP_ANIMATION_BOUNCE">
          <bm-label content="广州昂宝电子有限公司" :labelStyle="{color: '#666', border: '1px solid #ccc', borderRadius: '4px', padding: '4px', background: '#fff', boxShadow: '1px 1px 3px #999', fontSize : '14px'}" :offset="{width: -65, height: 30}"/>
        </bm-marker>
        <bm-circle :center="center" :radius="circlePath.radius" stroke-color="blue" :stroke-opacity="0.5" :stroke-weight="2" @lineupdate="updateCirclePath"></bm-circle> -->
      </baidu-map>
    </div>

  </div>
</template>

<script>
import BaiduMap from 'vue-baidu-map/components/map/Map.vue'
import BmNavigation from 'vue-baidu-map/components/controls/Navigation.vue'
import BmControl from 'vue-baidu-map/components/controls/Control.vue'
import BmMarker from 'vue-baidu-map/components/overlays/Marker.vue'
import BmLabel from 'vue-baidu-map/components/overlays/Label.vue'
import BmCircle from 'vue-baidu-map/components/overlays/Circle.vue'

import BaseTable from '@/assets/package/table-base'
import FenceAPI from '@/api/fence'
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
      activeFence: {}
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
  components: {BaseTable, BaiduMap, BmNavigation, BmControl, BmMarker, BmCircle, BmLabel},
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
      FenceAPI.getFenceList(this.search).then(resp => {
        if (resp.code === 0) {
          this.tableData = resp.data.records
          // this.activeAnchor = 1
          this.activeAnchor = this.tableData[0].id
          // this.center.lng = +this.tableData[0].lng
          // this.center.lat = +this.tableData[0].lat
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
        width: '60px'
      }, {
        label: '名称',
        prop: 'name',
        align: 'center',
        width: '100px'
      }, {
        label: '半径',
        prop: 'radius',
        align: 'center',
        width: '60px'
      }, {
        label: '操作',
        align: 'center',
        renderBody: this.getToolboxRender
      }]
    },
    getToolboxRender (h, row) {
      return [
        <el-button size="tiny" icon="el-icon-location-outline" title="定位" onClick={() => this.located(row)}></el-button>,
        <el-button size="tiny" icon="el-icon-delete" title="删除" onClick={() => this.remove(row)}></el-button>
      ]
    },
    located (row) {
      this.activeAnchor = row.id
      this.center.lng = row.lng
      this.center.lat = row.lat
    },
    remove (row) {

    }
  }
}
</script>

<style lang="scss" scoped>

.fence,
.content,
.bm-view {
  width: 100%;
  height: 100%;
}
.aside {
  background: #fff;
  position: fixed;
  top: 51px;
  left: 0;
  width: 320px;
  height: 100%;
  overflow: hidden;
  padding: 5px;
}
.content{
  padding-left: 320px;
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
</style>
<style lang="css">
.el-button--tiny{
  padding: 5px;
}
</style>
