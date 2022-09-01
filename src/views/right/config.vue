<script setup lang="ts">
import appStore from "@/store";
import { ElMessage } from "element-plus";
import { storeToRefs } from "pinia";
import ViewAngle from "./config/viewAngle.vue";
import Bgm from "./config/bgm.vue";
import SpecialEffect from "./config/specialEffect.vue";
import SandTable from "./config/sandTable.vue";
const { setConfigNum } = appStore.commonStore;
const activeName = ref<string>("1");

// watch(
//   pano,
//   (newPano, oldPano) => {
//     if (newPano && !oldPano) {
//       fov.value = newPano.get("view.fov");
//       fovmax.value = newPano.get("view.fovmax");
//       fovmin.value = newPano.get("view.fovmin");
//       hlookatmin.value = newPano.get("view.hlookatmin");
//       hlookatmax.value = newPano.get("view.hlookatmax");
//       vlookatmin.value = newPano.get("view.vlookatmin");
//       vlookatmax.value = newPano.get("view.vlookatmax");
//     }
//   },
//   { immediate: true }
// );
</script>
<template>
  <div class="config-container">
    <el-tabs
      v-model="activeName"
      class="config-tabs"
      @tab-change="
        (tabPanelName) => {
          setConfigNum(tabPanelName);
        }
      "
    >
      <el-tab-pane label="初始视角" name="1"><ViewAngle /></el-tab-pane>
      <el-tab-pane label="沙盘位置" name="2"><SandTable /></el-tab-pane>
      <el-tab-pane label="背景音乐" name="3"><Bgm /></el-tab-pane>
      <el-tab-pane label="页面特效" name="4"><SpecialEffect /></el-tab-pane>
    </el-tabs>
  </div>
</template>
<style scoped lang="scss">
.config-container {
  padding: 10px;
  @include p-number(10px);
  .el-tabs__item {
    color: #fff;
  }
}
</style>
<style>
.config-container .el-tabs__item {
  color: #fff;
}
.config-container .el-tabs__item.is-active {
  color: var(--el-color-primary);
}
</style>
