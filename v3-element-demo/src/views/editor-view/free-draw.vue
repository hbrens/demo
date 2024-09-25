<script setup>
import {onMounted, ref} from 'vue'
import Konva from 'konva'

const operatorDomRef = ref(null)
const imageUrl = 'https://p6-flow-imagex-sign.byteimg.com/ocean-cloud-tos/image_skill/62bd027c-9190-4d50-b34e-87f60d622dac_1725298328882658190~tplv-a9rns2rl98-web-image.jpeg?rk3s=b14c611d&x-expires=1756834329&x-signature=PrWOpy3qhKMSIB1mFg7VWvIOdzM%3D'


const bgLayer = ref(null)
const maskLayer = ref(null)
const drawLayer = ref(null)
const line = ref(null)

const stageContainer = ref(null)
const isDrawing = ref(false)

const init = () => {
  const stage = new Konva.Stage({
    container: stageContainer.value,
    width: stageContainer.value.clientWidth,
    height: stageContainer.value.clientHeight,
  })

  bgLayer.value = new Konva.Layer();
  drawLayer.value = new Konva.Layer();

  const imageObj = new Image();
  imageObj.src = imageUrl;
  imageObj.onload = () => {
    const scale = Math.min( stage.width() / imageObj.width , stage.height() / imageObj.height )
    // 创建一个 Konva Image 对象
    const konvaImage = new Konva.Image({
      image: imageObj,
      x: (stage.width() - scale * imageObj.width) / 2, // 居中显示
      y: (stage.height() -  scale * imageObj.height) / 2, // 居中显示
      width: scale * imageObj.width,
      height: scale * imageObj.height,
      // draggable: true
    });

    // 将 Image 添加到 Layer 中
    bgLayer.value.add(konvaImage);

    // 将 Layer 添加到 Stage 中
    stage.add(bgLayer.value);

    // 绘制 Layer
    bgLayer.value.draw();

    const rect = new Konva.Rect({
      x: 0,
      y: 0,
      width: stage.width(),
      height: stage.height(),
      fill: 'rgba(0,0,0,0)',
    })

    // 种子填充函数
    function floodFill(x, y, fillColor, tolerance = 0) {
      const imageData = drawLayer.value.getCanvas().context.getImageData(0, 0, stage.width(), stage.height());
      const data = imageData.data;
      const startColor = getPixel(data, x, y);
      const stack = [];
      stack.push([x, y]);
      console.log(1)
      console.log(stack)

      while (stack.length > 0) {
        const [cx, cy] = stack.pop();
        const pixelColor = getPixel(data, cx, cy);
        console.log(colorMatch(pixelColor, startColor, tolerance), 'match')
        if (colorMatch(pixelColor, startColor, tolerance)) {
          setPixel(data, cx, cy, fillColor);
          stack.push([cx + 1, cy]);
          stack.push([cx - 1, cy]);
          stack.push([cx, cy + 1]);
          stack.push([cx, cy - 1]);
        }
        break
      }
      console.log(2)

      console.log(3)

      drawLayer.value.getCanvas().context.putImageData(imageData, 0, 0);
      drawLayer.value.batchDraw();
    }

    function getPixel(data, x, y) {
      const i = (y * stage.width() + x) * 4;
      return [data[i], data[i + 1], data[i + 2], data[i + 3]];
    }

    function setPixel(data, x, y, color) {
      const i = (y * stage.width() + x) * 4;
      data[i] = color[0];
      data[i + 1] = color[1];
      data[i + 2] = color[2];
      data[i + 3] = color[3];
    }

    function colorMatch(c1, c2, tolerance) {
      return (
        Math.abs(c1[0] - c2[0]) <= tolerance &&
        Math.abs(c1[1] - c2[1]) <= tolerance &&
        Math.abs(c1[2] - c2[2]) <= tolerance
      );
    }

    drawLayer.value.add(rect)
    stage.add(drawLayer.value)
    let lastLine;
    drawLayer.value.on('mousedown', function (e) {
      isDrawing.value = true;
      const pos = stage.getPointerPosition();
      lastLine = new Konva.Line({
        stroke: 'black',
        strokeWidth: 10,
        globalCompositeOperation: 'source-over',
        points: [pos.x, pos.y],
      });
      drawLayer.value.add(lastLine);
    })

    drawLayer.value.on('mousemove', function (e) {
      if (isDrawing.value) {
        const pos = stage.getPointerPosition();
        const newPoints = lastLine.points().concat([pos.x, pos.y]);
        lastLine.points(newPoints);
        drawLayer.value.batchDraw();
      }
    })

    drawLayer.value.on('mouseup', function (e) {
      isDrawing.value = false
    })

    drawLayer.value.on('dblclick', function (e) {
      console.log('dbclick')
      const pos = stage.getPointerPosition();
      const shapes = drawLayer.value.getChildren();
      console.log(shapes)
      shapes.forEach((shape) => {
        if (shape.intersects(pos)) {
          console.log(shape)
        }
      });
    })
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