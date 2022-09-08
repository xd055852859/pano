<script setup lang="ts">
import { ElMessage } from "element-plus";
import ControlItem from "../../components/controlItem.vue";

const activeName = ref<string>("1");
</script>
<template>
  <div class="config-container">
    <el-tabs v-model="activeName" class="config-tabs">
      <el-tab-pane label="全部" name="1"><ControlItem type="all"/></el-tab-pane>
      <el-tab-pane label="热点" name="2"><ControlItem type="hotspot"/></el-tab-pane>
      <el-tab-pane label="文字" name="3"><ControlItem type="text"/></el-tab-pane>
      <el-tab-pane label="图片" name="4"><ControlItem  type="image"/></el-tab-pane>
      <el-tab-pane label="导览点" name="5"><ControlItem  type="viewPoint"/></el-tab-pane>
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
<style></style>
