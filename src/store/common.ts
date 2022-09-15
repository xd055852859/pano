import { ref } from "vue";
import { defineStore } from "pinia";
import { User } from "@/interface/User";
import api from "@/services/api";
import { ResultProps } from "@/interface/Common";
import { getBase64 } from "@/services/util";

// 使用setup模式定义
export const commonStore = defineStore("commonStore", () => {
  const leftNum = ref<number>(0);
  const headerNum = ref<number>(0);
  const configNum = ref<string>("1");
  const createState = ref<boolean>(false);
  const createFile = ref<any>(null);
  const setLeftNum = (newLeftNum: number) => {
    leftNum.value = newLeftNum;
  };
  const setHeaderNum = (newHeaderNum: number) => {
    headerNum.value = newHeaderNum;
  };
  const setConfigNum = (newConfigNum: string) => {
    configNum.value = newConfigNum;
  };
  const setCreateState = (newCreateState: boolean) => {
    createState.value = newCreateState;
  };
  const setCreateFile = (newCreateFile: any) => {
    getBase64(newCreateFile)
      .then((res) => {
        createFile.value = res;
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return {
    leftNum,
    setLeftNum,
    headerNum,
    setHeaderNum,
    configNum,
    setConfigNum,
    createState,
    setCreateState,
    createFile,
    setCreateFile,
  };
});
