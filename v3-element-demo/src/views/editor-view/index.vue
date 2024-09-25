<script setup>
import EditorMain from '@/views/editor-view/editor-main.vue'
import  { useDark } from '@vueuse/core'
// import InPainting from '@/views/editor-view/in-painting.vue'
import OnlyMask from '@/views/editor-view/only-mask.vue'
const isDark = useDark()

</script>
<template>
  <div class="editor-view">
    <div class="editor-view__aside">

    </div>
    <div id="asideHorizontalHandler"></div>
    <div class="editor-view__main">
<!--      <editor-main></editor-main>-->
<!--      <in-painting></in-painting>-->
      <only-mask></only-mask>
    </div>
  </div>
</template>

<style lang="less" scoped>
.editor-view {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  background-color: #292B2F;

  flex-direction: row-reverse;

  &__aside {
    width: 300px;
    //background-color: red;
  }

  #asideHorizontalHandler {
    width: 10px;
    cursor: ew-resize;
    display: flex;
    //background-color: red;

    &:before {
      content: '';
      border-left: 1px solid black;
    }
  }
  &__main {
    width: calc(100vw - 10px - 300px);
  }
}
</style>