<template>
  <div class="home">
    <el-container>
      <el-header style="text-align: right">
        <div class="header">
          <router-link to="about">
            <img :src="image" alt="img" class="content" style="height: 30px"/>
          </router-link>
          <div>
            <el-divider style="margin-top: 50px"></el-divider>
            <div class="mbx">

              <el-breadcrumb separator="/">
                <el-breadcrumb-item style="font-weight: normal;">
                  <el-button style="height: 10px;" type="text" @click="previousDir">返回上一级</el-button>
                </el-breadcrumb-item>
                <el-breadcrumb-item>
                  <el-button plain style="height: 10px;color: #909399" type="text" @click="jumpDir('/')">根目录</el-button>
                </el-breadcrumb-item>
                <el-breadcrumb-item v-for="folder in folders">
                  <el-button plain style="height: 10px;color: #909399" type="text" @click="jumpDir(folder)">
                    {{ folder.split('/').pop() }}
                  </el-button>
                </el-breadcrumb-item>
              </el-breadcrumb>

            </div>
            <el-divider></el-divider>
          </div>
        </div>
      </el-header>

      <el-main>

        <div id="main_body">
          <el-scrollbar :max-height="max_height">
            <el-row :gutter="20">
              <el-col v-for="item in items" :lg="4" :md="4" :sm="6" :xl="2" :xs="8">
                <a>
                  <el-card :style="{height:card_style}" class="main_card" @click="">


                    <div v-if="item.dir===1" class="div_content" @click="openDir(item.name)">
                      <el-checkbox class="checkbox" size="large" @click.stop=""></el-checkbox>
                      <el-icon :size="50" :style="{height: icon_height}"
                               style="margin: auto;opacity: 80%;color: #409EFF;">
                        <Folder/>
                      </el-icon>
                      <div style="color: #409EFF">{{ item.name }}</div>
                    </div>


                    <div v-if="item.dir===0" class="div_content">
                      <el-checkbox class="checkbox" size="large"></el-checkbox>
                      <el-icon :size="50" :style="{height: icon_height}"
                               style="margin: auto;opacity: 80%;color: #409EFF;">
                        <Document/>
                      </el-icon>
                      <div style="color: #409EFF">{{ item.name }}</div>
                    </div>


                    <div v-if="item.dir===2" :style="{height: icon_height}" @click="dialog_show=true">
                      <el-icon :size="50" :style="{height: icon_height}"
                               style="margin: auto;opacity: 80%;color: #409EFF;">
                        <Plus/>
                      </el-icon>
                      <el-dialog v-model="dialog_show" title="上传文件或创建文件夹" width=360px>
                        <div>
                          <div style="margin-bottom: 10px;text-align: center">
                            <el-select v-model="select_choice" style="width: 240px" @change="test">
                              <el-option v-for="option in select_options" :label="option.label"
                                         :value="option.value"></el-option>
                            </el-select>
                          </div>

                          <div v-if="select_choice===0" style="text-align: center" @keyup.enter="newDir">
                            <el-input ref="input" v-model="dir_name" :class="class_input"
                                      style="width: 240px;margin-bottom: 20px;">
                              <template #prepend>文件夹名</template>
                            </el-input>
                            <div>
                              <el-button @click="newDir">确定</el-button>
                            </div>
                          </div>

                          <div v-if="select_choice===1" class="upload">
                            <div @drag.stop="" @dragenter.stop="" @dragleave.stop="" @dragover.stop="" @drop.stop="">
                              <el-icon :size="50" style="opacity: 80%;color: #409EFF;margin: auto">
                                <Plus/>
                              </el-icon>
                              <div>拖拽到此处上传</div>
                            </div>
                          </div>
                          <el-button style="margin-top: 20px;width: 80px">上传</el-button>
                        </div>

                      </el-dialog>
                    </div>
                  </el-card>
                </a>
              </el-col>
            </el-row>
          </el-scrollbar>
        </div>

      </el-main>

    </el-container>
  </div>
</template>

<script>
// @ is an alias to /src
import connectServer from "@/connect";
import backgroundImg from '../assets/Kpan.png'
import {Check, DArrowLeft, Document, DocumentAdd, Folder, FolderAdd, Plus, Upload} from '@element-plus/icons-vue'
import debounce from "@/function/debounce";
import sortByName from "@/function/sortByName";
import {ElMessage} from 'element-plus'

export default {
  name: 'Home',
  components: {
    DArrowLeft,
    Upload,
    Check,
    Document,
    Folder,
    FolderAdd,
    DocumentAdd,
    Plus
  },
  data() {
    return {
      image: backgroundImg,
      card_style: 200 + 'px',
      icon_height: 150 + 'px',
      max_height: window.innerHeight - 180 + 'px',
      class_input: '',
      folders: this.$store.getters.locationGet,
      items: {},
      dialog_show: false,
      select_choice: 1,
      select_options: [{value: 1, label: '文件'}, {value: 0, label: '文件夹'}],
      dir_name: ''
    }
  },
  methods: {
    resizeHandle() {
      this.max_height = window.innerHeight - 180 + 'px'
      this.card_style = window.innerWidth > 600 ? 200 + 'px' : 160 + 'px'
      this.icon_height = window.innerWidth > 600 ? 150 + 'px' : 110 + 'px'
    },
    openDir(name) {
      this.$store.commit('locationPush', name)
      this.accessDir()
      this.folders = this.$store.getters.locationGet
    },
    jumpDir(name) {
      this.$store.commit('locationJump', name)
      this.accessDir()
      this.folders = this.$store.getters.locationGet
    },
    previousDir() {
      this.$store.commit('locationPop')
      this.accessDir()
      this.folders = this.$store.getters.locationGet
    },
    accessDir() {
      let send = {
        operate: 1,
        location: this.$store.getters.locationGet[this.$store.getters.locationGet.length - 1]
      }
      connectServer.post('/fileControl', send, {headers: {'Content-Type': 'application/json'}}).then((response) => {
        if (response.data.code === 102) {
          ElMessage.error('目录不存在')
        } else {
          this.items = sortByName(response.data)
        }
      }).catch(function (error) {
        ElMessage.error('与服务器失去连接，请重试')
        console.log(error);
      })
    },
    newDir() {
      if (this.dir_name === '') {
        ElMessage.error('文件夹名不能为空')
      } else {
        let send = {
          "operate": 2,
          "location": this.$store.getters.locationGet[this.$store.getters.locationGet.length - 1] + "/" + this.dir_name,
        }
        connectServer.post('/fileControl', send, {headers: {'Content-Type': 'application/json'}}).then((response) => {
          if (response.data.code === 101) {
            ElMessage.success('创建成功')
            this.accessDir()
            this.dialog_show = false
          } else if (response.data.code === 102) {
            ElMessage.warning('目录已存在')
            this.class_input = 'animate__animated animate__headShake --animate-duration: 800ms'
            this.dir_name = ''
            setTimeout(() => this.class_input = '', 1000)
          }
        }).catch(function (error) {
          ElMessage.error('出现错误，请重试')
          console.log(error);
        })
      }
    },

    test() {
      // if (this.select_choice === 0) {
      //
      //   this.$nextTick(() => {
      //     this.$refs.input.focus()
      //   })
      //
      // }
      // console.log('test')
    }

  },
  mounted() {
    this.resizeHandle()
    window.addEventListener('resize', debounce(this.resizeHandle, 10))
    this.accessDir()
  }
}
</script>

<style scoped>
.header {
  height: 10%;
  width: 100%;
  padding-top: 20px;
  padding-bottom: 20px;
  position: fixed;
}

.content {
  height: 40px;
  float: left;
  padding-left: 30px;
}

/deep/ .el-container {
  padding: 0;
}

/deep/ .el-header {
  padding: 0;
}

/deep/ .el-main {
  overflow: hidden;
  padding: 0;
}

/deep/ .el-divider {
  margin-top: 15px;
  margin-bottom: 15px;
}

/deep/ .el-scrollbar__wrap {
  padding: 20px;
  overflow-x: hidden;
}

.mbx {
  width: 100%;
  padding-left: 30px;
}

#main_body {
  margin-top: 60px;
  height: 80%;
  overflow: hidden;
}

.scrollbar-demo-item {
  width: 90%;
  margin-left: 3%;
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 200px;
  text-align: center;
}

el-row {
  width: 98%;
  margin-left: 1%;
}

el-icon {
  color: #409EFF;
}

.main_card {
  border-radius: 30px;
  margin-bottom: 30px;
}

.div_content {
  position: relative;
}

.checkbox {
  position: absolute;
  top: -10px;
  left: 0;
}

.upload {
  width: 230px;
  text-align: center;
  margin: auto;
  border: 2px dashed #409EFF;
  height: 230px;
  display: flex;
  align-items: center;
  justify-content: center;
}

</style>
