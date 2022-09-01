<script setup lang="ts">
import appStore from "@/store";
import { ElMessage } from "element-plus";
import { ArrowLeft } from "@element-plus/icons-vue";
import { storeToRefs } from "pinia";
import api from "@/services/api";
import { ResultProps } from "@/interface/Common";
import Preview from "@/views/preview.vue";
const { setLeftNum, setHeaderNum, setPreviewVisible } = appStore.commonStore;
const { leftNum, headerNum, previewVisible } = storeToRefs(
  appStore.commonStore
);
const { hotspotIndex, pano, panoConfig, sceneConfig } = storeToRefs(
  appStore.panoStore
);
const { setHotspotIndex } = appStore.panoStore;
const { hotspotObj, layerObj } = storeToRefs(appStore.controlStore);
const { setHotspotConfig, setLayerConfig, setHotspotObj, setLayerObj } =
  appStore.controlStore;

const activeIndex = ref("1");

onMounted(() => {
  window.addEventListener("setItemEvent", function (e: any) {
    console.log(e.key);
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
        case "viewPoint":
          index = 8;
          break;
      }
      console.log(index);
      setHotspotIndex(index);
      localStorage.removeItem("targetlayerName");
    }
  });
});

const getHotspot = () => {
  // if (hotspotObj.value) {
  for (let key in hotspotObj.value) {
    let value = hotspotObj.value[key];
    let name = value.name;
    console.log(name);
    pano.value.call(`addhotspot(${name})`);
    pano.value.set(`hotspot[${name}].url`, value.url);
    if (value.logoType === "gif") {
      pano.value.set(`hotspot[${name}].renderer`, "css3d");
    }
    pano.value.set(`hotspot[${name}].atv`, value.atv);
    pano.value.set(`hotspot[${name}].ath`, value.ath);
    pano.value.set(
      `hotspot[${name}].onclick`,
      `getHotspotName(${name},'hotspot')`
    );
    pano.value.set(`hotspot[${name}].scale`, value.scale ? value.scale : "0.1");
    pano.value.set(`hotspot[${name}].ondown`, "draghotspot()");
    if (hotspotObj.value[key].title) {
      let layerName = name + "text";
      pano.value.call(`addlayer(${layerName})`);
      pano.value.set(`layer[${layerName}].html`, hotspotObj.value[key].title);
      pano.value.set(`layer[${layerName}].type`, "text");
      pano.value.set(`layer[${layerName}].align`, "top");
      pano.value.set(
        `layer[${layerName}].css`,
        "font-family:Arial; font-size:16px; color:#000000;"
      );
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
    if (value.type === "text") {
      pano.value.call(`addhotspot(${name})`);
      pano.value.set(`hotspot[${name}].type`, "text");
      pano.value.set(`hotspot[${name}].html`, value.text);
      pano.value.set(`hotspot[${name}].atv`, value.atv);
      pano.value.set(`hotspot[${name}].ath`, value.ath);
      pano.value.set(`hotspot[${name}].align`, "center");
      pano.value.set(
        `hotspot[${name}].css`,
        "font-family:Arial; font-size:16px; color:#000000;"
      );
      pano.value.set(`hotspot[${name}].padding`, "10");
      pano.value.set(`hotspot[${name}].ondown`, "draghotspot()");
      pano.value.set(`hotspot[${name}].onclick`, `getLayerName(${name})`);
    } else if (layerObj.value[key].type === "image") {
      pano.value.call(`addlayer(${name})`);
      pano.value.set(`layer[${name}].url`, value.imageList[0]);
      pano.value.set(`layer[${name}].x`, value.x);
      pano.value.set(`layer[${name}].y`, value.y);
      pano.value.set(`layer[${name}].align`, "center");
      pano.value.set(`layer[${name}].ondown`, "draglayer()");
      pano.value.set(`layer[${name}].onclick`, `getLayerName(${name})`);
    }
  }
};
const removeHotspot = () => {
  if (hotspotObj.value) {
    let newHostObj = { ...hotspotObj.value };
    for (let key in hotspotObj.value) {
      console.log(hotspotObj.value[key]);

      newHostObj[key].ath = pano.value.get(
        `hotspot[${newHostObj[key].name}].ath`
      )
        ? pano.value.get(`hotspot[${newHostObj[key].name}].ath`)
        : newHostObj[key].ath;
      newHostObj[key].atv = pano.value.get(
        `hotspot[${newHostObj[key].name}].atv`
      )
        ? pano.value.get(`hotspot[${newHostObj[key].name}].atv`)
        : newHostObj[key].atv;
      pano.value.call(`removehotspot(${newHostObj[key].name},true)`);
      if (newHostObj[key].title) {
        pano.value.call(`removelayer(${newHostObj[key].name}text,true)`);
      }
    }
    setHotspotObj(newHostObj);
  }
};
const removeLayer = () => {
  let newLayerObj = { ...layerObj.value };
  for (let key in layerObj.value) {
    console.log(layerObj.value[key]);
    if (newLayerObj[key].type === "text") {
      newLayerObj[key].ath = pano.value.get(
        `hotspot[${newLayerObj[key].name}].ath`
      )
        ? pano.value.get(`hotspot[${newLayerObj[key].name}].ath`)
        : newLayerObj[key].ath;
      newLayerObj[key].atv = pano.value.get(
        `hotspot[${newLayerObj[key].name}].atv`
      )
        ? pano.value.get(`hotspot[${newLayerObj[key].name}].atv`)
        : newLayerObj[key].atv;
      pano.value.call(`removehotspot(${newLayerObj[key].name})`);
    } else if (newLayerObj[key].type === "image") {
      console.log();
      newLayerObj[key].x = pano.value.get(`layer[${newLayerObj[key].name}].x`)
        ? pano.value.get(`layer[${newLayerObj[key].name}].x`)
        : newLayerObj[key].y;
      newLayerObj[key].y = pano.value.get(`layer[${newLayerObj[key].name}].y`)
        ? pano.value.get(`layer[${newLayerObj[key].name}].y`)
        : newLayerObj[key].y;
      pano.value.call(`removelayer(${newLayerObj[key].name})`);
    }
  }
  setLayerObj(newLayerObj);
};
const chooseHotspot = (index) => {
  setHeaderNum(3);
  setHotspotIndex(index);
  createHotspot(index);
};
const chooseControl = (index) => {
  setHeaderNum(4);
  setHotspotIndex(index);
  createControl(index);
};
const createHotspot = (index) => {
  let name = "hotspot" + new Date().getTime();
  let atv = sceneConfig.value?.viewAngle?.vlookat
    ? sceneConfig.value.viewAngle.vlookat
    : 0;
  let ath = sceneConfig.value?.viewAngle?.hlookat
    ? sceneConfig.value.viewAngle.hlookat
    : 0;
  pano.value.call(`addhotspot(${name})`);
  pano.value.set(
    `hotspot[${name}].url`,
    "https://cdn-pano.qingtime.cn/hotspot(40).png"
  );
  // pano.value.set(`hotspot[hotspot${name}].renderer`, "css3d");
  pano.value.set(`hotspot[${name}].atv`, atv);
  pano.value.set(`hotspot[${name}].ath`, ath);
  pano.value.set(`hotspot[${name}].onclick`, `getHotspotName(${name})`);
  pano.value.set(`hotspot[${name}].scale`, "0.1");
  pano.value.set(`hotspot[${name}].ondown`, "draghotspot()");
  let obj: any = {
    name: name,
    url: "https://cdn-pano.qingtime.cn/hotspot(40).png",
    ath: ath,
    atv: atv,
    title: "",
    state: "unUsed",
    logoType: "normal",
  };
  //0 全景 1 超链接 2 图片 3 视频 4 文本 5 音频
  switch (index) {
    case 0:
      obj = {
        ...obj,
        type: "loadPano",
        sceneKey: "",
        blend: "淡入淡出",
        keepView: "",
      };
      break;
    case 1:
      obj = {
        ...obj,
        type: "loadUrl",
        linkUrl: "",
        //_blank _self
        target: "_self",
      };
      break;
    //click/loop
    case 2:
      obj = {
        ...obj,
        type: "openImage",
        imageList: [],
        switchMode: "loop",
        interval: "2",
      };
      break;
    case 3:
      obj = {
        ...obj,
        type: "openVideo",
        linkUrl: "",
      };
      break;
    case 4:
      obj = {
        ...obj,
        type: "openText",
        text: "",
      };
      break;
    case 5:
      obj = {
        ...obj,
        type: "openAudio",
        mediaUrl: "",
      };
  }
  // setHotspotObj({ name: obj, ...hotspotObj });
  setHotspotConfig({ ...obj });
};
const createControl = (index: number) => {
  let name = "layer" + new Date().getTime();
  let atv = sceneConfig.value?.viewAngle?.vlookat
    ? sceneConfig.value.viewAngle.vlookat
    : 0;
  let ath = sceneConfig.value?.viewAngle?.hlookat
    ? sceneConfig.value.viewAngle.hlookat
    : 0;
  console.log(name);

  let obj: any = {
    name: name,
    state: "unUsed",
  };
  switch (index) {
    case 6:
      pano.value.call(`addhotspot(${name})`);
      pano.value.set(`hotspot[${name}].type`, "text");
      pano.value.set(`hotspot[${name}].align`, "center");
      pano.value.set(
        `hotspot[${name}].css`,
        "font-family:Arial; font-size:16px; color:#000000;"
      );
      pano.value.set(`hotspot[${name}].onclick`, `getLayerName(${name})`);
      pano.value.set(`hotspot[${name}].padding`, "10");
      pano.value.set(`hotspot[${name}].ondown`, "draghotspot()");
      obj = {
        ...obj,
        type: "text",
        linkUrl: "",
        text: "",
        ath: ath,
        atv: atv,
        target: "_self",
      };
      setLayerConfig({ ...obj });
      break;
    case 7:
      pano.value.call(`addlayer(${name})`);
      pano.value.set(`layer[${name}].type`, "image");
      // pano.value.set(`layer[${name}].url`, "hotspot.png");
      pano.value.set(`layer[${name}].align`, "center");
      pano.value.set(`layer[${name}].ondown`, "draglayer()");
      pano.value.set(`layer[${name}].onclick`, `getLayerName(${name})`);
      pano.value.set(`layer[${name}].x`, `getLayerName(${name})`);
      pano.value.set(`layer[${name}].y`, `getLayerName(${name})`);
      obj = {
        ...obj,
        type: "image",
        imageList: [],
        switchMode: "loop",
        interval: "2",
      };
      setLayerConfig({ ...obj });
      break;
    case 8:
      createHotspot(index);
      break;
  }
};

const savePano = async () => {
  let savePanoRes: any = null;
  let saveSceneRes: any = null;
  let hotspot: any = [];
  let layer: any = [];
  let state = false;
  if (panoConfig.value && sceneConfig.value) {
    let panoObj = {
      name: panoConfig.value.name,
      tagKey: panoConfig.value.tagKey,
      labels: panoConfig.value.labels,
      public: panoConfig.value.public,
      location: panoConfig.value.location,
      config: panoConfig.value.config,
      panoKey: panoConfig.value._key,
    };
    savePanoRes = (await api.request.patch("pano", {
      ...panoObj,
    })) as ResultProps;
    if (hotspotObj.value) {
      let newHostObj = { ...hotspotObj.value };
      for (let key in hotspotObj.value) {
        console.log(hotspotObj.value[key]);
        if (newHostObj[key].state === "used") {
          newHostObj[key].ath = pano.value.get(
            `hotspot[${newHostObj[key].name}].ath`
          )
            ? pano.value.get(`hotspot[${newHostObj[key].name}].ath`)
            : newHostObj[key].ath;
          newHostObj[key].atv = pano.value.get(
            `hotspot[${newHostObj[key].name}].atv`
          )
            ? pano.value.get(`hotspot[${newHostObj[key].name}].atv`)
            : newHostObj[key].atv;
          hotspot.push(newHostObj[key]);
        } else {
          state = true;
        }
      }
    }
    if (layerObj.value) {
      let newLayerObj = { ...layerObj.value };
      for (let key in layerObj.value) {
        console.log(layerObj.value[key]);
        if (newLayerObj[key].state === "used") {
          if (newLayerObj[key].type === "text") {
            newLayerObj[key].ath = pano.value.get(
              `hotspot[${newLayerObj[key].name}].ath`
            )
              ? pano.value.get(`hotspot[${newLayerObj[key].name}].ath`)
              : newLayerObj[key].ath;
            newLayerObj[key].atv = pano.value.get(
              `hotspot[${newLayerObj[key].name}].atv`
            )
              ? pano.value.get(`hotspot[${newLayerObj[key].name}].atv`)
              : newLayerObj[key].atv;
          } else if (newLayerObj[key].type === "image") {
            console.log();
            newLayerObj[key].x = pano.value.get(
              `layer[${newLayerObj[key].name}].x`
            )
              ? pano.value.get(`layer[${newLayerObj[key].name}].x`)
              : newLayerObj[key].y;
            newLayerObj[key].y = pano.value.get(
              `layer[${newLayerObj[key].name}].y`
            )
              ? pano.value.get(`layer[${newLayerObj[key].name}].y`)
              : newLayerObj[key].y;
          }
          layer.push(newLayerObj[key]);
          console.log(layer);
        } else {
          state = true;
        }
      }
    }
    if (state) {
      ElMessage({
        message: "尚有控件内容未保存",
        type: "warning",
        duration: 1000,
      });
    }
    let sceneObj = {
      sceneKey: sceneConfig.value._key,
      viewAngle: sceneConfig.value.viewAngle,
      sandTable: sceneConfig.value?.sandTable
        ? sceneConfig.value?.sandTable
        : {},
      // url: "", loop: false
      BGM: sceneConfig.value?.BGM ? sceneConfig.value?.BGM : {},
      specialEffect: sceneConfig.value?.specialEffect
        ? sceneConfig.value?.specialEffect
        : {},
      hotspots: hotspot,
      layers: layer,
      //{
      //   sky: { scale: "1.0", url: "" },
      //   ground: { scale: "1.0", url: "" },
      // },
      shade: sceneConfig.value?.shade ? sceneConfig.value?.shade : {},
    };

    saveSceneRes = (await api.request.patch("scene", {
      ...sceneObj,
    })) as ResultProps;
    if (savePanoRes.msg === "OK" && saveSceneRes.msg === "OK") {
      ElMessage({
        message: "保存成功",
        type: "success",
        duration: 1000,
      });
    }
  }
};
watch(headerNum, (newNum, oldNum) => {
  console.log(newNum);
  if (newNum === 0 || newNum === 1) {
    removeHotspot();
    removeLayer();
  } else if (oldNum === 0 || oldNum === 1) {
    getHotspot();
    getLayer();
  }
});
</script>
<template>
  <div class="pano-editor-header">
    <div class="left">
      <el-icon :size="24" style="margin-right: 5px">
        <ArrowLeft />
      </el-icon>
      全景标题
    </div>
    <div class="center">
      <el-menu
        :default-active="activeIndex"
        mode="horizontal"
        background-color="#373737"
        text-color="#fff"
        class="center-menu"
      >
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
            <template #title>热点</template>
            <el-menu-item index="2-4-1" @click="chooseHotspot(0)"
              >全景切换</el-menu-item
            >
            <el-menu-item index="2-4-2" @click="chooseHotspot(1)"
              >超链接</el-menu-item
            >
            <el-menu-item index="2-4-3" @click="chooseHotspot(2)"
              >图片热点</el-menu-item
            >
            <el-menu-item index="2-4-4" @click="chooseHotspot(3)"
              >视频热点</el-menu-item
            >
            <el-menu-item index="2-4-5" @click="chooseHotspot(4)"
              >文本热点</el-menu-item
            >
            <el-menu-item index="2-4-6" @click="chooseHotspot(5)"
              >音频热点</el-menu-item
            >
          </el-sub-menu>
          <el-menu-item index="2-2" @click="chooseControl(6)"
            >文字</el-menu-item
          >
          <el-menu-item index="2-3" @click="chooseControl(7)"
            >图片</el-menu-item
          >
          <el-menu-item index="2-4" @click="chooseControl(8)"
            >导航点</el-menu-item
          >
        </el-sub-menu>
        <el-menu-item index="3" @click="setHeaderNum(5)">控件</el-menu-item>
      </el-menu>
    </div>
    <div class="right">
      <div @click="setPreviewVisible(true)">预览</div>
      <div @click="savePano">保存</div>
      <div>分享</div>
    </div>
  </div>
  <el-dialog v-model="previewVisible" title="预览" fullscreen destroy-on-close>
    <Preview />
  </el-dialog>
</template>
<style scoped lang="scss">
.pano-editor-header {
  width: 100vw;
  height: 50px;
  position: relative;
  z-index: 1;
  color: #fff;
  background: #373737;
  @include flex(space-between, center, null);

  .left {
    width: 255px;
    height: 50px;
    padding-left: 35px;
    box-sizing: border-box;
    @include flex(null, center, null);
  }

  .center {
    width: calc(100% - 500px);
    box-sizing: border-box;
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
    width: 245px;
    @include flex(center, center, null);

    > div {
      margin-right: 10px;
    }
  }
}
</style>
<style lang="scss"></style>
