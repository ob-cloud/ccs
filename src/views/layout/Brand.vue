<template>
  <a href="javascript:void(0)" class="brand" @click="dashboard">
    <span class="brand-label">昂宝养老看护系统</span>
  </a>
</template>

<script>
export default {
  name: 'brand',
  data () {
    return {
    }
  },
  computed: {

  },
  methods: {
    dashboard () {
      this.$router.push({path: '/dashboard'})
    }
  }
}
</script>
