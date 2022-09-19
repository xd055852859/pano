<script setup lang="ts">
import { ElMessage } from "element-plus";
import appStore from "@/store";
import { storeToRefs } from "pinia";
import SliderProgress from "@/components/common/sliderProgress.vue";
import CommonPano from "@/components/common/pano.vue";
const { pano, sceneConfig } = storeToRefs(appStore.panoStore);
const { setSceneConfig } = appStore.panoStore;
const fov = ref<number>(95);
const fovmax = ref<number>(120);
const fovmin = ref<number>(70);
const hlookatmin = ref<number>(-180);
const hlookatmax = ref<number>(180);
const vlookatmin = ref<number>(-90);
const vlookatmax = ref<number>(90);
const changeFov = (type: string) => {
  switch (type) {
    case "fov":
      if (fov.value < fovmin.value) {
        fov.value = fovmin.value;
      }
      if (fov.value > fovmax.value) {
        fov.value = fovmax.value;
      }
      if (fovmax.value > 180) {
        fovmax.value = 180;
      }
      if (fovmin.value < 0) {
        fovmax.value = 0;
      }
      pano.value.set(`view.fovmax`, fovmax.value);
      pano.value.set(`view.fov`, fov.value);
      pano.value.set(`view.fovmin`, fovmin.value);
      break;
    case "vlook":
      if (vlookatmax.value < vlookatmin.value) {
        vlookatmax.value = vlookatmin.value;
      }
      if (vlookatmin.value > vlookatmax.value) {
        vlookatmin.value = vlookatmax.value;
      }
      if (vlookatmax.value > 90) {
        vlookatmax.value = 90;
      }
      if (vlookatmin.value < -90) {
        vlookatmin.value = -90;
      }
      pano.value.set(`view.vlookatmax`, vlookatmax.value);
      pano.value.set(`view.vlookatmin`, vlookatmin.value);
      break;
    case "hlook":
      if (hlookatmax.value < hlookatmin.value) {
        hlookatmax.value = hlookatmin.value;
      }
      if (hlookatmin.value > hlookatmax.value) {
        hlookatmin.value = hlookatmax.value;
      }
      if (hlookatmax.value > 180) {
        hlookatmax.value = 180;
      }
      if (hlookatmin.value < -180) {
        hlookatmin.value = -180;
      }
      pano.value.set(`view.hlookatmax`, hlookatmax.value);
      pano.value.set(`view.hlookatmin`, hlookatmin.value);
      break;
  }
  setSceneConfig({
    viewAngle: {
      fov: fov.value,
      fovmax: fovmax.value,
      fovmin: fovmin.value,
      hlookat: pano.value.get(`view.hlookat`),
      hlookatmax: hlookatmax.value,
      hlookatmin: hlookatmin.value,
      vlookat: pano.value.get(`view.vlookat`),
      vlookatmax: vlookatmax.value,
      vlookatmin: vlookatmin.value,
    },
    _key: sceneConfig.value?._key,
  });
};
watch(
  sceneConfig,
  (newConfig) => {
    if (newConfig?.viewAngle) {
      fov.value = +newConfig.viewAngle.fov;
      fovmax.value = +newConfig.viewAngle.fovmax;
      fovmin.value = +newConfig.viewAngle.fovmin;
      hlookatmin.value = +newConfig.viewAngle.hlookatmin;
      hlookatmax.value = +newConfig.viewAngle.hlookatmax;
      vlookatmin.value = +newConfig.viewAngle.vlookatmin;
      vlookatmax.value = +newConfig.viewAngle.vlookatmax;
    }
  },
  { immediate: true, deep: true }
);
</script>
<template>
  <div class="pano-config">
    <div class="pano-config-title">设置初始视角</div>
    <div class="pano-config-img" v-if="sceneConfig">
      <CommonPano type="fov" panoId="fovPano" />
    </div>
    <el-divider border-style="dashed" />
    <div class="pano-config-title">范围设置</div>
    <div class="pano-config-progress" @mouseleave="changeFov('fov')">
      <SliderProgress
        :width="300"
        :hasCenter="true"
        :leftNum="fovmin"
        :rightNum="fovmax"
        :centerNum="fov"
        :allNum="180"
        :type="''"
        @changeLeftNum="
          (num) => {
            fovmin = num;
          }
        "
        @changeRightNum="
          (num) => {
            fovmax = num;
          }
        "
        @changeCenterNum="
          (num) => {
            fov = num;
            changeFov('fov');
          }
        "
      />
    </div>
    <div class="pano-config-fov">
      <div class="pano-config-input">
        <el-input
          v-model="fovmin"
          style="width: 60px"
          @blur="changeFov('fov')"
        />
        <div>最近</div>
      </div>
      <div class="pano-config-input">
        <el-input v-model="fov" style="width: 60px" @blur="changeFov('fov')" />
        <div>初始</div>
      </div>
      <div class="pano-config-input">
        <el-input
          v-model="fovmax"
          style="width: 60px"
          @blur="changeFov('fov')"
        />
        <div>最远</div>
      </div>
    </div>
    <el-divider border-style="dashed" />
    <div class="pano-config-title">垂直视角限制</div>
    <div class="pano-config-progress" @mouseleave="changeFov('vlook')">
      <SliderProgress
        :width="300"
        :leftNum="vlookatmin"
        :rightNum="vlookatmax"
        :allNum="180"
        :type="'negative'"
        @changeLeftNum="
          (num) => {
            vlookatmin = num;
          }
        "
        @changeRightNum="
          (num) => {
            vlookatmax = num;
          }
        "
      />
    </div>
    <div class="pano-config-fov">
      <div class="pano-config-input">
        <el-input
          v-model="vlookatmin"
          style="width: 60px"
          @blur="changeFov('vlook')"
        />
        <div>最低</div>
      </div>
      <div class="pano-config-input">
        <el-input
          v-model="vlookatmax"
          style="width: 60px"
          @blur="changeFov('vlook')"
        />
        <div>最高</div>
      </div>
    </div>
    <el-divider border-style="dashed" />
    <div class="pano-config-title">水平视角限制</div>
    <div class="pano-config-progress" @mouseleave="changeFov('hlook')">
      <SliderProgress
        :width="300"
        :leftNum="hlookatmin"
        :rightNum="hlookatmax"
        :allNum="360"
        :type="'negative'"
        @changeLeftNum="
          (num) => {
            hlookatmin = num;
          }
        "
        @changeRightNum="
          (num) => {
            hlookatmax = num;
          }
        "
      />
    </div>
    <div class="pano-config-fov">
      <div class="pano-config-input">
        <el-input
          v-model="hlookatmin"
          style="width: 60px"
          @blur="changeFov('hlook')"
        />
        <div>最左</div>
      </div>
      <div class="pano-config-input">
        <el-input
          v-model="hlookatmax"
          style="width: 60px"
          @blur="changeFov('hlook')"
        />
        <div>最右</div>
      </div>
    </div>
    <div></div>
  </div>
</template>
<style scoped lang="scss">
.pano-config {
  width: 100%;
  height: calc(100vh - 120px);
  padding: 5px 10px;
  box-sizing: border-box;
  @include scroll();

  .pano-config-title {
    margin-bottom:10px;
  }

  .pano-config-img {
    width: 100%;
    height: 200px;
    margin-bottom: 10px;
  }

  .pano-config-progress {
    width: 100%;
    height: 70px;
  }

  .pano-config-fov {
    height: 70px;
    margin-bottom: 10px;
    @include flex(space-between, center, null);

    .pano-config-input {
      > div:nth-child(2) {
        @include flex(center, center, null);
        margin: 10px 0px;
      }
    }
  }
}
</style>
<style></style>
