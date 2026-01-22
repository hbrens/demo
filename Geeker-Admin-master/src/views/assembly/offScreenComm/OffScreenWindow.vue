<template>
  <div class="offscreen-form">
    <el-form :model="formData" label-width="80px">
      <el-form-item label="用户名">
        <el-input v-model="formData.username" placeholder="请输入用户名" @input="handleChange" />
      </el-form-item>
      <el-form-item label="邮箱">
        <el-input v-model="formData.email" placeholder="请输入邮箱" @input="handleChange" />
      </el-form-item>
      <el-form-item label="手机号">
        <el-input v-model="formData.phone" placeholder="请输入手机号" @input="handleChange" />
      </el-form-item>
      <el-form-item label="状态">
        <el-switch v-model="formData.status" @change="handleChange" />
        <span class="status-text">{{ formData.status ? "启用" : "禁用" }}</span>
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="formData.description" type="textarea" rows="3" placeholder="请输入描述" @input="handleChange" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts" name="OffScreenWindow">
import { reactive, onMounted, onUnmounted } from "vue";
import type { FormData } from "./components/RightForm.vue";

// 表单数据
const formData = reactive<FormData>({
  username: "",
  email: "",
  phone: "",
  status: true,
  description: "",
});

// 目标窗口引用
let targetWindow: Window | null = null;

// 处理表单变化
const handleChange = () => {
  // 发送消息给主窗口
  if (targetWindow && !targetWindow.closed) {
    targetWindow.postMessage({ type: "update", data: { ...formData } }, "*");
  }
};

// 监听主窗口消息
const handleMessage = (event: MessageEvent) => {
  const { type, data } = event.data || {};

  switch (type) {
    case "init":
      // 接收初始化数据
      if (data) {
        Object.assign(formData, data);
      }
      break;

    case "setValue":
      // 接收设置值指令
      if (data) {
        Object.assign(formData, data);
        // 同步回主窗口
        handleChange();
      }
      break;

    case "close":
      // 主窗口要求关闭
      window.close();
      break;
  }
};

// 初始化
onMounted(() => {
  // 通过 window.opener 获取主窗口
  targetWindow = window.opener;

  if (targetWindow) {
    // 监听主窗口消息
    window.addEventListener("message", handleMessage);

    // 发送 ready 消息给主窗口，请求初始化数据
    targetWindow.postMessage({ type: "ready" }, "*");
  } else {
    console.warn("无法获取主窗口引用");
  }
});

// 组件卸载时清理
onUnmounted(() => {
  window.removeEventListener("message", handleMessage);
});
</script>

<style scoped>
.offscreen-form {
  background: #fff;
  border-radius: 4px;
  padding: 20px;
  max-width: 600px;
  margin: 20px auto;
}

.status-text {
  margin-left: 10px;
  font-size: 14px;
  color: #666;
}
</style>
