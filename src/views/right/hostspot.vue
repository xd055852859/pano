<script setup lang="ts">
import { ResultProps } from "@/interface/Common";
import { PanoTag } from "@/interface/pano";
import { Check, Delete, Close } from "@element-plus/icons-vue";
import api from "@/services/api";
import { uploadFile } from "@/services/util";
import appStore from "@/store";
import { ElMessage } from "element-plus";
import { storeToRefs } from "pinia";
import ProgressItem from "@/components/progressItem.vue";
const { hotspotIndex, pano, panoConfig, sceneConfig, sceneList } = storeToRefs(
  appStore.panoStore
);
const { hotspotConfig, hotspotObj } = storeToRefs(appStore.controlStore);
const { setHotspotConfig, setHotspotObj } = appStore.controlStore;
const { setHeaderNum } = appStore.commonStore;

const title = ref<string>("");
const hotspotType = ref<string>("");
const linkUrl = ref<string>("");
const sceneKey = ref<string>("");
const blend = ref<string>("");
const keepView = ref<boolean>(false);

const target = ref<number>(0);

const switchMode = ref<number>(0);
const imgList = ref<string[]>([]);

const imgTime = ref<string>("2");

const videoUrl = ref<string>("");

const text = ref<string>("");

const mediaUrl = ref<string>("");

const musicList = ref<any>(null);
const videoList = ref<any>(null);

const typeName = ref<string>("");
const typeArray = ref<PanoTag[]>([]);
const logoArray = ref<any>([]);
const logo = ref<string>("");
const logoVisible = ref<boolean>(false);
const deleteVisible = ref<boolean>(false);
const percent = ref<number>(50);
const scale = ref<string>("1.0");
const delIndex = ref<number>(0);
const deleteMediaVisible = ref<boolean>(false);
const changeTypeArray = [
  {
    label: "淡入淡出",
    value: "淡入淡出",
  },
  {
    label: "缩放过渡",
    value: "缩放过渡",
  },
  {
    label: "黑场过渡",
    value: "黑场过渡",
  },
  {
    label: "白场过渡",
    value: "白场过渡",
  },
  {
    label: "从右到左",
    value: "从右到左",
  },
  {
    label: "从上至下",
    value: "从上至下",
  },
  {
    label: "对角线",
    value: "对角线",
  },
  {
    label: "圆形展开",
    value: "圆形展开",
  },
  {
    label: "垂直展开",
    value: "垂直展开",
  },
  {
    label: "水平展开",
    value: "水平展开",
  },
  {
    label: "椭圆缩放",
    value: "椭圆缩放",
  },
];

onMounted(() => {
  getPanoType();
  getPanoLogo();
});
const getPanoType = async () => {
  const typeRes = (await api.request.get("tag", {
    name: typeName.value,
  })) as ResultProps;
  if (typeRes.msg === "OK") {
    typeArray.value = typeRes.data.map((item) => {
      return {
        _key: item._key,
        name: item.name,
      };
    });
  }
};
const getPanoLogo = async () => {
  const logoRes = (await api.request.get("media", {
    type: "hotLogo",
    page: 1,
    limit: 100,
  })) as ResultProps;
  if (logoRes.msg === "OK") {
    logoArray.value = [...logoRes.data];
  }
};
const getMusic = async () => {
  const musicRes = (await api.request.get("media", {
    type: "audio",
    page: 1,
    limit: 100,
  })) as ResultProps;
  if (musicRes.msg === "OK") {
    musicList.value = [...musicRes.data];
  }
};
const getVideo = async () => {
  const videoRes = (await api.request.get("media", {
    type: "video",
    page: 1,
    limit: 100,
  })) as ResultProps;
  if (videoRes.msg === "OK") {
    videoList.value = [...videoRes.data];
  }
};
// const getHostspotAth = () => {
//   console.log(pano.value.get("hotspot[hotspot1]"));
//   console.log(pano.value.get("hotspot[hotspot1].ath"));
//   console.log(pano.value.get("hotspot[hotspot1].atv"));
// };
const changeText = (text) => {
  console.log(text);
  let name = hotspotConfig.value.name + "text";
  if (text) {
    console.log(pano.value.get(`layer[${name}]`));
    if (pano.value.get(`layer[${name}]`)) {
      pano.value.set(`layer[${name}].html`, text);
    } else {
      pano.value.call(`addlayer(${name})`);
      pano.value.set(`layer[${name}].html`, text);
      pano.value.set(`layer[${name}].type`, "text");
      pano.value.set(`layer[${name}].align`, "top");
      pano.value.set(`layer[${name}].css`, " color:#FFFFFF;font-size:14px");
      pano.value.set(`layer[${name}].txtshadow`, "1 1 2.0 0x000000 0.5");
      pano.value.set(`layer[${name}].bg`, "false");
      pano.value.set(`layer[${name}].y`, "-20");
      pano.value.set(`layer[${name}].padding`, "3");
      pano.value.set(
        `layer[${name}].parent`,
        `hotspot[${hotspotConfig.value.name}]`
      );
    }
  } else {
    if (pano.value.get(`layer[${name}]`)) {
      pano.value.call(`removelayer(${name})`);
    }
  }
  setHotspotConfig({ title: text, name: hotspotConfig.value.name });
};
const changePercent = (percent) => {
  scale.value = (percent / 50).toFixed(1);
  pano.value.set(`hotspot[${hotspotConfig.value.name}].scale`, scale.value);
  setHotspotConfig({ scale: scale.value, name: hotspotConfig.value.name });
};
const changeHotspot = (type, value, oType?: string, ovalue?: string) => {
  if (hotspotIndex.value === 3) {
    videoUrl.value = videoUrl.value !== value ? value : "";
  } else if (hotspotIndex.value === 5) {
    mediaUrl.value = mediaUrl.value !== value ? value : "";
  }
  setHotspotConfig({ [type]: value, name: hotspotConfig.value.name });
  if (oType) {
    setHotspotConfig({ [oType]: ovalue, name: hotspotConfig.value.name });
    if (oType === "logoType") {
      pano.value.set(`hotspot[${hotspotConfig.value.name}].url`, value);
      pano.value.set(`hotspot[${hotspotConfig.value.name}].renderer`, "css3d");
      pano.value.set(`hotspot[${hotspotConfig.value.name}].scale`, "0.4");
    }
  }
};
const updateMedia = (file, type) => {
  let mimeType =
    type === "image"
      ? ["image/*"]
      : type === "audio"
      ? ["audio/*"]
      : ["video/*"];
  if (file) {
    uploadFile(file, mimeType, async (url, name) => {
      console.log(url);
      if (type === "image") {
        imgList.value.push(url);
        changeHotspot("imageList", imgList.value);
      }
      const createRes = (await api.request.post("media", {
        name: file.name,
        url: url,
        type: type,
      })) as ResultProps;
      if (createRes.msg === "OK") {
        ElMessage({
          message: `上传${type === "audio" ? "音频" : "视频"}成功`,
          type: "success",
          duration: 1000,
        });
        if (type === "audio") {
          musicList.value.push(createRes.data);
        } else {
          videoList.value.push(createRes.data);
        }
      }
    });
  }
};
const delImg = (index) => {
  imgList.value.splice(index, 1);
  changeHotspot("imageList", imgList.value);
};
const deleteMedia = async () => {
  let key = "";
  console.log();
  if (hotspotIndex.value === 5) {
    key = musicList.value[delIndex.value]._key;
    musicList.value.splice(delIndex.value, 1);
  } else if (hotspotIndex.value === 3) {
    key = videoList.value[delIndex.value]._key;
    videoList.value.splice(delIndex.value, 1);
  }
  const mediaRes = (await api.request.delete("media", {
    mediaKey: key,
  })) as ResultProps;
  if (mediaRes.msg === "OK") {
    ElMessage({
      message: `删除${hotspotIndex.value === 5 ? "音乐" : "视频"}成功`,
      type: "success",
      duration: 1000,
    });
    deleteMediaVisible.value = false;
  }
};
const saveHotspot = () => {
  if (hotspotConfig.value) {
    let str = "";
    switch (hotspotConfig.value.type) {
      case "loadPano":
        str = hotspotConfig.value.sceneKey ? "" : "请选择切换场景";
        str = hotspotConfig.value.blend ? "" + str : "请选择切换效果";
        break;
      case "loadUrl":
        str = hotspotConfig.value.linkUrl ? "" : "请输入超链接网址";
        break;
      case "openImage":
        str = hotspotConfig.value.imageList.length === 0 ? "请上传图片" : "";
        break;
      case "openVideo":
        str = hotspotConfig.value.linkUrl ? "" : "请上传视频";
        break;
      case "openText":
        str = hotspotConfig.value.text ? "" : "请输入文本内容";
        break;
      case "openAudio":
        str = hotspotConfig.value.mediaUrl ? "" : "请上传音频";
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
        message: "保存热点内容成功",
        type: "success",
        duration: 1000,
      });
      setHotspotConfig({ name: hotspotConfig.value.name, state: "used" });
      setHeaderNum(2);
    }
  }
};
const delHotspot = () => {
  deleteVisible.value = false;
  let obj = { ...hotspotObj.value };
  pano.value.call(`removehotspot(${hotspotConfig.value.name})`);
  if (pano.value.get(`layer[${hotspotConfig.value.name}text]`)) {
    pano.value.call(`removelayer(${hotspotConfig.value.name}text)`);
  }
  delete obj[hotspotConfig.value.name];
  setHotspotObj({ ...obj });
  setHotspotConfig(null);
  setHeaderNum(2);
};
watch(
  hotspotConfig,
  (newConfig, oldConfig) => {
    console.log(newConfig?.name, oldConfig?.name);
    if (newConfig && newConfig?.name !== oldConfig?.name) {
      logo.value = newConfig.url;
      title.value = newConfig.title;
      scale.value = newConfig.scale ? newConfig.scale : "1.0";
      percent.value = +scale.value * 50;
      switch (newConfig.type) {
        case "loadPano":
          hotspotType.value = "全景切换";
          sceneKey.value = newConfig.sceneKey;
          blend.value = newConfig.blend;
          keepView.value = !!newConfig.keepView;
          break;
        case "loadUrl":
          hotspotType.value = "超链接";
          linkUrl.value = newConfig.linkUrl;
          target.value = newConfig.target === "_blank" ? 1 : 0;
          break;
        //click/loop
        case "openImage":
          hotspotType.value = "图片";
          imgList.value = newConfig.imageList;
          switchMode.value = newConfig.switchMode === "loop" ? 1 : 0;
          imgTime.value = newConfig.interval;
          break;
        case "openVideo":
          hotspotType.value = "视频";
          videoUrl.value = newConfig.linkUrl;
          getVideo();
          break;
        case "openText":
          hotspotType.value = "文本";
          text.value = newConfig.text;
          break;
        case "openAudio":
          hotspotType.value = "音频";
          mediaUrl.value = newConfig.mediaUrl;
          getMusic();
          break;
      }
    }
  },
  { immediate: true }
);
watch(hotspotIndex, () => {});
</script>
<template>
  <div class="pano-right-hostspot">
    <div class="hostspot-title">热点</div>
    <div class="hostspot-container">
      <div class="pano-item">
        <div class="pano-item-title" style="width: 100%">
          类型: {{ hotspotType }}
        </div>
        <div class="pano-item-logo" @click="logoVisible = true">
          <img :src="logo" alt="" />
        </div>
      </div>
      <div class="pano-item">
        <div class="pano-item-title" style="width: 100%">缩放</div>
        <div class="pano-item-progress">
          <ProgressItem :percent="percent" @changePercent="changePercent" />
          <div style="margin-bottom: 5px">{{ scale }}</div>
        </div>
      </div>
      <div class="pano-item">
        <div class="pano-item-title">热点标题</div>
        <el-input
          v-model="title"
          placeholder="请输入标题"
          style="width: 190px"
          @input="changeText"
        />
      </div>
      <template v-if="hotspotIndex === 0">
        <div class="pano-item">
          <div class="pano-item-title">选择跳转场景</div>
          <el-select
            v-model="sceneKey"
            placeholder="请选择类型"
            @change="(value) => changeHotspot('sceneKey', value)"
          >
            <template v-for="item in sceneList" :key="item._key">
              <!-- v-if="item._key !== sceneConfig?._key" -->
              <el-option :label="item.name" :value="item._key" />
            </template>
          </el-select>
        </div>
        <div class="pano-item">
          <div class="pano-item-title">切换效果</div>
          <el-select
            v-model="blend"
            placeholder="请选择类型"
            @change="(value) => changeHotspot('blend', value)"
          >
            <el-option
              v-for="item in changeTypeArray"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
        <div class="pano-item">
          <div class="pano-item-title">切换时，保持当前视角</div>
          <el-checkbox
            v-model="keepView"
            label=""
            @change="
              (value) => changeHotspot('keepView', value ? 'true' : 'false')
            "
          />
        </div>
      </template>
      <template v-if="hotspotIndex === 1">
        <div class="pano-item">
          <div class="pano-item-title">超链接</div>
          <el-input
            v-model="linkUrl"
            placeholder="请输入链接"
            style="width: 190px"
            @change="(value) => changeHotspot('linkUrl', value)"
          />
        </div>
        <div class="pano-item">
          <el-radio-group
            v-model="target"
            :text-color="'#fff'"
            @change="
              (value) => changeHotspot('target', value ? '_blank' : '_self')
            "
          >
            <el-radio :label="0">本窗口打开</el-radio>
            <el-radio :label="1">新窗口打开</el-radio>
          </el-radio-group>
        </div>
      </template>
      <template v-if="hotspotIndex === 2">
        <div class="pano-item">
          <div class="pano-item-title" style="width: 100%">
            <div>图片</div>
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
              (value) => changeHotspot('switchMode', value ? 'click' : 'loop')
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
                @change="(value) => changeHotspot('interval', value)"
              />秒
            </div>
          </div>
        </div>
      </template>
      <template v-if="hotspotIndex === 3">
        <div class="pano-item">
          <div class="pano-item-title" style="width: 100%">
            <div>视频</div>
            <div class="upload-button">
              <el-button type="success" round>上传</el-button>
              <input
                type="file"
                accept="video/*"
                @change="
                  //@ts-ignore
                  updateMedia($event.target.files[0], 'video')
                "
                class="upload-img"
              />
            </div>
          </div>
        </div>
        <div class="pano-item-media">
          <div
            class="pano-media-item"
            v-for="(item, index) in videoList"
            :key="`video${index}`"
            @click="changeHotspot('linkUrl', item.url)"
          >
            <div class="pano-media-name single-to-long">{{ item.name }}</div>
            <div class="pano-media-button">
              <el-icon v-if="videoUrl === item.url" style="margin-left: 10px"
                ><Check
              /></el-icon>
              <el-icon
                v-else
                class="pano-media-delete"
                @click="
                  $event.stopPropagation();
                  delIndex = index;
                  deleteMediaVisible = true;
                "
                ><Delete
              /></el-icon>
            </div>
          </div>
        </div>
      </template>
      <template v-if="hotspotIndex === 4">
        <div class="pano-item">
          <div class="pano-item-title" style="width: 100%">
            <div>文字</div>
          </div>
          <el-input
            v-model="text"
            :autosize="{ minRows: 6 }"
            type="textarea"
            placeholder="请输入文字"
            @change="(value) => changeHotspot('text', value)"
          />
        </div>
      </template>
      <template v-if="hotspotIndex === 5">
        <div class="pano-item">
          <div class="pano-item-title" style="width: 100%">
            <div>音频</div>
            <div class="upload-button">
              <el-button type="success" round>上传</el-button>
              <input
                type="file"
                accept="audio/*"
                @change="
                  //@ts-ignore
                  updateMedia($event.target.files[0], 'audio')
                "
                class="upload-img"
              />
            </div>
          </div>
          <div class="pano-item-media">
            <div
              class="pano-media-item"
              v-for="(item, index) in musicList"
              :key="`music${index}`"
              @click="changeHotspot('mediaUrl', item.url)"
            >
              <div class="pano-media-name single-to-long">{{ item.name }}</div>
              <div class="pano-media-button">
                <el-icon v-if="mediaUrl === item.url" style="margin-left: 10px"
                  ><Check
                /></el-icon>
                <el-icon
                  v-else
                  class="pano-media-delete"
                  @click="
                    $event.stopPropagation();
                    delIndex = index;
                    deleteMediaVisible = true;
                  "
                  ><Delete
                /></el-icon>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
    <div class="hostspot-button">
      <el-button type="success" round style="width: 40%" @click="saveHotspot"
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
      <div style="padding: 20px">是否删除该热点</div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteVisible = false">取消</el-button>
          <el-button type="success" @click="delHotspot()">确认</el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog v-model="logoVisible" title="更换图标" width="45vw">
      <div class="logo-container">
        <div
          class="logo-item"
          v-for="(item, index) in logoArray"
          :key="`logo${index}`"
          @click="
            logo = item.url;
            changeHotspot('url', item.url, 'logoType', item.subType);
          "
        >
          <img :src="item.url" alt="" />
        </div>
      </div>
    </el-dialog>
    <el-dialog v-model="deleteMediaVisible" title="删除提示" width="30%">
      <div style="padding: 20px">
        是否删除该{{ hotspotIndex === 5 ? "音乐" : "视频" }}
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteVisible = false">取消</el-button>
          <el-button type="success" @click="deleteMedia()">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<style scoped lang="scss">
.pano-right-hostspot {
  width: 100%;
  height: 100%;
  .hostspot-title {
    width: 100%;
    height: 45px;
    @include flex(center, center, null);
  }
  .pano-item-logo {
    width: 100%;
    height: 75px;
    @include flex(center, center, null);
    margin-bottom: 10px;
    img {
      height: 100%;
    }
  }
  .hostspot-container {
    width: 100%;
    height: calc(100% - 95px);
    @include scroll();
    @include p-number(20px);
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
    .pano-item-media {
      width: 100%;
      height: calc(100% - 310px);
      @include scroll();
      .pano-media-item {
        width: 100%;
        height: 35px;
        @include flex(space-between, center, null);
        .pano-media-name {
          width: calc(100% - 70px);
          height: 35px;
          line-height: 35px;
        }
        .pano-media-button {
          width: 30px;
          height: 100%;
          @include flex(flex-end, center, null);
          .pano-media-delete {
            display: none;
          }
        }
        &:hover .pano-media-delete {
          display: flex;
        }
      }
    }
  }
  .hostspot-button {
    width: 100%;
    height: 55px;
    @include flex(space-between, center, null);
    @include p-number(10px);
  }
}

.logo-container {
  width: 100%;
  height: 50vh;
  @include scroll();
  @include flex(null, center, flex);
  @include p-number(15px);
  .logo-item {
    width: 10%;
    img {
      width: 80%;
    }
  }
}
</style>
<style lang="scss">
.pano-right-hostspot {
  .el-radio {
    color: #fff;
  }
  .el-dialog {
    background-color: rgba(30, 30, 30, 0.7);
    .el-dialog__title {
      color: #fff;
    }
    .el-dialog__close {
      color: #fff;
    }
    .el-dialog__body {
      color: #fff;
    }
  }
}
</style>
