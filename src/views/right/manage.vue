<script setup lang="ts">
import { ResultProps } from "@/interface/Common";
import { PanoTag } from "@/interface/Pano";
import api from "@/services/api";
import appStore from "@/store";
import { ArrowRight } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { storeToRefs } from "pinia";
import CommonMap from "@/components/common/map.vue";
const { sceneObj, sceneKey, panoConfig, sceneList } = storeToRefs(
  appStore.panoStore
);
const { setPanoConfig } = appStore.panoStore;
const labelsInput = ref<string>("");
const sandType = ref<number>(0);
const cruiseTime = ref<string>("");
const littleplanet = ref<boolean>(false);
const panoTypeKey = ref<string>("");
const name = ref<string>("");
const typeName = ref<string>("");
const blend = ref<string>("");
const mapVisible = ref<boolean>(false);
const panoTypeArray = ref<PanoTag[]>([]);
const locationArray = ref<any>([]);
const targetScene = ref<any>(null);
const sandTableRef = ref<any>(null);
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
});
const getPanoType = async () => {
  const typeRes = (await api.request.get("tag", {
    name: typeName.value,
  })) as ResultProps;
  if (typeRes.msg === "OK") {
    panoTypeArray.value = typeRes.data.map((item) => {
      return {
        _key: item._key,
        name: item.name,
      };
    });
  }
};
const changeConfig = (type, value, newType?: string) => {
  if (newType) {
    //@ts-ignore
    setPanoConfig({
      ...panoConfig.value,
      config: { ...panoConfig.value?.config, [type]: value },
    });
  } else {
    //@ts-ignore
    setPanoConfig({
      ...panoConfig.value,
      [type]: value,
    });
  }
};
const handleClose = (done) => {
  let [position, keyArr, zoom, center] = sandTableRef.value.getLocation();
  let location: any = {
    zoom: zoom,
    center: center,
  };
  keyArr.forEach((keyItem, keyIndex) => {
    let index = sceneList.value.findIndex((item) => item._key === keyItem);
    if (index !== -1) {
      location[keyItem] = {
        name: sceneList.value[index].name,
        _key: keyItem,
        position: position[keyIndex],
      };
    }
  });
  console.log(location);
  //@ts-ignore
  setPanoConfig({
    ...panoConfig.value,
    sandTable: { ...location },
  });
  done();
};
watch(
  panoConfig,
  (newConfig, oldConfig) => {
    if (newConfig && (!oldConfig || oldConfig._key !== newConfig._key)) {
      labelsInput.value = newConfig?.labels ? newConfig.labels : "";
      panoTypeKey.value = newConfig?.tagKey ? newConfig.tagKey : "";
      name.value = newConfig.name;
      blend.value = newConfig.config?.blend ? newConfig.config.blend : "";
      littleplanet.value = newConfig?.littleplanet
        ? newConfig.littleplanet
        : false;
    }
  },
  { immediate: true }
);
watch(
  sceneList,
  (newList, oldList) => {
    if (newList && !oldList) {
      targetScene.value = newList[0];
    }
  },
  { immediate: true }
);
watch(
  panoConfig,
  (newConfig) => {
    if (newConfig?.sandTable) {
      console.log(newConfig?.sandTable);
      locationArray.value = [];
      for (let key in newConfig?.sandTable) {
        if (key !== "center" && key !== "zoom") {
          console.log(key);
          locationArray.value.push(newConfig.sandTable[key]);
        }
      }
    }
  },
  { immediate: true }
);
</script>
<template>
  <div class="pano-right-manage">
    <div class="pano-item" v-if="sceneObj">
      <div class="pano-item-title">封面</div>
      <div class="pano-item-img">
        <img :src="sceneObj[sceneKey]?.cover" alt="" />
      </div>
    </div>
    <div class="pano-item">
      <div class="pano-item-title">类型</div>
      <el-select
        v-model="panoTypeKey"
        placeholder="请选择类型"
        @change="changeConfig('tagKey', panoTypeKey)"
      >
        <el-option
          v-for="item in panoTypeArray"
          :key="item._key"
          :label="item.name"
          :value="item._key"
        />
      </el-select>
    </div>
    <div class="pano-item">
      <div class="pano-item-title">标题</div>
      <el-input
        v-model="name"
        placeholder="请输入标题"
        style="width: 190px"
        @change="changeConfig('name', name)"
      />
    </div>
    <div class="pano-item">
      <div class="pano-item-title" style="width: 100%">
        <div>自定义标签</div>
        <div>使用“，”分割标签</div>
      </div>
      <el-input
        v-model="labelsInput"
        :autosize="{ minRows: 4 }"
        type="textarea"
        placeholder="请输入标签"
        @change="changeConfig('labels', labelsInput)"
      />
    </div>
    <div class="pano-item">
      <div class="pano-item-title">切换效果</div>
      <el-select
        v-model="blend"
        placeholder="请选择类型"
        @change="changeConfig('blend', blend, 'config')"
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
      <div
        class="pano-item-title"
        style="width: 100%; cursor: pointer"
        @click="mapVisible = true"
      >
        <div>沙盘</div>
        <div>
          <el-icon><ArrowRight /></el-icon>
        </div>
      </div>
    </div>
    <el-checkbox
      v-model="littleplanet"
      label="小行星开场"
      size="large"
      @change="changeConfig('littleplanet', littleplanet)"
    />
    <el-dialog
      v-model="mapVisible"
      title="沙盘地图"
      width="80vw"
      top="8vh"
      :before-close="handleClose"
    >
      <div class="map-container">
        <div class="map-left" v-if="targetScene">
          <CommonMap
            :mapId="'sandTableMap'"
            :width="'100%'"
            :height="'100%'"
            :data="locationArray"
            :zoom="panoConfig?.sandTable?.zoom"
            :center="panoConfig?.sandTable?.center"
            :targetScene="targetScene"
            type="sandTable"
            ref="sandTableRef"
          />
        </div>
        <div class="map-right">
          <div
            v-for="(item, index) in sceneList"
            :key="`map${index}`"
            class="map-right-item single-to-long"
            :style="
              targetScene && targetScene._key === item._key
                ? { background: '#efefef' }
                : ''
            "
            @click="targetScene = item"
          >
            {{ item.name }}
          </div>
        </div>
      </div>
    </el-dialog>
    <!-- 

    
    <div class="pano-item">
      <div class="pano-item-title">巡航时间</div>
      <div>
        <el-input
          v-model="cruiseTime"
          placeholder="请输入巡航时间"
          style="width: 150px; margin-right: 10px"
        />秒
      </div>
    </div>
 -->
  </div>
</template>
<style scoped lang="scss">
.pano-right-manage {
  width: 100%;
  height: 100%;
  @include scroll();
  padding: 10px 20px;
  box-sizing: border-box;
  .pano-item {
    .pano-item-img {
      width: 100%;
      height: 280px;
      img {
        @include img-fit(cover);
      }
    }
  }
  .map-container {
    width: 80vw;
    height: 80vh;
    @include flex(space-between, center, null);
    .map-left {
      width: calc(100% - 210px);
      height: 100%;
    }
    .map-right {
      width: 200px;
      height: 100%;
      @include scroll();
      .map-right-item {
        width: 100%;
        height: 40px;
        line-height: 40px;
        cursor: pointer;
        @include p-number(10px);
      }
    }
  }
}
</style>
<style lang="scss">
.pano-right-manage {
  .el-checkbox__label {
    color: #fff;
  }
}
</style>
