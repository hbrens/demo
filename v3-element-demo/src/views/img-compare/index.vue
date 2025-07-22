<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import Konva from 'konva'
import { useGesture } from '@vueuse/gesture'

// 主图和三张可选图都用同一张图片
const imageUrls = [
  {
    url: 'http://192.168.0.104:8080/0f04af422502a40b6c8dc19d53d1f348.jpg',
    boxes: [
      // 示例：左上(0.1,0.1) 右下(0.4,0.3)
      { x1: 0.1, y1: 0.1, x2: 0.4, y2: 0.3 },
      { x1: 0.5, y1: 0.5, x2: 0.7, y2: 0.7 },
    ]
  },
  {
    url: 'http://192.168.0.104:8080/0f04af422502a40b6c8dc19d53d1f348.jpg',
    boxes: [
      { x1: 0.2, y1: 0.2, x2: 0.5, y2: 0.4 },
    ]
  },
  {
    url: 'http://192.168.0.104:8080/0f04af422502a40b6c8dc19d53d1f348.jpg',
    boxes: []
  },
]
const selectedIndex = ref(0)
const stageContainer = ref()
const konvaStage = ref(null)
const konvaImageLayer = ref(null)
const konvaAnnotationLayer = ref(null)
const konvaImage = ref(null)

const getStageSize = () => {
  if (!stageContainer.value) return { width: 360, height: 360 }
  const rect = stageContainer.value.getBoundingClientRect()
  return {
    width: rect.width,
    height: rect.height,
  }
}

// 辅助函数：根据图片当前x/y/scale渲染标注框
function renderAnnotations(imgObj) {
  konvaAnnotationLayer.value.destroyChildren()
  if (!konvaImage.value) return
  imgObj.boxes.forEach(box => {
    const x = konvaImage.value.x() + box.x1 * konvaImage.value.width()
    const y = konvaImage.value.y() + box.y1 * konvaImage.value.height()
    const w = (box.x2 - box.x1) * konvaImage.value.width()
    const h = (box.y2 - box.y1) * konvaImage.value.height()
    const rect = new Konva.Rect({
      x, y, width: w, height: h,
      stroke: '#ff4d4f',
      strokeWidth: 2,
      listening: false,
    })
    konvaAnnotationLayer.value.add(rect)
  })
  konvaAnnotationLayer.value.draw()
}

// 记录图片原始宽高
defineProps([])
const imageState = ref({ x: 0, y: 0, width: 0, height: 0, origWidth: 0, origHeight: 0 })

const renderImage = (imgObj) => {
  const { width, height } = getStageSize()
  if (!konvaStage.value) {
    konvaStage.value = new Konva.Stage({
      container: stageContainer.value,
      width,
      height,
    })
    konvaImageLayer.value = new Konva.Layer()
    konvaAnnotationLayer.value = new Konva.Layer()
    konvaStage.value.add(konvaImageLayer.value)
    konvaStage.value.add(konvaAnnotationLayer.value)
  } else {
    konvaStage.value.width(width)
    konvaStage.value.height(height)
    konvaImageLayer.value.destroyChildren()
    konvaAnnotationLayer.value.destroyChildren()
  }
  const imageObj = new window.Image()
  imageObj.crossOrigin = 'Anonymous'
  imageObj.src = imgObj.url
  imageObj.onload = () => {
    const scale = Math.min(width / imageObj.width, height / imageObj.height)
    const imgW = imageObj.width * scale
    const imgH = imageObj.height * scale
    const offsetX = (width - imgW) / 2
    const offsetY = (height - imgH) / 2
    imageState.value = { x: offsetX, y: offsetY, width: imgW, height: imgH, origWidth: imageObj.width, origHeight: imageObj.height }
    konvaImage.value = new Konva.Image({
      image: imageObj,
      x: offsetX,
      y: offsetY,
      width: imgW,
      height: imgH,
      draggable: false,
    })
    konvaImageLayer.value.add(konvaImage.value)
    konvaImageLayer.value.draw()
    renderAnnotations(imgObj)
  }
}

function updateImageAndAnnotations(imgObj) {
  if (!konvaImage.value) return
  konvaImage.value.x(imageState.value.x)
  konvaImage.value.y(imageState.value.y)
  konvaImage.value.width(imageState.value.width)
  konvaImage.value.height(imageState.value.height)
  konvaImageLayer.value.batchDraw()
  renderAnnotations(imgObj)
}

onMounted(() => {
  nextTick(() => {
    renderImage(imageUrls[selectedIndex.value])
  })
})
const isDragging = ref(false)
let startDistance = 0
let lastPinchCenter = null
let lastPinchImgPos = { x: 0, y: 0, width: 0, height: 0 }

useGesture(
  {
    onPinchStart: ({ event }) => {
      if (konvaImage.value && event.touches && event.touches.length === 2) {
        const rect = stageContainer.value.getBoundingClientRect()
        const centerX = (event.touches[0].clientX + event.touches[1].clientX) / 2 - rect.left
        const centerY = (event.touches[0].clientY + event.touches[1].clientY) / 2 - rect.top
        lastPinchCenter = { x: centerX, y: centerY }
        lastPinchImgPos = {
          x: imageState.value.x,
          y: imageState.value.y,
          width: imageState.value.width,
          height: imageState.value.height
        }
        const dx = event.touches[0].clientX - event.touches[1].clientX
        const dy = event.touches[0].clientY - event.touches[1].clientY
        startDistance = Math.sqrt(dx * dx + dy * dy)
      }
    },
    onPinch: ({ event }) => {
      if (!konvaImage.value) return
      if (event.touches && event.touches.length === 2) {
        const dx = event.touches[0].clientX - event.touches[1].clientX
        const dy = event.touches[0].clientY - event.touches[1].clientY
        const currentDistance = Math.sqrt(dx * dx + dy * dy)
        let scale = currentDistance / startDistance
        // 限制缩放比例
        if (lastPinchImgPos.width * scale < lastPinchImgPos.width * 0.5) scale = 0.5
        if (lastPinchImgPos.width * scale > lastPinchImgPos.width * 10) scale = 10
        const newImgW = lastPinchImgPos.width * scale
        const newImgH = lastPinchImgPos.height * scale
        const relX = (lastPinchCenter.x - lastPinchImgPos.x) / lastPinchImgPos.width
        const relY = (lastPinchCenter.y - lastPinchImgPos.y) / lastPinchImgPos.height
        imageState.value.width = newImgW
        imageState.value.height = newImgH
        imageState.value.x = lastPinchCenter.x - relX * newImgW
        imageState.value.y = lastPinchCenter.y - relY * newImgH
        updateImageAndAnnotations(imageUrls[selectedIndex.value])
      }
    },
    onPinchEnd: () => {
      lastPinchImgPos = { x: imageState.value.x, y: imageState.value.y, width: imageState.value.width, height: imageState.value.height }
      lastPinchCenter = null
    }
  },
  {
    domTarget: stageContainer,
    eventOptions: { passive: false },
    pinch: { scaleBounds: { min: 0.5, max: 3 }, rubberband: true },
  }
)


watch(selectedIndex, (idx) => {
  renderImage(imageUrls[idx])
})

const handleSelect = (idx) => {
  selectedIndex.value = idx
}
const handleProcess = () => {
  // 处理按钮点击逻辑
  alert('开始处理')
}
</script>

<template>
  <div class="img-compare-mobile">
    <div class="main-img-area">
      <div class="konva-stage" ref="stageContainer"></div>
    </div>
    <div class="img-select-row">
      <div
        v-for="(img, idx) in imageUrls"
        :key="idx"
        class="img-thumb"
        :class="{ active: idx === selectedIndex }"
        @click="handleSelect(idx)"
      >
        <img :src="img.url" alt="可选图片" />
      </div>
    </div>
    <div class="footer-btn-row">
      <el-button type="primary" class="process-btn" @click="handleProcess">开始处理 {{ isDragging }}</el-button>
    </div>
  </div>
</template>

<style scoped lang="less">
.img-compare-mobile {
  width: 100vw;
  min-height: 100vh;
  background: #f7f7f7;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
}
.main-img-area {
  width: 100vw;
  max-width: 100vw;
  height: 70vh;
  background: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 0;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
}
.konva-stage {
  width: 100vw;
  height: 70vh;
  background: #eee;
  border-radius: 0;
  overflow: hidden;
  margin: 0;
}
.img-select-row {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin: 4vw 0 3vw 0;
  gap: 3vw;
}
.img-thumb {
  width: 18vw;
  height: 18vw;
  min-width: 56px;
  min-height: 56px;
  max-width: 90px;
  max-height: 90px;
  border-radius: 2vw;
  overflow: hidden;
  border: 0.5vw solid transparent;
  box-sizing: border-box;
  cursor: pointer;
  transition: border 0.2s;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
.img-thumb.active {
  border: 0.5vw solid #409eff;
}
.footer-btn-row {
  width: 100vw;
  max-width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 8vw;
}
.process-btn {
  width: 90vw;
  max-width: 400px;
  height: 12vw;
  min-height: 44px;
  font-size: 1.2rem;
  border-radius: 6vw;
}
</style>