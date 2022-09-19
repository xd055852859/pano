<script setup lang="ts">
import { ElMessage } from "element-plus";
import { Close } from "@element-plus/icons-vue";
import { storeToRefs } from "pinia";
import appStore from "@/store";
import router from "@/router";
const { user } = storeToRefs(
  appStore.authStore
);
const logout = () => {
  router.push("/");
  localStorage.clear();
  ElMessage({
    message: "退出登录成功",
    type: "success",
    duration: 1000,
  });
};
</script>
<template>
  <div class="header">
    <div>全景</div>
    <div>
      <el-dropdown>
        <el-avatar
          :src="user?.userAvatar"
        />
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>
<style scoped lang="scss">
.header {
  width: 100vw;
  height: 70px;
  background: #1e1e1e;
  box-shadow: 0px 0px 4px 6px rgba(0, 0, 0, 0.05);
  color: #fff;
  @include p-number(3%);
  @include flex(space-between, center, null);
}
</style>
<style></style>
