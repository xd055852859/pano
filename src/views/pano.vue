<script setup lang="ts">
//1208547675
import { ElMessage } from "element-plus";
import Manage from "./right/manage.vue";
import Left from "./left/left.vue";
import appStore from "@/store";
import { storeToRefs } from "pinia";
import Config from "./right/config.vue";
import Hostspot from "./right/hostspot.vue";
import Control from "./right/control.vue";
import PanoHeader from "@/components/panoHeader.vue";
import api from "@/services/api";
import { ResultProps } from "@/interface/Common";

import focusSvg from "@/assets/svg/focus.svg";
import CommonPano from "@/components/commonPano.vue";
const route = useRoute();
const { sceneKey, sceneObj, sceneConfig, pano, fovPano } = storeToRefs(
  appStore.panoStore
);
const { leftNum, headerNum, configNum } = storeToRefs(appStore.commonStore);
const { setSceneObj, setSceneConfig, setSceneKey, setPanoConfig } =
  appStore.panoStore;
const { setHotspotObj, setLayerObj } = appStore.controlStore;

onMounted(() => {
  getPanoInfo();
});
const getPanoInfo = async () => {
  const infoRes = (await api.request.get("pano/detail", {
    panoKey: route.params.id,
  })) as ResultProps;
  if (infoRes.msg === "OK") {
    console.log(infoRes);
    let newSceneObj: any = {};
    infoRes.data.sceneList.forEach((item) => {
      newSceneObj[item._key] = {
        cover: `${api.File_URL}${item.cover}`,
        _key: item._key,
        name: item.name,
      };
    });
    setSceneObj(newSceneObj);
    setSceneKey(infoRes.data.sceneList[infoRes.data.sceneList.length - 1]._key);
    setPanoConfig({
      name: infoRes.data.name,
      public: infoRes.data.public,
      userKey: infoRes.data.userKey,
      tagKey: infoRes.data.tagKey,
      labels: infoRes.data.labels,
      location: infoRes.data.location,
      config: infoRes.data.config,
      _key: infoRes.data._key,
    });
  }
};
const getSceneInfo = async (key) => {
  const infoRes = (await api.request.get("scene/detail", {
    sceneKey: key,
  })) as ResultProps;
  if (infoRes.msg === "OK") {
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
    });
    if (infoRes.data.hotspots) {
      let obj: any = {};
      infoRes.data.hotspots.forEach((item) => {
        obj[item.name] = { ...item, state: "used" };
      });
      setHotspotObj({ ...obj });
    }
    if (infoRes.data.layers) {
      let obj: any = {};
      infoRes.data.layers.forEach((item) => {
        obj[item.name] = { ...item, state: "used" };
      });
      setLayerObj({ ...obj });
    }
  }
};
const focusFov = async () => {
  fovPano.value.set(`view.fovmax`, pano.value.get(`view.fovmax`));
  fovPano.value.set(`view.fov`, pano.value.get(`view.fov`));
  fovPano.value.set(`view.fovmin`, pano.value.get(`view.fovmin`));
  fovPano.value.set(`view.vlookat`, pano.value.get(`view.vlookat`));
  fovPano.value.set(`view.vlookatmax`, pano.value.get(`view.vlookatmax`));
  fovPano.value.set(`view.vlookatmin`, pano.value.get(`view.vlookatmin`));
  fovPano.value.set(`view.hlookat`, pano.value.get(`view.hlookat`));
  fovPano.value.set(`view.hlookatmax`, pano.value.get(`view.hlookatmax`));
  fovPano.value.set(`view.hlookatmin`, pano.value.get(`view.hlookatmin`));
  let viewAngle = {
    fov: pano.value.get(`view.fov`) + "",
    fovmax: pano.value.get(`view.fovmax`) + "",
    fovmin: pano.value.get(`view.fovmin`) + "",
    hlookat: pano.value.get(`view.hlookat`) + "",
    hlookatmax: pano.value.get(`view.hlookatmax`) + "",
    hlookatmin: pano.value.get(`view.hlookatmin`) + "",
    vlookat: pano.value.get(`view.vlookat`) + "",
    vlookatmax: pano.value.get(`view.vlookatmax`) + "",
    vlookatmin: pano.value.get(`view.vlookatmin`) + "",
  };
  //@ts-ingore
  setSceneConfig({
    viewAngle: { ...viewAngle },
    _key: sceneConfig.value?._key,
  });
  const infoRes = (await api.request.patch("scene", {
    viewAngle: { ...viewAngle },
    sceneKey: sceneConfig.value?._key,
  })) as ResultProps;
  if (infoRes.msg === "OK") {
    ElMessage({
      message: "锁定视角成功",
      type: "success",
      duration: 1000,
    });
  }
};
watch(sceneKey, (newKey) => {
  if (newKey) {
    if (sceneObj.value[newKey] && sceneObj.value[newKey].multires) {
      setSceneConfig({
        ...sceneObj.value[newKey],
      });
    } else {
      getSceneInfo(newKey);
    }
  }
});
</script>
<template>
  <div class="pano-editor">
    <PanoHeader />
    <div class="pano-editor-container">
      <div class="left">
        <Left />
      </div>
      <div class="right" v-if="headerNum !== 2">
        <Manage v-if="leftNum === 0 && headerNum === 0" />
        <Config v-if="leftNum === 1 && headerNum === 0" />
        <Hostspot v-if="headerNum === 3" />
        <Control v-if="headerNum === 4" />
      </div>
      <div class="center">
        <CommonPano type="main" panoId="mainPano" />
      </div>
      <div
        class="pano-config-focus"
        v-if="leftNum === 1 && headerNum === 0 && configNum === '1'"
      >
        <div class="pano-focus-img"><img :src="focusSvg" alt="" /></div>
        <div class="button">
          <el-button
            @click="focusFov"
            type="success"
            round
            color="#86b93f"
            style="color: #fff"
            >把当前视角视为初始视角</el-button
          >
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.pano-editor {
  width: 100vw;
  height: 100vh;

  .pano-editor-container {
    width: 100vw;
    height: calc(100vh - 50px);
    position: relative;
    z-index: 1;

    .left {
      width: 260px;
      height: 100%;
      background: rgba(30, 30, 30, 0.7);
      box-shadow: 0px 0px 4px 6px rgba(0, 0, 0, 0.05);
      top: 0px;
      left: 0px;
      position: absolute;
      z-index: 4;
    }

    .right {
      width: 375px;
      height: 100%;
      background: rgba(30, 30, 30, 0.7);
      box-shadow: 0px 0px 4px 6px rgba(0, 0, 0, 0.05);
      color: #fff;
      top: 0px;
      right: 0px;
      position: absolute;
      z-index: 4;
    }

    .center {
      width: 100%;
      height: 100%;
      top: 0px;
      left: 0px;
      position: absolute;
      z-index: 2;
    }

    .pano-config-focus {
      width: 40vw;
      position: absolute;
      top: 15vh;
      left: 30vw;
      z-index: 3;
      align-content: center;
      pointer-events: none;
      @include flex(center, center, wrap);

      .pano-focus-img {
        img {
          width: 40vw;
          height: 50vh;
        }
      }

      .button {
        pointer-events: all;
        height: 40px;
        @include flex(center, center, null);
        margin-top: 15px;
      }
    }
  }
}
</style>
<style lang="scss">
.pano-editor {
  .el-dialog__body {
    padding: 0px;
  }
}
</style>
