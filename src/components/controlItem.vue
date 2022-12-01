<script setup lang="ts">
import appStore from "@/store";
import { ElMessage } from "element-plus";
import { storeToRefs } from "pinia";
import draggable from "vuedraggable";
const { hotspotObj, layerObj, viewPointArray } = storeToRefs(
  appStore.controlStore
);
const { pano } = storeToRefs(appStore.panoStore);
const { setViewPointArray } = appStore.controlStore;

const props = defineProps<{
  type: string;
}>();
const viewPointList = ref<any>([]);
const drag = ref<boolean>(false);
const iconName = ref<string>("");
onMounted(() => {
  if (
    viewPointArray.value &&
    viewPointArray.value.length > 0 &&
    (props.type === "viewPoint" || props.type === "all")
  ) {
    viewPointList.value = [...viewPointArray.value];
  }
});
const changeHotspot = (type) => {
  let name = "";
  switch (type) {
    case "loadPano":
      name = "全景切换";
      break;
    case "loadUrl":
      name = "超链接";

      break;
    case "openImage":
      name = "图片";

      break;
    case "openVideo":
      name = "视频";

      break;
    case "openText":
      name = "文本";

      break;
    case "openAudio":
      name = "音频";

      break;
  }
  return name;
};
const getIconName = (type) => {
  let name = "";
  switch (type) {
    case "loadPano":
      name = "hotspot1";
      break;
    case "loadUrl":
      name = "hotspot2";
      break;
    case "openImage":
      name = "hotspot3";
      break;
    case "openVideo":
      name = "hotspot4";
      break;
    case "openText":
      name = "hotspot5";
      break;
    case "openAudio":
      name = "hotspot6";
      break;
  }
  return name;
};
const toPoint = (control) => {
  pano.value.call(`looktohotspot(${control.name},40)`);
  if (props.type === "hotspot") {
    pano.value.call(`getHotspotName(${control.name})`);
  } else if (props.type === "all") {
    if (control.number) {
      pano.value.call(`getViewPointName(${control.number - 1})`);
    } else if (control.type === "image" || control.type === "text") {
      pano.value.call(`getLayerName(${control.name})`);
    } else {
      pano.value.call(`getHotspotName(${control.name})`);
    }
  } else if (props.type === "viewPoint") {
    pano.value.call(`getViewPointName(${control.number - 1})`);
  } else {
    pano.value.call(`getLayerName(${control.name})`);
  }
};
watch(viewPointList, (newList) => {
  let arr: any = [];
  newList.forEach((item, index) => {
    pano.value.set(`hotspot[${item.name}].html`, index + 1);
    pano.value.set(
      `hotspot[${item.name}].onclick`,
      `getViewPointName(${index})`
    );
    arr.push({ ...item, number: index + 1 });
  });
  setViewPointArray([...arr]);
});
</script>
<template>
  <div class="control-item">
    <template v-if="type === 'hotspot' || type === 'all'">
      <template v-for="(value, key) in hotspotObj" :key="`hotspot${key}`">
        <div class="control-item-hotspot" @click="toPoint(value)">
          <iconpark-icon
            :name="getIconName(value.type)"
            :size="20"
            style="margin-right: 8px"
          />
          {{ value.title ? value.title : "热点" }}
          ({{ changeHotspot(value.type) }})
        </div>
        <el-divider border-style="dashed" />
      </template>
    </template>
    <template
      v-if="
        (type === 'viewPoint' || type === 'all') && viewPointList.length > 0
      "
    >
      <draggable
        v-model="viewPointList"
        @start="drag = true"
        @end="drag = false"
        item-key="index"
      >
        <template #item="{ element }">
          <div>
            <div class="control-item-hotspot" @click="toPoint(element)">
              <iconpark-icon
                name="control4"
                :size="20"
                style="margin-right: 8px"
              />
              导航点 {{ element.number }}
            </div>
            <el-divider border-style="dashed" />
          </div>
        </template>
      </draggable>
    </template>
    <template v-if="type !== 'hotspot' && type !== 'viewPoint'">
      <template v-for="(value, key) in layerObj" :key="`layer${key}`">
        <template
          v-if="(type === 'text' || type === 'all') && value.type === 'text'"
        >
          <div class="control-item-text" @click="toPoint(value)">
            <iconpark-icon
              name="control2"
              :size="20"
              style="margin-right: 8px"
            />
            {{ value.text }}
          </div>
          <el-divider border-style="dashed" />
        </template>
        <template
          v-if="(type === 'image' || type === 'all') && value.type === 'image'"
        >
          <div class="control-item-img" @click="toPoint(value)">
            <div class="img-left"><img :src="value.imageList[0]" alt="" /></div>
            <div class="img-right single-to-long">{{ value.name }}</div>
          </div>
          <el-divider border-style="dashed" />
        </template>
      </template>
    </template>
  </div>
</template>
<style scoped lang="scss">
.control-item {
  width: 100%;
  height: calc(100vh - 120px);
  padding: 5px 10px;
  box-sizing: border-box;
  @include scroll();
  .control-item-hotspot {
    width: 100%;
    height: 40px;
    line-height: 40px;
    cursor: pointer;
    @include flex(null, center, null);
  }
  .control-item-text {
    width: 100%;
    min-height: 40px;
    line-height: 40px;
    cursor: pointer;
    @include flex(null, center, null);
  }
  .control-item-img {
    width: 100%;
    height: 50px;
    cursor: pointer;
    @include flex(space-between, center, null);
    .img-left {
      width: 40px;
      height: 40px;
      img {
        @include img-fit(cover);
      }
    }
    .img-right {
      width: calc(100% - 50px);
      height: 100%;
      @include flex(null, center, null);
    }
  }
}
</style>
<style></style>
