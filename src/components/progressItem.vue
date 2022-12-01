<script setup lang="ts">
import { useDebounceFn } from "@vueuse/core";
import { watchPostEffect } from "vue";

const props = defineProps<{ percent: number }>();
const emits = defineEmits(["changePercent"]);
const moveState = ref<boolean>(false);
const percent = ref<number>(0);
const barRef = ref<any>(null);
const barleft = ref<number>(0);
const progressRef = ref<any>(null);

const moveProgress = (e) => {
  let event = e || window.event;
  let left = progressRef.value.getBoundingClientRect().left;
  const width = progressRef.value.getBoundingClientRect().width;
  barleft.value = event.clientX - left;
  percent.value = Math.round((barleft.value / width) * 100);
  if (percent.value > 100) {
    percent.value = 100;
  } else if (percent.value < 0) {
    percent.value = 0;
  }
  emits("changePercent", percent.value);
};
watch(
  () => props.percent,
  (newPercent) => {
    percent.value = newPercent;
  },
  { immediate: true }
);
</script>
<template>
  <div
    class="progress-container"
    @mousemove="moveState ? moveProgress($event) : null"
    @mousedown="moveState = true"
    @mouseup="moveState = false"
    @mouseClick="moveProgress($event)"
  >
    <div class="progress" ref="progressRef">
      <el-progress
        :percentage="percent"
        :text-inside="true"
        :stroke-width="16"
        :color="'#16ab78'"
      />
      <!-- <div
        class="progress-box"
        @mousedown="test"
        ref="barRef"
        :style="{ left: barleft + 'px' }"
      ></div> -->
    </div>
  </div>
</template>
<style scoped lang="scss">
.progress-container {
  width: 100%;
  height: 20px;
  position: relative;
  z-index: 1;
  cursor: pointer;
  padding-right: 10px;
  box-sizing: border-box;
}
</style>
<style lang="scss">
.progress-container {
  .el-progress-bar__inner {
    transition: none !important;
  }
}
</style>
