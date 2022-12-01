<script setup lang="ts">
import appStore from "@/store";
import { ElMessage } from "element-plus";
import { ArrowLeft } from "@element-plus/icons-vue";
import { storeToRefs } from "pinia";
import api from "@/services/api";
import { ResultProps } from "@/interface/Common";
import useClipboard from "vue-clipboard3";
import router from "@/router";
import useCheckUsed from "@/hooks/useCheckUsed";
import Share from "./common/share.vue";
const { toClipboard } = useClipboard();
const { setLeftNum, setHeaderNum } = appStore.commonStore;
const { headerNum } = storeToRefs(appStore.commonStore);
const { pano, panoConfig, sceneKey, sceneConfig } = storeToRefs(
  appStore.panoStore
);
const { setHotspotIndex } = appStore.panoStore;
const { hotspotObj, layerObj, viewPointArray } = storeToRefs(
  appStore.controlStore
);
const {
  setHotspotConfig,
  setLayerConfig,
  setHotspotObj,
  setLayerObj,
  setViewPointConfig,
} = appStore.controlStore;
const { savePano } = appStore.panoStore;

const activeIndex = ref("1");
const shareVisible = ref<boolean>(false);
const shareUrl = ref<string>("");
onMounted(() => {
  window.addEventListener("setItemEvent", function (e: any) {
    if (e.key === "targetspotName" && e.newValue) {
      let index = 0;
      setHotspotConfig(hotspotObj.value[e.newValue]);
      setHeaderNum(3);
      switch (hotspotObj.value[e.newValue].type) {
        case "loadPano":
          index = 0;
          break;
        case "loadUrl":
          index = 1;
          break;
        //click/loop
        case "openImage":
          index = 2;
          break;
        case "openVideo":
          index = 3;
          break;
        case "openText":
          index = 4;
          break;
        case "openAudio":
          index = 5;
          break;
      }
      setHotspotIndex(index);
      localStorage.removeItem("targetspotName");
    } else if (e.key === "targetlayerName" && e.newValue) {
      let index = 0;
      setLayerConfig(layerObj.value[e.newValue]);
      setHeaderNum(4);
      switch (layerObj.value[e.newValue].type) {
        case "text":
          index = 6;
          break;
        case "image":
          index = 7;
          break;
        //click/loop
      }
      setHotspotIndex(index);
      localStorage.removeItem("targetlayerName");
    } else if (e.key === "targetViewPointNumber" && e.newValue) {
      setViewPointConfig(viewPointArray.value[e.newValue]);
      setHeaderNum(4);
      setHotspotIndex(8);
      localStorage.removeItem("targetViewPointNumber");
    }
  });
});

const getHotspot = () => {
  // if (hotspotObj.value) {
  for (let key in hotspotObj.value) {
    let value = hotspotObj.value[key];
    let name = value.name;
    pano.value.call(`addhotspot(${name})`);
    pano.value.set(`hotspot[${name}].url`, value.url);
    if (value.logoType === "gif") {
      pano.value.set(`hotspot[${name}].renderer`, "css3d");
    }
    pano.value.set(`hotspot[${name}].atv`, value.atv);
    pano.value.set(`hotspot[${name}].ath`, value.ath);
    pano.value.set(`hotspot[${name}].onclick`, `getHotspotName(${name})`);
    pano.value.set(`hotspot[${name}].scale`, value.scale ? value.scale : "1.0");
    pano.value.set(`hotspot[${name}].ondown`, "draghotspot()");
    if (hotspotObj.value[key].title) {
      let layerName = name + "text";
      pano.value.call(`addlayer(${layerName})`);
      pano.value.set(`layer[${layerName}].html`, hotspotObj.value[key].title);
      pano.value.set(`layer[${layerName}].type`, "text");
      pano.value.set(`layer[${layerName}].align`, "top");
      pano.value.set(`layer[${layerName}].css`, "color:#FFFFFF;font-size:14px");
      pano.value.set(`layer[${layerName}].txtshadow`, "1 1 2.0 0x000000 0.5");
      pano.value.set(`layer[${layerName}].bg`, "false");
      pano.value.set(`layer[${layerName}].y`, "-20");
      pano.value.set(`layer[${layerName}].padding`, "3");
      pano.value.set(`layer[${layerName}].parent`, `hotspot[${name}]`);
    }
  }
  // }
};
const getLayer = () => {
  for (let key in layerObj.value) {
    let value = layerObj.value[key];
    let name = value.name;
    pano.value.call(`addhotspot(${name})`);
    if (value.type === "text") {
      pano.value.set(`hotspot[${name}].type`, "text");
      pano.value.set(`hotspot[${name}].html`, value.text);
      pano.value.call(`assignstyle(hotspot[${name}],'textStyle')`);
      pano.value.set(`hotspot[${name}].css`, "color:#FFFFFF;font-size:14px");
    } else if (layerObj.value[key].type === "image") {
      if (value.imageList && value.imageList[0]) {
        pano.value.set(`hotspot[${name}].url`, value.imageList[0]);
      } else {
        pano.value.set(
          `hotspot[${name}].url`,
          "https://cdn-pano.qingtime.cn/hotspot(55).png"
        );
        pano.value.set(`hotspot[${name}].scale`, "1.0");
      }
      pano.value.set(`hotspot[${name}].rx`, value.rx ? value.rx : "0");
      pano.value.set(`hotspot[${name}].ry`, value.ry ? value.ry : "0");
      pano.value.set(`hotspot[${name}].rz`, value.rz ? value.rz : "0");
    }
    pano.value.set(`hotspot[${name}].scale`, value.scale ? value.scale : "1.0");
    pano.value.set(`hotspot[${name}].atv`, value.atv);
    pano.value.set(`hotspot[${name}].ath`, value.ath);
    pano.value.set(`hotspot[${name}].align`, "center");
    pano.value.set(`hotspot[${name}].ondown`, "draghotspot()");
    pano.value.set(`hotspot[${name}].distorted`, "true");
    pano.value.set(`hotspot[${name}].onclick`, `getLayerName(${name})`);
  }
};
const getViewPoint = () => {
  viewPointArray.value.forEach((item, index) => {
    let name = item.name;
    pano.value.call(`addhotspot(${name})`);
    pano.value.set(`hotspot[${name}].type`, "text");
    pano.value.set(`hotspot[${name}].html`, item.number);
    pano.value.call(`assignstyle(hotspot[${name}],'textStyle')`);
    pano.value.set(`hotspot[${name}].css`, "color:#FFFFFF;font-size:14px");
    pano.value.set(`hotspot[${name}].atv`, item.atv);
    pano.value.set(`hotspot[${name}].ath`, item.ath);
    pano.value.set(`hotspot[${name}].padding`, "8");
    pano.value.set(`hotspot[${name}].ondown`, "draghotspot()");
    pano.value.set(`hotspot[${name}].onclick`, `getViewPointName(${index})`);
  });
};
const removeControl = (obj, type) => {
  if (obj) {
    let newObj = { ...obj };
    for (let key in newObj) {
      pano.value.call(`removehotspot(${newObj[key].name})`);
      if (newObj[key].title) {
        pano.value.call(`removelayer(${newObj[key].name}text)`);
      }
    }
    if (type === "hotspot") {
      setHotspotObj(newObj);
    } else {
      setLayerObj(newObj);
    }
  }
};

const chooseHotspot = (index) => {
  setHeaderNum(3);
  setHotspotIndex(index);
  createHotspot(index);
};
const chooseControl = (index) => {
  setHeaderNum(4);
  setHotspotIndex(index);
  createLayer(index);
};
const createHotspot = (index) => {
  let name = "hotspot" + new Date().getTime();
  let atv = pano.value.get(`view.vlookat`);
  let ath = pano.value.get(`view.hlookat`);
  pano.value.call(`addhotspot(${name})`);
  // pano.value.set(`hotspot[hotspot${name}].renderer`, "css3d");
  pano.value.set(`hotspot[${name}].scale`, "1.0");
  pano.value.set(`hotspot[${name}].atv`, atv);
  pano.value.set(`hotspot[${name}].ath`, ath);
  pano.value.set(`hotspot[${name}].onclick`, `getHotspotName(${name})`);
  pano.value.set(`hotspot[${name}].ondown`, "draghotspot()");
  let obj: any = {
    name: name,
    ath: ath,
    atv: atv,
    title: "",
    state: "unUsed",
    logoType: "normal",
    scale: "1",
  };
  //0 全景 1 超链接 2 图片 3 视频 4 文本 5 音频
  switch (index) {
    case 0:
      pano.value.set(
        `hotspot[${name}].url`,
        "https://cdn-pano.qingtime.cn/hotspot(49).png"
      );
      obj = {
        ...obj,
        url: "https://cdn-pano.qingtime.cn/hotspot(49).png",
        type: "loadPano",
        sceneKey: "",
        blend: "淡入淡出",
        keepView: "",
      };
      break;
    case 1:
      pano.value.set(
        `hotspot[${name}].url`,
        "https://cdn-pano.qingtime.cn/hotspot(43).png"
      );
      obj = {
        ...obj,
        url: "https://cdn-pano.qingtime.cn/hotspot(43).png",
        type: "loadUrl",
        linkUrl: "",
        //_blank _self
        target: "_self",
      };
      break;
    //click/loop
    case 2:
      pano.value.set(
        `hotspot[${name}].url`,
        "https://cdn-pano.qingtime.cn/hotspot(46).png"
      );
      obj = {
        ...obj,
        url: "https://cdn-pano.qingtime.cn/hotspot(46).png",
        type: "openImage",
        imageList: [],
        switchMode: "loop",
        interval: "2",
      };
      break;
    case 3:
      pano.value.set(
        `hotspot[${name}].url`,
        "https://cdn-pano.qingtime.cn/hotspot(45).png"
      );
      obj = {
        ...obj,
        url: "https://cdn-pano.qingtime.cn/hotspot(45).png",
        type: "openVideo",
        linkUrl: "",
      };
      break;
    case 4:
      pano.value.set(
        `hotspot[${name}].url`,
        "https://cdn-pano.qingtime.cn/hotspot(47).png"
      );
      obj = {
        ...obj,
        url: "https://cdn-pano.qingtime.cn/hotspot(47).png",
        type: "openText",
        text: "",
      };
      break;
    case 5:
      pano.value.set(
        `hotspot[${name}].url`,
        "https://cdn-pano.qingtime.cn/hotspot(48).png"
      );
      obj = {
        ...obj,
        url: "https://cdn-pano.qingtime.cn/hotspot(48).png",
        type: "openAudio",
        mediaUrl: "",
      };
  }
  // setHotspotObj({ name: obj, ...hotspotObj });
  setHotspotConfig({ ...obj });
};
const createLayer = (index: number) => {
  let name = "layer" + new Date().getTime();
  let atv = pano.value.get(`view.vlookat`);
  let ath = pano.value.get(`view.hlookat`);

  let obj: any = {
    name: name,
    state: "unUsed",
    ath: ath,
    atv: atv,
  };
  pano.value.call(`addhotspot(${name})`);

  pano.value.set(`hotspot[${name}].align`, "center");
  pano.value.set(`hotspot[${name}].ondown`, "draghotspot()");
  pano.value.set(`hotspot[${name}].ath`, ath);
  pano.value.set(`hotspot[${name}].atv`, atv);
  switch (index) {
    case 6:
      pano.value.set(`hotspot[${name}].type`, "text");
      pano.value.set(`hotspot[${name}].css`, "color:#FFFFFF;font-size:14px");
      pano.value.call(`assignstyle(hotspot[${name}],'textStyle')`);
      pano.value.set(`hotspot[${name}].padding`, "10");
      pano.value.set(`hotspot[${name}].scale`, "1.0");
      pano.value.set(`hotspot[${name}].onclick`, `getLayerName(${name})`);
      obj = {
        ...obj,
        type: "text",
        linkUrl: "",
        text: "",
        target: "_self",
      };
      setLayerConfig({ ...obj });
      break;
    case 7:
      pano.value.set(`hotspot[${name}].type`, "image");
      pano.value.set(`hotspot[${name}].onclick`, `getLayerName(${name})`);
      pano.value.set(
        `hotspot[${name}].url`,
        "https://cdn-pano.qingtime.cn/hotspot(55).png"
      );
      pano.value.set(`hotspot[${name}].scale`, "1.0");
      pano.value.set(`hotspot[${name}].distorted`, "true");

      obj = {
        ...obj,
        type: "image",
        imageList: [],
        switchMode: "loop",
        interval: "2",
        scale: "1.0",
        rx: "0",
        ry: "0",
        rz: "0",
      };
      setLayerConfig({ ...obj });
      break;
    case 8:
      pano.value.set(`hotspot[${name}].type`, "text");
      pano.value.set(`hotspot[${name}].css`, "color:#FFFFFF;font-size:14px");
      pano.value.call(`assignstyle(hotspot[${name}],'textStyle')`);
      pano.value.set(`hotspot[${name}].padding`, "8");
      pano.value.set(`hotspot[${name}].html`, viewPointArray.value.length + 1);
      pano.value.set(`hotspot[${name}].onclick`, `getViewPointName(${index})`);
      obj = {
        ...obj,
        number: viewPointArray.value.length + 1,
        interval: "2",
      };
      setViewPointConfig({
        ...obj,
      });
      break;
  }
};

const sharePano = (item) => {
  shareVisible.value = true;
  shareUrl.value = `${window.location.protocol}//${window.location.host}/#/preview/${panoConfig.value?._key}/${sceneKey.value}`;
};
watch(headerNum, (newNum, oldNum) => {
  console.log(newNum);
  activeIndex.value = newNum + "";
  if (newNum === 0 || newNum === 1) {
    removeControl(hotspotObj.value, "hotspot");
    removeControl(layerObj.value, "layer");
    // pano.value.call("webvr_hide_all_layers");
    // pano.value.call("webvr_show_all_hotspots");
  } else if (oldNum === 0 || oldNum === 1) {
    getHotspot();
    getLayer();
    getViewPoint();
    // pano.value.call("webvr_restore_layers");
    // pano.value.call("webvr_restore_hotspots");
  }
});
watch(
  [hotspotObj, layerObj, viewPointArray],
  (
    [newHotspotObj, newLayerObj, newViewPointArray],
    [oldHotspotObj, oldLayerObj, oldViewPointArray]
  ) => {
    if (headerNum.value !== 0 && headerNum.value !== 1) {
      if (newHotspotObj && !oldHotspotObj) {
        getHotspot();
      }
      if (newLayerObj && !oldLayerObj) {
        getLayer();
      }
      if (newViewPointArray && !oldViewPointArray) {
        getViewPoint();
      }
    }
  },
  { immediate: true }
);
// watch(
//   [sceneConfig,pano],
//   (newConfig,newPano) => {
//     if (newConfig&&newPano) {
//       getHotspot();
//       getLayer();
//       getViewPoint();
//     }
//   },
//   { immediate: true }
// );
</script>
<template>
  <div class="pano-editor-header">
    <div class="left" @click="$router.push('/view')">
      <el-icon :size="24" style="margin-right: 5px">
        <ArrowLeft />
      </el-icon>
      <div class="single-to-long" style="width: 145px">
        {{ panoConfig?.name ? panoConfig?.name : "全景" }}
      </div>
    </div>
    <div class="center">
      <el-menu :active="activeIndex" mode="horizontal" class="center-menu">
        <el-menu-item
          index="1"
          @click="
            setHeaderNum(0);
            setLeftNum(0);
          "
        >
          项目设置</el-menu-item
        >
        <el-sub-menu index="2">
          <template #title
            ><span
              @click="
                setHeaderNum(2);
                getHotspot();
              "
              >插入</span
            ></template
          >
          <el-sub-menu index="2-1">
            <template #title
              ><iconpark-icon
                name="control1"
                :size="20"
                style="margin-right: 8px"
                color="#333"
              />热点</template
            >
            <el-menu-item index="2-4-1" @click="chooseHotspot(0)">
              <iconpark-icon
                name="hotspot1"
                :size="20"
                style="margin-right: 8px"
                color="#333"
              />全景切换</el-menu-item
            >
            <el-menu-item index="2-4-2" @click="chooseHotspot(1)"
              ><iconpark-icon
                name="hotspot2"
                :size="20"
                style="margin-right: 8px"
                color="#333"
              />超链接</el-menu-item
            >
            <el-menu-item index="2-4-3" @click="chooseHotspot(2)"
              ><iconpark-icon
                name="hotspot3"
                :size="20"
                style="margin-right: 8px"
                color="#333"
              />图片热点</el-menu-item
            >
            <el-menu-item index="2-4-4" @click="chooseHotspot(3)"
              ><iconpark-icon
                name="hotspot4"
                :size="20"
                style="margin-right: 8px"
                color="#333"
              />视频热点</el-menu-item
            >
            <el-menu-item index="2-4-5" @click="chooseHotspot(4)"
              ><iconpark-icon
                name="hotspot5"
                :size="20"
                style="margin-right: 8px"
                color="#333"
              />文本热点</el-menu-item
            >
            <el-menu-item index="2-4-6" @click="chooseHotspot(5)"
              ><iconpark-icon
                name="hotspot6"
                :size="20"
                style="margin-right: 8px"
                color="#333"
              />音频热点</el-menu-item
            >
          </el-sub-menu>
          <el-divider border-style="dashed" />
          <el-menu-item index="2-2" @click="chooseControl(6)"
            ><iconpark-icon
              name="control2"
              :size="20"
              style="margin-right: 8px"
              color="#333"
            />文字</el-menu-item
          >
          <el-menu-item index="2-3" @click="chooseControl(7)"
            ><iconpark-icon
              name="control3"
              :size="20"
              style="margin-right: 8px"
              color="#333"
            />图片</el-menu-item
          >
          <el-menu-item index="2-4" @click="chooseControl(8)"
            ><iconpark-icon
              name="control4"
              :size="20"
              style="margin-right: 8px"
              color="#333"
            />导航点</el-menu-item
          >
        </el-sub-menu>
        <el-menu-item index="3" @click="setHeaderNum(5)">控件</el-menu-item>
      </el-menu>
    </div>
    <div class="right">
      <!-- <div @click="$router.push(`/preview/${panoConfig?._key}/${sceneKey}`)"> -->
      <div @click="savePano('preview')">
        <iconpark-icon
          name="preview"
          :size="24"
          style="margin-right: 2px"
        />预览
      </div>
      <div @click="savePano('save')">
        <iconpark-icon name="save" :size="24" style="margin-right: 2px" />保存
      </div>
      <div @click="sharePano">
        <iconpark-icon name="share" :size="24" />分享
      </div>
    </div>
    <el-dialog v-model="shareVisible" title="分享" :width="'550px'">
      <Share :url="shareUrl" />
    </el-dialog>
  </div>
</template>
<style scoped lang="scss">
.pano-editor-header {
  width: 100vw;
  height: 50px;
  position: absolute;
  left: 0px;
  top: 0px;
  z-index: 2;
  color: #fff;
  background: rgba(30, 30, 30, 0.7);
  @include p-number(15px);
  @include flex(space-between, center, null);

  .left {
    width: 165px;
    height: 50px;
    @include flex(null, center, null);
  }

  .center {
    width: calc(100% - 400px);
    box-sizing: border-box;
    .center-menu {
      background-color: transparent;
      color: #fff;
    }
    // @include flex(center, center, null);
    // > div {
    //   width: 80px;
    //   margin-right: 10px;
    //   cursor: pointer;
    //   @include flex(center, center, null);
    // }
    // .choose-left {
    //   width: 80px;
    //   height: 29px;
    //   background: #86b93f;
    //   border-radius: 8px;
    // }
  }

  .right {
    width: 235px;
    @include flex(flex-end, center, null);
    > div {
      cursor: pointer;
      @include flex(center, center, null);
      margin-right: 12px;
    }
  }
}
</style>
<style lang="scss">
.center {
  .center-menu {
    border: 0px;
    height: 49px;
    .el-sub-menu__title {
      color: #fff;
    }
    .el-menu-item {
      color: #fff;
    }
    .is-active {
      background-color: transparent;
    }
  }
}
.pano-editor {
  .pano-editor-header {
    .el-dialog__body {
      padding: 15px;
    }
  }
}
</style>
