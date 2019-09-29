<template>
  <a href="javascript:void(0)" class="brand">
    <span class="brand-label" @click="dashboard">昂宝养老看护系统</span>
    <el-dropdown class="dropdown" trigger="click" @command="handleCommand">
      <span class="el-dropdown-link">
        <span class="name">{{defaultHouse.name}}</span>
        <i class="el-icon-arrow-down el-icon--right"></i>
      </span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item :command="item.id" v-for="item in houseList" :key="item.id" :data-id="item.id">{{item.name}}</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </a>

</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'brand',
  data () {
    return {
    }
  },
  computed: {
    ...mapGetters([
      'houseList'
    ]),
    defaultHouse () {
      let defaults = {}
      if (this.houseList.length) {
        defaults = this.houseList[0]
        this.$store.dispatch('setHouseId', defaults.id)
      }
      return defaults
    }
  },
  mounted() {
  },
  methods: {
    dashboard () {
      if (this.$route.path === '/dashboard.html') return
      this.$router.push({path: '/dashboard.html'})
    },
    handleCommand (command) {
      if (command) {
        this.$store.dispatch('setHouseId', command).then(res => {
          location.reload()
        })
      }
    }
  }
}
</script>
