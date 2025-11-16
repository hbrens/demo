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
        ref="imageRef"
        class="canvas-image"
        :src="imageSrc"
        alt="示例图片"
        draggable="false"
        :style="imageStyle"
        @load="handleImageLoad"
      />
    </div>

  <el-button @click="handleZoomAdjust">缩放</el-button>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'

const containerRef = ref(null)
const imageRef = ref(null)

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

// 图片原始尺寸和显示尺寸
const imageNaturalSize = reactive({ width: 0, height: 0 })
const imageDisplaySize = reactive({ width: 0, height: 0 }) // 图片在容器中的实际显示尺寸（考虑 object-fit: contain）

// 将数值限制在指定区间内，防止过度缩放或出现负值
const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const imageStyle = computed(() => ({
  top: `${position.y}px`, // 根据当前偏移调整图片位置
  left: `${position.x}px`,
  transform: `scale(${scale.value})`, // 应用缩放倍数
  transformOrigin: '0 0' // 相对左上角缩放，便于配合偏移量计算
}))

const handleZoomAdjust = () => {
  if (scale.value <= 1) {
    position.x = 0
    position.y = 0
    scale.value = 1
  }
}

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

// 计算图片在容器中的实际显示尺寸（考虑 object-fit: contain）
const calculateImageDisplaySize = () => {
  if (!containerRef.value || !imageRef.value || imageNaturalSize.width === 0 || imageNaturalSize.height === 0) {
    return
  }

  const containerWidth = containerRef.value.clientWidth
  const containerHeight = containerRef.value.clientHeight
  const imageAspect = imageNaturalSize.width / imageNaturalSize.height
  const containerAspect = containerWidth / containerHeight

  // 根据 object-fit: contain 计算实际显示尺寸
  if (imageAspect > containerAspect) {
    // 图片更宽，以宽度为准
    imageDisplaySize.width = containerWidth
    imageDisplaySize.height = containerWidth / imageAspect
  } else {
    // 图片更高，以高度为准
    imageDisplaySize.width = containerHeight * imageAspect
    imageDisplaySize.height = containerHeight
  }
}

// 计算拖动边界限制
const getDragBounds = () => {
  if (!containerRef.value || imageDisplaySize.width === 0 || imageDisplaySize.height === 0) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0, canDragX: false, canDragY: false }
  }

  const containerWidth = containerRef.value.clientWidth
  const containerHeight = containerRef.value.clientHeight

  // 计算缩放后的图片尺寸
  const scaledWidth = imageDisplaySize.width * scale.value
  const scaledHeight = imageDisplaySize.height * scale.value

  // 判断是否可以拖动
  // 只有当缩放 > 1 且缩放后的尺寸大于容器尺寸时，才允许拖动
  const canDragX = scale.value > 1 && scaledWidth > containerWidth
  const canDragY = scale.value > 1 && scaledHeight > containerHeight

  // 计算拖动边界
  // X轴：当图片宽度超过容器时，限制在 [容器宽度 - 图片宽度, 0] 范围内
  const minX = canDragX ? containerWidth - scaledWidth : 0
  const maxX = 0

  // Y轴：当图片高度超过容器时，限制在 [容器高度 - 图片高度, 0] 范围内
  const minY = canDragY ? containerHeight - scaledHeight : 0
  const maxY = 0

  return { minX, maxX, minY, maxY, canDragX, canDragY }
}

// 图片加载完成时计算显示尺寸
const handleImageLoad = () => {
  if (imageRef.value) {
    imageNaturalSize.width = imageRef.value.naturalWidth
    imageNaturalSize.height = imageRef.value.naturalHeight
    calculateImageDisplaySize()
  }
}

const handleMouseDown = (event) => {
  if (event.button !== 0) return
  
  // 检查是否可以拖动
  const bounds = getDragBounds()
  if (!bounds.canDragX && !bounds.canDragY) {
    // 如果两个方向都不能拖动，则不启动拖动
    return
  }

  isDragging.value = true
  dragStartPoint.x = event.clientX // 记录初始按下位置，用于计算偏移差值
  dragStartPoint.y = event.clientY
  dragStartPosition.x = position.x // 保存当前图像的偏移基线
  dragStartPosition.y = position.y
}

const handleMouseMove = (event) => {
  if (!isDragging.value) return

  // 获取拖动边界
  const bounds = getDragBounds()

  // 计算新的偏移量
  let newX = dragStartPosition.x + (event.clientX - dragStartPoint.x)
  let newY = dragStartPosition.y + (event.clientY - dragStartPoint.y)

  // 应用X轴边界限制
  if (bounds.canDragX) {
    newX = clamp(newX, bounds.minX, bounds.maxX)
  } else {
    // 如果不能拖动X轴，保持原位置
    newX = position.x
  }

  // 应用Y轴边界限制
  if (bounds.canDragY) {
    newY = clamp(newY, bounds.minY, bounds.maxY)
  } else {
    // 如果不能拖动Y轴，保持原位置
    newY = position.y
  }

  position.x = newX
  position.y = newY
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

