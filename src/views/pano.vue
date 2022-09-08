<script setup lang="ts">
//1208547675
import { ElMessage } from "element-plus";
import Manage from "./right/manage.vue";
import Left from "./left/left.vue";
import appStore from "@/store";
import { storeToRefs } from "pinia";
import Config from "./right/config.vue";
import Hostspot from "./right/hostspot.vue";
import Layer from "./right/layer.vue";
import PanoHeader from "@/components/panoHeader.vue";
import api from "@/services/api";
import { ResultProps } from "@/interface/Common";

import focusSvg from "@/assets/svg/focus.svg";
import CommonPano from "@/components/commonPano.vue";
import Control from "./right/control.vue";
const route = useRoute();

const { sceneKey, sceneObj, sceneConfig, pano, fovPano } = storeToRefs(
  appStore.panoStore
);
const { leftNum, headerNum, configNum } = storeToRefs(appStore.commonStore);
const { getPanoInfo, setSceneConfig } = appStore.panoStore;

onMounted(() => {
  getPanoInfo(route.params.id);
});
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
</script>
<template>
  <div class="pano-editor">
    <PanoHeader />
    <div class="left">
      <Left />
    </div>
    <div class="right" v-if="headerNum !== 2 && sceneConfig?.multires">
      <Manage v-if="leftNum === 0 && headerNum === 0" />
      <Config v-if="leftNum === 1 && headerNum === 0" />
      <Hostspot v-if="headerNum === 3" />
      <Layer v-if="headerNum === 4" />
      <Control v-if="headerNum === 5" />
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
</template>
<style scoped lang="scss">
.pano-editor {
  width: 100vw;
  height: 100vh;
  position: relative;
  z-index: 1;

  .left {
    width: 180px;
    height: calc(100% - 50px);
    background: rgba(30, 30, 30, 0.7);

    top: 50px;
    left: 0px;
    position: absolute;
    z-index: 2;
  }

  .right {
    width: 375px;
    height: calc(100% - 50px);
    background: rgba(30, 30, 30, 0.7);
    color: #fff;
    top: 50px;
    right: 0px;
    position: absolute;
    z-index: 2;
  }

  .center {
    width: 100%;
    height: 100%;
  }

  .pano-config-focus {
    width: 50vw;
    position: absolute;
    top: 20vh;
    left: 25vw;
    z-index: 3;
    align-content: center;
    pointer-events: none;
    @include flex(center, center, wrap);

    .pano-focus-img {
      img {
        width: 50vw;
        height: 50vh;
      }
    }

    .button {
      pointer-events: all;
      height: 40px;
      @include flex(center, center, null);
      margin-top: 10px;
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
