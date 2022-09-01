import { ref } from "vue";
import { defineStore } from "pinia";

// 使用setup模式定义
export const controlStore = defineStore("controlStore", () => {
  const hotspotConfig = ref<any>(null);
  const hotspotObj = ref<any>(null);
  const layerConfig = ref<any>(null);
  const layerObj = ref<any>(null);
  const setHotspotConfig = (newHotspotConfig: any) => {
    if (newHotspotConfig) {
      hotspotConfig.value = { ...hotspotConfig.value, ...newHotspotConfig };
      if (!hotspotObj.value) {
        hotspotObj.value = {};
      }
      if (!hotspotObj.value[newHotspotConfig.name]) {
        hotspotObj.value[newHotspotConfig.name] = {};
      }
      hotspotObj.value[newHotspotConfig.name] = {
        ...hotspotObj.value[newHotspotConfig.name],
        ...newHotspotConfig,
      };
    } else {
      hotspotConfig.value = null;
    }
  };
  const setHotspotObj = (newHotspotObj: any) => {
    hotspotObj.value = newHotspotObj;
  };
  const setLayerConfig = (newLayerConfig: any) => {
    if (newLayerConfig) {
      layerConfig.value = { ...layerConfig.value, ...newLayerConfig };
      if (!layerObj.value) {
        layerObj.value = {};
      }
      if (!layerObj.value[newLayerConfig.name]) {
        layerObj.value[newLayerConfig.name] = {};
      }
      layerObj.value[newLayerConfig.name] = {
        ...layerObj.value[newLayerConfig.name],
        ...newLayerConfig,
      };
    } else {
      layerConfig.value = null;
    }
  };
  const setLayerObj = (newLayersObj: any) => {
    layerObj.value = newLayersObj;
  };
  return {
    hotspotConfig,
    setHotspotConfig,
    hotspotObj,
    setHotspotObj,
    layerConfig,
    setLayerConfig,
    layerObj,
    setLayerObj,
  };
});
