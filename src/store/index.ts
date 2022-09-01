import { authStore } from "@/store/auth";
import { commonStore } from "@/store/common";
import { panoStore } from "@/store/pano";
import { controlStore } from "@/store/control";

export interface IAppStore {
  authStore: ReturnType<typeof authStore>;
  commonStore: ReturnType<typeof commonStore>;
  panoStore: ReturnType<typeof panoStore>;
  controlStore: ReturnType<typeof controlStore>;
}

const appStore: IAppStore = {} as IAppStore;
/**
 * 注册app状态库
 */
export const registerStore = () => {
  appStore.authStore = authStore();
  appStore.commonStore = commonStore();
  appStore.panoStore = panoStore();
  appStore.controlStore = controlStore();
};

export default appStore;
