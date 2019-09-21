<template>
  <section>
    <aside class="app-sidebar">
      <sidebar-menu></sidebar-menu>
    </aside>
    <section class="app-body">
      <article class="app-main" :style="appMainStyles">
        <keep-alive v-if="isKeepAlive">
           <router-view/>
        </keep-alive>
         <router-view v-else/>
      </article>
    </section>
  </section>
</template>

<script>
import SidebarMenu from '@/views/layout/SidebarMenu.vue'
import {
  mapGetters
} from 'vuex'

export default {
  name: 'layout',
  components: {
    SidebarMenu
  },
  created () {
    // this.getNavSubMenus()
  },
  mounted () {
    this.resetDocumentClientHeight()
    window.onresize = () => {
      this.resetDocumentClientHeight()
    }
  },
  computed: {
    ...mapGetters([
      'documentClientHeight'
    ]),
    appBodyStyles () {
      return [{ 'minHeight': `${this.documentClientHeight}px` }, { 'height': `${this.documentClientHeight}px` }]
    },
    appMainStyles () {
      let height = this.documentClientHeight
      height -= 50
      return [{
        'minHeight': `${height}px`
      }, {
        'height': `${height}px`
      }]
    },
    isKeepAlive () {
      return this.$route.meta && this.$route.meta.isKeepAlive
    }
  },
  methods: {
    resetDocumentClientHeight () {
      this.$store.dispatch('updateDocumentClientHeight', document.documentElement.clientHeight)
    },
    getNavSubMenus () {
      this.$store.dispatch('generateNavSubMenu')
    }
  }
}
</script>
<style lang="css" scoped>
.app-body{
  margin-left: 230px;
}
</style>
