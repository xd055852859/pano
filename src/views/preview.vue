<script setup lang="ts">
import { ElMessage } from "element-plus";
import CommonPano from "@/components/commonPano.vue";
import { storeToRefs } from "pinia";
import appStore from "@/store";
import CommonMap from "@/components/commonMap.vue";

const route = useRoute();
const { hotspotObj } = storeToRefs(appStore.controlStore);
const { sceneConfig, sceneList, previewPano, panoConfig } = storeToRefs(
  appStore.panoStore
);
const { getPanoInfo, setSceneKey } = appStore.panoStore;
const hotspot = ref<any>(null);
const previewVisible = ref<boolean>(false);
const sceneKey = ref<string>("");
const bottomRef = ref<any>(null);
const dialogTitle = ref<any>(null);
const dialogTop = ref<string>("5vh");
const dialogWidth = ref<string>("0");
const dialogHeight = ref<string>("0");
const locationArray = ref<any>([]);

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
  if (!panoConfig.value) {
    getPanoInfo(route.params.panoKey, "preview");
    setSceneKey(route.params.sceneKey as string);
  }
  window.addEventListener("setItemEvent", function (e: any) {
    if (e.key === "hotspotName" && e.newValue) {
      previewVisible.value = true;
      hotspot.value = hotspotObj.value[e.newValue];
      localStorage.removeItem("hotspotName");
    } else if (e.key === "getLoadPano" && e.newValue) {
      hotspot.value = hotspotObj.value[e.newValue];
      localStorage.removeItem("getLoadPano");
    }
  });
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
  }
};
const chooseScene = (path, key) => {
  setSceneKey(key);
  previewPano.value.call(
    `loadpano(${path},null,KEEPSCENES,'${
      blendObj[panoConfig.value?.config.blend]
    }')`
  );
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
});
watch(panoConfig, (newConfig) => {
  if (newConfig?.sandTable) {
    console.log(newConfig?.sandTable);
    locationArray.value = [];
    for (let key in newConfig?.sandTable) {
      if (key !== "center" && key !== "zoom" && key !== "_key") {
        console.log(key);
        locationArray.value.push(newConfig.sandTable[key]);
      }
    }
  }
});
watch(hotspot, (newHotspot) => {
  if (newHotspot) {
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
</script>
<template>
  <div class="preview-container">
    <CommonPano type="preview" panoId="previewPano" />
    <!--       -->
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
        v-if="hotspot.imageList && hotspot.type === 'openImage'"
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
    <div class="preview-bottom" ref="bottomRef" @wheel.prevent.stop="moveScene">
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
      class="preview-map"
      v-if="panoConfig?.sandTable && sceneConfig && locationArray.length > 0"
    >
      <CommonMap
        :mapId="'previewMap'"
        :width="'100%'"
        :height="'100%'"
        :data="locationArray"
        :zoom="panoConfig.sandTable?.zoom"
        :center="panoConfig.sandTable?.center"
        @chooseMarker="chooseMarker"
        type="preview"
      />
    </div>
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
    height: 120px;
    position: absolute;
    z-index: 2;
    left: 0px;
    bottom: 0px;
    background: rgba(30, 30, 30, 0.7);
    overflow-x: auto;
    overflow-y: hidden;
    @include flex(null, center, null);
    &::-webkit-scrollbar {
      width: 0px;
      height: 0px;
    }
    .screen {
      width: 200px;
      height: 100px;
      margin: 15px 0px;
      position: relative;
      z-index: 1;
      border-radius: 10px;
      box-sizing: border-box;
      overflow: hidden;
      margin-right: 10px;
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
  .preview-map {
    width: 250px;
    height: 250px;
    position: absolute;
    z-index: 2;
    right: 0px;
    top: 0px;
  }
}
</style>
<style></style>
