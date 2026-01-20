<template>
  <div class="card">
    <div class="tif-container">
      <h2>TIF 组件</h2>
      
      <!-- 输入区域 -->
      <div class="input-section">
        <el-input
          v-model="tifUrl"
          placeholder="请输入 TIF 图片地址，如: http://127.0.0.1:40080/1.tif"
          clearable
          style="width: 400px"
        >
          <template #prepend>URL</template>
        </el-input>
        <el-button type="primary" @click="parseTif" :loading="loading" style="margin-left: 10px">
          解析 TIF
        </el-button>
      </div>

      <!-- 错误提示 -->
      <el-alert
        v-if="errorMsg"
        :title="errorMsg"
        type="error"
        show-icon
        style="margin-top: 16px; width: 500px"
      />

      <!-- 图片预览 -->
      <div v-if="imageSrc" class="preview-section">
        <h3>解析结果</h3>
        <img :src="imageSrc" alt="TIF 解析结果" class="tif-image" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="tif">
import { ref } from "vue";
import { parseTifToDataUrl } from "./utils";

const tifUrl = ref("http://127.0.0.1:40080/1.tif");
const imageSrc = ref("");
const loading = ref(false);
const errorMsg = ref("");

// 解析 TIF 文件
const parseTif = async () => {
  if (!tifUrl.value) {
    errorMsg.value = "请输入 TIF 图片地址";
    return;
  }

  loading.value = true;
  errorMsg.value = "";
  imageSrc.value = "";

  try {
    imageSrc.value = await parseTifToDataUrl(tifUrl.value);
  } catch (error) {
    console.error("解析 TIF 失败:", error);
    errorMsg.value = error instanceof Error ? error.message : "解析 TIF 失败";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped lang="scss">
@import "./index.scss";
</style>
