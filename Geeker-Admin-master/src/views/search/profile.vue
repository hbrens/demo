<template>
  <div>
    <h1>Profile</h1>
    <el-button type="primary" :icon="Plus" @click="openUserDialog">新增用户信息</el-button>
    <el-button type="success" :icon="Document" @click="openStepDialog" style="margin-left: 10px;">步骤表单</el-button>
    <UserAddDialog ref="userDialogRef" />
    <StepFormDialog ref="stepDialogRef" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Plus, Document } from "@element-plus/icons-vue";
import UserAddDialog from "@/views/search/componets/UserAddDialog.vue";
import StepFormDialog from "@/views/search/componets/StepFormDialog.vue";

const userDialogRef = ref<InstanceType<typeof UserAddDialog> | null>(null);
const stepDialogRef = ref<InstanceType<typeof StepFormDialog> | null>(null);

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

const openStepDialog = () => {
  stepDialogRef.value?.acceptParams({
    title: "步骤表单",
    isView: false,
    row: {},
    api: async (params: any) => {
      // 模拟API调用
      console.log("提交步骤表单:", params);
      return Promise.resolve({ success: true });
    },
    getTableList: () => {
      // 模拟刷新列表
      console.log("刷新列表");
    }
  });
};
</script>
