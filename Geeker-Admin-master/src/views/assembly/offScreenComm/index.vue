<template>
  <div class="offscreen-comm-container" :class="{ 'is-offscreen': isOffScreen }">
    <!-- 左侧面板 -->
    <div class="left-panel-wrapper">
      <LeftPanel
        :form-data="formData"
        :is-off-screen="isOffScreen"
        :window-status="windowStatus"
        @open-off-screen="openOffScreen"
        @close-off-screen="closeOffScreen"
        @set-value="handleSetValue"
      />
    </div>

    <!-- 右侧表单（同屏时显示） -->
    <div v-if="!isOffScreen" class="right-panel-wrapper">
      <RightForm v-model="formData" @change="handleFormChange" />
    </div>
  </div>
</template>

<script setup lang="ts" name="offScreenComm">
import { ref, onUnmounted } from "vue";
import { ElMessage } from "element-plus";
import LeftPanel from "./components/LeftPanel.vue";
import RightForm, { type FormData } from "./components/RightForm.vue";

// 离屏窗口引用
let offscreenWindow: Window | null = null;

// 事件监听器引用
let messageHandler: ((event: MessageEvent) => void) | null = null;
let checkInterval: number | null = null;

// 窗口状态
const windowStatus = ref("未打开");

// 是否离屏
const isOffScreen = ref(false);

// 表单数据
const formData = ref<FormData>({
  username: "",
  email: "",
  phone: "",
  status: true,
  description: "",
});

// 监听离屏窗口发来的消息
const handleOffscreenMessage = (event: MessageEvent) => {
  const { type, data } = event.data || {};

  if (type === "ready") {
    // 离屏窗口已准备好，发送初始化数据
    offscreenWindow!.postMessage({ type: "init", data: { ...formData.value } }, "*");
    windowStatus.value = "已连接";
  } else if (type === "update") {
    // 接收离屏窗口的表单更新
    if (data) {
      Object.assign(formData.value, data);
    }
  }
};

// 打开离屏窗口
const openOffScreen = () => {
  // 如果已存在窗口，先清理
  closeOffScreen();

  // 计算新窗口位置（居中）
  const width = 600;
  const height = 700;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  // 构建 URL（打开独立的离屏表单页面）
  const offscreenUrl = `${window.location.origin}/#/offscreen-form`;

  // 打开新窗口
  offscreenWindow = window.open(
    offscreenUrl,
    "OffScreenForm",
    `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
  );

  if (offscreenWindow) {
    windowStatus.value = "正在连接...";
    isOffScreen.value = true;

    // 添加消息监听器
    messageHandler = handleOffscreenMessage;
    window.addEventListener("message", messageHandler);

    // 监听窗口关闭
    checkInterval = window.setInterval(() => {
      if (offscreenWindow?.closed) {
        closeOffScreen();
      }
    }, 500);
  } else {
    windowStatus.value = "打开失败";
    ElMessage.error("无法打开离屏窗口，请检查浏览器设置");
  }
};

// 关闭离屏窗口
const closeOffScreen = () => {
  // 关闭窗口
  if (offscreenWindow && !offscreenWindow.closed) {
    offscreenWindow.close();
  }
  offscreenWindow = null;

  // 移除事件监听器
  if (messageHandler) {
    window.removeEventListener("message", messageHandler);
    messageHandler = null;
  }

  // 清除定时器
  if (checkInterval !== null) {
    clearInterval(checkInterval);
    checkInterval = null;
  }

  // 重置状态
  isOffScreen.value = false;
  windowStatus.value = "未打开";
};

// 处理表单变化（同屏时）
const handleFormChange = (data: FormData) => {
  // 如果离屏窗口存在，同步数据
  if (isOffScreen.value && offscreenWindow && !offscreenWindow.closed) {
    offscreenWindow.postMessage({ type: "setValue", data }, "*");
  }
};

// 处理设置值（左侧按钮）
const handleSetValue = (value: Partial<FormData>) => {
  // 更新本地数据
  Object.assign(formData.value, value);

  // 如果离屏窗口存在，同步数据
  if (isOffScreen.value && offscreenWindow && !offscreenWindow.closed) {
    offscreenWindow.postMessage({ type: "setValue", data: value }, "*");
  }
};

// 组件卸载时清理
onUnmounted(() => {
  closeOffScreen();
});
</script>

<style scoped lang="scss">
@import "./index.scss";
</style>
