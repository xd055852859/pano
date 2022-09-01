<script setup lang="ts">
import { ResultProps } from "@/interface/Common";
import { PanoTag } from "@/interface/Pano";
import api from "@/services/api";
import appStore from "@/store";
import { ElMessage } from "element-plus";
import { storeToRefs } from "pinia";
const { sceneObj, sceneKey, panoConfig } = storeToRefs(appStore.panoStore);
const { setPanoConfig } = appStore.panoStore;
const labelsInput = ref<string>("");
const sandType = ref<number>(0);
const cruiseTime = ref<string>("");
const publicWorks = ref<boolean>(false);
const panoTypeKey = ref<string>("");
const name = ref<string>("");
const typeName = ref<string>("");
const panoTypeArray = ref<PanoTag[]>([]);
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
const changeConfig = (type, value) => {
  //@ts-ignore
  setPanoConfig({
    ...panoConfig.value,
    [type]: value,
  });
};
watch(
  panoConfig,
  (newConfig, oldConfig) => {
    if (newConfig && !oldConfig) {
      labelsInput.value = newConfig?.labels ? newConfig.labels : "";
      panoTypeKey.value = newConfig?.tagKey ? newConfig.tagKey : "";
      name.value = newConfig.name;
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
    <!-- 
    <div class="pano-item">
      <div class="pano-item-title" style="width: 100%">
        <div>沙盘</div>
        <div>
          <el-select
            v-model="sandType"
            class="m-2"
            placeholder="Select"
            size="large"
          >
            <el-option label="无" :value="0" />
            <el-option label="室内场景" :value="1" />
            <el-option label="室外场景" :value="2" />
          </el-select>
        </div>
      </div>
      <div class="pano-item-box"></div>
    </div>
    <div class="pano-item">
      <div class="pano-item-title" style="width: 100%">朗读人</div>
      <div class="pano-item-box"></div>
    </div>
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
    <el-checkbox v-model="publicWorks" label="公开作品" size="large" />
    <div>
      <div>设置位置</div>
      <div></div>
    </div> -->
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
      img {
        @include img-fit(cover);
      }
    }
  }
}
</style>
<style></style>
