<script setup lang="ts">
import { ElMessage } from "element-plus";
const props = defineProps<{
  text: string;
}>();
</script>
<template>
  <div class="loading">
    <div class="loading-logo"></div>
    <div class="loading-text">{{ text }}</div>
  </div>
</template>
<style scoped lang="scss">
.loading {
  width: 120px;
  @include flex(center, center, wrap);
}
.loading-logo {
  width: 64px;
  height: 64px;
  position: relative;
  background: #fff;
  border-radius: 50%;
  transform: rotate(45deg);
  animation: rotate 2s linear infinite;
  &:before {
    content: "";
    position: absolute;
    left: 50%;
    top: 50%;
    width: 15px;
    height: 30px;
    background: #86b93f;
    transform: skew(5deg, 60deg) translate(-50%, -5%);
  }
  &:after {
    content: "";
    position: absolute;
    left: 50%;
    top: 50%;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #fff;
    transform: translate(-50%, -50%);
  }
}
@keyframes rotate {
  0% {
    transform: rotate(45deg);
  }
  30%,
  50%,
  70% {
    transform: rotate(230deg);
  }
  40%,
  60%,
  80% {
    transform: rotate(240deg);
  }
  100% {
    transform: rotate(245deg);
  }
}

.loading-text {
  font-size: 24px;
  color: #fff;
  display: inline-block;
  font-family: Arial, Helvetica, sans-serif;
  font-weight: 400;
  position: relative;
  margin-top: 15px;
  &:after {
    content: "";
    height: 4px;
    width: 0%;
    display: block;
    background: #86b93f;
    animation: 5s lineGrow linear infinite;
  }
}
@keyframes lineGrow {
  to {
    width: 100%;
  }
}
</style>
<style></style>
