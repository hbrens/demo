<template>
  <div class="img-zoom-page">
    <div class="toolbar">
      <el-button size="small" type="primary" @click="reset">重置</el-button>
      <span class="scale-indicator">缩放：{{ (scale * 100).toFixed(0) }}%</span>
    </div>

    <div
      class="image-box"
      @wheel="handleWheel"
      @mousedown="startDrag"
      @mousemove="onDrag"
      @mouseup="stopDrag"
      @mouseleave="stopDrag"
      @dblclick="reset"
    >
      <img
        class="zoom-image"
        :src="demoImg"
        alt="示例图片"
        :style="imageStyle"
        draggable="false"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'

const scale = ref(1)
const translate = reactive({
  x: 0,
  y: 0
})

const isDragging = ref(false)
const dragStart = reactive({
  x: 0,
  y: 0
})
const translateStart = reactive({
  x: 0,
  y: 0
})

const minScale = 0.1
const maxScale = 8
const zoomStep = 0.15

const demoImg =
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80'

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const imageStyle = computed(() => ({
  left: `${translate.x}px`,
  top: `${translate.y}px`,
  scale: scale.value
}))

const reset = () => {
  scale.value = 1
  translate.x = 0
  translate.y = 0
}

const handleWheel = (event) => {
  event.preventDefault()

  const zoomDirection = event.deltaY > 0 ? -1 : 1
  const factor = 1 + zoomStep * zoomDirection

  scale.value = clamp(scale.value * factor, minScale, maxScale)
}

const startDrag = (event) => {
  if (event.button !== 0) return
  isDragging.value = true
  dragStart.x = event.clientX
  dragStart.y = event.clientY
  translateStart.x = translate.x
  translateStart.y = translate.y
}

const onDrag = (event) => {
  if (!isDragging.value) return
  translate.x = translateStart.x + (event.clientX - dragStart.x)
  translate.y = translateStart.y + (event.clientY - dragStart.y)
}

const stopDrag = () => {
  isDragging.value = false
}
</script>

<style scoped>
.img-zoom-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.scale-indicator {
  font-size: 14px;
  color: #606266;
}

.image-box {
  position: relative;
  width: 640px;
  height: 400px;
  border: 1px dashed #dcdfe6;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f5f7fa;
  cursor: grab;
  user-select: none;
}

.image-box:active {
  cursor: grabbing;
}

.zoom-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  transform-origin: 50% 50%;
  transition: scale 0.08s ease-out;
  pointer-events: none;
}
</style>

