import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "login",
    component: () => import("@/views/login.vue"),
    children: [],
  },
  {
    path: "/view",
    name: "view",
    component: () => import("@/views/index.vue"),
    redirect: "/view/home",
    children: [
      {
        path: "home",
        name: "home",
        component: () => import("@/views/home.vue"),
        children: [],
      },
      {
        path: "pano/:id",
        name: "pano",
        component: () => import("@/views/pano.vue"),
        children: [],
      },
    ],
  },

  {
    path: "/preview/:panoKey/:sceneKey",
    name: "preview",
    component: () => import("@/views/preview.vue"),
    children: [],
  },
];
const routerHistory = createWebHashHistory();
const router = createRouter({
  history: routerHistory,
  routes,
});
//全局前置守卫
// router.beforeEach((to, from, next) => {
//   const { user, token } = store.state;
//   const { redirectAlreadyLogin, requiredLogin } = to.meta;
//   if (!user.isLogin) {
//     if (token) {
//       next("/");
//     } else {
//         next("login");
//     }
//     // } else if (redirectAlreadyLogin) {
//     //   next("/");
//   } else {
//     next();
//   }
// });
// 全局导航守卫
export default router;
