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

                <el-breadcrumb-item>
                  <el-tooltip content="下载" effect="light" placement="bottom">
                    <el-button round style="height: 10px;color: #409EFF;padding: 0" type="text" @click="download">
                      <el-icon :size="16">
                        <Download/>
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
import {ElMessage} from 'element-plus'
import limitLength from "@/function/limitLength";
// import store from "@/store";
import sortByNameShare from "@/function/sortByNameShare";

export default {
  name: 'Share',
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
      items: {},
      checkbox: []
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
    download() {
      let file = []
      for (let i = 0; i < this.checkbox.length; i++) {
        file.push({name: this.checkbox[i].name, dir: this.checkbox[i].dir})
      }
      let send = {
        location: this.$store.getters.locationGet,
        name: file
      }
      connectServer.post('/shareDownload', send, {
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
      connectServer.post('/share', send, {headers: {'Content-Type': 'application/json'}}).then((response) => {
        if (response.data.code === 102) {
          ElMessage.error('目录不存在')
        } else {
          this.items = sortByNameShare(response.data)
          if (this.items.length === 0) {
            ElMessage.warning('空文件夹')
          }
        }
      }).catch((error) => {
        ElMessage.error('与服务器失去连接，请重试')
        console.log(error);
      })
    }
  },
  beforeMount() {
    let token = this.$route.params.token
    this.$store.commit("saveToken", token)
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

</style>
