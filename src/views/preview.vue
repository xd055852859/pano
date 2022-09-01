<script setup lang="ts">
import { ElMessage } from "element-plus";
import CommonPano from "@/components/commonPano.vue";
import { storeToRefs } from "pinia";
import appStore from "@/store";
const { hotspotObj } = storeToRefs(appStore.controlStore);
const hotspot = ref<any>(null);
const previewVisible = ref<boolean>(false);
onMounted(() => {
  window.addEventListener("setItemEvent", function (e: any) {
    console.log(e);
    if (e.key === "hotspotName" && e.newValue) {
      previewVisible.value = true;
      hotspot.value = hotspotObj.value[e.newValue];
      localStorage.removeItem("hotspotName");
    }
  });
});
</script>
<template>
  <div class="preview-container">
    <CommonPano type="preview" panoId="previewPano" />
    <el-dialog
      v-model="previewVisible"
      :title="
        hotspot
          ? hotspot.type === 'openImage'
            ? '图片'
            : hotspot.type === 'openText'
            ? '文本'
            : hotspot.type === 'openVideo'
            ? '视频'
            : '音频'
          : ''
      "
      :top="
        hotspot
          ? hotspot.type === 'openAudio' || hotspot.type === 'openText'
            ? '20vh'
            : '5vh'
          : '5vh'
      "
      :width="
        hotspot
          ? hotspot.type === 'openAudio' || hotspot.type === 'openText'
            ? '40vw'
            : '80vw'
          : '50vw'
      "
      destroy-on-close
    >
      <el-carousel
        trigger="click"
        height="80vh"
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
        v-if="hotspot.type !== 'openImage'"
        class="preview-box"
        :class="{ 'dp-center-center': hotspot.type !== 'openText' }"
        :style="{
          height:
            hotspot.type === 'openAudio' || hotspot.type === 'openText'
              ? '40vh'
              : '80vh',
          width:
            hotspot.type === 'openAudio' || hotspot.type === 'openText'
              ? '40vw'
              : '80vw',
        }"
      >
        <div
          v-if="hotspot.type === 'openText'"
          style="padding: 20px; box-sizing: border-box"
        >
          {{ hotspot.text }}
        </div>
        <audio
          controls
          v-if="hotspot.type === 'openAudio'"
          :src="hotspot.mediaUrl"
          autoplay
        >
          您的浏览器不支持 audio 元素。
        </audio>
        <video
          controls
          v-if="hotspot.type === 'openVideo'"
          :src="hotspot.linkUrl"
          autoplay
          style="height: 90%"
        >
          您的浏览器不支持 video 元素。
        </video>
      </div>
    </el-dialog>
  </div>
</template>
<style scoped lang="scss">
.preview-container {
  width: 100vw;
  height: calc(100vh - 55px);
  .preview-img {
    width: 80vw;
    height: 80vh;
    // object-fit: contain;
    img {
      @include img-fit(contain);
    }
  }
  .preview-box {
    width: 80vw;
    height: 80vh;
    font-size: 16px;
    @include scroll();
  }
}
</style>
<style></style>
