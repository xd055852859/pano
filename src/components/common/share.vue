<script setup lang="ts">
import { useClipboard } from "@vueuse/core";
import { ElMessage } from "element-plus";
import QrcodeVue from "qrcode.vue";
// const { toClipboard } = useClipboard();

const { copy } = useClipboard();
const props = defineProps<{
  url: string;
}>();
onMounted(() => {});
const sharePano = () => {
  copy(props.url);
  ElMessage({
    message: "复制链接成功",
    type: "success",
    duration: 1000,
  });
};
</script>
<template>
  <div class="code-container">
    <div class="code-url">
      <div class="code-input single-to-long">{{ url }}</div>
      <el-button @click="sharePano" type="success">复制</el-button>
    </div>
    <div class="code-box">
      <qrcode-vue :value="url" :size="200" level="H" />
    </div>
  </div>
</template>
<style scoped lang="scss">
.code-container {
  width: 500px;
  height: 330px;
  .code-url {
    width: 100%;
    height: 90px;
    @include flex(space-between, center, null);
    margin-bottom:30px;
    .code-input{
      width:400px;
      border:1px solid #efefef;
      padding:8px;
      border-radius: 8px;
    }
  }
  .code-box {
    width: 100%;
    height: 180px;
    @include flex(center, center, null);
  }
}
</style>
<style></style>
