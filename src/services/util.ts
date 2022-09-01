import * as qiniu from "qiniu-js";
import api from "./api";

export const getSearchParamValue = (search: string, paramName: string) => {
  const QUERY_PARAMS: string = new URLSearchParams(search).get(
    paramName
  ) as string;
  if (QUERY_PARAMS) {
    return QUERY_PARAMS;
  } else {
    return null;
  }
};

// 生成标识符
export const guid = (len, radix) => {
  var chars =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");
  var uuid: any = [],
    i;
  radix = radix || chars.length;

  if (len) {
    // Compact form
    for (i = 0; i < len; i++) uuid[i] = chars[0 | (Math.random() * radix)];
  } else {
    // rfc4122, version 4 form
    var r;

    // rfc4122 requires these characters
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = "-";
    uuid[14] = "4";

    // Fill in random data.  At i==19 set the high bits of clock sequence as
    // per rfc4122, sec. 4.1.5
    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | (Math.random() * 16);
        uuid[i] = chars[i === 19 ? (r & 0x3) | 0x8 : r];
      }
    }
  }
  return uuid.join("");
};

export const uploadFile = async (
  file,
  mimeType,
  callback,
  fileType?: string
) => {
  if (!file) {
    alert("无文件");
    return;
  }
  if (file.size > 20000000) {
    alert("文件不能大于20M,请重新选择");
    return;
  }
  let uploadRes: any = await api.request.get(
    "upTokenQiniu/getQiNiuUpToken",
    {
      token: localStorage.getItem("token"),
      type: 2,
      bucketType: 12,
    },
    true
  );
  if ((uploadRes.msg = "OK")) {
    let uptoken = uploadRes.result;
    const domain = "https://cdn-pano.qingtime.cn/";
    let putExtra = {
      // 文件原文件名
      fname: "",
      // 自定义变量
      params: {},
      // 限制上传文件类型
      mimeType: mimeType,
    };
    let config = {
      useCdnDomain: true,
      disableStatisticsReport: false,
      retryCount: 5,
      region: qiniu.region.z0,
      forceDirect: true,
    };
    let observer = {
      next(res) {},
      error(err) {
        alert(err.message);
      },
      complete(res) {
        callback(domain + res.key);
        //return domain + res.key;
      },
    };
    // 上传
    let observable = qiniu.upload(
      file,
      fileType
        ? new Date().getTime() + "_pano." + fileType
        : new Date().getTime() +
            "_pano" +
            (file.name ? file.name.substr(file.name.lastIndexOf(".")) : ".png"),
      uptoken,
      putExtra,
      config
    );
    // 上传开始
    observable.subscribe(observer);
  }
};

export const is_mobile = () => {
  let regex_match =
    /(nokia|iphone|android|motorola|^mot-|softbank|foma|docomo|kddi|up.browser|up.link|htc|dopod|blazer|netfront|helio|hosin|huawei|novarra|CoolPad|webos|techfaith|palmsource|blackberry|alcatel|amoi|ktouch|nexian|samsung|^sam-|s[cg]h|^lge|ericsson|philips|sagem|wellcom|bunjalloo|maui|symbian|smartphone|midp|wap|phone|windows ce|iemobile|^spice|^bird|^zte-|longcos|pantech|gionee|^sie-|portalmmm|jigs browser|hiptop|^benq|haier|^lct|operas*mobi|opera*mini|320x320|240x320|176x220|Mobile|iPad)/i;
  let u = navigator.userAgent;
  if (null == u) {
    return true;
  }
  let result = regex_match.exec(u);

  if (null == result) {
    return false;
  } else {
    return true;
  }
};
