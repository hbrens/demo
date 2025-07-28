<template>
  <div>
    <h1>Profile</h1>
    <el-button type="primary" :icon="Plus" @click="openUserDialog">新增用户信息</el-button>
    <UserAddDialog ref="userDialogRef" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Plus } from "@element-plus/icons-vue";
import UserAddDialog from "@/views/search/componets/UserAddDialog.vue";

const userDialogRef = ref<InstanceType<typeof UserAddDialog> | null>(null);

const openUserDialog = () => {
  userDialogRef.value?.acceptParams({
    title: "新增",
    isView: false,
    row: {},
    api: async (params: any) => {
      // 模拟API调用
      console.log("新增用户信息:", params);
      return Promise.resolve({ success: true });
    },
    getTableList: () => {
      // 模拟刷新列表
      console.log("刷新用户列表");
    }
  });
};
</script>
