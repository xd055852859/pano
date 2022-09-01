<script setup lang="ts">
import { ResultProps } from "@/interface/Common";
import { Close } from '@element-plus/icons-vue'
import api from "@/services/api";
import appStore from "@/store";
import axios from "axios";
import { ElMessage } from "element-plus";
import { storeToRefs } from "pinia";
const router = useRouter();
const { token } = storeToRefs(appStore.authStore);
const panoList = ref<any>([])
const tempFiles = ref<any>([]);
const deleteVisible = ref<boolean>(false);
const deleteIndex = ref<number>(0);
onMounted(() => {
  getPanoList()
})
const uploadPanoImg = (e) => {
  tempFiles.value = [...tempFiles.value, ...e.target.files];
};
const createPano = async () => {
  const formData = new FormData();
  if (tempFiles.value.length === 0) {
    ElMessage({
      message: "请上传全景图片",
      type: "error",
      duration: 1000,
    });
    return;
  }
  // 遍历当前临时文件List,将上传文件添加到FormData对象中
  tempFiles.value.forEach((item) => formData.append("images", item));
  // 调用后端接口,发送请求
  const createRes = (await axios.post(
    "https://panodata2.qingtime.cn/scene/new",
    formData,
    {
      // 因为我们上传了图片,因此需要单独执行请求头的Content-Type
      headers: {
        // 表示上传的是文件,而不是普通的表单数据
        "Content-Type": "multipart/form-data",
        token: token.value,
      },
    }
  )) as ResultProps;

  if (createRes.data.msg === "OK") {
    // console.log(createRes.data);
    ElMessage({
      message: "创建全景成功",
      type: "success",
      duration: 1000,
    });
    router.push("/pano/" + createRes.data.data);
  }
};
const delPano = async () => {
  deleteVisible.value = false
  const infoRes = (await api.request.delete("pano", {
    panoKey: panoList.value[deleteIndex.value]._key,
  })) as ResultProps;
  if (infoRes.msg === "OK") {
    ElMessage({
      message: "删除全景成功",
      type: "success",
      duration: 1000,
    });
    panoList.value.splice(deleteIndex.value, 1);
  }
}
const getPanoList = async () => {
  const listRes = (await api.request.get("pano", {
    page: 1,
    limit: 100
  })) as ResultProps;
  if (listRes.msg === "OK") {
    console.log(listRes);
    panoList.value = [...listRes.data];
  }
}
</script>
<template>
  <div class="pano-home">
    <div>
      <el-button @click="createPano" type="primary">新建全景浏览</el-button>
    </div>
    <div style="margin:10px 0px">
      <input type="file" accept=".png,.jpg,.jpeg" multiple @change="uploadPanoImg" />
    </div>
    <div class="pano-list">
      <el-card class="pano-list-item" v-for="(item, index) in panoList" :key="`pano${index}`"
        @click="$router.push(`/pano/${item._key}`)">
        <template #header>
          <div class="pano-list-header">
            <span> {{ item._key }}</span>
            <el-icon @click="$event.stopPropagation(); deleteIndex = index; deleteVisible = true" style="cursor:pointer">
              <Close />
            </el-icon>
          </div>
        </template>
        <div>{{ item.name }}</div>
      </el-card>
    </div>
    <el-dialog v-model="deleteVisible" title="删除提示" width="30%">
      <span>是否删除该全景</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteVisible = false">取消</el-button>
          <el-button type="primary" @click="delPano()">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<style scoped lang="scss">
.pano-home {
  padding-top: 10px;
  padding-bottom: 10px;
  @include p-number(3%);

  .pano-list {
    @include flex(space-between, center, wrap);

    .pano-list-item {
      width: 20%;
      margin-top: 10px;

      .pano-list-header {
        @include flex(space-between, center, null);
      }
    }
  }
}
</style>
<style>
</style>
