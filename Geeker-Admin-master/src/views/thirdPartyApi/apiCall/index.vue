<template>
  <div class="card">
    <h4 class="title">API 调用</h4>
    <el-tabs v-model="activeTab" type="border-card" class="api-call-tabs">
      <el-tab-pane label="在线使用" name="online">
        <OnlineChat />
      </el-tab-pane>
      <el-tab-pane label="批量处理" name="batch">
        <div class="batch-placeholder">
          <el-empty description="批量处理功能开发中" :image-size="100" />
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts" name="apiCall">
import { ref } from "vue";
import OnlineChat from "./components/OnlineChat.vue";

const activeTab = ref("online");
</script>

<style lang="scss" scoped>
.card {
  padding: 20px;

  .title {
    margin: 0 0 16px;
    font-size: 17px;
    font-weight: bold;
    color: var(--el-text-color-primary);
  }
}

.api-call-tabs {
  :deep(.el-tabs__content) {
    padding: 0;
  }

  :deep(.el-tab-pane) {
    height: calc(100vh - 260px);
    min-height: 400px;
  }
}

.batch-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
