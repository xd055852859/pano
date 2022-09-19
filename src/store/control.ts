import { ref } from "vue";
import { defineStore } from "pinia";
import { panoStore } from "./pano";
// 使用setup模式定义
export const controlStore = defineStore("controlStore", () => {
  const hotspotConfig = ref<any>(null);
  const hotspotObj = ref<any>(null);
  const layerConfig = ref<any>(null);
  const layerObj = ref<any>(null);
  const viewPointConfig = ref<any>(null);
  const viewPointArray = ref<any>(null);
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
  const setViewPointConfig = (newViewPointConfig: any) => {
    if (newViewPointConfig) {
      console.log(newViewPointConfig);
      viewPointConfig.value = {
        ...viewPointConfig.value,
        ...newViewPointConfig,
      };
      if (!viewPointArray.value) {
        viewPointArray.value = [];
      }
      let index = viewPointArray.value.findIndex(
        (item) => item.name === newViewPointConfig.name
      );
      console.log(index);
      if (index !== -1) {
        viewPointArray.value[index] = {
          ...viewPointArray.value[index],
          ...newViewPointConfig,
        };
      } else {
        viewPointArray.value.push(newViewPointConfig);
      }
    } else {
      viewPointConfig.value = null;
    }
  };
  const setViewPointArray = (newViewPointsArray: any) => {
    viewPointArray.value = newViewPointsArray;
  };
  // watch([hotspotObj,layerObj,viewPointConfig],([newHotspotObj,newLayerObj,newViewPointConfig])=>{
  //   panoStore().setSceneObj({
  //     ...panoStore().sceneObj,
  //     [panoStore().sceneObj[panoStore().sceneKey]]:{
  //       ...panoStore().sceneObj[panoStore().sceneKey],
  //       hotspots: Object.values(newHotspotObj.value),
  //       layers: Object.values(newHotspotObj.value),
  //       viewPoints: Object.values(newHotspotObj.value),
  //     }

  //   });
  // })
  return {
    hotspotConfig,
    setHotspotConfig,
    hotspotObj,
    setHotspotObj,
    layerConfig,
    setLayerConfig,
    layerObj,
    setLayerObj,
    viewPointConfig,
    setViewPointConfig,
    viewPointArray,
    setViewPointArray,
  };
});
