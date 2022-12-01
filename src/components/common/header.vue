<script setup lang="ts">
import { ElMessage } from "element-plus";
import { Close } from "@element-plus/icons-vue";
import { storeToRefs } from "pinia";
import appStore from "@/store";
import router from "@/router";
import axios from "axios";
import api from "@/services/api";
import { ResultProps } from "@/interface/Common";
const { user, token } = storeToRefs(appStore.authStore);
const { setCreateFile } = appStore.commonStore;
const logout = () => {
  router.push("/");
  localStorage.clear();
  ElMessage({
    message: "退出登录成功",
    type: "success",
    duration: 1000,
  });
};
const uploadPanoImg = async (file) => {
  if (file.size > 31457280) {
    ElMessage({
      message: "请上传不大于30M的图片",
      type: "warning",
      duration: 3000,
    });
    return;
  }
  // let regExp = /[\u4E00-\u9FA5\uF900-\uFA2D]{1,}/;
  // if (regExp.test(file.name)) {
  //   ElMessage({
  //     message: "文件名请勿使用中文",
  //     type: "warning",
  //     duration: 3000,
  //   });
  //   return;
  // }

  let url = window.URL || window.webkitURL;
  let img = new Image(); //手动创建一个Image对象
  img.src = url.createObjectURL(file); //创建Image的对象的url
  img.onload = async () => {
    if (img.height === img.width || img.width / img.height === 2) {
      //请使用正方形或者2:1的尺寸的图片
      const formData = new FormData();
      // Object.defineProperty(file, "name", {
      //   writable: true, //设置属性为可写
      // });
      // file.name = "pano" + new Date().getTime();
      // 遍历当前临时文件List,将上传文件添加到FormData对象中

      const createRes = (await api.request.post("pano", {})) as ResultProps;

      if (createRes.msg === "OK") {
        ElMessage({
          message: "创建全景成功",
          type: "success",
          duration: 1000,
        });
        // setCreateState(true);
        setCreateFile(file);
        router.push(`/preview/${createRes.data._key}/create`);
        let arr = file.name.split(".");
        console.log( `pano${new Date().getTime()}.${arr[arr.length - 1]}`)
        let newFile = new File(
          [file],
          `pano${new Date().getTime()}.${arr[arr.length - 1]}`,
          {
            type: file.type,
          }
        );
        formData.append("images", newFile);
        formData.append("panoKey", createRes.data._key);
        console.log(file.name.replace(`.${arr[arr.length - 1]}`, ""))
        formData.append(
          "panoName",
          file.name.replace(`.${arr[arr.length - 1]}`, "")
        );
        formData.append(
          "sceneName",
          file.name.replace(`.${arr[arr.length - 1]}`, "")
        );
        axios.post("https://panodata2.qingtime.cn/scene/new", formData, {
          // 因为我们上传了图片,因此需要单独执行请求头的Content-Type
          headers: {
            // 表示上传的是文件,而不是普通的表单数据
            "Content-Type": "multipart/form-data",
            token: token.value,
          },
        });
      }
    } else {
      ElMessage({
        message: "请选择正方形或宽高比2:1的图片",
        type: "warning",
        duration: 3000,
      });
    }
  };
};
</script>
<template>
  <div class="header">
    <div class="left">
      <img
        :src="'https://cdn-pano.qingtime.cn/1661587220929_pano.svg'"
        alt=""
        class="logo"
      />全景
    </div>
    <div class="right">
      <div class="button" style="margin-right:15px">
        <el-tooltip content="请选择宽高比2:1的图片">
          <div class="upload-button">
            <el-button type="success" round>新建全景</el-button>
            <input
              type="file"
              accept=".png,.jpg,.jpeg"
              @change="
                //@ts-ignore
                uploadPanoImg($event.target.files[0])
              "
              class="upload-img"
            />
          </div>
        </el-tooltip>
      </div>
      <el-dropdown>
        <el-avatar :src="user?.userAvatar" />
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
  .left {
    height: 100%;
    @include flex(center, center, null);
    .logo {
      width: 35px;
      height: 35px;
      margin-right: 10px;
    }
  }
  .right {
    height: 100%;
    @include flex(center, center, null);
  }
}
</style>
<style></style>
