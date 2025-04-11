<template>
  <div class="custom-header">
    <span>{{ params.displayName }}</span>
    <el-button type="primary" size="small" @click="onButtonClick">
      操作
    </el-button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  params: Object
})

const onButtonClick = () => {
  console.log('自定义按钮被点击')
  // 在这里添加您的按钮点击逻辑
}
</script>

<style scoped>
.custom-header {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style> 