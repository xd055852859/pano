<script setup lang="ts">
import { getSearchParamValue } from "@/services/util";
import { storeToRefs } from "pinia";
import appStore from "@/store";
import request from "@/services/api";
import setTheme from "./hooks/theme";
const { setToken } = appStore.authStore;
const { setSceneKey } = appStore.panoStore;
const { setLeftNum, setCreateState } = appStore.commonStore;
const socket: any = inject("socket");
onBeforeMount(() => {
  window.addEventListener("message", handle, false);
  const search = window.location.search
    ? window.location.search.split("?")[1]
    : window.location.hash.split("?")[1];
  let token = "";
  if (getSearchParamValue(search, "token")) {
    token = getSearchParamValue(search, "token") as string;
  } else if (localStorage.getItem("token")) {
    token = localStorage.getItem("token") as string;
  }
  if (token) {
    request.setToken(token);
    setToken(token);
    socket.on("connect", () => {
      socket.emit("login", token);
      socket.on("createOK", (data) => {
        console.log(data)
        //删除
        setLeftNum(0);
        setSceneKey(data._key);
        setCreateState(false);
      });
    });
  }
  setTheme("#86b93f");
  // let url = window.location.href;
  //自动切换为https
  // if (url.indexOf("http://localhost") === -1 && url.indexOf("https") < 0) {
  //   url = url.replace("http:", "https:");
  //   window.location.replace(url);
  // }
});
onUnmounted(() => {
  window.removeEventListener("message", handle, false);
});
const handle = (e: any) => {
  if (
    e.origin === "https://account.qingtime.cn" &&
    e.data.eventName === "redirect"
  ) {
    const token = getSearchParamValue(
      e.data.data.split("?")[1],
      "token"
    ) as string;
    request.setToken(token);
    setToken(token);
  }
};
//初始化
</script>

<template><router-view></router-view></template>

<style lang="scss">
*::-webkit-scrollbar {
  width: 2px;
  height: 2px;
}

*::-webkit-scrollbar-thumb {
  background: var(--el-color-success);
  border-radius: 100px;
}
.common-color {
  color: var(--el-color-success) !important;
}
</style>
