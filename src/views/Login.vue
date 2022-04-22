<template xmlns="http://www.w3.org/1999/html">

  <div class="img-bg" v-bind:style="{ 'background-image': 'url(' + image + ')'}" @keyup.enter="login">
    <el-card :style="{width:width,height:height}" class="box-card" shadow="hover">
      <el-container>
        <el-header class="register">
          <span> 登 录 </span>
        </el-header>
        <el-main>

          <el-row>
            <el-col class="inputLine">
              <span> 电 子 邮 件 </span>
              <el-tooltip
                  :content="content_email"
                  :visible="visible_email"
                  effect="light"
                  placement="right">
                <el-input v-model="input_email" :class="class_email" clearable placeholder="输入电子邮件"
                          size="default" @input="email_fun"/>
              </el-tooltip>
            </el-col>
          </el-row>

          <el-row>
            <el-col class="inputLine">
              <span> 密 码 </span>
              <el-tooltip
                  :content="content_pwd"
                  :visible="visible_pwd"
                  effect="light"
                  placement="right">
                <el-input v-model="input_pwd" :class="class_pwd" :disabled="disable_pwd" placeholder="输入密码"
                          show-password size="default"
                          type="password"
                          @input="pwd_fun"/>
              </el-tooltip>
            </el-col>
          </el-row>

          <el-row>
            <el-col class="login-button">
              <el-button :disabled="disable_button" :loading="loading" plain size="default" type="primary"
                         @click="login">登录
              </el-button>
            </el-col>
          </el-row>

          <el-row>
            <el-col style="margin-top: -15px">
              <el-button plain style="font-size: small" type="text" @click="registerUser">注册账号</el-button>
            </el-col>
          </el-row>

        </el-main>
      </el-container>
    </el-card>
  </div>
</template>

<script>
import CryptoJS from 'crypto-js'
import connectServer from "@/connect";
import {ElMessage} from 'element-plus'
import backgroundImg from '../assets/background-register.jpg'
import debounce from "@/function/debounce";

let checkEmail = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/


export default {
  name: "Login",
  data() {
    return {
      image: backgroundImg,
      loading: false,
      width: 420 + 'px',
      height: 520 + 'px',

      input_email: '',
      input_pwd: '',

      class_email: '',
      class_pwd: '',

      visible_email: false,
      visible_pwd: false,

      content_email: '请输入正确的邮箱',
      content_pwd: '密码至少6位',

      disable_pwd: true,
      disable_button: true
    }
  },
  methods: {
    email_fun() {
      this.visible_email = checkEmail.test(this.input_email) === false && this.input_email !== '';
      this.disable_pwd = checkEmail.test(this.input_email) === false
      this.disable_button = checkEmail.test(this.input_email) === false || this.input_pwd.length < 6
    },
    pwd_fun() {
      this.visible_pwd = this.input_pwd.length < 6;
      this.disable_button = checkEmail.test(this.input_email) === false || this.input_pwd.length < 6
    },
    registerUser() {
      this.$router.push('/register')
    },
    login() {
      this.loading = true

      if (this.input_pwd.length < 6) {
        ElMessage.error("请输入正确的密码")
        this.loading = false
        return
      }

      if (checkEmail.test(this.input_email) === true) {
        let user = {email: this.input_email, pwd: CryptoJS.SHA1(this.input_pwd).toString()}

        connectServer.post('/login', user, {headers: {'Content-Type': 'application/json'}})
            .then((response) => {
              ElMessage.success("登陆成功！")
              this.$router.push('/')
            })
            .catch((error) => {
              if (error.response.data.code === 0) {
                if (error.response.data.msg === "user not found") {
                  this.input_pwd = ''
                  this.class_email = 'animate__animated animate__headShake --animate-duration: 800ms'
                  this.class_pwd = 'animate__animated animate__headShake --animate-duration: 800ms'
                  ElMessage.error("用户不存在")
                  setTimeout(() => {
                    this.class_email = ''
                    this.class_pwd = ''
                  }, 1000)
                }
                if (error.response.data.msg === "pwd error") {
                  this.class_pwd = 'animate__animated animate__headShake --animate-duration: 800ms'
                  ElMessage.error("密码错误")
                  this.input_pwd = ''
                  setTimeout(() => this.class_pwd = '', 1000)
                }
              } else {
                console.log('??')
                ElMessage.error("其他错误，稍后重试")
              }
            })
      } else {
        this.class_email = 'animate__animated animate__headShake --animate-duration: 800ms'
        ElMessage.error("请输入正确的邮箱")
        setTimeout(() => this.class_email = '', 1000)
      }
      this.loading = false
    },
    resizeHandle() {
      if (window.innerWidth <= 420) {
        this.width = window.innerWidth + 'px'
        this.height = 600 + 'px'
      } else {
        this.width = 420 + 'px'
        this.height = 520 + 'px'
      }
    }
  },
  mounted() {
    this.resizeHandle()
    window.addEventListener('resize', debounce(this.resizeHandle, 10))
  }
}
</script>

<style scoped>
.img-bg {
  padding: -1em;
  width: 100%;
  height: 100%;
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
  position: fixed;
}

/deep/ .el-card__body {
  padding: 20px 10px 20px 10px;
}

/deep/ .el-input__inner {
  border-radius: 20px;
}

.box-card {
  background: #ffffff;
  border-radius: 45px;
  border: 3px solid rgba(64, 158, 255, 0.6);
  /*width: 420px;*/
  /*height: 460px;*/
  margin: auto;
  top: 50%;
  left: 50%;
  position: fixed;
  transform: translate(-50%, -50%);
}

.el-header {
  margin-left: -4px;
  background-color: #FFFFFF;
  font-size: 30px;
  font-weight: 600;
  /*font-size: var(--el-font-size-extra-large);*/
  color: var(--el-text-color-primary);
  line-height: 90px;
  text-align: center;;
}

.el-row {
  margin: 10px;
  padding: 10px;
}

.inputLine {
  width: 450px;
  margin-left: 0;
  font-size: 16px;
  font-weight: 500;
  text-align: justify;
  margin-bottom: -2em;
  margin-top: 1em;
}


.inputLine:after {
  content: "";
  display: inline-block;
  width: 100%;
}

.el-input {
  width: 220px;
}

.el-button {
  font-size: 16px;
  width: 140px;
  height: 40px;
  border-radius: 20px
}

.login-button {
  width: 50px;
  padding-top: 164px;
  /*padding: 30px;*/
  margin: auto;
}

</style>