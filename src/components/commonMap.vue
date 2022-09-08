<script setup lang="ts">
import { ElMessage } from "element-plus";
import AMapLoader from "@amap/amap-jsapi-loader";
import appStore from "@/store";
import { storeToRefs } from "pinia";

const props = defineProps<{
  mapId: string;
  width: string;
  height: string;
  data?: any;
  zoom?: number;
  center?: number[];
  point?: any;
  type?: string;
}>();
const emits = defineEmits<{
  (e: "setPoint", obj: any): void;
  (e: "chooseMarker", key: string): void;
}>();
const amap = shallowRef<any>(null);
const amapData = shallowRef<any>(null);
const marker = shallowRef<any>(null);

onMounted(() => {
  initMap();
});
const initMap = () => {
  console.log(props.mapId);

  AMapLoader.load({
    key: "70beeffb8fc9537f6d450fd3747b70c9", // 申请好的Web端开发者Key，首次调用 load 时必填
    version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
    plugins: [], // 需要使用的的插件列表，如比例尺'AMap.Scale'等
  })
    .then((AMap) => {
      console.log(AMap);
      amap.value = new AMap.Map(props.mapId, {
        viewMode: "3D", //是否为3D地图模式
        zoom: props.zoom ? props.zoom : 5, //初始化地图级别
        center: props.center ? props.center : [116.397428, 39.90923],
      });
      console.log(amap.value);
      amapData.value = AMap;
      if (props.type === "sandTable") {
        if (props.data) {
          setPointer(props.data.lng, props.data.lat);
        }
        amap.value.on("click", clickMap);
      } else {
        if (props.data) {
          console.log(props.data);
          setPointerArray(props.data);
        }
      }
    })
    .catch((e) => {
      console.log(e);
    });
};

const setPointer = (lng, lat) => {
  // setLocation(lng, lat);
  if (marker.value) {
    amap.value.remove(marker.value);
  }
  marker.value = new amapData.value.Marker({
    position: new amapData.value.LngLat(lng, lat), // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
    label: "当前",
  });
  amap.value.add(marker.value);
  emits("setPoint", {
    lng: lng,
    lat: lat,
    zoom: amap.value.getZoom(),
    center: [amap.value.getCenter().lng, amap.value.getCenter().lat],
  });
};

const setPointerArray = (arr) => {
  // setLocation(lng, lat);
  console.log(arr);
  const markArr: any = [];
  arr.forEach((item) => {
    let marker = null;
    marker = new amapData.value.Marker({
      position: new amapData.value.LngLat(item.lng, item.lat), // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
      label: item._key,
    });
    if (marker) {
      //@ts-ignore
      marker.on("click", clickMarker);
      markArr.push(marker);
    }
  });
  console.log(markArr);
  amap.value.add(markArr);
};
const clickMap = (e) => {
  if (e.lnglat.lng && e.lnglat.lat) {
    setPointer(e.lnglat.lng, e.lnglat.lat);
  }
};
const clickMarker = (e) => {
  emits("chooseMarker", e.target._originOpts.label);
};
// const clearMap = (e) => {
//   amap.value.remove(marker.value);
// };

</script>
<template>
  <div
    :id="props.mapId"
    :style="{ width: width, height: height }"
    class="common-map"
  ></div>
</template>
<style scoped lang="scss"></style>
<style lang="scss">
.common-map {
  padding-right: 1px;
  .amap-layer {
    width: calc(100% + 1px) !important;
  }
}
</style>
