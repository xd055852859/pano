<script setup lang="ts">
import appStore from "@/store";
import { ElMessage } from "element-plus";
import { storeToRefs } from "pinia";
const { token } = storeToRefs(appStore.authStore);
const { getUserInfo } = appStore.authStore;
watch(
  token,
  (newVal, oldVal) => {
    if (newVal) {
      getUserInfo();
    }
  },
  { immediate: true }
);
</script>
<template><router-view></router-view></template>
<style scoped lang="scss"></style>
<style></style>
