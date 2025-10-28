<template>
  <div class="version-table-container">
    <el-table :data="versionData" style="width: 100%" border>
      <!-- 第一列：版本名称 -->
      <el-table-column prop="versionName" label="版本名称" width="200" align="center">
        <template #default="{ row }">
          <div class="version-name">
            <el-tag type="primary" size="large">{{ row.versionName }}</el-tag>
          </div>
        </template>
      </el-table-column>

      <!-- 第二列：版本历史步骤条 -->
      <el-table-column prop="versionHistory" label="版本历史" min-width="400">
        <template #default="{ row }">
          <div class="version-history">
            <el-steps :active="row.versionHistory.length - 1" direction="horizontal" finish-status="success">
              <el-step 
                v-for="(version, index) in row.versionHistory" 
                :key="index"
              >
                <template #icon>
                  <div class="version-card">
                    <div class="card-header" :style="{ backgroundColor: getCardColor(index) }">
                      <span class="version-number">{{ version.version }}</span>
                    </div>
                    <div class="card-content">
                      <p class="version-desc">{{ version.description }}</p>
                      <p class="version-date">{{ version.date }}</p>
                    </div>
                  </div>
                </template>
              </el-step>
            </el-steps>
          </div>
        </template>
      </el-table-column>

      <!-- 第三列：操作按钮 -->
      <el-table-column label="操作" width="200" align="center">
        <template #default="{ row }">
          <div class="action-buttons">
            <el-button type="primary" size="small" icon="Edit">编辑</el-button>
            <el-button type="danger" size="small" icon="Delete">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 模拟版本数据
const versionData = ref([
  {
    versionName: 'V1.0.0',
    versionHistory: [
      { version: 'V0.1.0', description: '初始版本', date: '2023-01-01' },
      { version: 'V0.2.0', description: '基础功能', date: '2023-01-15' },
      { version: 'V0.3.0', description: 'UI优化', date: '2023-02-01' },
      { version: 'V1.0.0', description: '正式发布', date: '2023-02-15' }
    ]
  },
  {
    versionName: 'V2.0.0',
    versionHistory: [
      { version: 'V1.0.0', description: '基础版本', date: '2023-02-15' },
      { version: 'V1.1.0', description: 'bug修复', date: '2023-03-01' },
      { version: 'V1.2.0', description: '性能优化', date: '2023-03-15' },
      { version: 'V1.3.0', description: '新功能', date: '2023-04-01' },
      { version: 'V1.4.0', description: '安全更新', date: '2023-04-15' },
      { version: 'V2.0.0', description: '重大更新', date: '2023-05-01' }
    ]
  },
  {
    versionName: 'V3.0.0',
    versionHistory: [
      { version: 'V2.0.0', description: '上一版本', date: '2023-05-01' },
      { version: 'V2.1.0', description: '小修复', date: '2023-05-15' },
      { version: 'V2.2.0', description: '功能增强', date: '2023-06-01' },
      { version: 'V3.0.0', description: '架构重构', date: '2023-06-15' }
    ]
  },
  {
    versionName: 'V4.0.0',
    versionHistory: [
      { version: 'V3.0.0', description: '重构版本', date: '2023-06-15' },
      { version: 'V3.1.0', description: '稳定性提升', date: '2023-07-01' },
      { version: 'V3.2.0', description: '用户体验优化', date: '2023-07-15' },
      { version: 'V3.3.0', description: 'API更新', date: '2023-08-01' },
      { version: 'V3.4.0', description: '性能提升', date: '2023-08-15' },
      { version: 'V3.5.0', description: '安全加固', date: '2023-09-01' },
      { version: 'V4.0.0', description: '全面升级', date: '2023-09-15' }
    ]
  }
])

// 获取卡片背景色
const getCardColor = (index: number) => {
  const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399', '#9C27B0', '#FF9800']
  return colors[index % colors.length]
}
</script>

<style scoped lang="scss">
.version-table-container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.version-name {
  display: flex;
  justify-content: center;
  align-items: center;
}

.version-history {
  padding: 10px 0;
  overflow-x: auto;
  
  :deep(.el-steps) {
    display: flex !important;
    min-width: max-content;
    justify-content: flex-start !important;
    
    .el-step__line {
      background-color: #e4e7ed;
    }
    
    .el-step__icon {
      width: auto;
      height: auto;
      background: none;
      border: none;
    }
  }
}

.version-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-width: 120px;
  max-width: 150px;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.card-header {
  padding: 8px 12px;
  color: white;
  font-weight: bold;
  text-align: center;
  border-radius: 8px 8px 0 0;
  
  .version-number {
    font-size: 14px;
    font-weight: 600;
  }
}

.card-content {
  padding: 10px 12px;
  
  .version-desc {
    margin: 0 0 5px 0;
    font-size: 12px;
    color: #606266;
    line-height: 1.4;
    word-break: break-all;
  }
  
  .version-date {
    margin: 0;
    font-size: 11px;
    color: #909399;
  }
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
}

:deep(.el-table) {
  .el-table__header {
    background-color: #fafafa;
  }
  
  .el-table__row {
    &:hover {
      background-color: #f5f7fa;
    }
  }
}

:deep(.el-steps--horizontal) {
  .el-step {
    flex: 0 0 200px !important;
    margin-right: 0 !important;
    position: relative;
    width: 200px !important;
    
    &:not(:last-child) {
      .el-step__line {
        position: absolute;
        top: 15px;
        left: 100px;
        right: -100px;
        height: 2px;
        background-color: #e4e7ed;
        z-index: 1;
      }
    }
  }
  
  .el-step__icon {
    margin-top: 0;
    position: relative;
    z-index: 2;
    width: 30px;
    height: 30px;
  }
  
  .el-step__title {
    display: none;
  }
  
  .el-step__description {
    display: none;
  }
}
</style>