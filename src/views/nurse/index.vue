<template>
  <div class="nurse">
    <el-button size="large" type="primary" class="msg" @click="sendMessage">发送消息</el-button>
    护工管理开发中...
  </div>
</template>

<script>
import axios from 'axios'
import QS from 'qs'
// import Helper from '@/common/helper'
export default {
  methods: {
    sendMessage () {
      // const time = Helper.parseTime(new Date().getTime(), '{h}:{i}')
      let data = {
        DeviceId: 26199,
        UserId: 39186,
        DeviceModel: 324,
        Params: 'test for sos',
        CmdCode: '8099',
        Token: '4692DCAD9FA223418A35650A8AC98D854BC96715CADDA54B8F494BDEB96E470D'
      }
      data = QS.stringify(data)
      axios({
        method: 'post',
        url: 'https://aliiot.on-bright.com/consumer/test/SendCommand',
        data,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        }
      }).then(res => {
        if (res.State === 0) {
          this.$message({
            message: '发送成功',
            type: 'success'
          })
        } else {
          this.$message({
            message: res.Message || '发送失败',
            type: 'error'
          })
        }
      }).catch(() => {
        this.$message({
          message: '服务异常',
          type: 'error'
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.nurse{
  text-align: center;
  margin-top: 15%;
  padding: 20px;
  font-size: 20px;
  color: #999;
  position: relative;
}
.msg{
  position: absolute;
  top: -60px;
}
</style>
