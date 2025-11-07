<!-- 经典布局 -->
<template>
  <el-container class="layout">
    <el-header>
      <div class="header-lf mask-image">
        <div class="logo flx-center">
          <img class="logo-img" src="@/assets/images/logo.svg" alt="logo" />
          <span class="logo-text">{{ title }}</span>
        </div>
        <!-- 顶部第一层菜单 -->
        <div class="top-menu">
          <div
            v-for="item in firstLevelMenuList"
            :key="item.path"
            class="top-menu-item"
            :class="{ 'is-active': topActiveMenu === item.path }"
            @click="handleClickTopMenu(item)"
          >
            <el-icon v-if="item.meta.icon" class="menu-icon">
              <component :is="item.meta.icon"></component>
            </el-icon>
            <span class="menu-title">{{ item.meta.title }}</span>
          </div>
        </div>
        <ToolBarLeft />
      </div>
      <div class="header-ri">
        <ToolBarRight />
      </div>
    </el-header>
    <el-container class="classic-content">
      <el-aside v-if="!shouldHideSubMenu">
        <div class="aside-box" :style="{ width: isCollapse ? '65px' : '210px' }">
          <el-scrollbar>
            <el-menu
              :router="false"
              :default-active="activeMenu"
              :collapse="isCollapse"
              :unique-opened="accordion"
              :collapse-transition="false"
            >
              <SubMenu :menu-list="subMenuList" />
            </el-menu>
          </el-scrollbar>
        </div>
      </el-aside>
      <el-container class="classic-main">
        <Main />
      </el-container>
    </el-container>
  </el-container>
</template>

<script setup lang="ts" name="layoutClassic">
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/modules/auth";
import { useGlobalStore } from "@/stores/modules/global";
import Main from "@/layouts/components/Main/index.vue";
import SubMenu from "@/layouts/components/Menu/SubMenu.vue";
import ToolBarLeft from "@/layouts/components/Header/ToolBarLeft.vue";
import ToolBarRight from "@/layouts/components/Header/ToolBarRight.vue";

const title = import.meta.env.VITE_GLOB_APP_TITLE;

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const globalStore = useGlobalStore();
const accordion = computed(() => globalStore.accordion);
const isCollapse = computed(() => globalStore.isCollapse);
const menuList = computed(() => authStore.showMenuListGet);
const activeMenu = computed(() => (route.meta.activeMenu ? route.meta.activeMenu : route.path) as string);

// 第一层菜单列表（顶部菜单）
const firstLevelMenuList = computed(() => {
  return menuList.value.filter(item => !item.meta?.isHide);
});

// 第二层菜单列表（左侧菜单）
const subMenuList = ref<Menu.MenuOptions[]>([]);

// 顶部菜单激活项
const topActiveMenu = ref("");

// 判断是否应该隐藏左侧子菜单
const shouldHideSubMenu = computed(() => {
  if (!topActiveMenu.value) return false;
  const currentMenu = menuList.value.find((item: Menu.MenuOptions) => item.path === topActiveMenu.value);
  return currentMenu?.meta?.hideSubMenu === true;
});

// 根据当前路由自动切换左侧菜单
watch(
  () => [menuList, route],
  () => {
    if (!menuList.value.length) {
      subMenuList.value = [];
      topActiveMenu.value = "";
      return;
    }
    
    const currentPath = route.path;
    let activeMenuPath = route.meta.activeMenu as string || currentPath;
    // 如果 activeMenu 不是以 / 开头，尝试添加 / 前缀
    if (activeMenuPath && !activeMenuPath.startsWith("/")) {
      activeMenuPath = `/${activeMenuPath}`;
    }
    
    // 首先尝试精确匹配第一层菜单（使用 activeMenu 或当前路径）
    const exactMatch = menuList.value.find((item: Menu.MenuOptions) => 
      item.path === currentPath || item.path === activeMenuPath
    );
    if (exactMatch) {
      topActiveMenu.value = exactMatch.path;
      if (exactMatch.children?.length) {
        subMenuList.value = exactMatch.children;
      } else {
        subMenuList.value = [];
      }
      return;
    }
    
    // 查找包含当前路径的第一层菜单（通过子菜单匹配）
    for (const firstLevelItem of menuList.value) {
      if (firstLevelItem.children?.length) {
        // 检查子菜单中是否有匹配的
        const childMatch = firstLevelItem.children.find(
          (child: Menu.MenuOptions) => 
            child.path === currentPath || 
            child.path === activeMenuPath ||
            currentPath.startsWith(child.path + "/") ||
            activeMenuPath.startsWith(child.path + "/")
        );
        if (childMatch) {
          topActiveMenu.value = firstLevelItem.path;
          subMenuList.value = firstLevelItem.children;
          return;
        }
      }
      
      // 检查路径是否以第一层菜单路径开头
      if (currentPath.startsWith(firstLevelItem.path + "/") || 
          currentPath === firstLevelItem.path ||
          activeMenuPath.startsWith(firstLevelItem.path + "/") ||
          activeMenuPath === firstLevelItem.path) {
        topActiveMenu.value = firstLevelItem.path;
        if (firstLevelItem.children?.length) {
          subMenuList.value = firstLevelItem.children;
        } else {
          subMenuList.value = [];
        }
        return;
      }
    }
    
    // 如果都没有匹配，尝试根据路径的第一段来匹配
    const pathSegments = currentPath.split("/").filter(Boolean);
    if (pathSegments.length > 0) {
      const firstSegment = `/${pathSegments[0]}`;
      const foundMenu = menuList.value.find((item: Menu.MenuOptions) => item.path === firstSegment);
      if (foundMenu) {
        topActiveMenu.value = foundMenu.path;
        if (foundMenu.children?.length) {
          subMenuList.value = foundMenu.children;
        } else {
          subMenuList.value = [];
        }
        return;
      }
    }
    
    // 如果还是没有匹配，清空左侧菜单
    subMenuList.value = [];
    topActiveMenu.value = "";
  },
  {
    deep: true,
    immediate: true
  }
);

// 点击顶部菜单
const handleClickTopMenu = (item: Menu.MenuOptions) => {
  topActiveMenu.value = item.path;
  
  if (item.children?.length) {
    // 如果有子菜单，显示子菜单
    subMenuList.value = item.children;
    // 如果设置了 hideSubMenu，直接跳转到当前菜单，不跳转到第一个子菜单
    if (item.meta?.hideSubMenu) {
      if (item.meta?.isLink) {
        window.open(item.meta.isLink, "_blank");
      } else {
        router.push(item.path);
      }
      return;
    }
    // 如果当前路由不在这个菜单的子菜单中，跳转到第一个子菜单
    const isCurrentInChildren = item.children.some(
      (child: Menu.MenuOptions) => 
        route.path === child.path || 
        route.path.startsWith(child.path + "/")
    );
    if (!isCurrentInChildren) {
      const firstChild = item.children[0];
      if (firstChild && !firstChild.meta?.isLink && !firstChild.meta?.isHide) {
        router.push(firstChild.path);
      }
    }
  } else {
    // 如果没有子菜单，直接跳转
    subMenuList.value = [];
    if (item.meta?.isLink) {
      window.open(item.meta.isLink, "_blank");
    } else {
      router.push(item.path);
    }
  }
};
</script>

<style scoped lang="scss">
@import "./index.scss";
</style>
