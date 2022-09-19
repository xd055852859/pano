<script setup lang="ts">
import { ResultProps } from "@/interface/Common";
import { MoreFilled } from "@element-plus/icons-vue";
import api from "@/services/api";
import appStore from "@/store";
import axios from "axios";
import { ElMessage } from "element-plus";
import { storeToRefs } from "pinia";
import CommonHeader from "../components/common/header.vue";
import Share from "@/components/common/share.vue";
const router = useRouter();
const dayjs: any = inject("dayjs");
const { token } = storeToRefs(appStore.authStore);
const { setCreateFile } = appStore.commonStore;
const { clearPano } = appStore.panoStore;
const panoList = ref<any>([]);
const deleteVisible = ref<boolean>(false);
const deleteIndex = ref<number>(0);
const nameVisible = ref<boolean>(false);
const shareVisible = ref<boolean>(false);
const shareUrl = ref<string>("");
const nameInput = ref<string>("");
const panoIndex = ref<number>(0);
const closeRef = ref<any>(null);
const total = ref<number>(0);
const page = ref<number>(1);
onMounted(() => {
  clearPano();
  getPanoList();
});
const uploadPanoImg = async (file) => {
  if (file.size > 31457280) {
    ElMessage({
      message: "请上传不大于30M的图片",
      type: "warning",
      duration: 3000,
    });
    return;
  }
  // let regExp = /[\u4E00-\u9FA5\uF900-\uFA2D]{1,}/;
  // if (regExp.test(file.name)) {
  //   ElMessage({
  //     message: "文件名请勿使用中文",
  //     type: "warning",
  //     duration: 3000,
  //   });
  //   return;
  // }

  let url = window.URL || window.webkitURL;
  console.log(url.createObjectURL(file)); //this.files[0]为选中的文件(索引为0因为是单选一个),这里是图片
  let img = new Image(); //手动创建一个Image对象
  img.src = url.createObjectURL(file); //创建Image的对象的url
  img.onload = async () => {
    if (img.height === img.width || img.width / img.height === 2) {
      //请使用正方形或者2:1的尺寸的图片
      const formData = new FormData();
      // Object.defineProperty(file, "name", {
      //   writable: true, //设置属性为可写
      // });
      // file.name = "pano" + new Date().getTime();
      // 遍历当前临时文件List,将上传文件添加到FormData对象中
      let arr = file.name.split(".");
      let newFile = new File(
        [file],
        `pano${new Date().getTime()}.${arr[arr.length - 1]}`,
        {
          type: file.type,
        }
      );
      formData.append("images", newFile);
      console.log(newFile);
      const createRes = (await api.request.post("pano", {})) as ResultProps;

      if (createRes.msg === "OK") {
        // console.log(createRes.data);
        ElMessage({
          message: "创建全景成功",
          type: "success",
          duration: 1000,
        });
        // setCreateState(true);
        setCreateFile(file);
        router.push(`/preview/${createRes.data._key}/create`);
        formData.append("panoKey", createRes.data._key);
        axios.post("https://panodata2.qingtime.cn/scene/new", formData, {
          // 因为我们上传了图片,因此需要单独执行请求头的Content-Type
          headers: {
            // 表示上传的是文件,而不是普通的表单数据
            "Content-Type": "multipart/form-data",
            token: token.value,
          },
        });
      }
    } else {
      ElMessage({
        message: "请选择正方形或宽高比2:1的图片",
        type: "warning",
        duration: 3000,
      });
    }
  };
};
const delPano = async () => {
  deleteVisible.value = false;
  const infoRes = (await api.request.delete("pano", {
    panoKey: panoList.value[deleteIndex.value]._key,
  })) as ResultProps;
  if (infoRes.msg === "OK") {
    ElMessage({
      message: "删除全景成功",
      type: "success",
      duration: 1000,
    });
    panoList.value.splice(deleteIndex.value, 1);
  }
};
const getPanoList = async () => {
  const listRes: any = (await api.request.get("pano", {
    page: page.value,
    limit: 30,
  })) as ResultProps;
  if (listRes.msg === "OK") {
    panoList.value = listRes.data.map((item) => {
      item.cover = `${api.File_URL}${item.cover}`;
      item.createTime = dayjs(item.createTime).format("YYYY-MM-DD");
      return item;
    });
    total.value = listRes.total;
  }
};
const scrollPano = (e: any) => {
  //文档内容实际高度（包括超出视窗的溢出部分）
  let scrollHeight = e.target.scrollHeight;
  //滚动条滚动距离
  let scrollTop = e.target.scrollTop;
  //窗口可视范围高度
  let height = e.target.clientHeight;
  if (
    height + scrollTop >= scrollHeight &&
    panoList.value.length < total.value
  ) {
    page.value++;
    getPanoList();
  }
};
const saveName = async () => {
  nameVisible.value = false;
  const saveSceneRes = (await api.request.patch("pano", {
    name: nameInput.value,
    panoKey: panoList.value[panoIndex.value]._key,
  })) as ResultProps;
  if (saveSceneRes.msg === "OK") {
    ElMessage({
      message: "重命名成功",
      type: "success",
      duration: 1000,
    });
    panoList.value[panoIndex.value].name = nameInput.value;
    nameInput.value = "";
  }
};
const sharePano = (item) => {
  shareVisible.value = true;
  shareUrl.value = `${window.location.protocol}//${window.location.host}/#/preview/${item._key}/${item.firstScene}`;
};
</script>
<template>
  <CommonHeader />
  <div class="pano-header">
    <el-tooltip content="请选择正方形或宽高比2:1的图片">
      <div
        class="upload-button pano-header-button"
        style="justify-content: flex-start"
      >
        <div class="button">
          <iconpark-icon name="createLogo" :size="45" />
          <div class="title">新建全景预览</div>
        </div>
        <input
          type="file"
          accept=".png,.jpg,.jpeg"
          @change="
            //@ts-ignore
            uploadPanoImg($event.target.files[0])
          "
          class="upload-img"
        />
      </div>
    </el-tooltip>
  </div>
  <div class="pano-container" @scroll="scrollPano">
    <div class="pano-list">
      <div
        class="pano-list-item"
        v-for="(item, index) in panoList"
        :key="`pano${index}`"
        @click="$router.push(`/view/pano/${item._key}`)"
      >
        <img :src="item.cover" alt="" />
        <div class="title">
          <div>{{ item.name ? item.name : "全景" }}</div>
          <div>{{ item.createTime }}</div>
        </div>
        <div class="list-close" @click="$event.stopPropagation()">
          <el-dropdown>
            <el-icon style="cursor: pointer" :size="14">
              <MoreFilled />
            </el-icon>

            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  @click="
                    panoIndex = index;
                    nameInput = item.name;
                    nameVisible = true;
                  "
                  >重命名</el-dropdown-item
                >
                <el-dropdown-item @click="sharePano(item)"
                  >分享</el-dropdown-item
                >
                <el-dropdown-item
                  @click="
                    $router.push(`/preview/${item._key}/${item.firstScene}`)
                  "
                  >预览</el-dropdown-item
                >
                <el-dropdown-item
                  @click="
                    $event.stopPropagation();
                    deleteIndex = index;
                    deleteVisible = true;
                  "
                  >删除</el-dropdown-item
                >
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>
  </div>
  <el-dialog v-model="deleteVisible" title="删除提示" width="30%">
    <span>是否删除该全景</span>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="deleteVisible = false">取消</el-button>
        <el-button type="success" @click="delPano()">确认</el-button>
      </span>
    </template>
  </el-dialog>
  <el-dialog v-model="nameVisible" title="重命名" width="30%">
    <div style="padding: 20px">
      <el-input v-model="nameInput" placeholder="请输入场景名称" />
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="nameVisible = false">取消</el-button>
        <el-button type="primary" @click="saveName()">确认</el-button>
      </span>
    </template>
  </el-dialog>
  <el-dialog v-model="shareVisible" title="分享" :width="'550px'">
    <Share :url="shareUrl" />
  </el-dialog>
</template>
<style scoped lang="scss">
.pano-header {
  width: 100vw;
  height: 100px;
  background: #ffffff;
  @include p-number(3%);
  .pano-header-button {
    width: 100px;
    height: 100%;
    .button {
      width: 100%;
      height: 100%;
      align-content: center;
      @include flex(center, center, wrap);
      .title {
        width: 100%;
        text-align: center;
        margin-top: 10px;
      }
    }
  }
}
.pano-container {
  width: 100vw;
  height: calc(100vh - 170px);
  box-sizing: border-box;
  background: #eff0f4;
  @include scroll();
  @include flex(center, null, wrap);
  .pano-list {
    width: 85vw;
    height: 100%;
    min-width: 650px;
    box-sizing: border-box;
    padding: 20px 0px;
    .pano-list-item {
      width: 100%;
      height: 140px;
      margin-bottom: 20px;
      background-color: #fff;
      position: relative;
      z-index: 1;
      @include flex(space-between, center, wrap);
      img {
        width: 220px;
        height: 140px;
        object-fit: cover;
      }
      .title {
        width: calc(100% - 250px);
        height: 100%;
        @include flex(null, center, wrap);
        align-content: center;
        > div {
          width: 100%;
          height: 45%;
          @include flex(null, center, null);
          &:nth-child(2) {
            font-size: 14px;
            color: #9e9e9e;
          }
        }
      }
      .list-close {
        position: absolute;
        z-index: 2;
        bottom: 0px;
        right: 20px;
        opacity: 0;
      }
      &:hover .list-close {
        opacity: 1;
      }
    }
  }
}
</style>
<style lang="scss">
.pano-container {
  .el-dialog__body {
    padding: 15px;
  }
}
</style>
