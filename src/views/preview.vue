<script setup lang="ts">
import { ElMessage } from "element-plus";
import CommonPano from "@/components/common/pano.vue";
import { storeToRefs } from "pinia";
import appStore from "@/store";
import CommonMap from "@/components/common/map.vue";
import Loading from "@/components/loading/loading2.vue";
import api from "@/services/api";
import todoPng from "@/assets/img/todo.png";
const route = useRoute();
const { hotspotObj, viewPointArray } = storeToRefs(appStore.controlStore);
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
const pointRef = ref<any>(null);
const dialogTitle = ref<any>(null);
const dialogTop = ref<string>("5vh");
const dialogWidth = ref<string>("0");
const dialogHeight = ref<string>("0");
const locationArray = ref<any>([]);
const bgMusicUrl = ref<string>("");
const bgMusicRef = ref<any>(null);
const readMusicRef = ref<any>(null);
const playState = ref<boolean>(false);
const mapVisible = ref<boolean>(false);
const clearVisible = ref<boolean>(false);
const fullVisible = ref<boolean>(false);
const pointVisible = ref<boolean>(false);
const viewVisible = ref<boolean>(false);
const playVisible = ref<boolean>(false);
const targetScene = ref<any>(null);
const todoVisible = ref<boolean>(true);
const timer = ref<any>(null);
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
  api.request.patch("pano/view", {
    panoKey: route.params.panoKey,
  });
  if (route.params.sceneKey !== "create") {
    // setSceneKey(route.params.sceneKey as string);
    getSceneInfo(route.params.sceneKey);
    timer.value = setTimeout(() => {
      todoVisible.value = false;
    }, 8000);
  }

  // }
  window.addEventListener("setItemEvent", function (e: any) {
    console.log(e);
    if (e.key === "hotspotName" && e.newValue !== "loadPano") {
      previewVisible.value = true;
      hotspot.value = hotspotObj.value[e.newValue];
      localStorage.removeItem("hotspotName");
    } else if (e.key === "getLoadPano" && e.newValue) {
      hotspot.value = hotspotObj.value[e.newValue];
      localStorage.removeItem("getLoadPano");
    }
  });
});
onUnmounted(() => {
  setPreviewPano(null);
  if (timer.value) {
    clearTimeout(timer.value);
    timer.value = null;
  }
  if (readMusicRef.value) {
    readMusicRef.value.pause();
    readMusicRef.value = null;
  }
  if (bgMusicRef.value) {
    bgMusicRef.value.pause();
    bgMusicRef.value = null;
  }
});
const moveScene = (e) => {
  //@ts-ignore
  bottomRef.value.scrollLeft += e.deltaY;
};
const movePoint = () => {
  //@ts-ignore
  pointRef.value.scrollLeft += e.deltaY;
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
  // console.log(
  //   panoConfig.value?.config?.blend && blendObj[panoConfig.value.config.blend]
  //     ? blendObj[panoConfig.value.config.blend]
  //     : blendObj["淡入淡出"]
  // );
  // previewPano.value.call(
  //   `loadpano(${path},null,'KEEPSCENES','${
  //     panoConfig.value?.config?.blend && blendObj[panoConfig.value.config.blend]
  //       ? blendObj[panoConfig.value.config.blend]
  //       : blendObj["淡入淡出"]
  //   })'`
  // );
  previewPano.value.loadpano(
    path,
    null,
    "KEEPSCENES",
    "LIGHTBLEND(1.0, 0xFFFFFF, 2.0, linear)"
  );
};
const playMusic = () => {
  playState.value = !playState.value;
  if (playState.value) {
    bgMusicRef.value.play();
  } else {
    bgMusicRef.value.pause();
  }
};
const showVr = () => {
  previewPano.value.call(`webvr.enterVR()`);
};
const changeFullScreen = () => {
  //@ts-ignore
  const element = document.documentElement;
  // 如果是全屏状态
  if (fullVisible.value) {
    // 如果浏览器有这个Function
    if (document.exitFullscreen) {
      document.exitFullscreen();
      //@ts-ignore
    } else if (document.webkitCancelFullScreen) {
      //@ts-ignore
      document.webkitCancelFullScreen();
      //@ts-ignore
    } else if (document.mozCancelFullScreen) {
      //@ts-ignore
      document.mozCancelFullScreen();
      //@ts-ignore
    } else if (document.msExitFullscreen) {
      //@ts-ignore
      document.msExitFullscreen();
    }
  } else {
    // 如果浏览器有这个Function
    if (element.requestFullscreen) {
      element.requestFullscreen();
      //@ts-ignore
    } else if (element.webkitRequestFullScreen) {
      //@ts-ignore
      element.webkitRequestFullScreen();
      //@ts-ignore
    } else if (element.mozRequestFullScreen) {
      //@ts-ignore
      element.mozRequestFullScreen();
      //@ts-ignore
    } else if (element.msRequestFullscreen) {
      //@ts-ignore
      element.msRequestFullscreen();
    }
  }
  fullVisible.value = !fullVisible.value;
};
const startView = () => {
  previewPano.value.call(`auto-play()`);
  viewVisible.value = true;
};
const pauseView = () => {
  if (playVisible.value) {
    previewPano.value.call(`continue-play()`);
  } else {
    previewPano.value.call(`pause-play()`);
  }
  playVisible.value = !playVisible.value;
};
const stopView = () => {
  previewPano.value.call(`stop-play()`);
  viewVisible.value = false;
};
const toPoint = (control) => {
  console.log(control.name);
  // previewPano.value.call(`lookto(${control.name},40)`);
  previewPano.value.call(
    `lookto(get(hotspot['${control.name}'].ath),get(hotspot['${control.name}'].atv),70,null,true,true,next-play()`
  );
};
watch(sceneConfig, (newConfig) => {
  if (newConfig?.ttsContent) {
    if (readMusicRef.value) {
      readMusicRef.value.pause();
    }
    let url =
      "https://tts.baidu.com/text2audio?cuid=baike&lan=ZH&ctp=1&pdt=301&vol=9&rate=32&per=0&tex=" +
      sceneConfig.value?.ttsContent;
    readMusicRef.value = new Audio(url);
    readMusicRef.value.src = url;
    readMusicRef.value.play();
  }
  if (newConfig?.BGM) {
    bgMusicUrl.value = newConfig?.BGM.url;
  }
});
watch(
  panoConfig,
  (newConfig) => {
    if (newConfig?.sandTable) {
      locationArray.value = [];
      for (let key in newConfig?.sandTable) {
        if (key !== "center" && key !== "zoom") {
          locationArray.value.push(newConfig.sandTable[key]);
        }
      }
    }
  },
  { immediate: true }
);
watch(hotspot, (newHotspot) => {
  if (newHotspot) {
    switch (newHotspot.type) {
      case "openImage":
        dialogTitle.value = "图片";
        dialogTop.value = "5vh";
        dialogWidth.value = "80vw";
        dialogHeight.value = "72vh";
        break;
      case "openVideo":
        dialogTitle.value = "视频";
        dialogTop.value = "5vh";
        dialogWidth.value = "80vw";
        dialogHeight.value = "70vh";
        if (bgMusicRef.value) {
          bgMusicRef.value.pause();
        }
        break;
      case "openAudio":
        dialogTitle.value = "音频";
        dialogTop.value = "30vh";
        dialogWidth.value = "350px";
        dialogHeight.value = "80px";
        if (bgMusicRef.value) {
          bgMusicRef.value.pause();
        }
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
  <div class="preview-container" @mouseup="todoVisible = false">
    <template v-if="sceneConfig?.multires">
      <CommonPano type="preview" panoId="previewPano" />
      <div class="preview-header" v-if="token && !clearVisible">
        <div class="left">
          <img
            :src="'https://cdn-pano.qingtime.cn/1661587220929_pano.svg'"
            alt=""
            class="logo"
          />
          <div class="title" v-if="panoConfig?.viewNum">
            人气 : {{ panoConfig?.viewNum + 1 }}
          </div>
        </div>

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
          <el-tooltip content="背景音乐" placement="left">
            <iconpark-icon name="bgm" :size="40" />
          </el-tooltip>
        </div>
        <div class="preview-icon-item" @click="showVr" v-if="panoConfig?.vr">
          <el-tooltip content="VR模式" placement="left">
            <iconpark-icon name="vr" :size="40" />
          </el-tooltip>
        </div>
        <div
          class="preview-icon-item"
          @click="mapVisible = true"
          v-if="panoConfig?.sandTable"
        >
          <el-tooltip content="地图沙盘" placement="left">
            <iconpark-icon name="location" :size="30" />
          </el-tooltip>
        </div>
        <div class="preview-icon-item" @click="changeFullScreen">
          <el-tooltip
            :content="fullVisible ? '退出全屏' : '全屏'"
            placement="left"
          >
            <iconpark-icon
              :name="fullVisible ? 'off-screen' : 'full-screen'"
              :size="30"
              color="#fff"
            />
          </el-tooltip>
        </div>
        <div class="preview-icon-item" @click="clearVisible = !clearVisible">
          <el-tooltip content="清屏" placement="left">
            <iconpark-icon name="clear" :size="30" color="#fff" />
          </el-tooltip>
        </div>
      </div>
      <div
        class="preview-bottom"
        ref="bottomRef"
        @wheel.prevent.stop="moveScene"
        v-if="!clearVisible"
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
      <div
        class="preview-point-box"
        ref="pointRef"
        @wheel.prevent.stop="movePoint"
        v-if="pointVisible"
      >
        <div
          class="point-item"
          v-for="(item, index) in viewPointArray"
          :key="`point${index}`"
          @click="toPoint(item)"
        >
          导览{{ item.number }}
        </div>
      </div>
      <div
        class="preview-view"
        v-if="!clearVisible && viewPointArray.length > 0"
      >
        <div
          class="preview-point"
          @click="startView"
          style="margin-right: 5px"
          v-if="!viewVisible"
        >
          <iconpark-icon
            name="play-one"
            :size="18"
            color="#fff"
            style="margin-right: 5px"
          />导览
        </div>
        <div
          class="preview-point"
          @click="pointVisible = !pointVisible"
          style="margin-left: 5px"
          v-if="!viewVisible"
        >
          <iconpark-icon
            name="pin"
            :size="18"
            color="#fff"
            style="margin-right: 5px"
          />细节
        </div>
        <div
          class="preview-point"
          @click="pauseView"
          style="margin-right: 5px"
          v-if="viewVisible"
        >
          <iconpark-icon
            :name="playVisible ? 'play-one' : 'pause'"
            :size="18"
            color="#fff"
            style="margin-right: 5px"
          />{{ playVisible ? "继续" : "暂停" }}
        </div>
        <div
          class="preview-point"
          @click="stopView"
          style="margin-left: 5px"
          v-if="viewVisible"
        >
          <iconpark-icon
            :name="'stop'"
            :size="18"
            color="#fff"
            style="margin-right: 5px"
          />停止
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
  <div
    class="preview-todo"
    v-if="todoVisible && $route.params.sceneKey !== 'create'"
  >
    <img :src="todoPng" alt="" />
  </div>
</template>
<style scoped lang="scss">
.preview-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  z-index: 1;

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
  .preview-header {
    width: 100%;
    height: 45px;
    position: absolute;
    z-index: 2;
    left: 0px;
    top: 0px;
    background: rgba(30, 30, 30, 0.3);
    @include flex(space-between, center, null);
    @include p-number(10px);
    .left {
      @include flex(center, center, null);
      .logo {
        width: 35px;
        height: 35px;
        margin-right: 10px;
      }
      .title {
        font-size: 12px;
        color: #fff;
        margin-top: 12px;
      }
    }
  }
  .preview-icon {
    width: 50px;
    position: absolute;
    z-index: 2;
    right: 10px;
    top: 50px;
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
  .preview-view {
    width: 100%;
    height: 40px;
    position: fixed;
    left: 0px;
    bottom: 130px;
    z-index: 10;
    @include flex(center, center, null);
    .preview-point {
      width: 149px;
      height: 100%;
      color: rgba(255, 255, 255, 0.8);
      background: rgba(30, 30, 30, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.4);
      flex-shrink: 0;
      border-radius: 20px;
      font-size: 14px;
      cursor: pointer;
      @include flex(center, center, null);
    }
  }

  .preview-point-box {
    width: 100%;
    height: 50px;
    position: fixed;
    z-index: 2;
    left: 0px;
    bottom: 175px;
    background: rgba(30, 30, 30, 0.3);
    overflow-x: auto;
    overflow-y: hidden;
    @include flex(center, center, null);
    &::-webkit-scrollbar {
      width: 0px;
      height: 0px;
    }
    .point-item {
      width: 50px;
      height: 30px;
      border: 1px solid #fff;
      margin-right: 10px;
      flex-shrink: 0;
      color: #fff;
      font-size: 14px;
      text-align: center;
      line-height: 30px;
      cursor: pointer;
    }
  }
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
  .preview-music {
    opacity: 0;
  }
  .map-container {
    width: calc(80vw - 40px);
    height: calc(70vh - 40px);
  }
}
.preview-todo {
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
  top: 0px;
  bottom: 0px;
  left: 0px;
  right: 0px;
  z-index: 99;
  pointer-events: none;
  @include flex(center, center, null);
  img {
    width: 200px;
    height: 200px;
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
