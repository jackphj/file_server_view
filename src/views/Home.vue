<template>
  <div class="home">
    <el-container>
      <el-header style="text-align: right">
        <div class="header">
          <span>
            <router-link to="about">
              <img :src="image" alt="img" class="content" style="height: 30px;display: inline-block"/>
            </router-link>
            <router-link to="user">
              <el-avatar :size="small" style="float: right;margin-right: 40px">{{ user_name }}</el-avatar>
            </router-link>
          </span>

          <div>
            <el-divider style="margin-top: 50px"></el-divider>
            <div class="mbx">

              <el-breadcrumb separator="/">

                <el-breadcrumb-item>
                  <el-tooltip content="删除" effect="light" placement="bottom">
                    <el-button round style="height: 10px;color: #409EFF;padding: 0" type="text" @click="delFiles">
                      <el-icon :size="16">
                        <Delete/>
                      </el-icon>
                    </el-button>
                  </el-tooltip>

                  <el-tooltip content="下载" effect="light" placement="bottom">
                    <el-button round style="height: 10px;color: #409EFF;padding: 0" type="text" @click="download">
                      <el-icon :size="16">
                        <Download/>
                      </el-icon>
                    </el-button>
                  </el-tooltip>

                  <el-tooltip content="分享" effect="light" placement="bottom">
                    <el-button round style="height: 10px;color: #409EFF;padding: 0" type="text" @click="share">
                      <el-icon :size="16">
                        <Share/>
                      </el-icon>
                    </el-button>
                  </el-tooltip>

                </el-breadcrumb-item>


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

                <el-card :style="{height:card_style}" class="main_card" @click="">

                  <div v-if="item.dir===1" class="div_content" @click="openDir(item.name)">
                    <input v-model="checkbox" :value="item" class="checkbox" type="checkbox"
                           @click.stop=""/>
                    <el-icon :size="50" :style="{height: icon_height}"
                             style="margin: auto;opacity: 80%;color: #409EFF;">
                      <Folder/>
                    </el-icon>
                    <div style="color: #409EFF">{{ limitName(item.name) }}</div>
                  </div>

                  <div v-if="item.dir===0" class="div_content">
                    <input v-model="checkbox" :value="item" class="checkbox" type="checkbox"/>
                    <el-icon :size="50" :style="{height: icon_height}"
                             style="margin: auto;opacity: 80%;color: #409EFF;">
                      <Document/>
                    </el-icon>
                    <div style="color: #409EFF">{{ limitName(item.name) }}</div>
                  </div>

                  <div v-if="item.dir===2" :style="{height: icon_height}" @click="dialog_show=true">
                    <el-icon :size="50" :style="{height: icon_height}"
                             style="margin: auto;opacity: 80%;color: #409EFF;">
                      <Plus/>
                    </el-icon>
                    <el-dialog v-model="dialog_show" title="上传文件或创建文件夹" width=360px>
                      <div>
                        <div style="margin-bottom: 10px;text-align: center">
                          <el-select v-model="select_choice" style="width: 240px">
                            <el-option v-for="option in select_options" :label="option.label"
                                       :value="option.value"></el-option>
                          </el-select>
                        </div>

                        <div v-if="select_choice===0" style="text-align: center" @keyup.enter.stop="newDir">
                          <el-input ref="input" v-model="dir_name" :class="class_input"
                                    style="width: 240px;margin-bottom: 20px;">
                            <template #prepend>文件夹名</template>
                          </el-input>
                          <div>
                            <el-button @click.stop="newDir">确定</el-button>
                          </div>
                        </div>

                        <div v-if="select_choice===1"
                             :style="{'background-color':upload_color?'rgba(255,255,255,1)':'rgba(220,220,220,0.6)'}"
                             class="upload" @drop="drop" @drag.stop="dragEnter"
                             @dragenter.stop="dragEnter"
                             @dragleave.stop="dragLeave"
                             @dragover.stop="dragEnter">
                          <div>
                            <el-icon :size="50" style="opacity: 80%;color: #409EFF;margin: auto;">
                              <Plus/>
                            </el-icon>
                            <div>{{ show_name }}</div>
                            <div v-show="show_name==='拖拽到此处上传'">10M以内最多9个文件，大于10M只能单个上传</div>
                          </div>
                        </div>

                        <el-button v-if="select_choice===1" style="margin-top: 20px;width: 80px" @click.stop="upload">
                          上传
                        </el-button>
                      </div>

                    </el-dialog>
                  </div>

                </el-card>

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
import {
  Check,
  DArrowLeft,
  Delete,
  Document,
  DocumentAdd,
  Download,
  Folder,
  FolderAdd,
  Plus,
  Share,
  Upload
} from '@element-plus/icons-vue'
import debounce from "@/function/debounce";
import sortByName from "@/function/sortByName";
import {ElMessage, ElMessageBox} from 'element-plus'
import limitLength from "@/function/limitLength";

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
    Plus,
    Delete,
    Download,
    Share
  },
  data() {
    return {
      image: backgroundImg,
      card_style: 200 + 'px',
      icon_height: 150 + 'px',
      max_height: window.innerHeight - 180 + 'px',
      class_input: '',
      upload_color: true,

      folders: this.$store.getters.locationGet,
      user_name: this.$store.state.user_name,
      items: {},
      checkbox: [],
      dialog_show: false,
      select_choice: 1,
      select_options: [{value: 1, label: '文件'}, {value: 0, label: '文件夹'}],
      dir_name: '',
      show_name: '拖拽到此处上传',
      files: null
    }
  },
  methods: {
    limitName(content) {
      return limitLength(content)
    },
    resizeHandle() {
      this.max_height = window.innerHeight - 180 + 'px'
      this.card_style = window.innerWidth > 600 ? 200 + 'px' : 160 + 'px'
      this.icon_height = window.innerWidth > 600 ? 150 + 'px' : 110 + 'px'
    },
    delFiles() {
      let file = []
      for (let i = 0; i < this.checkbox.length; i++) {
        file.push(this.checkbox[i].name)
      }
      let send = {
        operate: 4,
        location: this.$store.getters.locationGet + '/',
        file: file
      }
      connectServer.post('/fileControl', send, {headers: {'Content-Type': 'application/json'}}).then((response) => {
        if (response.data.code === 102 || response.data.code === 103) {
          ElMessage.error('删除失败')
        } else if (response.data.code === 104) {
          ElMessage.error('权限不足')
        } else {
          ElMessage.success('删除成功')
          this.checkbox = []
          this.accessDir()
        }
      }).catch((error) => {
        ElMessage.error('与服务器失去连接，请重试')
        console.log(error);
      })
    },
    download() {
      let file = []
      for (let i = 0; i < this.checkbox.length; i++) {
        file.push({name: this.checkbox[i].name, dir: this.checkbox[i].dir})
      }
      let send = {
        location: this.$store.getters.locationGet,
        name: file
      }
      connectServer.post('/download', send, {
        headers: {'Content-Type': 'application/json'},
        responseType: 'blob'
      }).then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        if (this.checkbox.length > 1) {
          link.setAttribute('download', 'download.zip'); //or any other extension
        } else if (this.checkbox[0].dir === 0) {
          link.setAttribute('download', this.checkbox[0].name); //or any other extension
        } else if (this.checkbox[0].dir === 1) {
          link.setAttribute('download', 'download.zip'); //or any other extension
        }
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      })
    },
    share() {
      let file = []
      for (let i = 0; i < this.checkbox.length; i++) {
        file.push(this.checkbox[i].name)
      }
      let send = {
        operate: 5,
        location: this.$store.getters.locationGet,
        file: file
      }
      connectServer.post('/fileControl', send, {headers: {'Content-Type': 'application/json'}}).then((response) => {
        if (response.data.code === 102) {
          ElMessage.error('分享遇到问题，稍后重试')
        } else {
          ElMessageBox.alert('分享访问链接:' + window.location.host + '/share/' + response.data.link, '分享', {
            confirmButtonText: 'OK',
          }).then(() => {
            ElMessage.success('请记住您的链接')
          })
          console.log(window.location.host + '/share/' + response.data.link)
        }
      }).catch((error) => {
        ElMessage.error('与服务器失去连接，请重试')
        console.log(error);
      })
    },
    openDir(name) {
      this.$store.commit('locationPush', name)
      this.accessDir()
      this.folders = this.$store.getters.locationGet
      this.checkbox = []
    },
    jumpDir(name) {
      this.$store.commit('locationJump', name)
      this.accessDir()
      this.folders = this.$store.getters.locationGet
      this.checkbox = []
    },
    previousDir() {
      this.$store.commit('locationPop')
      this.accessDir()
      this.folders = this.$store.getters.locationGet
      this.checkbox = []
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
      }).catch((error) => {
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
            this.dialog_show = false
            this.accessDir()
          } else if (response.data.code === 102) {
            ElMessage.warning('目录已存在')
            this.class_input = 'animate__animated animate__headShake --animate-duration: 800ms'
            this.dir_name = ''
            setTimeout(() => this.class_input = '', 1000)
          } else if (response.data.code === 104) {
            ElMessage.error('权限不足')
          }
        }).catch((error) => {
          ElMessage.error('出现错误，请重试')
          console.log(error);
        })
      }
    },
    dragEnter(e) {
      e.stopPropagation();
      e.preventDefault();
      this.upload_color = false
    },
    dragLeave(e) {
      e.stopPropagation();
      e.preventDefault();
      this.upload_color = true
    },
    drop(e) {
      e.stopPropagation();
      e.preventDefault();

      this.files = e.dataTransfer.files
      this.show_name = this.files[0].name
      this.upload_color = true
    },
    upload() {
      let size = 0

      if (this.files.length > 9) {
        ElMessage.warning('不可以大于9项')
        this.files = []
        this.show_name = '拖拽到此处上传'
      } else {
        for (let i = 0; i < this.files.length; i++) {
          size += this.files[i].size
        }
        if (size > 10 * 1024 * 1024 && this.files.length > 1) {
          ElMessage.warning('文件过大,请以单文件形式传输')
          this.files = []
          this.show_name = '拖拽到此处上传'
        } else if (size <= 10 * 1024 * 1024) {
          let send = new FormData()
          send.append('location', this.$store.getters.locationGet + '/')
          for (let i = 0; i < this.files.length; i++) {
            send.append('files', this.files[i])
          }
          connectServer.post('/smallfile', send, {headers: {"Content-Type": "multipart/form-data"}}).then((response) => {
            if (response.data.code === 101) {
              ElMessage.success('上传成功')
              this.dialog_show = false
              this.accessDir()
            } else {
              ElMessage.error('出错了，请重试')
            }
          }).catch((error) => {
            ElMessage.error('出错了，请重试')
            console.log(error)
          })
        } else if (size > 10 * 1024 * 1024 && this.files.length === 1) {
          let send = new FormData()
          send.append('location', this.$store.getters.locationGet)
          send.append('files', this.files[0])
          connectServer.post('/largefile', send, {headers: {"Content-Type": "multipart/form-data"}}).then((response) => {
            if (response.data.code === 101) {
              ElMessage.success('上传成功')
              this.dialog_show = false
              this.accessDir()
            } else {
              ElMessage.error('出错了，请重试')
            }
          }).catch((error) => {
            ElMessage.error('出错了，请重试')
            console.log(error)
          })
        }
      }

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
  /* Add if not using autoprefixer */
  -webkit-appearance: none;
  /* Remove most all native input styles */
  appearance: none;
  /* For iOS < 15 */
  /* Not removed via appearance */
  margin: 0;

  font: inherit;
  color: currentColor;
  width: 0.8em;
  height: 0.8em;
  border: 0.04em solid #409EFF;
  border-radius: 0.15em;
  transform: translateY(-0.075em);

  display: grid;
  place-content: center;
  position: absolute;
  top: 0;
  left: 0;
  cursor: pointer;
}

.checkbox::before {
  content: "";
  width: 0.4em;
  height: 0.4em;
  clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
  transform: scale(0);
  transform-origin: bottom left;
  transition: 120ms transform ease-in-out;
  box-shadow: inset 0.2em 0.2em;
  /* Windows High Contrast Mode */
  background-color: black;
}

.checkbox:checked::before {
  transform: scale(1);
}

.upload {
  width: 230px;
  border-radius: 8px;
  text-align: center;
  margin: auto;
  border: 2px dashed rgba(64, 158, 255, 0.3);
  height: 230px;
  display: flex;
  align-items: center;
  justify-content: center;
}

</style>
