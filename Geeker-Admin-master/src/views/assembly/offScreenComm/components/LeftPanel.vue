<template>
  <div class="left-panel">
    <!-- JSON 显示区域 -->
    <div class="json-display">
      <div class="panel-title">表单数据 (JSON)</div>
      <pre class="json-content">{{ jsonDisplay }}</pre>
    </div>

    <!-- 控制按钮区域 -->
    <div class="control-buttons">
      <div class="panel-title">控制面板</div>
      <div class="button-group">
        <el-button type="primary" @click="openOffScreen">
          {{ isOffScreen ? "已打开离屏窗口" : "打开离屏窗口" }}
        </el-button>
        <el-button v-if="isOffScreen" type="danger" @click="closeOffScreen">
          关闭离屏窗口
        </el-button>
      </div>

      <div class="divider"></div>

      <div class="panel-title">预设表单值</div>
      <div class="button-group">
        <el-button @click="setPreset('user1')">预设用户1</el-button>
        <el-button @click="setPreset('user2')">预设用户2</el-button>
        <el-button @click="setPreset('clear')">清空表单</el-button>
      </div>

      <div class="divider"></div>

      <div class="panel-title">状态信息</div>
      <div class="status-info">
        <p><strong>离屏状态：</strong>{{ isOffScreen ? "已离屏" : "同屏" }}</p>
        <p><strong>窗口状态：</strong>{{ windowStatus }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="LeftPanel">
import { ref, watch, computed } from "vue";
import { FormData } from "./RightForm.vue";

// 预设数据
const presets: Record<string, Partial<FormData>> = {
  user1: {
    username: "张三",
    email: "zhangsan@example.com",
    phone: "13800138001",
    status: true,
    description: "这是用户1的描述信息",
  },
  user2: {
    username: "李四",
    email: "lisi@example.com",
    phone: "13900139002",
    status: false,
    description: "这是用户2的描述信息",
  },
  clear: {
    username: "",
    email: "",
    phone: "",
    status: true,
    description: "",
  },
};

// Props
const props = defineProps<{
  formData: FormData;
  isOffScreen: boolean;
  windowStatus: string;
}>();

// Emits
const emit = defineEmits<{
  (e: "openOffScreen"): void;
  (e: "closeOffScreen"): void;
  (e: "setValue", value: Partial<FormData>): void;
}>();

// 本地 JSON 显示数据
const jsonDisplay = ref("");

// 监听 props.formData 变化并更新 JSON 显示
watch(
  () => props.formData,
  (newVal) => {
    jsonDisplay.value = JSON.stringify(newVal, null, 2);
  },
  { immediate: true, deep: true }
);

// 打开离屏窗口
const openOffScreen = () => {
  emit("openOffScreen");
};

// 关闭离屏窗口
const closeOffScreen = () => {
  emit("closeOffScreen");
};

// 设置预设值
const setPreset = (key: string) => {
  emit("setValue", presets[key] || {});
};
</script>

<style scoped lang="scss">
.left-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 20px;

  .panel-title {
    font-size: 16px;
    font-weight: bold;
    color: #303133;
    margin-bottom: 12px;
  }

  .json-display {
    flex: 1;
    background: #f5f7fa;
    border-radius: 4px;
    padding: 16px;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .json-content {
      flex: 1;
      margin: 0;
      font-family: "Consolas", monospace;
      font-size: 13px;
      line-height: 1.5;
      color: #606266;
      overflow-y: auto;
      white-space: pre-wrap;
      word-break: break-all;
    }
  }

  .control-buttons {
    background: #fff;
    border-radius: 4px;
    padding: 16px;

    .button-group {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .divider {
      height: 1px;
      background: #ebeef5;
      margin: 16px 0;
    }

    .status-info {
      font-size: 14px;
      color: #606266;

      p {
        margin: 8px 0;
      }
    }
  }
}
</style>
