<script setup lang="ts">
import api from "@/services/api";
import appStore from "@/store";
import { ElMessage } from "element-plus";
import useXml from "@/hooks/useXml";

import { storeToRefs } from "pinia";
import { containsProp } from "@vueuse/shared";
const { fovPano,previewPano, pano, panoConfig, sceneKey, sceneConfig } = storeToRefs(
  appStore.panoStore
);
const { setPano, setHotspotName, setFovPano, setPreviewPano } =
  appStore.panoStore;
const props = defineProps<{
  panoId: string;
  config?: any;
  type: string;
}>();
const krpano = ref<any>(null);
const panoRef = ref<any>(null);

onMounted(() => {
  console.log(">>>>>");
  if (sceneConfig.value?.multires) {
    console.log("<<<<<<<<<");
    init(sceneConfig.value);
  }
});
const init = (config) => {
  //1208547675
  //@ts-ignore
  embedpano({
    id: "krpanoSWFObject" + props.type,
    xml: props.type === "preview" ? config.xmlPath : "./common.xml",
    // xml: config.xmlPath,
    target: props.panoId,
    consolelog: true, // trace krpano messages also to the browser console
    passQueryParameters: true, // pass query parameters of the url to krpano
    html5: "auto",
    basepath: `${api.File_URL}panos/${config._key}/`,

    onready: (newPano) => {
      if (props.type === "main" || props.type === "fov") {
        // console.log(newPano.get(`cube.multries`));
        clearPano(newPano, config);
        if (props.type === "main") {
          setPano(newPano);
          // newPano.call(`loadscene(${config._key})`);
        }
        if (props.type === "fov") {
          setFovPano(newPano);
        }
      } else if (props.type === "preview") {
        if (!previewPano.value) {
          newPano.call("skin_setup_littleplanetintro");
        }
        setPreviewPano(newPano);
      }
    },
  });
};
const clearPano = (newPano, config?: any) => {
  //multires="512,512"

  //控制预览
  let preview = useXml("preview", config);
  //控制视角
  let view = useXml("fov", config, props.type);
  let xmlstring = `<krpano>
      <include url="./plugins/specialEffect.xml" />

  	 ${props.type === "main" ? `<include url="./plugins/drag.xml" />` : ""}
     ${view}
     ${preview}

     </krpano>`;
  console.log(xmlstring);
  newPano.call(
    "loadxml(" + escape(xmlstring) + ", null, REMOVESCENES, BLEND(0.5));"
  );
};
const noMove = () => {
  if (fovPano.value) {
    // fovPano.value.set("view.hlookatmax", 0);
    // fovPano.value.set("view.hlookatmin", 0);
    // fovPano.value.set("view.vlookatmax", 0);
    // fovPano.value.set("view.vlookatmin", 0);
    // fovPano.value.set("view.fovmax", pano.value.get("view.fov"));
    // fovPano.value.set("view.fovmin", pano.value.get("view.fov"));
  }
};
// const choosehotSpot = () => {
//   if (localStorage.getItem("chooseName")) {
//     setHotspotName(localStorage.getItem("chooseName") as string);
//     localStorage.setItem("chooseName", "");
//   }
// };
watch(
  [sceneConfig, panoRef],
  ([newConfig, newPanoRef], [oldConfig]) => {
    if (newConfig?._key !== oldConfig?._key && newPanoRef) {
      //@ts-ignore
      removepano("krpanoSWFObject" + props.type);
      init(newConfig);
    }
  },
  { immediate: true, deep: true }
);
</script>
<template>
  <div
    :id="panoId"
    ref="panoRef"
    style="width: 100%; height: 100%"
    @mouseenter="props.type === 'fov' ? noMove() : null"
    :style="type === 'fov' ? { cursor: 'normal' } : {}"
  >
    <!--     @click="choosehotSpot()" -->
    <noscript>
      <table style="width: 100%; height: 100%">
        <tr style="vertical-align: middle; text-align: center">
          <td>ERROR:<br /><br />Javascript not activated<br /><br /></td>
        </tr>
      </table>
    </noscript>
  </div>
</template>

<style scoped lang="scss"></style>
<style></style>
