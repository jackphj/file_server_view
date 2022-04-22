<template xmlns="http://www.w3.org/1999/html">

  <div class="img-bg" v-bind:style="{ 'background-image': 'url(' + image + ')'}">
    <el-card :style="{width:width,height:height}" class="box-card" shadow="hover">
      <el-container>
        <el-header class="register">
          <span> 用户注册 </span>
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
                <el-input v-model="input_email" :class="class_email" placeholder="输入电子邮件" size="default"
                          @input="email_fun"/>
              </el-tooltip>
            </el-col>
          </el-row>

          <el-row>
            <el-col class="inputLine">
              <span> 用 户 名 </span>
              <el-tooltip
                  :content="content_name"
                  :visible="visible_name"
                  effect="light"
                  placement="right">
                <el-input v-model="input_name" :class="class_name" placeholder="输入用户名" size="default"
                          @input="name_fun"/>
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
            <el-col class="inputLine">
              <span> 再 次 输 入 </span>
              <el-tooltip
                  :content="content_pwd2"
                  :visible="visible_pwd2"
                  effect="light"
                  placement="right">
                <el-input v-model="input_pwd2" :class="class_pwd2" :disabled="disable_pwd2" placeholder="再次输入密码"
                          show-password size="default"
                          type="password"
                          @input="pwd_fun2"/>
              </el-tooltip>
            </el-col>
          </el-row>

          <el-row>
            <el-col class="register-button">
              <el-button :disabled="disable_button" :loading="loading" plain size="default" type="primary"
                         @click="registerUser">注册
              </el-button>
            </el-col>
          </el-row>

          <el-row>
            <el-col style="margin-top: -15px">
              <el-button plain style="font-size: small" type="text" @click="login">返回登录</el-button>
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

let email_not_fill = true, name_not_fill = true, pwd_not_fill = true
let checkEmail = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/

//TODO:error handle

export default {
  name: "Register",
  created() {
  },
  data() {
    return {
      image: backgroundImg,
      loading: false,
      width: 420 + 'px',
      height: 520 + 'px',

      input_email: '',
      input_name: '',
      input_pwd: '',
      input_pwd2: '',

      class_email: '',
      class_name: '',
      class_pwd: '',
      class_pwd2: '',

      visible_email: false,
      visible_name: false,
      visible_pwd: false,
      visible_pwd2: false,

      content_email: '请输入正确的邮箱',
      content_name: '用户名至少3个字符',
      content_pwd: '密码至少6位',
      content_pwd2: '密码不相同',

      disable_pwd: true,
      disable_pwd2: true,
      disable_button: true
    }
  },
  methods: {
    email_fun() {
      email_not_fill = checkEmail.test(this.input_email) === false

      this.visible_email = checkEmail.test(this.input_email) === false && this.input_email !== '';

      this.disable_pwd = email_not_fill || name_not_fill
      this.disable_pwd2 = email_not_fill || name_not_fill || pwd_not_fill
      this.disable_button = checkEmail.test(this.input_email) === false || this.input_name.length < 3 || !(this.input_pwd === this.input_pwd2)
    },
    name_fun() {
      name_not_fill = this.input_name.length < 3

      this.visible_name = this.input_name.length < 3

      this.disable_pwd = email_not_fill || name_not_fill
      this.disable_pwd2 = email_not_fill || name_not_fill || pwd_not_fill
      this.disable_button = checkEmail.test(this.input_email) === false || this.input_name.length < 3 || !(this.input_pwd === this.input_pwd2)
    },
    pwd_fun() {
      pwd_not_fill = this.input_pwd.length < 6;

      this.visible_pwd = this.input_pwd.length < 6;

      this.disable_pwd2 = email_not_fill || name_not_fill || pwd_not_fill
      this.disable_button = checkEmail.test(this.input_email) === false || this.input_name.length < 3 || !(this.input_pwd === this.input_pwd2)
    },
    pwd_fun2() {
      this.visible_pwd2 = !(this.input_pwd === this.input_pwd2)
      this.disable_button = checkEmail.test(this.input_email) === false || this.input_name.length < 3 || !(this.input_pwd === this.input_pwd2)
    },
    login() {
      this.$router.push('/login')
    },
    registerUser() {
      this.loading = true
      if (checkEmail.test(this.input_email) && this.input_name.length >= 3 && this.input_pwd.length >= 6 && this.input_pwd === this.input_pwd2) {

        let account = {
          name: this.input_name,
          email: this.input_email,
          auth: 1,
          pwd: CryptoJS.SHA1(this.input_pwd2).toString()
        }

        connectServer.post('/register', account, {headers: {'Content-Type': 'application/json'}})
            .then((response) => {
              console.log(response.data)
              if (response.data.code === 101) {
                ElMessage.success("注册成功！请登录")
                this.$router.push('/login')
              }
              if (response.data.code === 103 && response.data.msg === 'new user exist' || response.data.code === 104) {
                this.class_email = 'animate__animated animate__headShake'
                this.class_name = 'animate__animated animate__headShake'
                this.class_pwd = 'animate__animated animate__headShake'
                this.class_pwd2 = 'animate__animated animate__headShake'

                ElMessage.success("账号已存在")

                this.input_email = ''
                this.input_name = ''
                this.input_pwd = ''
                this.input_pwd2 = ''
              }
              if (response.data.code === 102 || response.data.code === 105 || response.data.code === 106) {
                this.class_email = 'animate__animated animate__headShake'
                this.class_name = 'animate__animated animate__headShake'
                this.class_pwd = 'animate__animated animate__headShake'
                this.class_pwd2 = 'animate__animated animate__headShake'

                ElMessage.success("账户存在问题")

                this.input_email = ''
                this.input_name = ''
                this.input_pwd = ''
                this.input_pwd2 = ''
              }
            })
            .catch((error) => {
              ElMessage.error("出问题了，稍后重试")
            })

      } else {
        ElMessage.error("输入信息有问题")
        this.input_pwd = ''
        this.input_pwd2 = ''
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
  height: 520px;
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
  margin-left: 0em;
  font-size: 16px;
  font-weight: 500;
  text-align: justify;
  margin-bottom: -2em;
  margin-top: 1em;
  text-justify: inter-word;
  justify-content: space-between;
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

.register-button {
  width: 50px;
  padding-top: 35px;
  /*padding: 30px;*/
  margin: auto;
}

</style>