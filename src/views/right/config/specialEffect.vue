<script setup lang="ts">
import { ResultProps } from "@/interface/Common";
import api from "@/services/api";
import appStore from "@/store";
import { ElMessage } from "element-plus";
import { storeToRefs } from "pinia";
import ProgressItem from "@/components/progressItem.vue";
import { uploadFile } from "@/services/util";
const { configNum } = storeToRefs(appStore.commonStore);
const { sceneConfig, pano } = storeToRefs(appStore.panoStore);
const { setSceneConfig } = appStore.panoStore;
const specialArray = ref<any>("");
const specialKey = ref<string>("");
const specialName = ref<string>("");
const specialScale = ref<string>("1.0");
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
      if (index !== -1) {
        specialKey.value = sceneConfig.value.specialEffect._key;
        pano.value.call(`addplugin(special)`);
        pano.value.set(
          `plugin[special].url`,
          "https://cdn-3d.qingtime.cn/snow.js"
        );
        if (specialArray.value[index].mode === "rain") {
          pano.value.set(`plugin[special].mode`, "rain");
          pano.value.call(`rain()`);
        } else {
          if (specialArray.value[index].url) {
            pano.value.set(`plugin[special].mode`, "image");
            pano.value.set(
              `plugin[special].imageurl`,
              specialArray.value[index].url
            );
            specialScale.value = sceneConfig.value.specialEffect?.scale
              ? sceneConfig.value.specialEffect.scale
              : "1.0";
            pano.value.set(`plugin[special].imagescale`, specialScale.value);
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
const addShade = (url, type, scale?: string) => {
  pano.value.call(`addhotspot(${type}logo)`);
  pano.value.set(`hotspot[${type}logo].url`, url);
  pano.value.set(`hotspot[${type}logo].keep`, "true");
  pano.value.set(`hotspot[${type}logo].atv`, type === "sky" ? "-90" : "90");
  pano.value.set(`hotspot[${type}logo].ath`, "0");
  pano.value.set(`hotspot[${type}logo].scale`, scale ? scale : "1.0");
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
    specialName.value = specialArray.value[index].name;
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
      pano.value.set(`plugin[special].imagescale`, specialScale.value);
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
    specialName.value = "";
    pano.value.call(`removeplugin(special)`);
    setSceneConfig({ specialEffect: {}, _key: sceneConfig.value?._key });
  }
};
const changeSpecialScale = (scale) => {
  console.log(scale);
  pano.value.set(`plugin[special].imagescale`, scale);
  setSceneConfig({
    specialEffect: {
      ...sceneConfig.value?.specialEffect,
      scale: scale,
    },
    _key: sceneConfig.value?._key,
  });
};
const updateShade = (file, type) => {
  let mimeType = ["image/*"];

  if (file) {
    uploadFile(file, mimeType, async (url) => {
      if (type === "sky") {
        skyUrl.value = url;
      } else {
        groundUrl.value = url;
      }
      changeShade(type, url);
    });
  }
};
const changeShade = (type, url) => {
  // if (sceneConfig.value?.shade) {
  if (url !== "上传") {
    if (type === "sky") {
      setSceneConfig({
        shade: {
          ...sceneConfig.value?.shade,
          sky: { url: skyUrl.value, scale: skyScale.value },
        },
        _key: sceneConfig.value?._key,
      });
    } else {
      setSceneConfig({
        shade: {
          ...sceneConfig.value?.shade,
          ground: { url: groundUrl.value, scale: groundScale.value },
        },
        _key: sceneConfig.value?._key,
      });
    }
    if (url) {
      addShade(url, type);
    } else {
      pano.value.call(`removehotspot(${type}logo)`);
    }
    //
  }
  // }
};
const changePercent = (percent, type) => {
  if (type === "sky") {
    skyScale.value = (percent / 50).toFixed(1);
    pano.value.set(`hotspot[${type}logo].scale`, skyScale.value);
    setSceneConfig({
      shade: {
        ...sceneConfig.value?.shade,
        sky: { url: skyUrl.value, scale: skyScale.value },
      },
      _key: sceneConfig.value?._key,
    });
  } else {
    groundScale.value = (percent / 50).toFixed(1);
    pano.value.set(`hotspot[${type}logo].scale`, groundScale.value);
    setSceneConfig({
      shade: {
        ...sceneConfig.value?.shade,
        ground: { url: groundUrl.value, scale: groundScale.value },
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
    if (newNum === "3") {
      getSpecial();
      if (sceneConfig.value?.shade) {
        console.log(sceneConfig.value?.shade);
        if (sceneConfig.value?.shade?.sky?.url) {
          let scale = sceneConfig.value.shade.sky.scale
            ? sceneConfig.value.shade.sky.scale
            : 1;
          skyPercent.value = +scale * 50;
          skyScale.value = scale;
          addShade(sceneConfig.value.shade.sky.url, "sky", skyScale.value);
          skyUrl.value = sceneConfig.value.shade.sky.url;
        }
        if (sceneConfig.value?.shade?.ground?.url) {
          let scale = sceneConfig.value.shade.ground.scale
            ? sceneConfig.value.shade.ground.scale
            : 1;
          groundPercent.value = +scale * 50;
          groundScale.value = scale;
          addShade(
            sceneConfig.value?.shade?.ground?.url,
            "ground",
            groundScale.value
          );
          groundUrl.value = sceneConfig.value.shade.ground.url;
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
      <div class="pano-item-title" style="width: 100%">
        <div>页面特效</div>
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
    </div>
    <div
      class="pano-item"
      v-if="specialName && specialName !== '下雨' && specialName !== '下雪'"
      style="min-height: 30px"
    >
      <el-radio-group
        v-model="specialScale"
        @change="changeSpecialScale"
        style="margin: 0px 10px 5px 10px"
      >
        <el-radio :label="'0.3'" style="color: #fff">小</el-radio>
        <el-radio :label="'0.5'" style="color: #fff">中</el-radio>
        <el-radio :label="'1.0'" style="color: #fff">大</el-radio>
      </el-radio-group>
    </div>
    <div class="pano-item">
      <div class="pano-item-title" style="width: 100%">
        <div>天空遮罩</div>
        <el-select
          v-model="skyUrl"
          placeholder="请选择天空遮罩"
          @change="(val) => changeShade('sky', val)"
        >
          <el-option :key="'无'" :label="'无'" :value="''" />
          <el-option
            :key="'默认'"
            :label="'默认'"
            :value="'https://cdn-pano.qingtime.cn/1664243905436_pano.png'"
          />
          <el-option :key="'上传'" :value="'上传'">
            <div class="upload-button">
              <div style="width: 100%">上传</div>
              <input
                type="file"
                accept=".png,.jpg,.jpeg"
                @change="
                  //@ts-ignore
                  updateShade($event.target.files[0], 'sky')
                "
                class="upload-img"
              />
            </div>
          </el-option>
        </el-select>
      </div>
      <div class="pano-specialEffect-shade">
        推荐使用500 * 500图片
        <img :src="skyUrl" alt="" v-if="skyUrl" />
      </div>
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
      <div class="pano-item-title" style="width: 100%">
        <div>地面遮罩</div>
        <el-select
          v-model="groundUrl"
          placeholder="请选择地面遮罩"
          @change="(val) => changeShade('ground', val)"
        >
          <el-option :key="''" :label="'无'" :value="''" />
          <el-option
            :key="'默认'"
            :label="'默认'"
            :value="'https://cdn-pano.qingtime.cn/1664243905436_pano.png'"
          />
          <el-option :key="'上传'" :value="'上传'">
            <div class="upload-button">
              <div style="width: 100%">上传</div>
              <input
                type="file"
                accept=".png,.jpg,.jpeg"
                @change="
                  //@ts-ignore
                  updateShade($event.target.files[0], 'ground')
                "
                class="upload-img"
              />
            </div>
          </el-option>
        </el-select>
      </div>
      <div class="pano-specialEffect-shade">
        推荐使用500 * 500图片
        <img :src="groundUrl" alt="" v-if="groundUrl" />
      </div>
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
  @include scroll();
  .pano-specialEffect-shade {
    width: 320px;
    height: 320px;
    position: relative;
    z-index: 1;
    border: 1px solid rgba(255, 255, 255, 0.4);
    margin: 10px 0px;
    font-size: 20px;
    text-align: center;
    line-height: 320px;
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      position: absolute;
      top: 0px;
      bottom: 0px;
      left: 0px;
      right: 0px;
      z-index: 2;
    }
  }
}
</style>
<style></style>
