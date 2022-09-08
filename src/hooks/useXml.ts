import api from "@/services/api";

const useXml = (type, config, panoType?: string) => {
  const str = ref<string>("");
  switch (type) {
    case "preview":
      let path = `${api.File_URL}panos/${config._key}/panos/${config.originName}.tiles`;
      str.value = `<preview url="${path}/preview.jpg" />
        <image>
            <cube url="${path}/%s/l%l/%v/l%l_%s_%v_%h.jpg"  multires="${config.multires}" />
          </image>
    `;
      break;
    case "fov":
      if (config?.viewAngle) {
        str.value = `<view fov="${config.viewAngle.fov}" hlookat="${config.viewAngle.hlookat}" vlookat="${config.viewAngle.vlookat}" fovmax="${config.viewAngle.fovmax}" fovmin="${config.viewAngle.fovmin}" limitview="lookat" hlookatmax="${config.viewAngle.hlookatmax}" vlookatmax="${config.viewAngle.vlookatmax}"  hlookatmin="${config.viewAngle.hlookatmin}"  vlookatmin="${config.viewAngle.vlookatmin}"/>`;
      } else {
        str.value = `<view fov="95" fovmax="120" fovmin="70" limitview="lookat" hlookatmax="180" vlookatmax="90"  hlookatmin="-180"  vlookatmin="-90"/>`;
      }
      break;
    // case "shade":
    //   if (config?.shade?.sky?.url) {
    //     str.value += `<hotspot name="skylogo" keep="true" url="${config.shade.sky.url}" ath="0" atv="-90" distorted="true" scale="${config.shade.sky.scale}" rotate="0.0" />`;
    //   }
    //   if (config?.shade?.ground?.url) {
    //     str.value += `<hotspot name="groundlogo" keep="true" url="${config.shade.ground.url}" ath="0" atv="-90" distorted="true" scale="${config.shade.sky.scale}" rotate="0.0" />`;
    //   }
    //   break;
  }
  return str.value;
};

export default useXml;
