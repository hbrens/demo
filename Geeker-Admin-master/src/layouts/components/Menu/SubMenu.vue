<template>
  <template v-for="subItem in menuList" :key="subItem.path">
    <el-sub-menu v-if="subItem.children?.length" :index="subItem.path">
      <template #title>
        <el-icon v-if="subItem.meta.icon">
          <component :is="subItem.meta.icon"></component>
        </el-icon>
        <span class="sle">{{ subItem.meta.title }}</span>
      </template>
      <SubMenu :menu-list="subItem.children" />
    </el-sub-menu>
    <el-menu-item v-else :index="subItem.path" @click="handleClickMenu(subItem)">
      <el-icon v-if="subItem.meta.icon">
        <component :is="subItem.meta.icon"></component>
      </el-icon>
      <template #title>
        <span class="sle">{{ subItem.meta.title }}</span>
      </template>
    </el-menu-item>
  </template>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

defineProps<{ menuList: Menu.MenuOptions[] }>();

const router = useRouter();
const handleClickMenu = (subItem: Menu.MenuOptions) => {
  if (subItem.meta.isLink) return window.open(subItem.meta.isLink, "_blank");
  router.push(subItem.path);
};
</script>

<style lang="scss">
// 菜单项基础样式
.el-menu-item {
  margin: 4px 8px;
  border-radius: 6px;
  height: 40px;
  line-height: 40px;
  transition: all 0.3s ease;
  padding: 0 12px !important;
  
  .el-icon {
    margin-right: 8px;
    font-size: 18px;
    transition: color 0.3s ease;
  }
  
  .sle {
    transition: color 0.3s ease;
  }
  
  &:hover {
    color: var(--el-menu-hover-text-color);
    background-color: var(--el-menu-hover-bg-color);
  }
  
  &.is-active {
    color: var(--el-color-primary) !important;
    background-color: var(--el-menu-active-bg-color) !important;
    font-weight: 500;
    
    // 移除左边框，使用圆角背景
    &::before {
      display: none;
    }
    
    .el-icon {
      color: var(--el-color-primary);
    }
    
    .sle {
      color: var(--el-color-primary);
    }
  }
}

// 子菜单标题样式
.el-sub-menu {
  .el-sub-menu__title {
    margin: 4px 8px;
    border-radius: 6px;
    height: 40px;
    line-height: 40px;
    transition: all 0.3s ease;
    padding: 0 12px !important;
    
    .el-icon {
      margin-right: 8px;
      font-size: 18px;
    }
    
    // 子菜单箭头图标样式
    .el-sub-menu__icon-arrow {
      right: 12px;
      transition: transform 0.3s ease;
    }
    
    &:hover {
      color: var(--el-menu-hover-text-color) !important;
      background-color: var(--el-menu-hover-bg-color) !important;
    }
  }
  
  // 子菜单打开时的样式
  &.is-opened {
    > .el-sub-menu__title {
      color: var(--el-menu-hover-text-color);
      
      .el-sub-menu__icon-arrow {
        transform: rotate(180deg);
      }
    }
  }
  
  // 子菜单项样式
  .el-menu {
    background-color: transparent;
    padding: 0;
    
    .el-menu-item {
      margin: 4px 8px;
      padding-left: 40px !important;
      padding-right: 12px !important;
      height: 40px;
      line-height: 40px;
      
      &.is-active {
        color: var(--el-color-primary) !important;
        background-color: var(--el-menu-active-bg-color) !important;
      }
    }
    
    // 三级菜单
    .el-sub-menu {
      .el-menu-item {
        padding-left: 60px !important;
      }
      
      .el-sub-menu__title {
        margin: 4px 8px;
        height: 40px;
        line-height: 40px;
      }
    }
  }
}

// 折叠状态下的样式
.el-menu--collapse {
  .el-menu-item,
  .el-sub-menu__title {
    margin: 4px 8px;
    padding: 0 20px !important;
    justify-content: center;
  }
  
  .is-active {
    .el-sub-menu__title {
      color: var(--el-color-primary) !important;
      background-color: var(--el-menu-active-bg-color) !important;
    }
  }
}

// 不同布局下的样式调整
.vertical,
.classic {
  .el-menu-item {
    &.is-active {
      &::before {
        display: none;
      }
    }
  }
}

.transverse {
  .el-menu-item {
    &.is-active {
      &::before {
        display: none;
      }
    }
  }
}

.columns {
  .el-menu-item {
    &.is-active {
      &::before {
        display: none;
      }
    }
  }
}
</style>
