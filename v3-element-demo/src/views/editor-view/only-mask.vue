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

const binaryImages = [
  'http://127.0.0.1:13800/binary_image_0.png',
  'http://127.0.0.1:13800/binary_image_1.png',
  'http://127.0.0.1:13800/binary_image_2.png',
]


const init = () => {
  const stage = new Konva.Stage({
    container: stageContainer.value,
    width: stageContainer.value.clientWidth,
    height: stageContainer.value.clientHeight,
  })

  bgLayer.value = new Konva.Layer();
  drawLayer.value = new Konva.Layer();

  const bgImage = new Image();
  bgImage.src = imageUrl;
  bgImage.crossOrigin = 'Anonymous';
  bgImage.onload = () => {
    const scale = Math.min( stage.width() / bgImage.width , stage.height() / bgImage.height )
    // 创建一个 Konva Image 对象
    const konvaImage = new Konva.Image({
      image: bgImage,
      x: 0, // 居中显示
      y: 0, // 居中显示
      width: 500,
      height: 500,
      // draggable: true
    });

    const bg = new Konva.Image({
      image: bgImage,
      x: 0, // 居中显示
      y: 0, // 居中显示
      width: 500,
      height: 500,
      // draggable: true
    });


    const rect = new Konva.Rect({
      x: 0,
      y: 0,
      width: stage.width(),
      height: stage.height(),
      fill: 'rgba(0,0,0,0)',
    })

    const maskImage = new Image();
    maskImage.src = 'http://192.168.0.105:13800/data/binary_image_1.png'
    // 设置图片允许跨域
    maskImage.crossOrigin = 'Anonymous';
    maskImage.onload = () => {
      // const maskImageUrl = convertImageBlackPartToTransparent(maskImage)
      // const mask = new Konva.Image({
      //   image: maskImageUrl,
      //   width: maskImageUrl.width,
      //   height: maskImageUrl.height,
      //   globalCompositeOperation: 'source-over'
      // });
      // //


      const canvas = document.createElement('canvas');
      canvas.width = maskImage.width;
      canvas.height = maskImage.height;
      const context = canvas.getContext('2d');
      console.log(maskImage.width, maskImage.height)

      context.drawImage(maskImage, 0, 0, maskImage.width, maskImage.height);
      const imageData = context.getImageData(0, 0, maskImage.width, maskImage.height);
      const data = imageData.data;

      // 处理图像数据，将黑色部分修改为透明
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // 判断是否为黑色 (r, g, b 都为 0)
        if (r === 0 && g === 0 && b === 0) {
          // 将黑色部分修改为透明
          data[i + 3] = 0; // 设置 alpha 通道为 0 (透明)
        }
      }

      // 将处理后的图像数据放回 canvas
      context.putImageData(imageData, 0, 0);
      const dataUrl = canvas.toDataURL()
      console.log(dataUrl)
      const tempImage = new Image()
      tempImage.src = dataUrl
      tempImage.onload = () => {
        const mask = new Konva.Image({
          image: tempImage,
          width: 500,
          height:500,
          globalCompositeOperation: 'destination-in'
        })

        drawLayer.value.add(konvaImage)
        drawLayer.value.add(mask)

        stage.add(drawLayer.value)
        // drawLayer.value.visible(false)
        // bgLayer.value.value(true)
        stage.add(bgLayer.value)

        bgLayer.value.add(bg)
        bgLayer.value.moveToBottom()
        bgLayer.value.visible(true)
      }

    };
  }

}


const handleTest = () => {
  bgLayer.value.visible(!bgLayer.value.visible())
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
        <el-button @click="handleTest">开始生成</el-button>
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