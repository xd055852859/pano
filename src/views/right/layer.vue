<script setup lang="ts">
import { uploadFile } from "@/services/util";
import appStore from "@/store";
import { Close } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { storeToRefs } from "pinia";
import ProgressItem from "@/components/progressItem.vue";
const { hotspotIndex, pano } = storeToRefs(appStore.panoStore);
const { layerConfig, viewPointConfig, viewPointArray } = storeToRefs(
  appStore.controlStore
);
const { setLayerConfig, setViewPointConfig, setLayerObj, setViewPointArray } =
  appStore.controlStore;
const { setHeaderNum } = appStore.commonStore;

const text = ref<string>("");
const linkUrl = ref<string>("");
const target = ref<number>(0);
const controlNavText = ref<string>("");
const switchMode = ref<number>(0);
const imgTime = ref<string>("2");
const imgList = ref<string[]>([]);
const percent = ref<number>(50);
const deleteVisible = ref<boolean>(false);
const scale = ref<string>("1.0");
const number = ref<number>(0);
const interval = ref<any>(null);
const rx = ref<number>(0);
const ry = ref<number>(0);
const rz = ref<number>(0);
const changeText = (text) => {
  pano.value.set(`hotspot[${layerConfig.value.name}].html`, text);
  setLayerConfig({ text: text, name: layerConfig.value.name });
};
const changeLayer = (type, value) => {
  setLayerConfig({ [type]: value, name: layerConfig.value.name });
};
const changePercent = (percent) => {
  scale.value = (percent / 50).toFixed(1);
  pano.value.set(`hotspot[${layerConfig.value.name}].scale`, scale.value);
  setLayerConfig({ scale: scale.value, name: layerConfig.value.name });
  console.log(scale.value);
};
const updateMedia = (file, type) => {
  let mimeType = ["image/*"];

  if (file) {
    uploadFile(file, mimeType, async (url, name) => {
      console.log(url);
      if (type === "image") {
        imgList.value.push(url);
        changeLayer("imageList", imgList.value);
        pano.value.set(
          `hotspot[${layerConfig.value.name}].url`,
          imgList.value[0]
        );
      }
    });
  }
};
const delImg = (index) => {
  imgList.value.splice(index, 1);
  changeLayer("imageList", imgList.value);
  if (imgList.value.length > 0) {
    pano.value.set(`hotspot[${layerConfig.value.name}].url`, imgList.value[0]);
  }
};
const saveLayer = () => {
  if (layerConfig.value && hotspotIndex.value !== 8) {
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
    setHeaderNum(2);
    setLayerConfig({ name: layerConfig.value.name, state: "used" });
  } else if (viewPointConfig.value && hotspotIndex.value === 8) {
    ElMessage({
      message: "保存控件内容成功",
      type: "success",
      duration: 1000,
    });
    setHeaderNum(2);
    setViewPointConfig({ name: viewPointConfig.value.name, state: "used" });
  }
};
const rotateLayer = (type, step) => {
  let num = type === "rx" ? rx.value : type === "ry" ? ry.value : rz.value;
  console.log(num);
  //rx 上下 ry 前后 rz 左右
  interval.value = setInterval(() => {
    num = num + step;
    switch (type) {
      case "ry":
        ry.value = num;
        pano.value.set(`hotspot[${layerConfig.value.name}].ry`, num);
      case "rx":
        rx.value = num;
        pano.value.set(`hotspot[${layerConfig.value.name}].rx`, num);
      case "rz":
        rz.value = num;
        pano.value.set(`hotspot[${layerConfig.value.name}].rz`, num);
    }
  }, 100);
};
const stopRotateLayer = (type) => {
  clearInterval(interval.value);
  switch (type) {
    case "ry":
      setLayerConfig({ name: layerConfig.value.name, ry: ry.value });
    case "rx":
      setLayerConfig({ name: layerConfig.value.name, rx: rx.value });
    case "rz":
      setLayerConfig({ name: layerConfig.value.name, rx: rz.value });
  }
};
const delLayer = () => {
  deleteVisible.value = false;
  if (hotspotIndex.value !== 8) {
    let obj = { ...layerConfig.value };
    pano.value.call(`removehotspot(${obj.name})`);
    delete obj[layerConfig.value.name];
    setLayerObj({ ...obj });
    setLayerConfig(null);
    setHeaderNum(2);
  } else {
    let obj = { ...viewPointConfig.value };
    let arr = [...viewPointArray.value];
    pano.value.call(`removehotspot(${obj.name})`);
    let index = arr.findIndex(
      (item) => item.name === viewPointConfig.value.name
    );
    if (index !== -1) {
      arr.splice(index, 1);
      arr.map((item, index) => {
        item.number = index + 1;
        console.log(item.name, item.number);
        pano.value.set(`hotspot[${item.name}].html`, index + 1);
        pano.value.set(
          `hotspot[${item.name}].onclick`,
          `getViewPointName(${index})`
        );
        return item;
      });
      setViewPointArray([...arr]);
      setViewPointConfig(null);
      setHeaderNum(2);
    }
  }
};
watch(
  layerConfig,
  (newConfig, oldConfig) => {
    console.log(newConfig?.name, oldConfig?.name);
    if (newConfig && newConfig?.name !== oldConfig?.name) {
      scale.value = newConfig.scale ? newConfig.scale : "1.0";
      percent.value = +scale.value * 50;
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
          rx.value = newConfig.rx ? parseInt(newConfig.rx) : 0;
          ry.value = newConfig.ry ? parseInt(newConfig.ry) : 0;
          rz.value = newConfig.rz ? parseInt(newConfig.rz) : 0;
          break;
      }
    }
  },
  { immediate: true }
);
watch(
  viewPointConfig,
  (newConfig, oldConfig) => {
    console.log(newConfig?.name, oldConfig?.name);
    if (newConfig && newConfig?.name !== oldConfig?.name) {
      scale.value = newConfig.scale ? newConfig.scale : "1.0";
      percent.value = +scale.value * 50;
      imgTime.value = newConfig.interval;
      number.value = newConfig.number;
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
              <el-button type="success" round>上传</el-button>
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
              <div class="list-close">
                <el-icon
                  @click="delImg(index)"
                  style="cursor: pointer"
                  :size="18"
                >
                  <Close />
                </el-icon>
              </div>
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
          <div class="pano-item-title" style="width: 100%">旋转</div>
          <div class="pano-item-button">
            <div
              type="success"
              @mousedown="rotateLayer('ry', 1)"
              @mouseup="stopRotateLayer('ry')"
            >
              <iconpark-icon name="rotate1" :size="30" />
            </div>
            <div
              type="success"
              @mousedown="rotateLayer('ry', -1)"
              @mouseup="stopRotateLayer('ry')"
            >
              <iconpark-icon name="rotate2" :size="30" />
            </div>
            <div
              type="success"
              @mousedown="rotateLayer('rx', 1)"
              @mouseup="stopRotateLayer('rx')"
            >
              <iconpark-icon name="rotate3" :size="30" />
            </div>
            <div
              type="success"
              @mousedown="rotateLayer('rx', -1)"
              @mouseup="stopRotateLayer('rx')"
            >
              <iconpark-icon name="rotate4" :size="30" />
            </div>
            <div
              type="success"
              @mousedown="rotateLayer('rz', 1)"
              @mouseup="stopRotateLayer('rz')"
            >
              <iconpark-icon name="rotate5" :size="30" />
            </div>
            <div
              type="success"
              @mousedown="rotateLayer('rz', -1)"
              @mouseup="stopRotateLayer('rz')"
            >
              <iconpark-icon name="rotate6" :size="30" />
            </div>
          </div>
        </div>
        <div class="pano-item">
          <div class="pano-item-title" style="width: 100%">缩放</div>
          <div class="pano-item-progress">
            <ProgressItem :percent="percent" @changePercent="changePercent" />
            <div style="margin-bottom: 5px">{{ scale }}</div>
          </div>
        </div>
      </template>
      <template v-if="hotspotIndex === 8">
        <div class="pano-item">
          <div class="pano-item-title">当前顺序</div>
          <div>{{ number }}</div>
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
        <!-- <div class="pano-item">
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
        </div> -->
      </template>
    </div>
    <div class="control-button">
      <el-button type="success" round style="width: 40%" @click="saveLayer"
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
          <el-button type="success" @click="delLayer()">确认</el-button>
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
        margin-right: 10px;
        position: relative;
        z-index: 1;
        img {
          width: 55px;
          height: 55px;
          object-fit: contain;
        }
        .list-close {
          position: absolute;
          z-index: 2;
          top: 0px;
          right: 2px;
          display: none;
        }
        &:hover .list-close {
          display: block;
        }
      }
    }
  }
  .control-button {
    width: 100%;
    height: 55px;
    @include flex(space-between, center, null);
  }
  .pano-item-button {
    width: 100%;
    @include flex(space-between, center, wrap);
    > div {
      width: 50%;
      height: 45px;
      line-height: 45px;
      text-align: center;
      cursor: pointer;
    }
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
