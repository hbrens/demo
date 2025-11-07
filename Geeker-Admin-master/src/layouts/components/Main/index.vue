<template>
  <Maximize v-show="maximize" />
  <Tabs v-show="tabs && layout !== 'classic'" />
  <div v-show="layout === 'classic' && !shouldHideBreadcrumb" class="breadcrumb-box">
    <Breadcrumb />
  </div>
  <el-main>
    <router-view v-slot="{ Component, route }">
      <transition appear name="fade-transform" mode="out-in">
        <keep-alive :include="keepAliveName">
          <component :is="createComponentWrapper(Component, route)" v-if="isRouterShow" :key="route.fullPath" />
        </keep-alive>
      </transition>
    </router-view>
  </el-main>
  <el-footer v-show="footer">
    <Footer />
  </el-footer>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount, provide, watch, h, computed } from "vue";
import { storeToRefs } from "pinia";
import { useDebounceFn } from "@vueuse/core";
import { useRoute } from "vue-router";
import { useGlobalStore } from "@/stores/modules/global";
import { useKeepAliveStore } from "@/stores/modules/keepAlive";
import Maximize from "./components/Maximize.vue";
import Tabs from "@/layouts/components/Tabs/index.vue";
import Breadcrumb from "@/layouts/components/Header/components/Breadcrumb.vue";
import Footer from "@/layouts/components/Footer/index.vue";

const route = useRoute();
const globalStore = useGlobalStore();
const { maximize, isCollapse, layout, tabs, footer } = storeToRefs(globalStore);

// 检查是否隐藏面包屑（检查顶级菜单的 meta.hideBreadcrumb）
const shouldHideBreadcrumb = computed(() => {
  // route.matched 包含所有匹配的路由记录，第一个通常是 layout，第二个是顶级菜单
  if (route.matched.length > 1) {
    const topMenu = route.matched[1];
    const meta = topMenu.meta as unknown as Menu.MetaProps;
    return meta?.hideBreadcrumb === true;
  }
  return false;
});

const keepAliveStore = useKeepAliveStore();
const { keepAliveName } = storeToRefs(keepAliveStore);

// 注入刷新页面方法
const isRouterShow = ref(true);
const refreshCurrentPage = (val: boolean) => (isRouterShow.value = val);
provide("refresh", refreshCurrentPage);

// 解决详情页 keep-alive 问题
const wrapperMap = new Map();
function createComponentWrapper(component, route) {
  if (!component) return;
  const wrapperName = route.fullPath;
  let wrapper = wrapperMap.get(wrapperName);
  if (!wrapper) {
    wrapper = { name: wrapperName, render: () => h(component) };
    wrapperMap.set(wrapperName, wrapper);
  }
  return h(wrapper);
}

// 监听当前页面是否最大化，动态添加 class
watch(
  () => maximize.value,
  () => {
    const app = document.getElementById("app") as HTMLElement;
    if (maximize.value) app.classList.add("main-maximize");
    else app.classList.remove("main-maximize");
  },
  { immediate: true }
);

// 监听布局变化，在 body 上添加相对应的 layout class
watch(
  () => layout.value,
  () => {
    const body = document.body as HTMLElement;
    body.setAttribute("class", layout.value);
  },
  { immediate: true }
);

// 监听窗口大小变化，折叠侧边栏
const screenWidth = ref(0);
const listeningWindow = useDebounceFn(() => {
  screenWidth.value = document.body.clientWidth;
  if (!isCollapse.value && screenWidth.value < 1200) globalStore.setGlobalState("isCollapse", true);
  if (isCollapse.value && screenWidth.value > 1200) globalStore.setGlobalState("isCollapse", false);
}, 100);
window.addEventListener("resize", listeningWindow, false);
onBeforeUnmount(() => {
  window.removeEventListener("resize", listeningWindow);
});
</script>

<style scoped lang="scss">
@import "./index.scss";
</style>
