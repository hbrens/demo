<script setup>
import {onMounted, ref} from 'vue'
import Konva from 'konva'

const operatorDomRef = ref(null)
const imageUrl = 'https://p6-flow-imagex-sign.byteimg.com/ocean-cloud-tos/image_skill/62bd027c-9190-4d50-b34e-87f60d622dac_1725298328882658190~tplv-a9rns2rl98-web-image.jpeg?rk3s=b14c611d&x-expires=1756834329&x-signature=PrWOpy3qhKMSIB1mFg7VWvIOdzM%3D'

const stageContainer = ref(null)
const lastRectX = ref(0)
const lastRectY = ref(0)
const lastRectScaleX = ref(1)
const lastRectScaleY = ref(1)
const init = () => {
  const stage = new Konva.Stage({
    container: stageContainer.value,
    width: stageContainer.value.clientWidth,
    height: stageContainer.value.clientHeight
  })

  const layer = new Konva.Layer();

  const imageObj = new Image();
  imageObj.src = imageUrl;
  imageObj.onload = () => {
    const maxWidth = stage.width() / 3;
    const maxHeight = stage.height() / 3;
    let scale = Math.min(maxWidth / imageObj.width, maxHeight / imageObj.height);

    // 创建一个 Konva Image 对象
    const konvaImage = new Konva.Image({
      image: imageObj,
      x: (stage.width() - imageObj.width * scale) / 2, // 居中显示
      y: (stage.height() - imageObj.height * scale) / 2, // 居中显示
      width: imageObj.width * scale,
      height: imageObj.height * scale,
      // draggable: true
    });

    // 计算图片的宽度和高度
    const imageWidth = imageObj.width * scale;
    const imageHeight = imageObj.height * scale;

    // 计算矩形框的宽度和高度（1.2 倍）
    const rectWidth = imageWidth * 1;
    const rectHeight = imageHeight * 1;


    // 计算矩形框的位置，使其居中
    const rectX = (stage.width() - rectWidth) / 2;
    const rectY = (stage.height() - rectHeight) / 2;

    lastRectX.value = rectX
    lastRectY.value = rectY

    // 创建一个矩形框
    const rect = new Konva.Rect({
      x: rectX,
      y: rectY,
      width: rectWidth,
      height: rectHeight,
      stroke: 'black',
      strokeWidth: 2,
      fill: 'rgba(255,255,255, 0.3)',
      draggable: false,
    });

    // 创建一个 Transformer 对象
    const transformer = new Konva.Transformer({
      node: rect, // 绑定到矩形框
      enabledAnchors: [
        'top-left', 'top-center', 'top-right',
        'middle-left', 'middle-right',
        'bottom-left', 'bottom-center', 'bottom-right'
      ], // 启用所有边和角
      rotateEnabled: false, // 禁用旋转（可选）
    });

    // 将 Image 添加到 Layer 中
    layer.add(rect);
    layer.add(konvaImage);
    layer.add(transformer)

    // 将 Layer 添加到 Stage 中
    stage.add(layer);

    // 绘制 Layer
    layer.draw();


    // 监听矩形框的缩放事件
    rect.on('transform', () => {
      const rectX1 = rect.x()
      const rectY1 = rect.y()

      const imageX1 = konvaImage.x()
      const imageY1 = konvaImage.y()

      if (rectX1 > imageX1) {
        rect.x(lastRectX.value)
        rect.scaleX(lastRectScaleX.value)
      }
      if (rectY1 > imageY1) {
        rect.y(lastRectY.value)
        rect.scaleY(lastRectScaleY.value)
      }

      lastRectX.value = rect.x()
      lastRectY.value = rect.y()
      lastRectScaleX.value = rect.scaleX()
      lastRectScaleY.value = rect.scaleY()

      // 绘制 Layer
      layer.batchDraw();
    });
  }
}

onMounted(() => {
  init()
})

</script>
<template>
  <div class="out-painting">
    <div class="out-painting__main">
      <div class="operator-container">
        <div class="operator-box" ref="stageContainer">

        </div>
      </div>
    </div>
    <div class="out-painting__footer">
      <div class="skill-box footer-row">

      </div>
      <div class="action-box footer-row">
        <el-button>开始生成</el-button>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>

.operator-container {
  width: 100%;
  height: 100%;

  .operator-box {
    width: 100%;
    height: 100%;
  }
}

.out-painting {
  height: 100%;

  display: flex;
  flex-direction: column;

  &__main {
    flex: 1;
  }

  &__footer {
    height: 120px;
    flex-shrink: 0;

    display: flex;
    flex-direction: column;

    .footer-row {
      height: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      border-top: 1px solid black;
    }

    .skill-box {

    }
  }
}
</style>