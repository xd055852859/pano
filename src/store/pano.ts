import { ref } from "vue";
import { defineStore } from "pinia";
import { User } from "@/interface/User";
import api from "@/services/api";
import { ResultProps } from "@/interface/Common";
import { SceneConfig } from "@/interface/Scene";
import { PanoConfig } from "@/interface/pano";
import router from "@/router";

import { controlStore } from "./control";

// 使用setup模式定义
export const panoStore = defineStore("panoStore", () => {
  const pano = ref<any>(null);
  const fovPano = ref<any>(null);
  const previewPano = ref<any>(null);
  const panoConfig = ref<PanoConfig | null>(null);
  const sceneConfig = ref<SceneConfig | null>(null);
  const sceneList = ref<any>(null);
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
  const setPreviewPano = (newPreviewPano: any) => {
    previewPano.value = newPreviewPano;
  };

  const getPanoInfo = async (id, type?: string) => {
    const infoRes = (await api.request.get("pano/detail", {
      panoKey: id,
    })) as ResultProps;
    if (infoRes.msg === "OK") {
      let newSceneObj: any = {};
      infoRes.data.sceneList.forEach((item) => {
        item.cover = `${api.File_URL}${item.cover}`;
        let obj = {
          cover: item.cover,
          xmlPath: `${api.File_URL}${item.xmlPath}`,
        };
        newSceneObj[item._key] = {
          ...item,
          ...obj,
        };
      });
      if (infoRes.data.sceneList[0].multires) {
        sceneObj.value = newSceneObj;
        sceneList.value = Object.values(newSceneObj);
        if (!type) {
          sceneKey.value = infoRes.data.sceneList[0]._key;
        }
      }
      panoConfig.value = {
        name: infoRes.data.name,
        public: infoRes.data.public,
        userKey: infoRes.data.userKey,
        tagKey: infoRes.data.tagKey,
        labels: infoRes.data.labels,
        location: infoRes.data.location,
        config: infoRes.data.config,
        sandTable: infoRes.data.sandTable,
        _key: infoRes.data._key,
      };
    }
  };

  const setPanoConfig = (newPanoObj: PanoConfig) => {
    panoConfig.value = newPanoObj;
  };
  const setSceneKey = (newSceneKey: string) => {
    sceneKey.value = newSceneKey;
  };
  const getSceneInfo = async (key) => {
    const infoRes = (await api.request.get("scene/detail", {
      sceneKey: key,
    })) as ResultProps;
    console.log(infoRes.data);
    if (infoRes.msg === "OK" && infoRes.data.multires) {
      setSceneConfig({
        name: infoRes.data.name,
        originName: infoRes.data.originName,
        panoKey: infoRes.data.panoKey,
        userKey: infoRes.data.userKey,
        xmlPath: `${api.File_URL}${infoRes.data.xmlPath}`,
        multires: infoRes.data.multires,
        _key: infoRes.data._key,
        viewAngle: infoRes.data.viewAngle,
        specialEffect: infoRes.data.specialEffect,
        shade: infoRes.data.shade,
        BGM: infoRes.data.BGM,
        ttsContent: infoRes.data.ttsContent,
        viewPoints: infoRes.data.viewPoints,
        cover: `${api.File_URL}${infoRes.data.cover}`,
      });
      if (infoRes.data.hotspots) {
        let obj: any = {};
        infoRes.data.hotspots.forEach((item) => {
          obj[item.name] = { ...item, state: "used" };
        });
        controlStore().setHotspotObj({ ...obj });
      } else {
        controlStore().setHotspotObj({});
      }
      if (infoRes.data.layers) {
        let obj: any = {};
        infoRes.data.layers.forEach((item) => {
          obj[item.name] = { ...item, state: "used" };
        });
        controlStore().setLayerObj({ ...obj });
      } else {
        controlStore().setLayerObj({});
      }
      if (infoRes.data.viewPoints) {
        let arr: any = [];
        infoRes.data.viewPoints.forEach((item) => {
          arr.push({ ...item, state: "used" });
        });
        controlStore().setViewPointArray([...arr]);
      } else {
        controlStore().setViewPointArray([]);
      }
    }
  };
  const setSceneConfig = (newSceneObj: any) => {
    console.log("????", newSceneObj);
    if (newSceneObj.multires) {
      if (newSceneObj._key === sceneConfig.value?._key) {
        sceneConfig.value = { ...sceneConfig.value, ...newSceneObj };
      } else {
        sceneConfig.value = { ...newSceneObj };
      }
      if (!sceneObj.value) {
        sceneObj.value = {};
      }
      if (!sceneObj.value[newSceneObj._key]) {
        sceneObj.value[newSceneObj._key] = {};
      }
      sceneObj.value[newSceneObj._key] = {
        ...sceneObj.value[newSceneObj._key],
        ...newSceneObj,
      };
      console.log(sceneObj.value);
      sceneList.value = Object.values(sceneObj.value);
    }
  };
  const setSceneObj = (newSceneObj: any) => {
    sceneObj.value = newSceneObj;
  };
  const setSceneList = (newSceneList: any) => {
    sceneList.value = newSceneList;
  };
  const delSceneObj = async (delKey: string) => {
    let newSceneObj = { ...sceneObj.value };
    delete newSceneObj[delKey];
    sceneObj.value = { ...newSceneObj };
    let index = sceneList.value.findIndex((item) => item._key === delKey);
    if (index !== -1) {
      sceneList.value.splice(index, 1);
    }
    if (Object.keys(sceneObj.value).length > 0) {
      console.log(Object.keys(sceneObj.value)[0]);
      sceneKey.value = Object.keys(sceneObj.value)[0];
    } else {
      await api.request.delete("pano", {
        panoKey: panoConfig.value?._key,
      });
      panoConfig.value = null;
      router.push("/view");
    }
  };
  const setHotspotIndex = (newHotspotIndex: number) => {
    hotspotIndex.value = newHotspotIndex;
  };
  const setHotspotName = (newHotspotName: string) => {
    hotspotName.value = newHotspotName;
  };
  const clearPano = () => {
    pano.value = null;
    fovPano.value = null;
    previewPano.value = null;
    panoConfig.value = null;
    sceneConfig.value = null;
    sceneList.value = null;
    sceneKey.value = "";
    hotspotIndex.value = 0;
    hotspotName.value = "";
    sceneObj.value = null;
  };
  watch(sceneKey, (newKey) => {
    console.log(newKey);
    // if (sceneObj.value && sceneObj.value[newKey]?.multires) {
    if (newKey) {
      console.log(newKey);
      if (
        sceneObj.value &&
        sceneObj.value[newKey] &&
        sceneObj.value[newKey]?.multires
      ) {
        setSceneConfig({
          ...sceneObj.value[newKey],
        });
      } else {
        console.log(newKey);
        getSceneInfo(newKey);
      }
    }
    // }
  });
  return {
    pano,
    setPano,
    fovPano,
    setFovPano,
    previewPano,
    setPreviewPano,
    panoConfig,
    getPanoInfo,
    setPanoConfig,
    sceneKey,
    setSceneKey,
    sceneConfig,
    setSceneConfig,
    sceneList,
    setSceneList,
    sceneObj,
    setSceneObj,
    delSceneObj,

    hotspotIndex,
    setHotspotIndex,
    hotspotName,
    setHotspotName,
    clearPano,
  };
});
