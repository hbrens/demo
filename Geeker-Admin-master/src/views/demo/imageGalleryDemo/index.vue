<template>
  <div class="card image-gallery-demo">
    <!-- 搜索条件区域 -->
    <div class="search-section">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="关键词搜索">
          <el-input
            v-model="searchForm.keyword"
            placeholder="请输入图片名称或描述"
            clearable
            style="width: 300px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="图片类型">
          <el-select v-model="searchForm.type" placeholder="请选择" clearable style="width: 150px">
            <el-option label="全部" value="" />
            <el-option label="风景" value="landscape" />
            <el-option label="人物" value="portrait" />
            <el-option label="动物" value="animal" />
            <el-option label="建筑" value="architecture" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 配置区域 -->
    <div class="config-section">
      <el-form :inline="true" class="config-form">
        <el-form-item label="每行显示列数">
          <el-input-number
            v-model="columns"
            :min="2"
            :max="8"
            :step="1"
            style="width: 120px"
          />
        </el-form-item>
      </el-form>
    </div>

    <!-- 图片画廊区域 -->
    <div class="gallery-section">
      <div v-if="filteredImageList.length === 0" class="empty-state">
        <el-empty description="暂无图片数据" />
      </div>
      <div v-else class="gallery-grid">
        <GalleryImageCard
          v-for="(image, index) in paginatedImageList"
          :key="image.id"
          :image="image"
          :preview-image-list="previewImageList"
          :image-index="getImageIndex(image)"
          @click="handleImageClick"
        />
      </div>
    </div>

    <!-- 分页区域 -->
    <div class="pagination-section">
      <el-pagination
        v-model:current-page="pageable.pageNum"
        v-model:page-size="pageable.pageSize"
        :page-sizes="[12, 24, 48, 96]"
        :total="pageable.total"
        :background="true"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts" name="ImageGalleryDemo">
import { ref, computed, onMounted, watch } from "vue";
import { Search, Refresh } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import GalleryImageCard from "./components/GalleryImageCard.vue";

// 搜索表单
const searchForm = ref({
  keyword: "",
  type: ""
});

// 列数配置（可配置）
const columns = ref(5);

// 分页数据
const pageable = ref({
  pageNum: 1,
  pageSize: 12,
  total: 0
});

// 模拟图片数据（使用不同的尺寸，模拟真实场景中图片尺寸不一致的情况）
const imageList = ref([
  {
    id: 1,
    name: "美丽风景1",
    description: "壮丽的山川河流",
    url: "https://picsum.photos/800/600?random=1",
    type: "landscape"
  },
  {
    id: 2,
    name: "人物肖像1",
    description: "优雅的人物照片",
    url: "https://picsum.photos/400/600?random=2",
    type: "portrait"
  },
  {
    id: 3,
    name: "可爱动物1",
    description: "萌萌的小动物",
    url: "https://picsum.photos/500/500?random=3",
    type: "animal"
  },
  {
    id: 4,
    name: "现代建筑1",
    description: "现代都市建筑",
    url: "https://picsum.photos/1000/500?random=4",
    type: "architecture"
  },
  {
    id: 5,
    name: "美丽风景2",
    description: "宁静的湖泊",
    url: "https://picsum.photos/600/400?random=5",
    type: "landscape"
  },
  {
    id: 6,
    name: "人物肖像2",
    description: "时尚人像摄影",
    url: "https://picsum.photos/500/800?random=6",
    type: "portrait"
  },
  {
    id: 7,
    name: "可爱动物2",
    description: "野生动物",
    url: "https://picsum.photos/600/600?random=7",
    type: "animal"
  },
  {
    id: 8,
    name: "现代建筑2",
    description: "历史建筑",
    url: "https://picsum.photos/900/600?random=8",
    type: "architecture"
  },
  {
    id: 9,
    name: "美丽风景3",
    description: "日出美景",
    url: "https://picsum.photos/700/500?random=9",
    type: "landscape"
  },
  {
    id: 10,
    name: "人物肖像3",
    description: "艺术人像",
    url: "https://picsum.photos/300/500?random=10",
    type: "portrait"
  },
  {
    id: 11,
    name: "可爱动物3",
    description: "家养宠物",
    url: "https://picsum.photos/400/400?random=11",
    type: "animal"
  },
  {
    id: 12,
    name: "现代建筑3",
    description: "古典建筑",
    url: "https://picsum.photos/1200/600?random=12",
    type: "architecture"
  },
  {
    id: 13,
    name: "美丽风景4",
    description: "海边日落",
    url: "https://picsum.photos/550/400?random=13",
    type: "landscape"
  },
  {
    id: 14,
    name: "人物肖像4",
    description: "街头摄影",
    url: "https://picsum.photos/450/700?random=14",
    type: "portrait"
  },
  {
    id: 15,
    name: "可爱动物4",
    description: "鸟类摄影",
    url: "https://picsum.photos/650/650?random=15",
    type: "animal"
  },
  {
    id: 16,
    name: "现代建筑4",
    description: "摩天大楼",
    url: "https://picsum.photos/1100/550?random=16",
    type: "architecture"
  },
  {
    id: 17,
    name: "美丽风景5",
    description: "森林小径",
    url: "https://picsum.photos/750/450?random=17",
    type: "landscape"
  },
  {
    id: 18,
    name: "人物肖像5",
    description: "儿童摄影",
    url: "https://picsum.photos/350/600?random=18",
    type: "portrait"
  },
  {
    id: 19,
    name: "可爱动物5",
    description: "海洋生物",
    url: "https://picsum.photos/550/550?random=19",
    type: "animal"
  },
  {
    id: 20,
    name: "现代建筑5",
    description: "桥梁建筑",
    url: "https://picsum.photos/950/500?random=20",
    type: "architecture"
  }
]);

// 过滤后的图片列表
const filteredImageList = computed(() => {
  let result = imageList.value;

  // 关键词搜索
  if (searchForm.value.keyword) {
    const keyword = searchForm.value.keyword.toLowerCase();
    result = result.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword)
    );
  }

  // 类型筛选
  if (searchForm.value.type) {
    result = result.filter((item) => item.type === searchForm.value.type);
  }

  return result;
});

// 分页后的图片列表
const paginatedImageList = computed(() => {
  const start = (pageable.value.pageNum - 1) * pageable.value.pageSize;
  const end = start + pageable.value.pageSize;
  return filteredImageList.value.slice(start, end);
});

// 预览图片列表
const previewImageList = computed(() => {
  return filteredImageList.value.map((item) => item.url);
});

// 获取图片在预览列表中的索引
const getImageIndex = (image: any) => {
  return filteredImageList.value.findIndex((item) => item.id === image.id);
};

// 搜索
const handleSearch = () => {
  pageable.value.pageNum = 1;
  updateTotal();
  ElMessage.success("搜索完成");
};

// 重置
const handleReset = () => {
  searchForm.value = {
    keyword: "",
    type: ""
  };
  pageable.value.pageNum = 1;
  updateTotal();
  ElMessage.info("已重置搜索条件");
};

// 更新总数
const updateTotal = () => {
  pageable.value.total = filteredImageList.value.length;
};

// 分页大小改变
const handleSizeChange = (size: number) => {
  pageable.value.pageSize = size;
  pageable.value.pageNum = 1;
  updateTotal();
};

// 当前页改变
const handleCurrentChange = (page: number) => {
  pageable.value.pageNum = page;
};

// 图片点击事件
const handleImageClick = (image: any) => {
  console.log("点击图片:", image);
};

// 监听过滤结果变化，自动更新总数
watch(
  () => filteredImageList.value.length,
  () => {
    updateTotal();
    // 如果当前页超出范围，重置到第一页
    const maxPage = Math.ceil(filteredImageList.value.length / pageable.value.pageSize) || 1;
    if (pageable.value.pageNum > maxPage) {
      pageable.value.pageNum = 1;
    }
  }
);

// 初始化
onMounted(() => {
  updateTotal();
});
</script>

<style lang="scss" scoped>
.image-gallery-demo {
  width: 100%;
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  // 搜索区域
  .search-section {
    .search-form {
      :deep(.el-form-item) {
        margin-bottom: 0;
      }
    }
  }

  // 配置区域
  .config-section {
    padding: 10px 0;
    border-top: 1px solid var(--el-border-color-lighter);
    border-bottom: 1px solid var(--el-border-color-lighter);

    .config-form {
      :deep(.el-form-item) {
        margin-bottom: 0;
      }
    }
  }

  // 画廊区域
  .gallery-section {
    flex: 1;
    overflow-y: auto;
    min-height: 400px;

    .empty-state {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 400px;
    }

    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
      padding: 10px 0;
      
      // 根据容器宽度自动调整列数
      // minmax(200px, 1fr) 表示每列最小 200px，最大平均分配
      // auto-fill 会根据可用空间自动填充列数
    }
  }

  // 分页区域
  .pagination-section {
    display: flex;
    justify-content: center;
    padding: 20px 0;
    border-top: 1px solid var(--el-border-color-lighter);
  }
}

// 响应式设计 - 根据屏幕宽度自动调整最小列宽
@media (max-width: 1200px) {
  .image-gallery-demo {
    .gallery-section {
      .gallery-grid {
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      }
    }
  }
}

@media (max-width: 768px) {
  .image-gallery-demo {
    .gallery-section {
      .gallery-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 12px;
      }
    }
  }
}

@media (max-width: 480px) {
  .image-gallery-demo {
    .gallery-section {
      .gallery-grid {
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 10px;
      }
    }
  }
}
</style>