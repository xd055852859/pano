import { ref } from "vue";
import { defineStore } from "pinia";
import { User } from "@/interface/User";
import api from "@/services/api";
import { ResultProps } from "@/interface/Common";
import { SceneConfig } from "@/interface/Scene";
import { PanoConfig } from "@/interface/pano";
import router from "@/router";

// 使用setup模式定义
export const panoStore = defineStore("panoStore", () => {
  const pano = ref<any>(null);
  const fovPano = ref<any>(null);
  const panoConfig = ref<PanoConfig | null>(null);
  const sceneConfig = ref<SceneConfig | null>(null);
  const sceneKey = ref<string>("");
  const hotspotIndex = ref<number>(0);
  const hotspotName = ref<string>("");
  const sceneObj = ref<any>(null);

  const setPano = (newPano: any) => {
    pano.value = newPano;
  };
  const setFovPano = (newFovPano: any) => {
    fovPano.value = newFovPano;
  };
  const setPanoConfig = (newPanoObj: PanoConfig) => {
    panoConfig.value = newPanoObj;
  };
  const setSceneKey = (newSceneKey: string) => {
    sceneKey.value = newSceneKey;
  };
  const setSceneConfig = (newSceneObj: any) => {
    if (newSceneObj._key === sceneConfig.value?._key) {
      sceneConfig.value = { ...sceneConfig.value, ...newSceneObj };
    } else {
      sceneConfig.value = { ...newSceneObj };
    }
    sceneObj.value[newSceneObj._key] = {
      ...sceneObj.value[newSceneObj._key],
      ...newSceneObj,
    };
  };
  const setSceneObj = (newSceneObj: any) => {
    sceneObj.value = newSceneObj;
  };
  const delSceneObj = async (delKey: string) => {
    let newSceneObj = { ...sceneObj.value };
    delete newSceneObj[delKey];
    sceneObj.value = { ...newSceneObj };
    if (Object.keys(sceneObj.value).length > 0) {
      console.log(Object.keys(sceneObj.value)[0]);
      sceneKey.value = Object.keys(sceneObj.value)[0];
    } else {
      await api.request.delete("pano", {
        panoKey: panoConfig.value?._key,
      });
      panoConfig.value = null;
      router.push("/home");
    }
  };
  const setHotspotIndex = (newHotspotIndex: number) => {
    hotspotIndex.value = newHotspotIndex;
  };
  const setHotspotName = (newHotspotName: string) => {
    hotspotName.value = newHotspotName;
  };
  return {
    pano,
    setPano,
    fovPano,
    setFovPano,
    panoConfig,
    setPanoConfig,
    sceneKey,
    setSceneKey,
    sceneConfig,
    setSceneConfig,
    sceneObj,
    setSceneObj,
    delSceneObj,

    hotspotIndex,
    setHotspotIndex,
    hotspotName,
    setHotspotName,
  };
});
