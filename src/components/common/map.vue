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
  targetScene?: any;
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
const markerArr = shallowRef<any>([]);
const markerKeyArr = shallowRef<any>([]);
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
      console.log(props.zoom, props.center);
      amapData.value = AMap;
      // if (props.type === "sandTable") {
      //   if (props.data) {
      //     setPointer(props.data.lng, props.data.lat);
      //   }

      // } else {
      if (props.data) {
        console.log(props.data);
        if (props.data.length > 0) {
          setPointerArray(props.data);
        }
        if (props.type === "sandTable") {
          amap.value.on("click", clickMap);
        }
      }
      // }
    })
    .catch((e) => {
      console.log(e);
    });
};

const setPointer = (lng, lat) => {
  // setLocation(lng, lat);
  let markIndex = markerKeyArr.value.indexOf(props.targetScene._key);
  if (markIndex === -1) {
    let icon = new amapData.value.Icon({
      size: new amapData.value.Size(35, 35), // 图标尺寸
      image: "https://cdn-pano.qingtime.cn/1663492789984_pano.png", // Icon的图像
      // imageOffset: new amapData.value.Pixel(-10, -10), // 图像相对展示区域的偏移量，适于雪碧图等
      imageSize: new amapData.value.Size(35, 35), // 根据所设置的大小拉伸或压缩图片
    });
    marker.value = new amapData.value.Marker({
      position: new amapData.value.LngLat(lng, lat), // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
      offset: new amapData.value.Pixel(-18, -36),
      icon: icon,
      label: {
        direction: "top",
        offset: new amapData.value.Pixel(0, -5), //设置文本标注偏移量
        content: `<div class='info'>${props.targetScene.name}</div>`,
      },
    });
    amap.value.add(marker.value);
    markerKeyArr.value.push(props.targetScene._key);
    markerArr.value.push(marker.value);
  } else {
    console.log(marker.value);
    markerArr.value[markIndex].setPosition([lng, lat]);
  }

  // // if(){
  //   markerArr.value.push(marker.value)
  // }
  // props.
  // emits("setPoint", {
  //   lng: lng,
  //   lat: lat,
  //   zoom: amap.value.getZoom(),
  //   center: [amap.value.getCenter().lng, amap.value.getCenter().lat],
  // });
};

const setPointerArray = (arr) => {
  // setLocation(lng, lat);
  arr.forEach((item) => {
    let marker: any = null;
    let icon = new amapData.value.Icon({
      size: new amapData.value.Size(35, 35), // 图标尺寸
      offset: new amapData.value.Pixel(-18, -36),
      image:
        props.targetScene._key === item._key
          ? "https://cdn-pano.qingtime.cn/1663492789984_pano.png"
          : "https://cdn-pano.qingtime.cn/1663550694198_pano.png", // Icon的图像
      // imageOffset: new amapData.value.Pixel(-10, -10), // 图像相对展示区域的偏移量，适于雪碧图等
      imageSize: new amapData.value.Size(35, 35), // 根据所设置的大小拉伸或压缩图片
    });
    marker = new amapData.value.Marker({
      position: new amapData.value.LngLat(item.position[0], item.position[1]), // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
      offset: new amapData.value.Pixel(-18, -36),
      icon: icon,
      label: {
        direction: "top",
        offset: new amapData.value.Pixel(0, -5), //设置文本标注偏移量
        content: `<div class='info'>${item.name}</div>`,
      },
    });
    if (marker) {
      console.log(item._key);
      //@ts-ignore
      marker.on("click", () => {
        clickMarker(item._key);
      });
      markerArr.value.push(marker);
      markerKeyArr.value.push(item._key);
    }
  });
  amap.value.add(markerArr.value);
};
const clickMap = (e) => {
  if (e.lnglat.lng && e.lnglat.lat && props.targetScene) {
    setPointer(e.lnglat.lng, e.lnglat.lat);
  }
};
const clickMarker = (key) => {
  console.log(key);
  emits("chooseMarker", key);
};
const getLocation = () => {
  let arr: any = [];
  markerArr.value.forEach((item) => {
    console.log(item.getPosition());
    arr.push([item.getPosition().lng, item.getPosition().lat]);
  });
  return [
    arr,
    markerKeyArr.value,
    amap.value.getZoom(),
    [amap.value.getCenter().lng, amap.value.getCenter().lat],
  ];
};
defineExpose({ getLocation });
// const clearMap = (e) => {
//   amap.value.remove(marker.value);
// };
watch(
  () => props.targetScene,
  (newScene) => {
    if (markerKeyArr.value.length > 0) {
      let markIndex = markerKeyArr.value.indexOf(newScene._key);
      let icon: any = null;
      markerArr.value.forEach((item, index) => {
        if (index === markIndex) {
          icon = new amapData.value.Icon({
            size: new amapData.value.Size(35, 35), // 图标尺寸
            image: "https://cdn-pano.qingtime.cn/1663492789984_pano.png",
            // Icon的图像
            // imageOffset: new amapData.value.Pixel(-10, -10), // 图像相对展示区域的偏移量，适于雪碧图等
            imageSize: new amapData.value.Size(35, 35), // 根据所设置的大小拉伸或压缩图片
          });
        } else {
          icon = new amapData.value.Icon({
            size: new amapData.value.Size(35, 35), // 图标尺寸
            image: "https://cdn-pano.qingtime.cn/1663550694198_pano.png", // Icon的图像
            // imageOffset: new amapData.value.Pixel(-10, -10), // 图像相对展示区域的偏移量，适于雪碧图等
            imageSize: new amapData.value.Size(35, 35), // 根据所设置的大小拉伸或压缩图片
          });
        }
        item.setIcon(icon);
        // item.on("click", () => {
        //   clickMarker(markerKeyArr[index]._key);
        // });
      });
    }
  }
);
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
.amap-marker-label {
  border: 0;
  background-color: rgba(134, 185, 63, 0.2);
  box-shadow: 0 2px 6px 0 rgba(114, 124, 245, 0.5);
}

.info {
  position: relative;
  margin: 0;
  top: 0;
  right: 0;
  min-width: 0;
}
</style>
