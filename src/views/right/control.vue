<script setup lang="ts">
import { uploadFile } from "@/services/util";
import appStore from "@/store";
import { ElMessage } from "element-plus";
import { storeToRefs } from "pinia";
const { hotspotIndex, pano } = storeToRefs(appStore.panoStore);
const { layerConfig } = storeToRefs(appStore.controlStore);
const { setLayerConfig } = appStore.controlStore;

const text = ref<string>("");
const linkUrl = ref<string>("");
const target = ref<number>(0);
const controlNavText = ref<string>("");
const switchMode = ref<number>(0);
const imgTime = ref<string>("5");
const imgList = ref<string[]>([]);

const deleteVisible = ref<boolean>(false);

const changeText = (text) => {
  pano.value.set(`hotspot[${layerConfig.value.name}].html`, text);
  setLayerConfig({ text: text, name: layerConfig.value.name });
};
const changeLayer = (type, value) => {
  setLayerConfig({ [type]: value, name: layerConfig.value.name });
};
const updateMedia = (file, type) => {
  let mimeType = ["image/*"];

  if (file) {
    uploadFile(file, mimeType, async (url, name) => {
      console.log(url);
      if (type === "image") {
        imgList.value.push(url);
        changeLayer("imageList", imgList.value);
        pano.value.set(`layer[${layerConfig.value.name}].url`, imgList.value[0]);
      }
    });
  }
};

const saveLayer = () => {
  if (layerConfig.value) {
    let str = "";
    switch (layerConfig.value.type) {
      case "text":
        str = layerConfig.value.text ? "" : "请输入文字内容";
        break;
      case "image":
        str = layerConfig.value.imageList.length === 0 ? "请上传图片" : "";
        break;
    }
    if (str) {
      ElMessage({
        message: str,
        type: "error",
        duration: 1000,
      });
      return;
    } else {
      ElMessage({
        message: "保存控件内容成功",
        type: "success",
        duration: 1000,
      });
    }
    setLayerConfig({ name: layerConfig.value.name, state: "used" });
  }
};
const delLayer = () => {};
watch(
  layerConfig,
  (newConfig, oldConfig) => {
    console.log(newConfig?.name, oldConfig?.name);
    if (newConfig && newConfig?.name !== oldConfig?.name) {
      switch (newConfig.type) {
        case "text":
          text.value = newConfig.text;
          linkUrl.value = newConfig.linkUrl;
          target.value = newConfig.target === "_blank" ? 1 : 0;
          break;
        //click/loop
        case "image":
          imgList.value = newConfig.imageList;
          switchMode.value = newConfig.switchMode === "loop" ? 1 : 0;
          imgTime.value = newConfig.interval;
          break;
      }
    }
  },
  { immediate: true }
);
</script>
<template>
  <div class="pano-right-control">
    <div class="control-title">
      插入{{
        hotspotIndex === 6 ? "文字" : hotspotIndex === 7 ? "图片" : "导航点"
      }}
    </div>
    <div class="control-container">
      <template v-if="hotspotIndex === 6">
        <div class="pano-item">
          <el-input
            v-model="text"
            :autosize="{ minRows: 6 }"
            type="textarea"
            placeholder="请输入文字内容"
            @input="changeText"
          />
        </div>
        <div class="pano-item">
          <div class="pano-item-title">超链接</div>
          <el-input
            v-model="linkUrl"
            placeholder="请输入链接"
            style="width: 190px"
            @change="(value) => changeLayer('linkUrl', value)"
          />
        </div>
        <div class="pano-item">
          <el-radio-group
            v-model="target"
            :text-color="'#fff'"
            @change="
              (value) => changeLayer('target', value ? '_blank' : '_self')
            "
          >
            <el-radio :label="0">本窗口打开</el-radio>
            <el-radio :label="1">新窗口打开</el-radio>
          </el-radio-group>
        </div>
      </template>
      <template v-if="hotspotIndex === 7">
        <div class="pano-item">
          <div class="pano-item-title" style="width: 100%">
            <div class="upload-button">
              <el-button
                type="success"
                round
                color="#86b93f"
                style="color: #fff"
                @click=""
                >上传</el-button
              >
              <input
                type="file"
                accept="image/*"
                @change="
                  //@ts-ignore
                  updateMedia($event.target.files[0], 'image')
                "
                class="upload-img"
              />
            </div>
          </div>
          <div class="pano-item-imgList">
            <div
              class="img-item"
              v-for="(item, index) in imgList"
              :key="`img${index}`"
            >
              <img :src="item" alt="" />
            </div>
          </div>
        </div>
        <div class="pano-item">
          <div class="pano-item-title" style="width: 100%">轮播</div>
          <el-radio-group
            v-model="switchMode"
            :text-color="'#fff'"
            @change="
              (value) => changeLayer('switchMode', value ? 'click' : 'loop')
            "
          >
            <el-radio :label="0">自动轮播</el-radio>
            <el-radio :label="1">点击切换</el-radio>
          </el-radio-group>
        </div>
        <div class="pano-item">
          <div class="pano-item-title" style="width: 100%">
            <div>自动播放间隔时间</div>
            <div>
              <el-input
                v-model="imgTime"
                placeholder="请输入间隔时间"
                style="width: 80px; margin-right: 10px"
                @change="(value) => changeLayer('interval', value)"
              />秒
            </div>
          </div>
        </div>
        <div class="pano-item">
          <div class="pano-item-title" style="width: 100%">缩放</div>
        </div>
      </template>
      <template v-if="hotspotIndex === 8">
        <div class="pano-item">
          <div class="pano-item-title">当前顺序</div>
          <div>3</div>
        </div>
        <div class="pano-item">
          <div class="pano-item-title" style="width: 100%">
            <div>移动时间</div>
            <div>
              <el-input
                v-model="imgTime"
                placeholder="请输入移动时间"
                style="width: 80px; margin-right: 10px"
              />秒
            </div>
          </div>
        </div>
        <div class="pano-item">
          <div class="pano-item-title" style="width: 100%">
            <div>朗读时间</div>
            <el-button
              type="success"
              round
              color="#86b93f"
              style="color: #fff"
              @click=""
              >听一下</el-button
            >
          </div>
          <el-input
            v-model="controlNavText"
            :autosize="{ minRows: 6 }"
            type="textarea"
            placeholder="请输入文字"
          />
        </div>
      </template>
    </div>
    <div class="control-button">
      <el-button
        type="success"
        round
        color="#86b93f"
        style="color: #fff; width: 40%"
        @click="saveLayer"
        >完成</el-button
      >
      <el-button
        type="info"
        round
        style="width: 40%"
        @click="deleteVisible = true"
        plain
        >删除</el-button
      >
    </div>
    <el-dialog v-model="deleteVisible" title="删除提示" width="30%">
      <div style="padding: 20px">是否删除该控件</div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteVisible = false">取消</el-button>
          <el-button type="primary" @click="delLayer()">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<style scoped lang="scss">
.pano-right-control {
  width: 100%;
  height: 100%;
  @include scroll();
  padding: 10px 20px;
  box-sizing: border-box;
  .control-title {
    width: 100%;
    height: 55px;
    @include flex(center, center, null);
  }
  .control-container {
    width: 100%;
    height: calc(100% - 115px);
    .pano-item-imgList {
      width: 100%;
      min-height: 60px;
      @include flex(null, center, wrap);
      .img-item {
        width: 60px;
        height: 60px;
        img {
          width: 55px;
          height: 55px;
          object-fit: contain;
        }
      }
    }
  }
  .control-button {
    width: 100%;
    height: 55px;
    @include flex(space-between, center, null);
  }
}
</style>
<style lang="scss">
.pano-right-control {
  .el-radio {
    color: #fff;
  }
}
</style>
