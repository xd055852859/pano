<script setup lang="ts">
import { ResultProps } from "@/interface/Common";
import api from "@/services/api";
import appStore from "@/store";
import { ElMessage } from "element-plus";
import { storeToRefs } from "pinia";
const { configNum } = storeToRefs(appStore.commonStore);
const { sceneConfig, pano } = storeToRefs(appStore.panoStore);
const { setSceneConfig } = appStore.panoStore;
const specialArray = ref<any>("");
const specialKey = ref<string>("");
const skyUrl = ref<string>("");
const groundUrl = ref<string>("");

const getSpecial = async () => {
  const specialRes = (await api.request.get("effect", {})) as ResultProps;
  if (specialRes.msg === "OK") {
    specialArray.value = [...specialRes.data];
    if (sceneConfig.value?.specialEffect) {
      let index = specialArray.value.findIndex((item) => {
        //@ts-ignore
        return item._key === sceneConfig.value.specialEffect._key;
      });
      if (index !== -1) {
        specialKey.value = sceneConfig.value.specialEffect._key;
        pano.value.call(`addplugin(special)`);
        pano.value.set(
          `plugin[special].url`,
          "https://cdn-3d.qingtime.cn/snow.js"
        );
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
const addShade = (url, type) => {
  console.log(url, type);
  pano.value.call(`addhotspot(${type}logo)`);
  pano.value.set(`hotspot[${type}logo].url`, url);
  pano.value.set(`hotspot[${type}logo].keep`, "true");
  pano.value.set(`hotspot[${type}logo].atv`, type === "sky" ? "-90" : "90");
  pano.value.set(`hotspot[${type}logo].ath`, "0");
  pano.value.set(`hotspot[${type}logo].scale`, "1.0");
};
const changeSpecial = (key) => {
  let index = specialArray.value.findIndex((item) => {
    return item._key === key;
  });
  if (index !== -1) {
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
    [type]: { scale: "1.0", url: url },
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
//{
//   sky: { scale: "1.0", url: "" },
//   ground: { scale: "1.0", url: "" },
// },
watch(
  configNum,
  (newNum) => {
    if (newNum === "4") {
      getSpecial();
      console.log(sceneConfig.value?.shade)
      if (sceneConfig.value?.shade) {
        if (sceneConfig.value?.shade?.sky?.url) {
          addShade(sceneConfig.value?.shade?.sky?.url, "sky");
        }
        if (sceneConfig.value?.shade?.ground?.url) {
          addShade(sceneConfig.value?.shade?.sky?.url, "ground");
        }
      }
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
          :key="'https://cdn-icare.qingtime.cn/湖广填四川.jpg'"
          :label="'天空'"
          :value="'https://cdn-icare.qingtime.cn/湖广填四川.jpg'"
        />
      </el-select>
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
          :key="'https://cdn-icare.qingtime.cn/永嘉之乱.jpg'"
          :label="'地面'"
          :value="'https://cdn-icare.qingtime.cn/永嘉之乱.jpg'"
        />
      </el-select>
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
