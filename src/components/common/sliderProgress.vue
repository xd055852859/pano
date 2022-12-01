<script setup lang="ts">
import { ElMessage } from "element-plus";
const props = defineProps<{
  width: number;
  leftNum: number;
  rightNum: number;
  centerNum?: number;
  hasCenter?: boolean;
  allNum: number;
  type: string;
}>();
const emits = defineEmits<{
  (e: "changeLeftNum", left: number): void;
  (e: "changeRightNum", right: number): void;
  (e: "changeCenterNum", center: number): void;
}>();
const step = computed(() => {
  return +(props.allNum / props.width).toFixed(1);
});
const leftBallRef = ref<any>(null);
const centerProgressRef = ref<any>(null);
const centerBallRef = ref<any>(null);
const rightBallRef = ref<any>(null);
const sliderProgressRef = ref<any>(null);
const sliderLineRef = ref<any>(null);
const targetType = ref<string>("");
onMounted(() => {
  const topVal = sliderProgressRef.value.offsetHeight / 2 - 10 + "px";
  leftBallRef.value.style.top = topVal;
  rightBallRef.value.style.top = topVal;

  leftBallRef.value.style.left = formatLeft(props.leftNum);
  rightBallRef.value.style.left = formatLeft(props.rightNum);

  if (props.hasCenter && props.centerNum) {
    centerBallRef.value.style.top = topVal;
    centerBallRef.value.style.left =
      (props.centerNum / props.allNum) * props.width + "px";
  }

  centerProgressRef.value.style.top =
    sliderProgressRef.value.offsetHeight / 2 - 1 + "px";

  centerProgressRef.value.style.left = leftBallRef.value.offsetLeft + "px";
  centerProgressRef.value.style.width =
    rightBallRef.value.offsetLeft - leftBallRef.value.offsetLeft + "px";
});

const formatLeft = (num) => {
  if (props.type === "negative") {
    return ((num + props.allNum / 2) / props.allNum) * props.width + "px";
  } else {
    return (num / props.allNum) * props.width + "px";
  }
};
const formatNum = (left) => {
  if (props.type === "negative") {
    return +((left / props.width) * props.allNum - props.allNum / 2).toFixed(1);
  } else {
    return +((left / props.width) * props.allNum).toFixed(1);
  }
};
const moveball = (e) => {
  let event = e || window.event;
  let leftVal =
    event.clientX - sliderProgressRef.value.getBoundingClientRect().left;
  if (targetType.value) {
    switch (targetType.value) {
      case "left":
        let leftRightVal =
          rightBallRef.value.getBoundingClientRect().left - event.clientX;
        let leftCenterVal = props.hasCenter
          ? centerBallRef.value.getBoundingClientRect().left - event.clientX
          : leftRightVal;
        if (leftCenterVal >= 0 && leftRightVal >= 0 && leftVal >= 0) {
          leftBallRef.value.style.left = leftVal + "px";
          emits("changeLeftNum", formatNum(leftVal));
        }
        break;
      case "right":
        let rightLeftVal =
          event.clientX - leftBallRef.value.getBoundingClientRect().left;
        let rightCenterVal = props.hasCenter
          ? event.clientX - centerBallRef.value.getBoundingClientRect().left
          : rightLeftVal;
        if (rightLeftVal >= 0 && rightCenterVal >= 0 && leftVal <= 300) {
          rightBallRef.value.style.left = leftVal + "px";
          emits("changeRightNum", formatNum(leftVal));
        }
        break;
      case "center":
        let centerLeftVal =
          event.clientX - leftBallRef.value.getBoundingClientRect().left;
        let centerRightVal =
          rightBallRef.value.getBoundingClientRect().left - event.clientX;
        if (centerLeftVal >= 0 && centerRightVal >= 0) {
          centerBallRef.value.style.left = leftVal + "px";
          emits("changeCenterNum", formatNum(leftVal));
        }
        break;
    }
    centerProgressRef.value.style.left = leftBallRef.value.offsetLeft + "px";
    centerProgressRef.value.style.width =
      rightBallRef.value.offsetLeft - leftBallRef.value.offsetLeft + "px";
  }
};
watch(
  [() => props.leftNum, () => props.rightNum, () => props.centerNum],
  ([newLeftNum, newRightNum, newCenterNum]) => {
    leftBallRef.value.style.left = formatLeft(newLeftNum);
    rightBallRef.value.style.left = formatLeft(newRightNum);
    if (props.hasCenter && newCenterNum) {
      centerBallRef.value.style.left =
        (newCenterNum / props.allNum) * props.width + "px";
    }
    centerProgressRef.value.style.left = leftBallRef.value.offsetLeft + "px";
    centerProgressRef.value.style.width =
      rightBallRef.value.offsetLeft - leftBallRef.value.offsetLeft + "px";
  }
);
</script>
<template>
  <div
    class="sliderProgress"
    ref="sliderProgressRef"
    :style="{ width: width + 'px' }"
    @mousemove="moveball"
    @mouseup="targetType = ''"
    @mouseleave="targetType = ''"
  >
    <div class="slider-line" ref="sliderLineRef"></div>
    <div
      class="left-ball"
      ref="leftBallRef"
      @mousedown="targetType = 'left'"
      @mouseup="targetType = ''"
    ></div>
    <div class="center-progress" ref="centerProgressRef"></div>
    <div
      class="center-ball"
      ref="centerBallRef"
      @mousedown="targetType = 'center'"
      @mouseup="targetType = ''"
      v-if="hasCenter"
    ></div>
    <div
      class="right-ball"
      ref="rightBallRef"
      @mousedown="targetType = 'right'"
      @mouseup="targetType = ''"
    ></div>
  </div>
</template>
<style scoped lang="scss">
.sliderProgress {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
  @include flex(center, center, null);
  .slider-line {
    width: 100%;
    height: 2px;
    background-color: #9e9e9e;
  }

  .left-ball,
  .right-ball {
    width: 10px;
    height: 20px;
    position: absolute;
    top: 0px;
    z-index: 4;
    background-color: #fff;
  }
  .left-ball {
    left: 0px;
  }
  .right-ball {
    right: 0px;
  }
  .center-ball {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    position: absolute;
    left: 0px;
    top: 0px;
    z-index: 4;
    background-color: #fff;
  }
  .center-progress {
    height: 2px;
    position: absolute;
    z-index: 3;
    background-color: rgb(139, 139, 240);
  }
}
</style>
<style></style>
