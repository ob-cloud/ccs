<template>
  <section class="ura-login">
    <div class="ura-login-container">
      <h3 class="ura-login-header">昂宝养老看护系统</h3>
      <el-form class="ura-login-body" :model="loginForm" :rules="loginRules" ref="loginForm" label-position="left">
        <el-form-item prop="account">
          <el-input name="account" type="text" v-model="loginForm.account" placeholder="账号" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            name="password"
            type="password"
            v-model="loginForm.password"
            placeholder="密码"
            @keyup.enter.native="handleLogin" />
        </el-form-item>
      </el-form>
      <div class="ura-login-footer">
        <el-button class="btn" type="primary" :loading="loading" @click.native.prevent="handleLogin">登录</el-button>
      </div>
      <!-- <el-button class="ura-login-footer" type="primary" :loading="loading" @click.native.prevent="handleLogin">登录</el-button> -->
    </div>

  </section>
</template>

<style lang="scss" scoped>
  // .ura-login{
  //   height: 100%;
  //   display: flex;
  //   flex-direction: column;
  //   align-items: center;
  //   justify-content: center;
  // }
  // .ura-login-container{
  //   border: 1px solid #eee;
  //   border-radius: 6px;
  //   background: #fff;
  //   width: 400px;
  //   padding: 10px 20px 20px 20px;
  //   box-shadow: 1px 1px 3px #ddd;
  // }
  // .ura-login-header{
  //   margin: 10px 0 30px 0;
  //   text-align: center;
  // }
  // .ura-login-body{

  // }
  // .ura-login-footer{
  //   padding: 12px 15px;
  //   width: 100%;
  // }
  .ura-login{
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.ura-login-container{
  width: 350px;
  height: 420px;
  font-size: 16px;
  font-family: 微软雅黑;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0,0,0,.35);
  margin-top: -120px;
  background: #fff;
  padding: 15px 20px
}
.ura-login-header{
  text-align: center;
  padding: 30px 0;
  & img{
    vertical-align: middle;
  }
}
.ura-login-body{
  & .el-form-item{
    margin-bottom: 24px;
  }
}
.ura-login-footer{
  & .btn {
    padding: 12px 15px;
    width: 100%;
  }
  .ura-login-way {
    text-align: center;
    font-size: 12px;
    color: #7F7F7F;
    padding: 2px;
    margin-top: 25px;
    cursor: pointer;
  }
}
</style>

<script>
export default {
  name: 'login',
  data () {
    const validateAccount = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入正确的用户名'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('密码不能小于6位'))
      } else {
        callback()
      }
    }
    return {
      loginForm: {
        account: '15879618946',
        password: '12345678'
      },
      loginRules: {
        account: [{ required: true, trigger: 'blur', validator: validateAccount }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }]
      },
      loading: false
    }
  },
  methods: {
    handleLogin () {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$store.dispatch('loginByAccount', this.loginForm).then(response => {
            this.loading = false
            if (!response) {
              this.$message({
                message: response.msg || '登录失败',
                type: 'error'
              })
              this.$router.push({path: '/login'})
            } else {
              this.$router.push({path: '/'})
            }
          }).catch(() => {
            this.loading = false
          })
        } else {
          return false
        }
      })
    }
  }
}
</script>

