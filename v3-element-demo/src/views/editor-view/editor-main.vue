<script setup>
import { ref } from 'vue'
const activeTab = ref('outPainting')
import OutPainting from '@/views/editor-view/out-painting.vue'
</script>
<template>
  <div class="editor-main">
    <div class="editor-main__header">
    </div>

    <div class="editor-main__content">
      <out-painting></out-painting>
    </div>
  </div>
</template>

<style lang="less" scoped>
.editor-main {
  height: 100%;

  &__header {
    height: 60px;
    border-bottom: 1px solid black;
  }
  &__content {
    height: calc(100vh - 60px);
  }
}
</style>