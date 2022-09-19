<script setup lang="ts">
import { ElMessage } from "element-plus";
import CommonMap from "@/components/common/map.vue";
import { storeToRefs } from "pinia";
import appStore from "@/store";
const { configNum } = storeToRefs(appStore.commonStore);
const { panoConfig, sceneConfig } = storeToRefs(appStore.panoStore);
const { setPanoConfig } = appStore.panoStore;

const setPoint = (location) => {
  let obj: any = {};
  if (panoConfig.value?.sandTable) {
    obj = { ...panoConfig.value.sandTable };
  }
  if (sceneConfig.value) {
    obj = {
      ...obj,
      zoom: obj.zoom
        ? obj.zoom >= location.zoom
          ? location.zoom
          : obj.zoom
        : location.zoom,
      center: location.center,
    };
    obj[sceneConfig.value._key] = {
      lng: location.lng,
      lat: location.lat,
      _key: sceneConfig.value._key,
    };
    //@ts-ignore
    setPanoConfig({
      ...panoConfig.value,
      sandTable: { ...obj },
    });
  }
};
</script>
<template>
  <div class="pano-sandTable">
    <div
      class="pano-sandMap"
      v-if="configNum === '2' && panoConfig && sceneConfig"
    >
      <CommonMap
        :mapId="'sandTableMap'"
        :width="'100%'"
        :height="'100%'"
        :data="panoConfig.sandTable && panoConfig.sandTable[sceneConfig._key]"
        :zoom="panoConfig.sandTable?.zoom"
        :center="panoConfig.sandTable?.center"
        type="sandTable"
        @setPoint="setPoint"
      />
    </div>
  </div>
</template>
<style scoped lang="scss">
.pano-sandTable {
  width: 100%;
  height: calc(100vh - 120px);
  padding: 5px 10px;
  box-sizing: border-box;
  @include scroll();
  .pano-sandMap {
    width: 340px;
    height: 340px;
  }
}
</style>
<style></style>
