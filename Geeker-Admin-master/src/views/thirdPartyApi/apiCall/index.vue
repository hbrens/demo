<template>
  <div class="card">
    <h4 class="title">API 调用</h4>
    <el-tabs v-model="activeTab" type="border-card" class="api-call-tabs">
      <el-tab-pane label="在线使用" name="online">
        <OnlineChat />
      </el-tab-pane>
      <el-tab-pane label="批量处理" name="batch">
        <el-tabs v-model="batchTab" class="batch-tabs">
          <el-tab-pane label="前端配置" name="clickConfig">
            <ClickConfig
              v-if="batchTab === 'clickConfig'"
              ref="clickConfigRef"
            />
          </el-tab-pane>
          <el-tab-pane label="脚本配置" name="scriptConfig">
            <ScriptConfig
              v-if="batchTab === 'scriptConfig'"
              ref="scriptConfigRef"
            />
          </el-tab-pane>
          <el-tab-pane label="任务列表" name="taskList">
            <TaskList
              v-if="batchTab === 'taskList'"
              @fill-config="handleFillConfig"
            />
          </el-tab-pane>
        </el-tabs>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts" name="apiCall">
import { ref } from "vue";
import OnlineChat from "./components/OnlineChat.vue";
import ClickConfig from "./components/ClickConfig.vue";
import ScriptConfig from "./components/ScriptConfig.vue";
import TaskList from "./components/TaskList.vue";
import type { BatchJob } from "@/api/thirdPartyApi";

const activeTab = ref("online");
const batchTab = ref("clickConfig");

const clickConfigRef = ref<InstanceType<typeof ClickConfig>>();
const scriptConfigRef = ref<InstanceType<typeof ScriptConfig>>();

// 处理配置回填
async function handleFillConfig(job: BatchJob) {
  let cfg: any = {};
  try {
    cfg = JSON.parse(job.config_json || "{}");
  } catch {}

  const isScript = job.source_type === "script";

  if (isScript) {
    batchTab.value = "scriptConfig";
    // 等待组件渲染完成
    setTimeout(() => {
      scriptConfigRef.value?.fillFromConfig(cfg, job.task_name || "", job.script_code || "");
    }, 100);
  } else {
    batchTab.value = "clickConfig";
    // 等待组件渲染完成
    setTimeout(() => {
      clickConfigRef.value?.fillFromConfig(cfg, job.task_name || "");
    }, 100);
  }
}
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

.batch-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;

  :deep(.el-tabs__header) {
    margin-bottom: 0;
  }

  :deep(.el-tabs__content) {
    flex: 1;
    overflow: hidden;
  }

  :deep(.el-tab-pane) {
    height: 100%;
  }
}
</style>
