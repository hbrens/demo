<template>
  <div class="search-page">
    <!-- 搜索条件区域 -->
    <div class="search-container">
      <div class="card">
        <div class="search-form">
          <!-- 搜索框 -->
          <div class="search-item">
            <div class="label">关键词搜索：</div>
            <el-input
              v-model="searchForm.keyword"
              placeholder="请输入搜索关键词"
              clearable
              class="search-input"
            />
          </div>
          
          <!-- 筛选条件区域 -->
          <div class="filter-section">
            <!-- 在职状态 -->
            <div class="filter-item">
              <div class="label">在职状态：</div>
              <el-radio-group v-model="searchForm.status">
                <el-radio-button label="all">全部</el-radio-button>
                <el-radio-button label="active">在职</el-radio-button>
                <el-radio-button label="inactive">离职</el-radio-button>
              </el-radio-group>
            </div>
            
            <!-- 部门 -->
            <div class="filter-item">
              <div class="label">所属部门：</div>
              <el-checkbox-group v-model="searchForm.departments">
                <el-checkbox-button label="tech">技术部</el-checkbox-button>
                <el-checkbox-button label="hr">人力资源</el-checkbox-button>
                <el-checkbox-button label="marketing">市场部</el-checkbox-button>
                <el-checkbox-button label="sales">销售部</el-checkbox-button>
                <el-checkbox-button label="finance">财务部</el-checkbox-button>
              </el-checkbox-group>
            </div>

            <!-- 职级 -->
            <div class="filter-item">
              <div class="label">职级：</div>
              <el-radio-group v-model="searchForm.level">
                <el-radio-button label="all">全部</el-radio-button>
                <el-radio-button label="p1">P1</el-radio-button>
                <el-radio-button label="p2">P2</el-radio-button>
                <el-radio-button label="p3">P3</el-radio-button>
                <el-radio-button label="p4">P4</el-radio-button>
                <el-radio-button label="p5">P5+</el-radio-button>
              </el-radio-group>
            </div>

            <!-- 工作地点 -->
            <div class="filter-item">
              <div class="label">工作地点：</div>
              <el-checkbox-group v-model="searchForm.locations">
                <el-checkbox-button label="beijing">北京</el-checkbox-button>
                <el-checkbox-button label="shanghai">上海</el-checkbox-button>
                <el-checkbox-button label="guangzhou">广州</el-checkbox-button>
                <el-checkbox-button label="shenzhen">深圳</el-checkbox-button>
                <el-checkbox-button label="hangzhou">杭州</el-checkbox-button>
              </el-checkbox-group>
            </div>

            <!-- 入职时间 -->
            <div class="filter-item">
              <div class="label">入职时间：</div>
              <el-radio-group v-model="searchForm.joinTime">
                <el-radio-button label="all">全部</el-radio-button>
                <el-radio-button label="within_3">3个月内</el-radio-button>
                <el-radio-button label="within_6">6个月内</el-radio-button>
                <el-radio-button label="within_12">1年内</el-radio-button>
                <el-radio-button label="more_than_12">1年以上</el-radio-button>
              </el-radio-group>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="search-buttons">
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="table-container">
      <div class="card table-card">
        <!-- 表格内容后续添加 -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

// 搜索表单数据
const searchForm = reactive({
  keyword: '',
  status: 'all',
  departments: [],
  level: 'all',
  locations: [],
  joinTime: 'all'
})

// 搜索方法
const handleSearch = () => {
  console.log('搜索条件：', searchForm)
}

// 重置方法
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.status = 'all'
  searchForm.departments = []
  searchForm.level = 'all'
  searchForm.locations = []
  searchForm.joinTime = 'all'
}
</script>

<style lang="scss" scoped>
.search-page {
  padding: 20px;
  max-width: 1440px;
  margin: 0 auto;
  height: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  
  .search-container {
    margin-bottom: 15px;
    flex-shrink: 0;
  }

  .table-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .table-card {
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: auto;
    }
  }

  .search-form {
    .search-item {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
      
      .search-input {
        width: 300px;
      }
    }

    .filter-section {
      border-top: 1px solid var(--el-border-color-lighter);
      padding-top: 15px;
    }

    .filter-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 12px;

      &:last-child {
        margin-bottom: 0;
      }

      :deep(.el-radio-group),
      :deep(.el-checkbox-group) {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      :deep(.el-radio-button__inner),
      :deep(.el-checkbox-button__inner) {
        border-radius: 16px;
        border: 1px solid var(--el-border-color);
        margin: 0;
        padding: 4px 20px;
        height: 28px;
        line-height: 20px;
        font-size: 13px;
        transition: all 0.3s;
        min-width: 80px;
        text-align: center;
      }

      :deep(.el-radio-button:first-child .el-radio-button__inner),
      :deep(.el-checkbox-button:first-child .el-checkbox-button__inner) {
        border-radius: 16px;
      }

      :deep(.el-radio-button:last-child .el-radio-button__inner),
      :deep(.el-checkbox-button:last-child .el-checkbox-button__inner) {
        border-radius: 16px;
      }

      :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
        color: #fff;
        background-color: var(--el-color-primary);
        border-color: var(--el-color-primary);
        box-shadow: none;
      }

      :deep(.el-checkbox-button__original-checkbox:checked + .el-checkbox-button__inner) {
        color: #fff;
        background-color: var(--el-color-primary);
        border-color: var(--el-color-primary);
        box-shadow: none;
      }

      :deep(.el-radio-button__inner:hover),
      :deep(.el-checkbox-button__inner:hover) {
        color: var(--el-color-primary);
        border-color: var(--el-color-primary);
      }

      :deep(.el-radio-button__inner) {
        border-left: 1px solid var(--el-border-color);
      }

      :deep(.el-radio-button:first-child .el-radio-button__inner) {
        border-left: 1px solid var(--el-border-color);
      }

      :deep(.el-radio-button:not(:first-child) .el-radio-button__inner) {
        border-left: 1px solid var(--el-border-color);
      }

      :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
        border-left: 1px solid var(--el-color-primary);
      }
    }

    .label {
      width: 80px;
      margin-right: 8px;
      color: var(--el-text-color-regular);
      line-height: 28px;
      font-size: 13px;
    }

    .search-buttons {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid var(--el-border-color-lighter);
      text-align: center;

      .el-button {
        margin: 0 8px;
      }
    }
  }
}
</style>