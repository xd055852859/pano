<script setup lang="ts">
import { ResultProps } from "@/interface/Common";
import { MoreFilled } from "@element-plus/icons-vue";
import api from "@/services/api";
import appStore from "@/store";
import axios from "axios";
import { ElMessage } from "element-plus";
import { storeToRefs } from "pinia";
import CommonHeader from "../components/common/header.vue";
import Share from "@/components/common/share.vue";
const router = useRouter();
const dayjs: any = inject("dayjs");

const { clearPano } = appStore.panoStore;
const panoList = ref<any>([]);
const deleteVisible = ref<boolean>(false);
const deleteIndex = ref<number>(0);
const nameVisible = ref<boolean>(false);
const shareVisible = ref<boolean>(false);
const shareUrl = ref<string>("");
const nameInput = ref<string>("");
const panoIndex = ref<number>(0);
const closeRef = ref<any>(null);
const total = ref<number>(0);
const page = ref<number>(1);
onMounted(() => {
  clearPano();
  getPanoList();
});

const delPano = async () => {
  deleteVisible.value = false;
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
};
const getPanoList = async () => {
  const listRes: any = (await api.request.get("pano", {
    page: page.value,
    limit: 30,
  })) as ResultProps;
  if (listRes.msg === "OK") {
    panoList.value = listRes.data.map((item) => {
      item.cover = `${api.File_URL}${item.cover}`;
      item.createTime = dayjs(item.createTime).format("YYYY-MM-DD");
      return item;
    });
    total.value = listRes.total;
  }
};
const scrollPano = (e: any) => {
  //文档内容实际高度（包括超出视窗的溢出部分）
  let scrollHeight = e.target.scrollHeight;
  //滚动条滚动距离
  let scrollTop = e.target.scrollTop;
  //窗口可视范围高度
  let height = e.target.clientHeight;
  if (
    height + scrollTop >= scrollHeight &&
    panoList.value.length < total.value
  ) {
    page.value++;
    getPanoList();
  }
};
const saveName = async () => {
  nameVisible.value = false;
  const saveSceneRes = (await api.request.patch("pano", {
    name: nameInput.value,
    panoKey: panoList.value[panoIndex.value]._key,
  })) as ResultProps;
  if (saveSceneRes.msg === "OK") {
    ElMessage({
      message: "重命名成功",
      type: "success",
      duration: 1000,
    });
    panoList.value[panoIndex.value].name = nameInput.value;
    nameInput.value = "";
  }
};
const sharePano = (item) => {
  shareVisible.value = true;
  shareUrl.value = `${window.location.protocol}//${window.location.host}/#/preview/${item._key}/${item.firstScene}`;
};
</script>
<template>
  <CommonHeader />
  <div class="pano-container" @scroll="scrollPano">
    <div class="pano-list">
      <div
        class="pano-list-item"
        v-for="(item, index) in panoList"
        :key="`pano${index}`"
        @click="$router.push(`/view/pano/${item._key}`)"
      >
        <img :src="item.cover" alt="" />
        <div class="title">
          <div class="top">{{ item.name ? item.name : "全景" }}</div>
          <div class="bottom">
            <div>{{ item.createTime }}</div>
            <div class="right">
              <div class="view" v-if="item.viewNum">
                <iconpark-icon
                  name="pano-view"
                  :size="20"
                  color="#9e9e9e"
                  style="margin-right: 5px"
                />
                {{ item.viewNum }}
              </div>
              <div class="list-close" @click="$event.stopPropagation()">
                <el-dropdown>
                  <el-icon style="cursor: pointer" :size="14">
                    <MoreFilled />
                  </el-icon>

                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item
                        @click="
                          panoIndex = index;
                          nameInput = item.name;
                          nameVisible = true;
                        "
                        >重命名</el-dropdown-item
                      >
                      <el-dropdown-item @click="sharePano(item)"
                        >分享</el-dropdown-item
                      >
                      <el-dropdown-item
                        @click="
                          $router.push(
                            `/preview/${item._key}/${item.firstScene}`
                          )
                        "
                        >预览</el-dropdown-item
                      >
                      <el-dropdown-item
                        @click="
                          $event.stopPropagation();
                          deleteIndex = index;
                          deleteVisible = true;
                        "
                        >删除</el-dropdown-item
                      >
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <el-dialog v-model="deleteVisible" title="删除提示" width="30%">
    <span>是否删除该全景</span>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="deleteVisible = false">取消</el-button>
        <el-button type="success" @click="delPano()">确认</el-button>
      </span>
    </template>
  </el-dialog>
  <el-dialog v-model="nameVisible" title="重命名" width="30%">
    <div style="padding: 20px">
      <el-input v-model="nameInput" placeholder="请输入场景名称" />
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="nameVisible = false">取消</el-button>
        <el-button type="primary" @click="saveName()">确认</el-button>
      </span>
    </template>
  </el-dialog>
  <el-dialog v-model="shareVisible" title="分享" :width="'550px'">
    <Share :url="shareUrl" />
  </el-dialog>
</template>
<style scoped lang="scss">
.pano-container {
  width: 100vw;
  height: calc(100vh - 70px);
  background: #eff0f4;

  @include scroll();
  @include flex(center, null, wrap);
  .pano-list {
    width: 85vw;
    min-height: 100%;
    min-width: 650px;
    box-sizing: border-box;
    padding-top: 20px;
    .pano-list-item {
      width: 100%;
      height: 140px;
      margin-bottom: 20px;
      background-color: #fff;
      position: relative;
      z-index: 1;
      border-radius: 12px;
      overflow: hidden;
      @include flex(space-between, center, wrap);
      img {
        width: 220px;
        height: 140px;
        object-fit: cover;
      }
      .title {
        width: calc(100% - 250px);
        height: 100%;
        .top {
          width: 100%;
          height: calc(100% - 50px);
          @include flex(null, center, null);
        }
        .bottom {
          width: 100%;
          height: 50px;
          font-size: 14px;
          color: #9e9e9e;
          padding-right: 10px;
          box-sizing: border-box;
          @include flex(space-between, center, null);
          .right {
            min-width: 200px;
            height: 100%;
            @include flex(flex-end, center, null);
            .view {
              height: 100%;
              @include flex(center, center, null);
            }
            .list-close {
              width: 30px;
              @include flex(center, center, null);
              opacity: 0;
            }
          }
        }
        &:hover .bottom .right .list-close {
          opacity: 1;
        }
      }
    }
  }
}
</style>
<style lang="scss">
.pano-container {
  .el-dialog__body {
    padding: 15px;
  }
}
</style>
