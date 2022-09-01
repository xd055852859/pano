<script setup lang="ts">
import { ElMessage } from "element-plus";
import panoJpg from "@/assets/img/pano1.jpg";
import appStore from "@/store";
import { storeToRefs } from "pinia";
import axios from "axios";
import { ResultProps } from "@/interface/Common";
import api from "@/services/api";
const { sceneObj, panoConfig, sceneConfig } = storeToRefs(appStore.panoStore);
const { setSceneKey, delSceneObj, setSceneConfig } = appStore.panoStore;
const { token } = storeToRefs(appStore.authStore);
const { setLeftNum, setHeaderNum } = appStore.commonStore;

const deleteVisible = ref<boolean>(false);
const nameVisible = ref<boolean>(false);
const nameInput = ref<string>("");
const deleteKey = ref<string>("");
const tempFiles = ref<any>([]);
const chooseScene = (key: string) => {
  setLeftNum(1);
  setHeaderNum(0);
  setSceneKey(key);
};
const uploadSceneImg = (e) => {
  tempFiles.value = [...tempFiles.value, ...e.target.files];
};
const createScene = async () => {
  if (panoConfig.value) {
    const formData = new FormData();
    if (tempFiles.value.length === 0) {
      return;
    }
    // 遍历当前临时文件List,将上传文件添加到FormData对象中
    tempFiles.value.forEach((item) => formData.append("images", item));
    formData.append("panoKey", panoConfig.value?._key);
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
      setLeftNum(1);
      setSceneKey(createRes.data.data);
    }
  }
};
const delScene = async () => {
  deleteVisible.value = false;
  delSceneObj(deleteKey.value);
  deleteKey.value = "";
  ElMessage({
    message: "删除场景成功",
    type: "success",
    duration: 1000,
  });
  await api.request.delete("scene", {
    sceneKey: sceneConfig.value?._key,
  });
};
const saveName = async () => {
  const saveSceneRes = (await api.request.patch("scene", {
    name: nameInput.value,
    sceneKey:sceneConfig.value?._key
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
  <div class="pano-left-container">
    <div class="button">
      <el-button
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
      />
    </div>
    <div
      class="screen"
      v-for="(value, key) in sceneObj"
      :key="`scene${key}`"
      @click="chooseScene(value._key)"
    >
      <img :src="value.cover" alt="" />
      <div v-if="sceneConfig?._key === value._key" class="screen-bottom">
        <div
          @click="
            nameVisible = true;
            nameInput = value.name;
          "
        >
          重命名
        </div>
        <div
          @click="
            deleteVisible = true;
            deleteKey = value._key;
          "
        >
          删除
        </div>
      </div>
      <div class="screen-title single-to-long">{{ value.name }}</div>
    </div>
  </div>
  <el-dialog v-model="deleteVisible" title="删除提示" width="30%">
    <span
      >{{
        Object.keys(sceneObj).length === 1
          ? "当前场景为最后场景,若删除将删除全景，"
          : ""
      }}是否删除该场景</span
    >
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="deleteVisible = false">取消</el-button>
        <el-button type="primary" @click="delScene()">确认</el-button>
      </span>
    </template>
  </el-dialog>
  <el-dialog v-model="nameVisible" title="删除提示" width="30%">
    <el-input v-model="nameInput" placeholder="请输入场景名称" />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="deleteVisible = false">取消</el-button>
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
  .screen {
    width: 100%;
    height: 210px;
    margin: 15px 0px;
    position: relative;
    z-index: 1;
    cursor: pointer;
    img {
      width: 240px;
      height: 170px;
      // @include img-fit(cover);
    }
    .screen-bottom {
      width: 100%;
      height: 30px;
      position: absolute;
      z-index: 2;
      left: 0px;
      bottom: 40px;
      @include p-number(10px);
      @include flex(space-between, center, null);
    }
    .screen-title {
      width: 100%;
      height: 30px;
      text-align: center;
      line-height: 30px;
    }
  }
}
</style>
<style></style>
