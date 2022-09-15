import appStore from "@/store";
import { storeToRefs } from "pinia";

const useCheckUsed = (type, obj: any) => {
  const { pano } = storeToRefs(appStore.panoStore);
  const state = ref<boolean>(false);
  const arr = ref<any>([]);
  let newarr = type === "obj" ? Object.values(obj) : [...obj];
  newarr.forEach((item: any, index) => {
    if (item.state === "used") {
      item.ath = pano.value.get(`hotspot[${item.name}].ath`)
        ? pano.value.get(`hotspot[${item.name}].ath`)
        : item.ath;
      item.atv = pano.value.get(`hotspot[${item.name}].atv`)
        ? pano.value.get(`hotspot[${item.name}].atv`)
        : item.atv;
      arr.value.push(item);
    } else {
      state.value = true;
    }
  });
  return [state.value, arr.value];
};

export default useCheckUsed;
