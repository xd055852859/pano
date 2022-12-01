<script setup lang="ts">
import { ElMessage } from "element-plus";
import { Check, Delete } from "@element-plus/icons-vue";
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
const ttsContent = ref<any>("");
const bgmIndex = ref<number>(0);
const deleteVisible = ref<boolean>(false);

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
    if (sceneConfig.value?.BGM?._key) {
      musicKey.value = sceneConfig.value.BGM._key;
    }
    if (sceneConfig.value?.ttsContent) {
      ttsContent.value = sceneConfig.value?.ttsContent;
    }
  }
};
const uploadMusic = (file) => {
  uploadFile(file, ["mp3"], async (url, name) => {
    const createRes = (await api.request.post("media", {
      name: file.name,
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
const deleteBgm = async () => {
  const bgmRes = (await api.request.delete("media", {
    mediaKey: bgmList.value[bgmIndex.value]._key,
  })) as ResultProps;
  if (bgmRes.msg === "OK") {
    ElMessage({
      message: "删除音乐成功",
      type: "success",
      duration: 1000,
    });
    deleteVisible.value = false;
    bgmList.value.splice(bgmIndex.value, 1);
  }
};
const changeText = () => {
  setSceneConfig({
    ttsContent: ttsContent.value,
    _key: sceneConfig.value?._key,
  });
};
</script>
<template>
  <div class="pano-music">
    <div class="pano-item">
      <div class="pano-item-title">朗读内容</div>
      <el-input
        v-model="ttsContent"
        :autosize="{ minRows: 6 }"
        type="textarea"
        placeholder="请输入朗读内容"
        @change="changeText"
      />
    </div>
    <div class="pano-item">
      <div class="pano-item-title">背景音乐</div>
      <div class="upload-button">
        <div class="upload-button">
          <el-button type="success" round>上传</el-button>
          <input
            type="file"
            accept=".mp3"
            @change="
              //@ts-ignore
              uploadMusic($event.target.files[0])
            "
            class="upload-img"
          />
        </div>
      </div>
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
        <div class="pano-music-name single-to-long">{{ item.name }}</div>
        <div class="pano-music-button">
          <el-icon v-if="musicKey === item._key" style="margin-left: 10px"
            ><Check
          /></el-icon>
          <el-icon
            v-else
            class="pano-music-delete"
            @click="
              $event.stopPropagation();
              bgmIndex = index;
              deleteVisible = true;
            "
            ><Delete
          /></el-icon>
        </div>
      </div>
    </div>
  </div>
  <el-dialog v-model="deleteVisible" title="删除提示" width="30%">
    <div style="padding: 20px">是否删除该音乐</div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="deleteVisible = false">取消</el-button>
        <el-button type="success" @click="deleteBgm()">确认</el-button>
      </span>
    </template>
  </el-dialog>
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
      cursor: pointer;
      @include flex(space-between, center, null);
      .pano-music-name {
        width: calc(100% - 40px);
        height: 35px;
        line-height: 35px;
      }
      .pano-music-button {
        width: 30px;
        height: 100%;
        @include flex(flex-end, center, null);
        .pano-music-delete {
          display: none;
        }
      }

      &:hover .pano-music-delete {
        display: flex;
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
