import { ref } from "vue";
import { defineStore } from "pinia";
import { User } from "@/interface/User";
import api from "@/services/api";
import { ResultProps } from "@/interface/Common";

// 使用setup模式定义
export const commonStore = defineStore("commonStore", () => {
  const leftNum = ref<number>(0);
  const headerNum = ref<number>(0);
  const configNum = ref<string>("1");
  const previewVisible = ref<boolean>(false);
  const setLeftNum = (newLeftNum: number) => {
    leftNum.value = newLeftNum;
  };
  const setHeaderNum = (newHeaderNum: number) => {
    headerNum.value = newHeaderNum;
  };
  const setConfigNum = (newConfigNum: string) => {
    configNum.value = newConfigNum;
  };
  const setPreviewVisible = (newPreviewVisible: boolean) => {
    previewVisible.value = newPreviewVisible;
  };
  return {
    leftNum,
    setLeftNum,
    headerNum,
    setHeaderNum,
    configNum,
    setConfigNum,
    previewVisible,
    setPreviewVisible
  };
});
