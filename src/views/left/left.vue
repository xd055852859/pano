<script setup lang="ts">
import { ElMessage } from "element-plus";
import loadGif from "@/assets/img/load.gif";
import { Close } from "@element-plus/icons-vue";
import appStore from "@/store";
import { storeToRefs } from "pinia";
import axios from "axios";
import { ResultProps } from "@/interface/Common";
import draggable from "vuedraggable";
import api from "@/services/api";
const { sceneObj, panoConfig, sceneConfig, sceneList } = storeToRefs(
  appStore.panoStore
);
const { setSceneKey, delSceneObj, setSceneConfig } = appStore.panoStore;
const { token } = storeToRefs(appStore.authStore);
const { createState, createFile } = storeToRefs(appStore.commonStore);
const {
  setLeftNum,
  setHeaderNum,
  setConfigNum,
  setCreateState,
  setCreateFile,
} = appStore.commonStore;
const socket: any = inject("socket");
const deleteVisible = ref<boolean>(false);
const nameVisible = ref<boolean>(false);
const nameInput = ref<string>("");
const deleteKey = ref<string>("");
const drag = ref<boolean>(false);
const chooseScene = (key: string) => {
  setLeftNum(1);
  setHeaderNum(0);
  setConfigNum("1");
  setSceneKey(key);
};
const uploadSceneImg = async (files) => {
  if (panoConfig.value) {
    const formData = new FormData();
    if (files.length === 0) {
      return;
    }
    // 遍历当前临时文件List,将上传文件添加到FormData对象中
    [...files].forEach((item) => formData.append("images", item));
    formData.append("panoKey", panoConfig.value?._key);
    ElMessage({
      message: "生成场景中...",
      type: "warning",
      duration: 3000,
    });
    // 调用后端接口,发送请求
    const createRes = (await axios.post(
      "https://panodata2.qingtime.cn/scene/new",
      formData,
      {
        // 因为我们上传了图片,因此需要单独执行请求头的Content-Type
        headers: {
          // 表示上传的是文件,而不是普通的表单数据
          "Content-Type": "multipart/form-data",
          token: token.value,
        },
      }
    )) as ResultProps;
    console.log(createRes.data);
    if (createRes.data.msg === "OK") {
      ElMessage({
        message: "创建场景成功",
        type: "success",
        duration: 1000,
      });
      setCreateState(true);
      setCreateFile(files[0]);
    }
  }
};
const delScene = async () => {
  deleteVisible.value = false;
  delSceneObj(deleteKey.value);
  ElMessage({
    message: "删除场景成功",
    type: "success",
    duration: 1000,
  });
  await api.request.delete("scene", {
    sceneKey: deleteKey.value,
  });
  deleteKey.value = "";
};
const sortScene = () => {
  let sceneArr = sceneList.value.map((item) => item._key);
  api.request.patch("scene/order", {
    panoKey: panoConfig.value?._key,
    sceneArr: sceneArr,
  });
};
const saveName = async () => {
  const saveSceneRes = (await api.request.patch("scene", {
    name: nameInput.value,
    sceneKey: sceneConfig.value?._key,
  })) as ResultProps;
  if (saveSceneRes.msg === "OK") {
    ElMessage({
      message: "重命名成功",
      type: "success",
      duration: 1000,
    });
    setSceneConfig({
      name: nameInput.value,
      _key: sceneConfig.value?._key,
    });
    nameVisible.value = false;
    nameInput.value = "";
  }
};
</script>
<template>
  <div class="pano-left-container" @mouseleave="sortScene">
    <div class="button">
      <div class="upload-button">
        <el-button type="success" round color="#86b93f" style="color: #fff"
          >+ 新场景</el-button
        >
        <input
          type="file"
          accept=".png,.jpg,.jpeg"
          @change="
            //@ts-ignore
            uploadSceneImg($event.target.files)
          "
          class="upload-img"
        />
      </div>
      <!-- <el-button
        type="success"
        round
        color="#86b93f"
        style="color: #fff"
        @click="createScene()"
        >+ 新场景</el-button
      >
    </div>
    <div>
      <input
        type="file"
        accept=".png,.jpg,.jpeg"
        multiple
        @change="uploadSceneImg"
      /> -->
    </div>
    <!--  -->
    <div v-if="createState" class="screen">
      <img :src="createFile" alt="" v-if="createFile" />
      <!-- <img :src="sceneList&&sceneList[0].cover ? sceneList[0].cover : ''" alt="" /> -->
      <div class="screen-mark single-to-long">
        <img :src="loadGif" alt="" />
        <div>场景生成中...</div>
      </div>
    </div>
    <draggable
      v-model="sceneList"
      @start="drag = true"
      @end="drag = false"
      item-key="index"
      class="screen-container"
      :style="{
        height: createState ? 'calc(100% - 200px)' : 'calc(100% - 80px)',
      }"
    >
      <template #item="{ element }">
        <div
          class="screen"
          @click="chooseScene(element._key)"
          :style="
            element._key === sceneConfig?._key
              ? { border: '3px solid #86b93f' }
              : {}
          "
        >
          <img :src="element.cover" alt="" />
          <div
            class="screen-icon single-to-long"
            @click="
              $event.stopPropagation();
              deleteVisible = true;
              deleteKey = element._key;
            "
          >
            <el-icon :size="20">
              <Close />
            </el-icon>
          </div>
          <div
            class="screen-bottom single-to-long"
            @click="
              $event.stopPropagation();
              nameVisible = true;
              nameInput = element.name;
            "
          >
            <!-- <div
         
        >
          重命名
        </div>
        <div
        
        >
          删除
        </div> -->
            {{ element.name }}
          </div>
        </div>
      </template>
    </draggable>
  </div>
  <el-dialog v-model="deleteVisible" title="删除提示" width="30%">
    <div style="padding: 20px">
      {{
        Object.keys(sceneObj).length === 1
          ? "当前场景为最后场景,若删除将删除全景，"
          : ""
      }}是否删除该场景
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="deleteVisible = false">取消</el-button>
        <el-button type="primary" @click="delScene()">确认</el-button>
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
</template>
<style scoped lang="scss">
.pano-left-container {
  width: 100%;
  height: 100%;
  @include scroll();
  @include p-number(10px);
  color: #fff;
  .button {
    width: 100%;
    height: 70px;
    @include flex(center, center, null);
  }
  .screen-container {
    width: 100%;
    @include scroll();
  }
  .screen {
    width: 100%;
    height: 120px;
    margin: 15px 0px;
    position: relative;
    z-index: 1;
    border-radius: 10px;
    box-sizing: border-box;
    overflow: hidden;
    cursor: pointer;
    img {
      @include img-fit(cover);
    }
    .screen-icon {
      width: 35px;
      height: 35px;
      position: absolute;
      z-index: 2;
      top: 0px;
      right: 0px;
      display: none;
      cursor: pointer;
    }
    &:hover {
      .screen-icon {
        @include flex(center, center, null);
      }
    }
    .screen-bottom {
      width: 100%;
      height: 35px;
      text-align: center;
      line-height: 35px;
      position: absolute;
      z-index: 2;
      left: 0px;
      bottom: 0px;
      color: #fff;
      background-color: rgba(0, 0, 0, 0.5);
      font-size: 14px;
      @include p-number(10px);
    }
    .screen-mark {
      width: 100%;
      height: 100%;
      position: absolute;
      z-index: 2;
      left: 0px;
      top: 0px;
      color: #fff;
      background-color: rgba(0, 0, 0, 0.5);
      font-size: 14px;
      align-content: center;
      @include flex(center, center, flex);
      img {
        width: 50px;
        height: 50px;
      }
      > div {
        width: 100%;
        text-align: center;
        margin-top: 5px;
      }
    }
  }
}
</style>
<style></style>
