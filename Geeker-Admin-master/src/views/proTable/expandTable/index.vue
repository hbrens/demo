<template>
  <div class="dataset-table-container">
    <!-- 表头 -->
    <div class="table-header">
      <div class="header-cell expand-header-cell">
        <!-- 展开列标题 -->
      </div>
      <div 
        v-for="column in columns" 
        :key="column.prop" 
        class="header-cell" 
        :style="column.width === 'auto' ? { flex: 1 } : { width: column.width }"
      >
        {{ column.label }}
      </div>
    </div>
    
    <!-- 数据行 -->
    <div class="data-rows">
      <div 
        v-for="(item, index) in tableData" 
        :key="index" 
        class="data-row"
      >
        <!-- 主行内容 -->
        <div class="data-row-main">
          <!-- 展开图标 -->
          <div class="expand-icon-cell">
            <el-icon 
              class="expand-icon" 
              :class="{ 'expanded': expandedRows.includes(index) }"
              @click="toggleExpand(index)"
            >
              <ArrowRight />
            </el-icon>
          </div>
          
          <!-- 数据列 -->
          <div 
            v-for="column in columns" 
            :key="column.prop" 
            class="data-cell" 
            :style="column.width === 'auto' ? { flex: 1 } : { width: column.width }"
          >
            <!-- 数据集名称列 -->
            <div v-if="column.prop === 'name'" class="dataset-name">
              <el-icon><Document /></el-icon>
              <span>{{ item[column.prop] }}</span>
            </div>
            <!-- 状态列 -->
            <el-tag 
              v-else-if="column.prop === 'status'"
              :type="item.status === 'normal' ? 'success' : item.status === 'processing' ? 'warning' : 'danger'"
            >
              {{ item.status === 'normal' ? '正常' : item.status === 'processing' ? '处理中' : '错误' }}
            </el-tag>
            <!-- 操作列 -->
            <div v-else-if="column.prop === 'operation'" class="operation-buttons">
              <el-button type="primary" size="small" @click="handleEdit(item)">编辑</el-button>
              <el-button type="success" size="small" @click="handleView(item)">查看</el-button>
              <el-button type="danger" size="small" @click="handleDelete(item)">删除</el-button>
            </div>
            <!-- 其他列 -->
            <span v-else>{{ item[column.prop] }}</span>
          </div>
        </div>
        
        <!-- 展开内容 -->
        <div v-if="expandedRows.includes(index)" class="expand-content">
          <div class="expand-content-inner">
            <h4>详细信息</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">创建时间：</span>
                <span class="detail-value">{{ item.createTime }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">更新时间：</span>
                <span class="detail-value">{{ item.updateTime }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">数据大小：</span>
                <span class="detail-value">{{ item.size }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">描述：</span>
                <span class="detail-value">{{ item.description || '暂无描述' }}</span>
              </div>
            </div>
            <div class="expand-actions">
              <el-button type="primary" size="small" @click="handleEdit(item)">编辑详情</el-button>
              <el-button type="info" size="small" @click="handleView(item)">查看详情</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="DatasetTable">
import { ref } from "vue";
import { Document, ArrowRight } from "@element-plus/icons-vue";

// 列配置
const columns = [
  {
    prop: "name",
    label: "数据集名称",
    width: "200px"
  },
  {
    prop: "createTime",
    label: "创建日期",
    width: "120px"
  },
  {
    prop: "size",
    label: "数据大小",
    width: "100px"
  },
  {
    prop: "status",
    label: "状态",
    width: "80px"
  },
  {
    prop: "operation",
    label: "操作",
    width: "auto" // 自动占满剩余宽度
  }
];

// 展开状态管理
const expandedRows = ref<number[]>([]);

// 模拟数据
const tableData = ref([
  {
    id: 1,
    name: "用户行为数据集",
    createTime: "2024-01-15 10:30:00",
    updateTime: "2024-01-15 16:45:00",
    size: "2.5GB",
    status: "normal",
    description: "包含用户点击、浏览、购买等行为数据，用于用户行为分析和推荐算法训练"
  },
  {
    id: 2,
    name: "销售数据分析集",
    createTime: "2024-01-14 15:20:00",
    updateTime: "2024-01-14 18:30:00",
    size: "1.8GB",
    status: "processing",
    description: "销售订单、客户信息、产品销量等数据，用于销售趋势分析和预测"
  },
  {
    id: 3,
    name: "产品推荐数据集",
    createTime: "2024-01-13 09:15:00",
    updateTime: "2024-01-13 14:20:00",
    size: "3.2GB",
    status: "normal",
    description: "用户偏好、产品特征、评分数据等，用于个性化推荐系统"
  },
  {
    id: 4,
    name: "市场调研数据集",
    createTime: "2024-01-12 14:45:00",
    updateTime: "2024-01-12 16:10:00",
    size: "1.2GB",
    status: "error",
    description: "市场调研问卷、用户反馈、竞品分析等数据"
  },
  {
    id: 5,
    name: "客户画像数据集",
    createTime: "2024-01-11 11:30:00",
    updateTime: "2024-01-11 15:45:00",
    size: "4.1GB",
    status: "normal",
    description: "客户基本信息、消费习惯、偏好标签等，用于客户细分和精准营销"
  }
]);

// 展开/收起函数
const toggleExpand = (index: number) => {
  const expandedIndex = expandedRows.value.indexOf(index);
  if (expandedIndex > -1) {
    // 收起行
    expandedRows.value.splice(expandedIndex, 1);
    console.log('收起行:', index, tableData.value[index]);
  } else {
    // 展开行
    expandedRows.value.push(index);
    const currentRow = tableData.value[index];
    console.log('展开行:', index, currentRow);
    
    // 触发展开事件，传递当前行信息
    handleRowExpand(currentRow, index);
  }
};

// 处理行展开事件
const handleRowExpand = (rowData: any, rowIndex: number) => {
  console.log('=== 行展开事件 ===');
  console.log('行索引:', rowIndex);
  console.log('行数据:', rowData);
  console.log('数据集名称:', rowData.name);
  console.log('状态:', rowData.status);
  console.log('创建时间:', rowData.createTime);
  console.log('更新时间:', rowData.updateTime);
  console.log('==================');
  
  // 这里可以添加你需要的其他逻辑
  // 比如：发送请求获取详细信息、更新状态等
};

// 操作函数
const handleEdit = (row: any) => {
  console.log("编辑", row);
};

const handleView = (row: any) => {
  console.log("查看", row);
};

const handleDelete = (row: any) => {
  console.log("删除", row);
};
</script>

<style scoped>
.dataset-table-container {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* 表头样式 */
.table-header {
  display: flex;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  padding: 0;
  margin-bottom: 12px;
  border: 1px solid #e4e7ed;
}

.header-cell {
  padding: 16px 12px;
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.expand-header-cell {
  width: 40px;
  flex: none;
}

/* 数据行样式 */
.data-rows {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.data-row {
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.data-row:hover {
  background-color: #f5f7fa;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: #409eff;
}

.data-row-main {
  display: flex;
  align-items: center;
}

/* 展开图标样式 */
.expand-icon-cell {
  width: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px 8px;
  flex: none;
}

.expand-icon {
  font-size: 16px;
  color: #909399;
  cursor: pointer;
  transition: all 0.3s ease;
  transform: rotate(0deg);
}

.expand-icon:hover {
  color: #409eff;
  transform: scale(1.1);
}

.expand-icon.expanded {
  transform: rotate(90deg);
  color: #409eff;
}

/* 展开内容样式 */
.expand-content {
  background: #f8f9fa;
  border-top: 1px solid #e4e7ed;
  margin: 0 8px 8px 8px;
  border-radius: 0 0 6px 6px;
  animation: expandDown 0.3s ease-out;
}

.expand-content-inner {
  padding: 20px;
}

.expand-content h4 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 24px;
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  align-items: center;
}

.detail-label {
  color: #606266;
  font-weight: 500;
  margin-right: 8px;
  min-width: 80px;
}

.detail-value {
  color: #303133;
  flex: 1;
}

.expand-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

@keyframes expandDown {
  from {
    opacity: 0;
    max-height: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    max-height: 200px;
    transform: translateY(0);
  }
}

.data-cell {
  padding: 16px 12px;
  display: flex;
  align-items: center;
  font-size: 14px;
}

.dataset-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.operation-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

:deep(.el-button) {
  border-radius: 4px;
  font-weight: 500;
  transition: all 0.3s ease;
}

:deep(.el-button:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

:deep(.el-tag) {
  border-radius: 12px;
  font-weight: 500;
}
</style>
