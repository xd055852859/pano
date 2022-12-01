import { ref } from "vue";
import { defineStore } from "pinia";
import { User } from "@/interface/User";
import api from "@/services/api";
import { ResultProps } from "@/interface/Common";
import { SceneConfig } from "@/interface/Scene";
import { PanoConfig } from "@/interface/pano";
import router from "@/router";

import { controlStore } from "./control";
import { ElMessage } from "element-plus";
import useCheckUsed from "@/hooks/useCheckUsed";

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
      if (
        infoRes.data.sceneList &&
        infoRes.data.sceneList[0] &&
        infoRes.data.sceneList[0].multires
      ) {
        sceneObj.value = newSceneObj;
        sceneList.value = infoRes.data.sceneList.map((item) => {
          if (newSceneObj[item._key]) {
            item = newSceneObj[item._key];
          }
          return item;
        });
        if (type !== "preview") {
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
        littleplanet: infoRes.data.littleplanet,
        vr: infoRes.data.vr,
        viewNum: infoRes.data.viewNum,
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
    sceneKey.value = key;
    const infoRes = (await api.request.get("scene/detail", {
      sceneKey: key,
    })) as ResultProps;
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
        cubeUrl:infoRes.data.cubeUrl
      });
      formatScene(infoRes.data);
    }
  };
  const formatScene = (data) => {
    if (data.hotspots) {
      let obj: any = {};
      data.hotspots.forEach((item) => {
        obj[item.name] = { ...item, state: "used" };
      });
      controlStore().setHotspotObj({ ...obj });
    } else {
      controlStore().setHotspotObj({});
    }
    if (data.layers) {
      let obj: any = {};
      data.layers.forEach((item) => {
        obj[item.name] = { ...item, state: "used" };
      });
      controlStore().setLayerObj({ ...obj });
    } else {
      controlStore().setLayerObj({});
    }
    if (data.viewPoints) {
      let arr: any = [];
      data.viewPoints.forEach((item) => {
        arr.push({ ...item, state: "used" });
      });
      controlStore().setViewPointArray([...arr]);
    } else {
      controlStore().setViewPointArray([]);
    }
  };
  const setSceneConfig = (newSceneObj: any) => {
    if (newSceneObj) {
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
      for (let key in sceneObj.value) {
        let value = sceneObj.value[key];
        if (!sceneList.value) {
          sceneList.value = [];
        }
        let index = sceneList.value.findIndex(
          (item) => item._key === value._key
        );
        if (index === -1) {
          sceneList.value.push(value);
        } else {
          sceneList.value[index] = value;
        }
      }
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
  const savePano = async (type?: string) => {
    let savePanoRes: any = null;
    let saveSceneRes: any = null;
    let hotspot: any = [];
    let layer: any = [];
    let viewPoints: any = [];
    let state = false;
    let checkState = false;
    if (panoConfig.value && sceneConfig.value) {
      let panoObj = {
        name: panoConfig.value.name,
        tagKey: panoConfig.value.tagKey,
        labels: panoConfig.value.labels,
        public: panoConfig.value.public,
        location: panoConfig.value.location,
        config: panoConfig.value.config,
        panoKey: panoConfig.value._key,
        sandTable: panoConfig.value?.sandTable,
        littleplanet: panoConfig.value?.littleplanet,
        vr: panoConfig.value?.vr,
        gyro: true,
      };
      savePanoRes = (await api.request.patch("pano", {
        ...panoObj,
      })) as ResultProps;
      if (controlStore().hotspotObj) {
        [state, hotspot] = useCheckUsed("obj", controlStore().hotspotObj);
        if (state) {
          checkState = true;
        }
      }
      if (controlStore().layerObj) {
        [state, layer] = useCheckUsed("obj", controlStore().layerObj);
        if (state) {
          checkState = true;
        }
      }
      if (controlStore().viewPointArray) {
        [state, viewPoints] = useCheckUsed(
          "arr",
          controlStore().viewPointArray
        );
        if (state) {
          checkState = true;
        }
      }
      if (checkState && type === "save") {
        ElMessage({
          message: "尚有控件或热点内容未保存",
          type: "warning",
          duration: 1000,
        });
      }
      let sceneObj = {
        sceneKey: sceneConfig.value._key,
        viewAngle: sceneConfig.value.viewAngle,
        // url: "", loop: false
        BGM: sceneConfig.value?.BGM ? sceneConfig.value?.BGM : {},
        specialEffect: sceneConfig.value?.specialEffect
          ? sceneConfig.value?.specialEffect
          : {},
        hotspots: hotspot,
        layers: layer,
        ttsContent: sceneConfig.value?.ttsContent,
        //{
        //   sky: { scale: "1.0", url: "" },
        //   ground: { scale: "1.0", url: "" },
        // },
        shade: sceneConfig.value?.shade ? sceneConfig.value?.shade : {},
        viewPoints: viewPoints,
      };

      saveSceneRes = (await api.request.patch("scene", {
        ...sceneObj,
      })) as ResultProps;
      if (savePanoRes.msg === "OK" && saveSceneRes.msg === "OK") {
        if (type === "preview") {
          router.push(`/preview/${panoConfig.value._key}/${sceneKey.value}`);
        } else if (type === "save") {
          ElMessage({
            message: "保存成功",
            type: "success",
            duration: 1000,
          });
        }
      }
    }
  };
  watch(sceneKey, (newKey) => {
    // if (sceneObj.value && sceneObj.value[newKey]?.multires) {
    if (newKey) {
      // if (
      //   sceneObj.value &&
      //   sceneObj.value[newKey] &&
      //   sceneObj.value[newKey]?.multires
      // ) {
      //   setSceneConfig({
      //     ...sceneObj.value[newKey],
      //   });
      //   formatScene(sceneObj.value[newKey]);
      // } else {
      getSceneInfo(newKey);
      // }
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
    getSceneInfo,
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
    savePano,
  };
});
