<template>
  <section class="app-container">
    <aside class="app-sidebar">
      <el-tree default-expand-all :data="treeList" :props="defaultProps" @node-click="handleNodeClick"></el-tree>
    </aside>
    <section class="app-body clearfix">
      <div class="box-container" style="overflow: auto" :style="{height: `${boxContainerHeight}px`}">
        <div class="box" v-for="(item, index) in source" :key="index">
          <p class="box-header">{{item.title}}</p>
          <div class="box-content">
            <el-card class="box-card" v-for="(itm, idx) in item.list" :key="idx">
              <div slot="header" class="clearfix title" :style="{background: itm.activeColor}">
                <span>{{itm.title}}</span>
              </div>
              <div class="text item">
                {{itm.text}}
              </div>
              <div class="bottom clearfix">
                <el-button type="text" icon="obicon obicon-cexinshuai" style="float:left;" title="心率">{{itm.heart}}</el-button>
                <el-button type="text" icon="obicon obicon-xieya" style="float:right;" title="血压">{{itm.collec}}</el-button>
              </div>
            </el-card>
          </div>
        </div>
      </div>
      <div class="box-aside">
        <el-card class="data-card">
          <div slot="header" class="">
            <span>统计</span>
          </div>
          <div class="text">
            <p>
              <span>在床人数:</span><span>4545</span>
            </p>
            <p>
              <span>离床人数:</span><span>233</span>
            </p>
            <p>
              <span>离床未归人数:</span><span>14</span>
            </p>
          </div>
        </el-card>
        <el-card class="data-card info" style="overflow: auto" :style="{height: `${infoCardHeight}px`}">
          <div slot="header" class="">
            <span>消息</span>
          </div>
          <div class="list">
           <div class="item" v-for="(item, index) in infoList" :key="index">
             <p class="desc">{{item.desc}}</p>
             <span class="time">{{item.time}}</span>
           </div>
          </div>
        </el-card>
      </div>
    </section>
  </section>
</template>

<script>
import data, {info} from '@/common/data'
export default {
  data () {
    return {
      source: data,
      infoList: info,
      treeList: [{
        label: '上海',
        children: [{
          label: '浦东',
          children: [{
            label: '外滩'
          }]
        }, {
          label: '闵行',
          children: [{
            label: '莘庄'
          }, {
            label: '七宝'
          }, {
            label: '浦江'
          }, {
            label: '梅陇'
          }, {
            label: '虹桥'
          }, {
            label: '马桥'
          }, {
            label: '吴泾'
          }, {
            label: '华漕'
          }, {
            label: '颛桥'
          }]
        }, {
          label: '宝山',
          children: [{
            label: '庙行'
          }, {
            label: '罗店'
          }]
        }, {
          label: '徐汇',
          children: [{
            label: '龙华'
          }]
        }, {
          label: '长宁',
          children: [{
            label: '虹桥'
          }]
        }, {
          label: '静安',
          children: [{
            label: '北站'
          }]
        }, {
          label: '普陀',
          children: [{
            label: '万里'
          }]
        }, {
          label: '虹口',
          children: [{
            label: '北外滩'
          }]
        }]
      }],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      boxContainerHeight: 700,
      infoCardHeight: 500
    }
  },
  mounted () {
    this.boxContainerHeight = window.document.body.clientHeight - 50 - 20 - 10
    this.infoCardHeight = window.document.body.clientHeight - 50 - 20 - 160 - 20
  },
  methods: {
    handleNodeClick (e) {
      console.log(e)
    }
  },
}
</script>

<style scoped>
.app-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}
.app-container .app-sidebar{
  top: 51px;
  background: #fff;
}
.app-sidebar{
  position: fixed;
  top: 0;
  left: 0;
  width: 200px;
  height: 100%;
  overflow: hidden;
}
.app-body{
  margin-left: 200px;
}
.box-container{
  background: #fff;
  padding: 20px;
  float: left;
  width: calc(100% - 270px);
}
.box-aside{
  float: right;
  width: 270px;
  padding-left: 10px;
}
.box-header{
  padding: 20px;
  text-align: center;
}
.box-content .box-card{
  width: 140px;
  display: inline-block;
  margin-left: 10px;
  margin-bottom: 10px;
}
.box-card .title{
  padding: 10px 20px;
  font-size: 14px;
  text-align: center;
}
.box-card .text{
  font-size: 14px;
  text-align: center;
  padding-bottom: 10px;
}
.box-card .bottom{
  padding-top: 10px;
}
.box-card .bottom .el-button{
  padding: 0;
  color: #999;
}
.clearfix:after{
  content: " ";
  width: 1px;
  height: 1px;
  visibility: hidden;
  display: inline-block;
  clear: both;
}
.data-card p {
  font-size: 14px;
  padding: 5px;
}
.data-card p span{
  margin-right: 5px;
}
.data-card.info{
  margin-top: 10px;
}
.data-card.info .item{
  margin-bottom: 10px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}
.data-card.info .item .desc{
  font-size: 12px;
}
.data-card.info .item .time{
  font-size: 12px;
  color: #999;
}

</style>
<style lang="scss">
.box-card .el-card__body{
  padding: 20px 20px 10px 20px;
}
.box-card .el-card__header{
  padding: 0;
}
.data-card .el-card__header{
  padding: 20px 20px 10px;
  border-bottom: none;
}
.data-card .el-card__body{
  padding: 0px 20px 20px 20px;
}
.obicon{
  font-size: 14px;
  margin-right: 3px;
}
</style>
