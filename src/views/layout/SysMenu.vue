<template>
  <ura-menu
    :menuList="sysMenuList"
    :menuActive="navMenuActiveName"
    :menuEvent="menuEvent">
  </ura-menu>
</template>

<script>
import UraMenu from '@/components/Layout/Menu.vue'
import { mapGetters } from 'vuex'
export default {
  name: 'SysMenu',
  data () {
    return {

    }
  },
  components: { UraMenu },
  computed: {
    ...mapGetters([
      'sysMenuList'
    ]),
    navMenuActiveName: {
      get () {
        return this.$store.state.menu.menuNavActiveName
      },
      set (name) {
        this.$store.dispatch('updateMenuNavActiveName', name)
      }
    }
  },
  watch: {
    $route: 'routerHandler'
  },
  mounted () {
    this.$emit('on-sysmenu-change', this.$route)
  },
  methods: {
    menuEvent (path, router) {
      const routeName = path
      if (/\S/.test(routeName)) {
        this.$router.push({ name: routeName, query: { s: Date.now() }, params: { s: Date.now() } }, to => {
          to.matched && to.matched.length === 0 && this.$router.push({ path: '/404' })
        })
      }
    },
    routerHandler (route) {
      this.navMenuActiveName = `${route.name}`
      this.$emit('on-sysmenu-change', route)
    }
  },
}
</script>

<style scoped>

</style>
