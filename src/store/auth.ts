import { ref } from "vue";
import { defineStore } from "pinia";
import { User } from "@/interface/User";
import api from "@/services/api";
import { ResultProps } from "@/interface/Common";

// 使用setup模式定义
export const authStore = defineStore("authStore", () => {
  const token = ref<string>("");
  const uploadToken = ref<string>("");
  const user = ref<User | null>(null);
  const friend = ref<User | null>(null);
  const mateList = ref<User[]>([]);
  const memberList = ref<User[]>([]);
  const setToken = (newToken: string) => {
    token.value = newToken;
  };
  const setUserInfo = (newUserInfo: User) => {
    user.value = newUserInfo;
  };
  const setFriendInfo = (newFriendInfo: User) => {
    friend.value = newFriendInfo;
  };
  const getUserInfo = async () => {
    const userInfoRes = (await api.request.get("user")) as ResultProps;
    if (userInfoRes.msg === "OK") {
      user.value = {
        _key: userInfoRes.data._key,
        userAvatar: userInfoRes.data.userAvatar,
        userName: userInfoRes.data.userName,
        beans: userInfoRes.data.beans,
        unReadNum: userInfoRes.data.unReadNum,
        createScore:userInfoRes.data.createScore,
        finishScore:userInfoRes.data.finishScore,
        defaultBoard:userInfoRes.data.defaultBoard
      };
    }
  };
  const getMateList = async () => {
    const mateRes: any = (await api.request.get("partner")) as ResultProps;
    if (mateRes.msg === "OK") {
      mateList.value = [...mateRes.data];
    }
  };
  const addMateList = async (mateItem: User) => {
    mateList.value = [...mateList.value, mateItem];
  };
  const changeMateList = async (oldIndex: number, newIndex: number) => {
    let item = { ...mateList.value[oldIndex] };
    mateList.value.splice(oldIndex, 1);
    mateList.value.splice(newIndex, 0, item);
  };
  const updateMateList = async (mateItem: User) => {
    mateList.value = mateList.value.map((item: User) => {
      if (item._key === mateItem._key) {
        item = { ...item, ...mateItem };
      }
      return item;
    });
  };

  const delMateList = async (mateKey: string) => {
    mateList.value = mateList.value.filter((item) => item._key !== mateKey);
  };

  const getMemberList = async () => {
    const memberRes: any = (await api.request.get(
      "board/member"
    )) as ResultProps;
    if (memberRes.msg === "OK") {
      memberList.value = [...memberRes.data];
    }
  };
  const addMemberList = async (memberItem: User) => {
    memberList.value = [...memberList.value, memberItem];
  };
  const getUploadToken = async () => {
    const tokenRes: any = (await api.request.get(
      "upTokenQiniu/getQiNiuUpToken",
      {
        token: token.value,
        type: 2,
        bucketType: 6,
      },
      true
    )) as ResultProps;
    if (tokenRes.msg === "OK") {
      uploadToken.value = tokenRes.result;
    }
  };
  return {
    token,
    user,
    setToken,
    setUserInfo,
    getUserInfo,
    friend,
    setFriendInfo,
    mateList,
    getMateList,
    addMateList,
    delMateList,
    changeMateList,
    updateMateList,
    memberList,
    getMemberList,
    addMemberList,
    uploadToken,
    getUploadToken,
  };
});
