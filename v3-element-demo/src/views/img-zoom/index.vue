<template>
  <div class="img-zoom-demo">
    <div
      ref="containerRef"
      class="canvas"
      @wheel.prevent="handleWheel"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
    >
      <img
        class="canvas-image"
        :src="imageSrc"
        alt="示例图片"
        draggable="false"
        :style="imageStyle"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'

const containerRef = ref(null)

const imageSrc =
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80'

const scale = ref(1) // 当前缩放倍数
const position = reactive({ x: 0, y: 0 }) // 当前图像的偏移位置（以容器左上角为基准）

const isDragging = ref(false)
const dragStartPoint = reactive({ x: 0, y: 0 }) // 记录按下时鼠标的位置
const dragStartPosition = reactive({ x: 0, y: 0 }) // 记录按下时图像的偏移量，用于拖拽计算基线

const minScale = 0.2
const maxScale = 8
const zoomStep = 0.12

// 将数值限制在指定区间内，防止过度缩放或出现负值
const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const imageStyle = computed(() => ({
  top: `${position.y}px`, // 根据当前偏移调整图片位置
  left: `${position.x}px`,
  transform: `scale(${scale.value})`, // 应用缩放倍数
  transformOrigin: '0 0' // 相对左上角缩放，便于配合偏移量计算
}))

const handleWheel = (event) => {
  if (!containerRef.value) return
  // 获取容器在视口中的位置，用于换算鼠标在容器内的坐标

  const rect = containerRef.value.getBoundingClientRect()
  const offsetX = event.clientX - rect.left // 鼠标相对容器左上角的横坐标
  const offsetY = event.clientY - rect.top // 鼠标相对容器左上角的纵坐标

  const direction = event.deltaY > 0 ? -1 : 1 // 鼠标滚轮向下缩小，向上放大
  const nextScale = clamp(scale.value * (1 + zoomStep * direction), minScale, maxScale) // 计算目标缩放倍数并限制范围
  const factor = nextScale / scale.value // 与当前倍数的比例，用于判断是否有效缩放
  if (factor === 1) return

  // 将鼠标位置换算为图片内部（未缩放前）坐标，确保缩放以鼠标所在点为中心
  const originX = (offsetX - position.x) / scale.value
  const originY = (offsetY - position.y) / scale.value

  // 通过反推缩放后的偏移量，让视觉焦点保持在鼠标所在位置
  position.x = offsetX - originX * nextScale
  position.y = offsetY - originY * nextScale
  scale.value = nextScale
}

const handleMouseDown = (event) => {
  if (event.button !== 0) return
  isDragging.value = true
  dragStartPoint.x = event.clientX // 记录初始按下位置，用于计算偏移差值
  dragStartPoint.y = event.clientY
  dragStartPosition.x = position.x // 保存当前图像的偏移基线
  dragStartPosition.y = position.y
}

const handleMouseMove = (event) => {
  if (!isDragging.value) return
  // 根据鼠标移动距离计算新的偏移量，实现平移效果
  position.x = dragStartPosition.x + (event.clientX - dragStartPoint.x)
  position.y = dragStartPosition.y + (event.clientY - dragStartPoint.y)
}

const handleMouseUp = () => {
  isDragging.value = false
}
</script>

<style scoped>
.img-zoom-demo {
  padding: 24px;
  display: flex;
  justify-content: center;
}

.canvas {
  position: relative;
  width: 640px;
  height: 420px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f7fa;
  cursor: grab;
  user-select: none;
}

.canvas:active {
  cursor: grabbing;
}

.canvas-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  /* 如果后续需要开启硬件加速或禁止事件穿透，可取消注释以下配置 */
  /* will-change: transform; */
  /* pointer-events: none; */
}
</style>

