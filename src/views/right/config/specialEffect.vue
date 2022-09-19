<script setup lang="ts">
import { ResultProps } from "@/interface/Common";
import api from "@/services/api";
import appStore from "@/store";
import { ElMessage } from "element-plus";
import { storeToRefs } from "pinia";
import ProgressItem from "@/components/progressItem.vue";
const { configNum } = storeToRefs(appStore.commonStore);
const { sceneConfig, pano } = storeToRefs(appStore.panoStore);
const { setSceneConfig } = appStore.panoStore;
const specialArray = ref<any>("");
const specialKey = ref<string>("");
const skyUrl = ref<string>("");
const groundUrl = ref<string>("");
const skyPercent = ref<number>(50);
const skyScale = ref<string>("1.0");
const groundPercent = ref<number>(50);
const groundScale = ref<string>("1.0");
const imageList = ref<any>([]);
onMounted(() => {
  getImage();
});
const getImage = async () => {
  const imageRes = (await api.request.get("media", {
    type: "image",
    page: 1,
    limit: 500,
  })) as ResultProps;
  if (imageRes.msg === "OK") {
    console.log(imageRes.data);
    imageList.value = [...imageRes.data];
  }
};
const getSpecial = async () => {
  const specialRes = (await api.request.get("effect", {})) as ResultProps;
  if (specialRes.msg === "OK") {
    specialArray.value = [...specialRes.data];
    if (sceneConfig.value?.specialEffect) {
      let index = specialArray.value.findIndex((item) => {
        //@ts-ignore
        return item._key === sceneConfig.value.specialEffect._key;
      });
      console.log(index);
      if (index !== -1) {
        specialKey.value = sceneConfig.value.specialEffect._key;
        pano.value.call(`addplugin(special)`);
        pano.value.set(
          `plugin[special].url`,
          "https://cdn-3d.qingtime.cn/snow.js"
        );
        console.log(specialArray.value[index].mode);
        if (specialArray.value[index].mode === "rain") {
          console.log("雨");
          pano.value.set(`plugin[special].mode`, "rain");
          pano.value.call(`rain()`);
        } else {
          if (specialArray.value[index].url) {
            pano.value.set(`plugin[special].mode`, "image");
            pano.value.set(
              `plugin[special].imageurl`,
              specialArray.value[index].url
            );
          }
          pano.value.call(`snowballs()`);
        }
        setSceneConfig({
          specialEffect: {
            mode: specialArray.value[index].mode,
            url: specialArray.value[index].url,
            _key: specialKey.value,
          },
          _key: sceneConfig.value?._key,
        });
      }
    }
    // pano.value.call(`addplugin(snow)`);
    // pano.value.set(`plugin[snow].url`, "https://cdn-3d.qingtime.cn/snow.js");
    // pano.value.set(`plugin[snow].floor`, "0.7");
    // pano.value.call(`snowballs(./hotspot.png)`);
  }
};
const removeSpecial = () => {
  pano.value.call(`removeplugin(special)`);
};
const addShade = (url, type) => {
  console.log(url, type);
  pano.value.call(`addhotspot(${type}logo)`);
  pano.value.set(`hotspot[${type}logo].url`, url);
  pano.value.set(`hotspot[${type}logo].keep`, "true");
  pano.value.set(`hotspot[${type}logo].atv`, type === "sky" ? "-90" : "90");
  pano.value.set(`hotspot[${type}logo].ath`, "0");
  pano.value.set(`hotspot[${type}logo].scale`, "1.0");
};
const removeShade = () => {
  pano.value.call(`removehotspot(skylogo)`);
  pano.value.call(`removehotspot(groundlogo)`);
};

const changeSpecial = (key) => {
  let index = specialArray.value.findIndex((item) => {
    return item._key === key;
  });
  if (index !== -1) {
    removeSpecial();
    pano.value.call(`addplugin(special)`);
    pano.value.set(`plugin[special].url`, "https://cdn-3d.qingtime.cn/snow.js");
    if (specialArray.value[index].mode === "rain") {
      pano.value.call(`rain()`);
    } else {
      if (specialArray.value[index].url) {
        pano.value.set(`plugin[special].mode`, "image");
        pano.value.set(
          `plugin[special].imageurl`,
          specialArray.value[index].url
        );
      }
      pano.value.call(`snowballs()`);
    }
    setSceneConfig({
      specialEffect: {
        mode: specialArray.value[index].mode,
        url: specialArray.value[index].url,
        _key: specialArray.value[index]._key,
      },
      _key: sceneConfig.value?._key,
    });
  } else {
    pano.value.call(`removeplugin(special)`);
    setSceneConfig({ specialEffect: {}, _key: sceneConfig.value?._key });
  }
};
const changeShade = (type, url) => {
  // if (sceneConfig.value?.shade) {

  let obj = { ...sceneConfig.value?.shade };
  obj = {
    ...obj,
    [type]: { ...[type], url: url },
  };
  if (url) {
    addShade(url, type);
  } else {
    pano.value.call(`removehotspot(${type}logo)`);
  }
  if (!obj.sky.url && !obj.ground.url) {
    obj = {};
  }
  setSceneConfig({ shade: { ...obj }, _key: sceneConfig.value?._key });
  // }
};
const changePercent = (percent, type) => {
  if (type === "sky") {
    skyScale.value = (percent / 50).toFixed(1);
    pano.value.set(`hotspot[${type}logo].scale`, skyScale.value);
    setSceneConfig({
      shade: {
        ...sceneConfig.value?.shade,
        sky: { ...sceneConfig.value?.shade.sky, scale: skyScale.value },
      },
      _key: sceneConfig.value?._key,
    });
  } else {
    groundScale.value = (percent / 50).toFixed(1);
    pano.value.set(`hotspot[${type}logo].scale`, groundScale.value);
    setSceneConfig({
      shade: {
        ...sceneConfig.value?.shade,
        ground: { ...sceneConfig.value?.shade.sky, scale: groundScale.value },
      },
      _key: sceneConfig.value?._key,
    });
  }
};
//{
//   sky: { scale: "1.0", url: "" },
//   ground: { scale: "1.0", url: "" },
// },
watch(
  configNum,
  (newNum) => {
    console.log(newNum);
    if (newNum === "3") {
      getSpecial();
      if (sceneConfig.value?.shade) {
        if (sceneConfig.value?.shade?.sky?.url) {
          addShade(sceneConfig.value.shade.sky.url, "sky");
          skyUrl.value = sceneConfig.value.shade.sky.url;
          let scale = sceneConfig.value.shade.sky.scale;
          console.log(+scale * 50);
          skyPercent.value = +scale * 50;
          skyScale.value = scale;
        }
        if (sceneConfig.value?.shade?.ground?.url) {
          addShade(sceneConfig.value?.shade?.ground?.url, "ground");
          groundUrl.value = sceneConfig.value.shade.ground.url;
          let scale = sceneConfig.value.shade.ground.scale;
          groundPercent.value = +scale * 50;
          groundScale.value = scale;
        }
      }
    } else {
      removeSpecial();
      removeShade();
    }
  },
  { immediate: true }
);
</script>
<template>
  <div class="pano-specialEffect">
    <div class="pano-item">
      <div class="pano-item-title" style="width: 100%">页面特效</div>
      <el-select
        v-model="specialKey"
        placeholder="请选择类型"
        @change="changeSpecial"
      >
        <el-option :key="''" :label="'无'" :value="''" />
        <el-option
          v-for="item in specialArray"
          :key="item._key"
          :label="item.name"
          :value="item._key"
        />
      </el-select>
    </div>
    <div class="pano-item">
      <div class="pano-item-title" style="width: 100%">天空遮罩</div>
      <!-- <div class="pano-item-box"></div> -->
      <el-select
        v-model="skyUrl"
        placeholder="请选择天空遮罩"
        @change="(val) => changeShade('sky', val)"
      >
        <el-option :key="''" :label="'无'" :value="''" />
        <el-option
          v-for="item in imageList"
          :key="item.url"
          :label="item.name"
          :value="item.url"
        />
      </el-select>
    </div>
    <div class="pano-item">
      <div class="pano-item-title" style="width: 100%">缩放</div>
      <div class="pano-item-progress">
        <ProgressItem
          :percent="skyPercent"
          @changePercent="(percent) => changePercent(percent, 'sky')"
        />
        <div style="margin-bottom: 5px">{{ skyScale }}</div>
      </div>
    </div>
    <div class="pano-item">
      <div class="pano-item-title" style="width: 100%">地面遮罩</div>
      <el-select
        v-model="groundUrl"
        placeholder="请选择地面遮罩"
        @change="(val) => changeShade('ground', val)"
      >
        <el-option :key="''" :label="'无'" :value="''" />
        <el-option
          v-for="item in imageList"
          :key="item.url"
          :label="item.name"
          :value="item.url"
        />
      </el-select>
    </div>
    <div class="pano-item">
      <div class="pano-item-title" style="width: 100%">缩放</div>
      <div class="pano-item-progress">
        <ProgressItem
          :percent="groundPercent"
          @changePercent="(percent) => changePercent(percent, 'ground')"
        />
        <div style="margin-bottom: 5px">{{ groundScale }}</div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.pano-specialEffect {
  width: 100%;
  height: calc(100vh - 120px);
  padding: 5px 10px;
  box-sizing: border-box;
}
</style>
<style></style>
