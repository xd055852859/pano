import axios from "axios";
import { ElMessage } from "element-plus";
// import i18n from "@/language/i18n";
import router from "@/router";
const AUTH_URL = import.meta.env.VITE_AUTH_URL;
const API_URL = import.meta.env.VITE_API_URL;
const File_URL= import.meta.env.VITE_File_URL;
let token = localStorage.getItem("token") || "";
let message = true;
axios.interceptors.response.use(
  (response) => {
    if (response.data.status === 701 && message) {
      message = false;
      ElMessage({
        message: "请登录",
        type: "error",
        duration: 1000,
      });
      localStorage.removeItem("token");
      router.push("/");
    } else if (response.data.status === 201) {
      ElMessage({
        message: response.data.msg,
        type: "error",
        duration: 1000,
      });
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);
const request = {
  get(path: string, params?: object, otherUrl?: boolean, otherPath?: string) {
    return new Promise(async function (resolve, reject) {
      try {
        const response = await axios({
          method: "get",
          url: otherPath
            ? otherPath
            : otherUrl
            ? AUTH_URL + path
            : API_URL + path,
          params: params,
          headers: {
            token: token,
          },
        });
        resolve(response.data);
      } catch (error) {
        reject(error);
      }
    });
  },
  post(path: string, params?: object, otherUrl?: boolean, otherPath?: string) {
    return new Promise(async function (resolve, reject) {
      try {
        const response = await axios({
          method: "post",
          url: otherPath
            ? otherPath
            : otherUrl
            ? AUTH_URL + path
            : API_URL + path,
          data: params,
          headers: {
            token: token,
          },
        });
        resolve(response.data);
      } catch (error) {
        reject(error);
      }
    });
  },
  patch(path: string, params?: object) {
    return new Promise(async function (resolve, reject) {
      try {
        const response = await axios({
          method: "patch",
          url: API_URL + path,
          data: params,
          headers: {
            token: token,
          },
        });
        resolve(response.data);
      } catch (error) {
        reject(error);
      }
    });
  },
  delete(path: string, params?: object) {
    return new Promise(async function (resolve, reject) {
      try {
        const response = await axios({
          method: "delete",
          url: API_URL + path,
          data: params,
          headers: {
            token: token,
          },
        });
        resolve(response.data);
      } catch (error) {
        reject(error);
      }
    });
  },
};

export default {
  request,
  File_URL,
  setToken: (_token: string) => {
    localStorage.setItem("token", _token);
    token = _token;
  },
};
