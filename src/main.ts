import { createApp } from "vue";
import App from "./App.vue";
import router from "@/router";
import { createPinia } from "pinia";
import { registerStore } from "@/store";

import ElementPlus from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import "./styles/common/common.scss";
import "./styles/element/common.scss";
import "element-plus/dist/index.css";
import dispatchEventStroage from '@/services/tool'

const app = createApp(App);

app
  .use(router)
  .use(ElementPlus, {
    locale: zhCn,
  })
  .use(createPinia());
// 为了解决setItemEvent不立即生效，使用事件派发强制更高
dispatchEventStroage()
registerStore();
app.mount("#app");
