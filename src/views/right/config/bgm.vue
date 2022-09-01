<script setup lang="ts">
import { ElMessage } from "element-plus";
import { Check } from "@element-plus/icons-vue";
import { uploadFile } from "@/services/util";
import api from "@/services/api";
import { ResultProps } from "@/interface/Common";
import appStore from "@/store";
import { storeToRefs } from "pinia";
const { sceneConfig } = storeToRefs(appStore.panoStore);
const { setSceneConfig } = appStore.panoStore;
const musicRadioState = ref<number>(0);
const musicFile = ref<any>(null);
const musicKey = ref<any>("");
const bgmList = ref<any>(null);
const uploadBgm = (e) => {
  console.log(e);
  musicFile.value = e.target.files[0];
};
onMounted(() => {
  getBgm();
});
const getBgm = async () => {
  const bgmRes = (await api.request.get("media", {
    type: "audio",
    page: 1,
    limit: 100,
  })) as ResultProps;
  if (bgmRes.msg === "OK") {
    bgmList.value = [...bgmRes.data];
    console.log(sceneConfig.value?.BGM._key);
    if (sceneConfig.value?.BGM?._key) {
      musicKey.value = sceneConfig.value.BGM._key;
    }
  }
};
const createBgm = () => {
  uploadFile(musicFile.value, ["mp3"], async (url, name) => {
    console.log(url);
    const createRes = (await api.request.post("media", {
      name: musicFile.value.name,
      url: url,
      type: "audio",
    })) as ResultProps;
    if (createRes.msg === "OK") {
      ElMessage({
        message: "上传音乐成功",
        type: "success",
        duration: 1000,
      });
      bgmList.value.push(createRes.data);
      console.log(sceneConfig.value?.BGM._key);
      if (sceneConfig.value?.BGM?._key) {
        musicKey.value = sceneConfig.value.BGM._key;
      }
    }
  });
};
const chooseBgm = (key, url) => {
  if (musicKey.value === key) {
    musicKey.value = "";
    setSceneConfig({ BGM: {}, _key: sceneConfig.value?._key });
  } else {
    musicKey.value = key;
    setSceneConfig({
      BGM: { _key: key, url: url, loop: !!musicRadioState },
      _key: sceneConfig.value?._key,
    });
  }
};
</script>
<template>
  <div class="pano-music">
    <div class="pano-item">
      <div class="pano-item-title">背景音乐</div>
      <el-button
        type="success"
        round
        color="#86b93f"
        style="color: #fff"
        @click="createBgm"
        >上传</el-button
      >
    </div>
    <div>
      <input type="file" accept=".mp3,.gif" @change="uploadBgm" />
    </div>
    <div class="pano-item">
      <el-radio-group v-model="musicRadioState" :text-color="'#fff'">
        <el-radio :label="0">循环</el-radio>
        <el-radio :label="1">单次</el-radio>
      </el-radio-group>
    </div>
    <div class="pano-music-box">
      <div
        class="pano-music-item"
        v-for="(item, index) in bgmList"
        :key="`bgm${index}`"
        @click="chooseBgm(item._key, item.url)"
      >
        <div class="pano-music-name">{{ item.name }}</div>
        <div v-if="musicKey === item._key">
          <el-icon><Check /></el-icon>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.pano-music {
  width: 100%;
  height: calc(100vh - 120px);
  padding: 5px 10px;
  box-sizing: border-box;

  .pano-music-box {
    width: 100%;
    height: calc(100% - 165px);
    @include scroll();
    .pano-music-item {
      width: 100%;
      height: 35px;
      @include flex(space-between, center, null);
      .pano-music-name {
        width: calc(100% - 70px);
        height: 35px;
        line-height: 35px;
      }
    }
  }
}
</style>
<style>
.pano-music .el-radio {
  color: #fff;
}
</style>
