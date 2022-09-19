<script setup lang="ts">
import { ElMessage } from "element-plus";
import CommonPano from "@/components/common/pano.vue";
import { storeToRefs } from "pinia";
import appStore from "@/store";
import CommonMap from "@/components/common/map.vue";
import Loading from "@/components/loading/loading2.vue";
const route = useRoute();
const { hotspotObj } = storeToRefs(appStore.controlStore);
const { token } = storeToRefs(appStore.authStore);
const { createFile } = storeToRefs(appStore.commonStore);
const { sceneConfig, sceneList, previewPano, panoConfig } = storeToRefs(
  appStore.panoStore
);
const { getPanoInfo, setSceneKey, setPreviewPano, getSceneInfo } =
  appStore.panoStore;
const hotspot = ref<any>(null);
const previewVisible = ref<boolean>(false);
const sceneKey = ref<string>("");
const bottomRef = ref<any>(null);
const dialogTitle = ref<any>(null);
const dialogTop = ref<string>("5vh");
const dialogWidth = ref<string>("0");
const dialogHeight = ref<string>("0");
const locationArray = ref<any>([]);
const bgMusicUrl = ref<string>("");
const bgMusicRef = ref<any>(null);
const playState = ref<boolean>(false);
const mapVisible = ref<boolean>(false);
const targetScene = ref<any>(null);
const blendObj = {
  淡入淡出: "BLEND(1.0, easeInCubic)",
  缩放过渡: "ZOOMBLEND(2.0, 2.0, easeInOutSine)",
  黑场过渡: "COLORBLEND(2.0, 0x000000, easeOutSine)",
  白场过渡: "LIGHTBLEND(1.0, 0xFFFFFF, 2.0, linear)",
  从右至左: "SLIDEBLEND(1.0, 0.0, 0.2, linear)",
  从上至下: "SLIDEBLEND(1.0, 90.0, 0.01, linear)",
  对角线: "SLIDEBLEND(1.0, 135.0, 0.4, linear)",
  圆形展开: "OPENBLEND(1.0, 0.0, 0.2, 0.0, linear)",
  垂直展开: "OPENBLEND(0.7, 1.0, 0.1, 0.0, linear)",
  水平展开: "OPENBLEND(1.0, -1.0, 0.3, 0.0, linear)",
  椭圆缩放: "OPENBLEND(1.0, -0.5, 0.3, 0.8, linear)",
};
onMounted(() => {
  // if (!panoConfig.value) {
  getPanoInfo(
    route.params.panoKey,
    route.params.sceneKey === "create" ? "create" : "preview"
  );
  console.log(route.params.sceneKey);
  if (route.params.sceneKey !== "create") {
    console.log(route.params.sceneKey);
    // setSceneKey(route.params.sceneKey as string);
    getSceneInfo(route.params.sceneKey);
  }
  // }
  window.addEventListener("setItemEvent", function (e: any) {
    // console.log(e.key);
    // console.log(e.newValue);
    if (e.key === "hotspotName" && e.newValue !== "loadPano") {
      previewVisible.value = true;
      hotspot.value = hotspotObj.value[e.newValue];
      console.log(hotspotObj.value);
      console.log(e.newValue);
      console.log(hotspot.value);
      localStorage.removeItem("hotspotName");
    } else if (e.key === "getLoadPano" && e.newValue) {
      hotspot.value = hotspotObj.value[e.newValue];
      localStorage.removeItem("getLoadPano");
    }
  });
});
onUnmounted(() => {
  setPreviewPano(null);
});
const moveScene = (e) => {
  //@ts-ignore
  bottomRef.value.scrollLeft += e.deltaY;
};
const chooseMarker = (key) => {
  setSceneKey(key);
  let index = sceneList.value.findIndex((item) => item._key === key);
  if (index !== -1) {
    chooseScene(sceneList.value[index].xmlPath, key);
    targetScene.value = sceneList.value[index];
  }
};
const chooseScene = (path, key) => {
  setSceneKey(key);
  console.log(panoConfig.value?.config.blend);
  previewPano.value.call(
    `loadpano(${path},null,KEEPSCENES,'${
      blendObj[panoConfig.value?.config.blend]
        ? blendObj[panoConfig.value?.config.blend]
        : blendObj["淡入淡出"]
    }')`
  );
};
const playMusic = () => {
  playState.value = !playState.value;
  if (playState.value) {
    console.log(bgMusicRef.value);
    bgMusicRef.value.play();
  } else {
    bgMusicRef.value.pause();
  }
};
const showVr = () => {
  previewPano.value.call(`addplugin(webvr)`);
};
watch(sceneConfig, (newConfig) => {
  console.log(newConfig);
  if (newConfig?.ttsContent) {
    let url =
      "https://tts.baidu.com/text2audio?cuid=baike&lan=ZH&ctp=1&pdt=301&vol=9&rate=32&per=0&tex=" +
      sceneConfig.value?.ttsContent;
    console.log(url);
    let n = new Audio(url);
    n.src = url;
    n.play();
  }
  if (newConfig?.BGM) {
    bgMusicUrl.value = newConfig?.BGM.url;
  }
});
watch(
  panoConfig,
  (newConfig) => {
    if (newConfig?.sandTable) {
      console.log(newConfig?.sandTable);
      locationArray.value = [];
      for (let key in newConfig?.sandTable) {
        if (key !== "center" && key !== "zoom") {
          console.log(key);
          locationArray.value.push(newConfig.sandTable[key]);
        }
      }
    }
  },
  { immediate: true }
);
watch(hotspot, (newHotspot) => {
  if (newHotspot) {
    console.log(newHotspot);
    switch (newHotspot.type) {
      case "openImage":
        dialogTitle.value = "图片";
        dialogTop.value = "5vh";
        dialogWidth.value = "80vw";
        dialogHeight.value = "80vh";
        break;
      case "openVideo":
        dialogTitle.value = "视频";
        dialogTop.value = "5vh";
        dialogWidth.value = "80vw";
        dialogHeight.value = "70vh";
        break;
      case "openAudio":
        dialogTitle.value = "音频";
        dialogTop.value = "30vh";
        dialogWidth.value = "350px";
        dialogHeight.value = "80px";
        break;
      case "openText":
        dialogTitle.value = "文本";
        dialogTop.value = "15vh";
        dialogWidth.value = "50vw";
        dialogHeight.value = "50vh";
        break;
    }
  }
});
watch(
  sceneList,
  (newList, oldList) => {
    if (newList && !oldList) {
      targetScene.value = newList[0];
    }
  },
  { immediate: true }
);
</script>
<template>
  <div class="preview-container">
    <template v-if="sceneConfig?.multires">
      <CommonPano type="preview" panoId="previewPano" />
      <div
        class="preview-bottom"
        ref="bottomRef"
        @wheel.prevent.stop="moveScene"
      >
        <div
          class="screen"
          v-for="(item, index) in sceneList"
          @click="chooseScene(item.xmlPath, item._key)"
          :key="`scene${index}`"
          :style="item._key === sceneKey ? { border: '3px solid #86b93f' } : {}"
        >
          <img :src="item.cover" alt="" />
        </div>
      </div>

      <div class="preview-button" v-if="token">
        <el-button
          type="success"
          round
          style="width: 120px"
          @click="$router.push(`/view/pano/${panoConfig?._key}`)"
          >编辑</el-button
        >
      </div>
      <div class="preview-icon">
        <div
          class="preview-icon-item"
          :style="{ animation: playState ? 'fadenum 3s infinite' : '' }"
          @click="playMusic"
          v-if="bgMusicUrl"
        >
          <iconpark-icon name="bgm" :size="40" />
        </div>
        <!-- <div class="preview-icon-item" @click="showVr">
          <iconpark-icon name="vr" :size="40" />
        </div> -->
        <div
          class="preview-icon-item"
          @click="mapVisible = true"
          v-if="panoConfig?.sandTable"
        >
          <iconpark-icon name="location" :size="30" />
        </div>
      </div>
    </template>
    <div class="preview-loading" v-else>
      <img :src="createFile" alt="" v-if="createFile" />
      <div class="preview-loading-mark">
        <Loading :text="'生成全景中'" />
      </div>
    </div>
    <el-dialog
      v-model="previewVisible"
      :title="dialogTitle"
      :top="dialogTop"
      :width="dialogWidth"
      destroy-on-close
    >
      <el-carousel
        trigger="click"
        :height="dialogHeight"
        v-if="hotspot && hotspot.imageList && hotspot.type === 'openImage'"
        :interval="+hotspot.interval * 1000"
        :loop="hotspot.switchMode === 'loop'"
      >
        <el-carousel-item
          v-for="(item, index) in hotspot.imageList"
          :key="`hotspotImg${index}`"
          ><div class="preview-img"><img :src="item" alt="" /></div>
        </el-carousel-item>
      </el-carousel>
      <div
        v-if="hotspot.type === 'openText'"
        class="preview-text"
        style="padding: 20px; box-sizing: border-box"
      >
        {{ hotspot.text }}
      </div>
      <div
        class="preview-audio dp-center-center"
        v-if="hotspot.type === 'openAudio'"
      >
        <audio controls :src="hotspot.mediaUrl" autoplay style="width: 90%">
          您的浏览器不支持 audio 元素。
        </audio>
      </div>
      <div
        class="preview-video dp-center-center"
        v-if="hotspot.type === 'openVideo'"
      >
        <video controls :src="hotspot.linkUrl" autoplay style="height: 90%">
          您的浏览器不支持 video 元素。
        </video>
      </div>
    </el-dialog>
    <el-dialog v-model="mapVisible" title="沙盘地图" width="80vw" top="8vh">
      <div class="map-container">
        <!-- <div class="map-left" v-if="targetScene"> -->
        <CommonMap
          :mapId="'previewMap'"
          :width="'100%'"
          :height="'100%'"
          :data="locationArray"
          :zoom="panoConfig?.sandTable?.zoom"
          :center="panoConfig?.sandTable?.center"
          :targetScene="targetScene"
          @chooseMarker="chooseMarker"
          type="preview"
        />
        <!-- </div>
        <div class="map-right">
          <div
            v-for="(item, index) in sceneList"
            :key="`map${index}`"
            class="map-right-item single-to-long"
            :style="
              targetScene && targetScene._key === item._key
                ? { background: '#efefef' }
                : ''
            "
            @click="targetScene = item"
          >
            {{ item.name }}
          </div>
        </div> -->
      </div>
    </el-dialog>
    <audio
      :src="bgMusicUrl"
      ref="bgMusicRef"
      loop
      class="preview-music"
    ></audio>
  </div>
</template>
<style scoped lang="scss">
.preview-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  z-index: 1;
  .preview-img {
    width: 80vw;
    height: 80vh;
    // object-fit: contain;
    img {
      @include img-fit(contain);
    }
  }
  .preview-text {
    width: 100%;
    height: 100%;
    font-size: 16px;
    @include scroll();
  }
  .preview-audio {
    width: 320px;
    height: 80px;
  }
  .preview-video {
    width: 80vw;
    height: 68vh;
    @include flex(center, center, null);
  }
  .preview-bottom {
    width: 100%;
    height: 90px;
    position: absolute;
    z-index: 2;
    left: 0px;
    bottom: 0px;
    background: rgba(30, 30, 30, 0.3);
    overflow-x: auto;
    overflow-y: hidden;
    @include flex(null, center, null);
    &::-webkit-scrollbar {
      width: 0px;
      height: 0px;
    }
    .screen {
      width: 150px;
      height: 75px;
      margin: 15px 0px;
      position: relative;
      z-index: 1;
      border-radius: 10px;
      box-sizing: border-box;
      overflow: hidden;
      margin-right: 10px;
      flex-shrink: 0;
      cursor: pointer;
      img {
        @include img-fit(cover);
        user-select: none;
        -webkit-user-drag: none;
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
    }
  }
  .preview-loading {
    width: 100vw;
    height: 100vh;
    position: absolute;
    z-index: 2;
    right: 0px;
    top: 0px;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .preview-loading-mark {
      width: 100vw;
      height: 100vh;
      position: absolute;
      z-index: 3;
      right: 0px;
      top: 0px;
      background: rgba(30, 30, 30, 0.5);
      @include flex(center, center, null);
    }
    // background: black;
  }
  .preview-button {
    position: absolute;
    z-index: 2;
    right: 10px;
    top: 10px;
  }
  .preview-icon {
    width: 50px;
    position: absolute;
    z-index: 2;
    right: 10px;
    top: 60px;
    @include flex(center, null, wrap);
    .preview-icon-item {
      width: 30px;
      height: 30px;
      cursor: pointer;
      @include flex(center, center, wrap);
      transform-origin: 50% 50%;
      margin-bottom: 10px;
    }
  }
  .preview-music {
    opacity: 0;
  }
  .map-container {
    width: calc(80vw - 40px);
    height: calc(70vh - 40px);
  }
}
</style>
<style>
@keyframes fadenum {
  100% {
    transform: rotate(360deg);
  }
}
</style>
