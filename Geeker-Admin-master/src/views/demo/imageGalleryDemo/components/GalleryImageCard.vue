<template>
  <div class="gallery-item" @click="handleClick">
    <div class="image-wrapper">
      <!-- 检查中状态 -->
      <div v-if="checkStatus === 'checking'" class="image-checking">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>检查中...</span>
      </div>
      <!-- 图片不存在 -->
      <div v-else-if="checkStatus === 'not-exists'" class="image-error">
        <el-icon><Picture /></el-icon>
        <span>图片不存在</span>
      </div>
      <!-- 图片存在，正常加载 -->
      <el-image
        v-else
        :src="image.url"
        :alt="image.name"
        fit="contain"
        :lazy="true"
        class="gallery-image"
        :preview-src-list="previewImageList"
        :initial-index="imageIndex"
        @error="handleImageError"
      >
        <template #error>
          <div class="image-error">
            <el-icon><Picture /></el-icon>
            <span>加载失败</span>
          </div>
        </template>
      </el-image>
    </div>
    <div class="image-info">
      <div class="image-desc">{{ image.description }}</div>
    </div>
  </div>
</template>

<script setup lang="ts" name="GalleryImageCard">
import { ref, onMounted } from "vue";
import { Picture, Loading } from "@element-plus/icons-vue";

interface ImageItem {
  id: number;
  name: string;
  description: string;
  url: string;
  type: string;
  // 可选：原图 URL，如果提供则检查原图，否则检查缩略图
  originalUrl?: string;
}

interface Props {
  image: ImageItem;
  previewImageList: string[];
  imageIndex: number;
  // 是否启用图片存在性检查
  checkImageExists?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  checkImageExists: true
});

const emit = defineEmits<{
  click: [image: ImageItem];
}>();

// 检查状态：checking(检查中) | exists(存在) | not-exists(不存在) | error(检查出错)
const checkStatus = ref<"checking" | "exists" | "not-exists" | "error">("checking");

const handleClick = () => {
  emit("click", props.image);
};

/**
 * 检查图片是否存在
 * 使用 HEAD 请求，只获取响应头，不下载图片内容，更轻量
 */
const checkImageExists = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      mode: "cors", // 处理跨域
      cache: "no-cache" // 不使用缓存，确保检查最新状态
    });
    
    // 状态码 200-299 表示成功
    return response.ok;
  } catch (error) {
    console.warn("检查图片是否存在时出错:", error);
    // 如果检查失败（可能是跨域问题），返回 true，让图片尝试加载
    // 这样即使检查失败，也不影响正常图片的显示
    return true;
  }
};

/**
 * 初始化图片检查
 */
const initImageCheck = async () => {
  if (!props.checkImageExists) {
    // 如果不启用检查，直接设置为存在状态
    checkStatus.value = "exists";
    return;
  }

  // 优先检查原图，如果没有原图 URL 则检查缩略图
  const urlToCheck = props.image.originalUrl || props.image.url;
  
  try {
    checkStatus.value = "checking";
    const exists = await checkImageExists(urlToCheck);
    
    if (exists) {
      checkStatus.value = "exists";
    } else {
      checkStatus.value = "not-exists";
    }
  } catch (error) {
    console.error("图片检查过程出错:", error);
    // 检查出错时，设置为存在状态，让图片尝试加载
    // 这样即使检查失败，也不影响正常图片的显示
    checkStatus.value = "exists";
  }
};

/**
 * 图片加载错误处理
 */
const handleImageError = () => {
  // 如果图片加载失败，更新状态
  if (checkStatus.value === "exists") {
    // 如果之前检查是存在的，但实际加载失败，可能是检查时存在但后来被删除了
    // 或者检查的是原图，但缩略图不存在
    checkStatus.value = "not-exists";
  }
};

// 组件挂载时检查图片
onMounted(() => {
  initImageCheck();
});
</script>

<style lang="scss" scoped>
.gallery-item {
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }

  .image-wrapper {
    position: relative;
    width: 100%;
    height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background-color: #f5f7fa;
    box-sizing: border-box;

    .gallery-image {
      width: 100%;
      height: 100%;
      background-color: #eee;
      border-radius: 8px;

      :deep(.el-image__inner) {
        width: 100%;
        height: 100%;
        object-fit: fit;
      }
    }

    .image-checking {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      color: var(--el-text-color-placeholder);
      font-size: 14px;
      width: 100%;
      height: 100%;

      .el-icon {
        font-size: 24px;
      }
    }

    .image-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      color: var(--el-text-color-placeholder);
      font-size: 14px;
      width: 100%;
      height: 100%;

      .el-icon {
        font-size: 24px;
      }
    }
  }

  .image-info {
    padding: 12px 16px;
    background-color: #fff;
    border-top: 1px solid var(--el-border-color-lighter);

    .image-name {
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin-bottom: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .image-desc {
      font-size: 12px;
      color: var(--el-text-color-regular);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>

