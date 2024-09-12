<script setup>
import {onMounted, ref} from 'vue'
import Konva from 'konva'

const operatorDomRef = ref(null)
const imageUrl = 'https://p6-flow-imagex-sign.byteimg.com/ocean-cloud-tos/image_skill/62bd027c-9190-4d50-b34e-87f60d622dac_1725298328882658190~tplv-a9rns2rl98-web-image.jpeg?rk3s=b14c611d&x-expires=1756834329&x-signature=PrWOpy3qhKMSIB1mFg7VWvIOdzM%3D'

const binaryImages = [
  'http://127.0.0.1:13800/binary_image_0.png',
  'http://127.0.0.1:13800/binary_image_1.png',
  'http://127.0.0.1:13800/binary_image_2.png',
]
const stageContainer = ref(null)
const init = () => {
  const stage = new Konva.Stage({
    container: stageContainer.value,
    width: 500,
    height: 500,
  })

  const layer = new Konva.Layer();

  const imageObj = new Image();
  imageObj.src = imageUrl;
  imageObj.onload = () => {

    // 创建一个 Konva Image 对象
    const konvaImage = new Konva.Image({
      image: imageObj,
      x: (stage.width() - 500) / 2, // 居中显示
      y: (stage.height() -  500) / 2, // 居中显示
      width: 500,
      height: 500,
      // draggable: true
    });




    // 将 Image 添加到 Layer 中
    layer.add(konvaImage);

    // 将 Layer 添加到 Stage 中
    stage.add(layer);

    // 绘制 Layer
    layer.draw();
    // 加载二值图并绘制半透明图形

    binaryImages.forEach(path => {
      loadBinaryImage(path);
    });
  }


  // 加载二值图并绘制半透明图形
  function loadBinaryImage(imageSrc) {
    const image = new Image();
    image.src = imageSrc;
    image.crossOrigin = 'Anonymous'; // 设置 CORS 属性
    image.onload = function() {
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // 创建一个新的 Konva 图像对象
      const konvaImage = new Konva.Image({
        image: canvas,
        x: 0,
        y: 0,
        width: canvas.width,
        height: canvas.height,
        // opacity: 0.3, // 设置透明度
        filters: [Konva.Filters.RGBA]
      });

      // 将黑色部分设置为透明
      konvaImage.cache();
      konvaImage.red(0);
      konvaImage.green(0);
      konvaImage.blue(0);
      konvaImage.alpha(0);

      // 将图像添加到图层中
      layer.add(konvaImage);
      layer.draw();
    };
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