import { useCssVar } from "@vueuse/core";

const setTheme = (value: string) => {
  const el = ref(null);
  const primary_color = useCssVar("--el-color-success", el);
  primary_color.value = value;
};

export default setTheme;
