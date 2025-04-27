<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRecruitmentStatsStore } from '@/stores/modules/stats/recruitmentStats'
import type { Ref } from 'vue'

interface RecruitmentData {
  id: string;
  name: string;
  owner: string;
  status: string;
  [key: string]: any;
}

const recruitmentStatsStore = useRecruitmentStatsStore()

// 监听store中的数据
const campusData = computed(() => recruitmentStatsStore.campusData)
const internalData = computed(() => recruitmentStatsStore.internalData)
const odData = computed(() => recruitmentStatsStore.odData)
const postDocData = computed(() => recruitmentStatsStore.postDocData)

// 定义状态列表
const statusList = ['沟通中', '面试中', '已入职', '其他', '总计']

// 定义渠道列表
const channels = [
  { key: 'campus', label: '校园招聘' },
  { key: 'internal', label: '内部转岗' },
  { key: 'od', label: '社会招聘' },
  { key: 'postDoc', label: '博士后' }
]

// 计算各个owner的招聘状态数据
const ownerStatusData = computed(() => {
  const ownerStats: Record<string, Record<string, Record<string, number>>> = {}
  
  // 初始化数据结构
  const initializeOwnerData = (owner: string) => {
    if (!ownerStats[owner]) {
      ownerStats[owner] = {}
      channels.forEach(channel => {
        ownerStats[owner][channel.key] = {
          '沟通中': 0,
          '面试中': 0,
          '已入职': 0,
          '其他': 0,
          '总计': 0
        }
      })
    }
  }

  // 处理每个渠道的数据
  const processChannelData = (data: RecruitmentData[], channelKey: string) => {
    if (!data?.length) return
    data.forEach(item => {
      initializeOwnerData(item.owner)
      
      // 增加总计
      ownerStats[item.owner][channelKey]['总计']++
      
      // 根据状态分类
      if (['沟通中', '面试中', '已入职'].includes(item.status)) {
        ownerStats[item.owner][channelKey][item.status]++
      } else {
        // 其他状态归类到"其他"
        ownerStats[item.owner][channelKey]['其他']++
      }
    })
  }

  // 处理所有渠道的数据
  processChannelData(campusData.value, 'campus')
  processChannelData(internalData.value, 'internal')
  processChannelData(odData.value, 'od')
  processChannelData(postDocData.value, 'postDoc')

  // 转换数据格式为表格所需的结构
  return Object.entries(ownerStats).map(([owner, channelStats]) => {
    const rowData: any = { owner }
    channels.forEach(channel => {
      Object.entries(channelStats[channel.key]).forEach(([status, count]) => {
        rowData[`${channel.key}_${status}`] = count
      })
    })
    return rowData
  })
})

// 获取表头的样式
const getHeaderCellStyle = () => {
  return {
    backgroundColor: '#f0f5ff',
    color: '#262626',
    padding: '8px 0',
    fontWeight: '600'
  }
}

// 获取单元格的样式
const getCellStyle = (row: any, column: any) => {
  const baseStyle = {
    padding: '4px 0'
  }
  
  if (column?.property?.endsWith('总计')) {
    return {
      ...baseStyle,
      fontWeight: 'bold',
      color: '#1890ff'
    }
  }
  return baseStyle
}

// 获取列的最小宽度
const getColumnMinWidth = (type: 'owner' | 'status') => {
  return type === 'owner' ? 100 : 80  // owner列最小100px，状态列最小80px
}
</script>

<template>
  <div class="chart-card">
    <div class="card-header">
      <h3>Owner招聘状态分布</h3>
    </div>
    <el-table
      :data="ownerStatusData"
      :cell-style="getCellStyle"
      :header-cell-style="getHeaderCellStyle"
      border
      stripe
      style="width: 100%"
    >
      <el-table-column
        prop="owner"
        label="Owner"
        width="120"
        fixed="left"
        align="center"
      />
      
      <el-table-column
        v-for="channel in channels"
        :key="channel.key"
        :label="channel.label"
        align="center"
      >
        <el-table-column
          v-for="status in statusList"
          :key="`${channel.key}_${status}`"
          :prop="`${channel.key}_${status}`"
          :label="status"
          align="center"
          width="80"
        >
          <template #default="{ row }">
            {{ row[`${channel.key}_${status}`] }}
          </template>
        </el-table-column>
      </el-table-column>
    </el-table>
  </div>
</template>

<style lang="scss" scoped>
.chart-card {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  height: 480px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.card-header {
  margin-bottom: 24px;
  text-align: center;
  flex-shrink: 0;

  h3 {
    margin: 0;
    font-size: 22px;
    color: #262626;
    font-weight: 600;
    position: relative;
    display: inline-block;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 50%;
      width: 60px;
      height: 3px;
      background: linear-gradient(90deg, #1890ff, #52c41a);
      transform: translateX(-50%);
      border-radius: 3px;
    }
  }
}

:deep(.el-table) {
  // 基础样式
  --el-table-border-color: #d9d9d9;
  --el-table-header-bg-color: #f0f5ff;
  --el-table-row-hover-bg-color: #f5f5f5;
  
  // 表格整体样式
  width: 100%;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  border-radius: 8px;
  
  // 表格容器样式
  .el-table__body-wrapper {
    overflow-x: auto;
    overflow-y: auto;
    
    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;
      
      &:hover {
        background: #a8a8a8;
      }
    }
    
    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }
  }
  
  // 单元格样式
  td {
    font-size: 14px;
    color: #262626;
    padding: 8px 4px;
    border: 1px solid #d9d9d9 !important;
    white-space: nowrap;
  }
  
  // 表头单元格样式
  th {
    border: 1px solid #d9d9d9 !important;
    padding: 8px 4px !important;
    white-space: nowrap;
    background-color: var(--el-table-header-bg-color) !important;
  }
  
  // 固定列样式
  .el-table__fixed {
    height: 100% !important;
    box-shadow: 4px 0 8px rgba(0, 0, 0, 0.1);
    
    .el-table__fixed-header-wrapper,
    .el-table__fixed-body-wrapper {
      background-color: #fff;
    }
  }
  
  // 取消原有的一些边框样式，避免重复
  .el-table__cell {
    border-right: none;
  }
  
  // 表头样式
  .el-table__header-wrapper {
    border-bottom: 1px solid #e6f7ff;
    
    th {
      font-size: 14px;
      font-weight: 600;
      color: #262626;
      background-color: var(--el-table-header-bg-color);
      padding: 12px 8px;
      transition: all 0.3s;
      
      &.is-leaf {
        border-bottom: 2px solid #e6f7ff;
      }
    }
  }
  
  // 总计列样式
  td.total-column {
    font-weight: 600;
    color: #1890ff;
    background-color: rgba(24, 144, 255, 0.05);
  }
  
  // 各状态单元格高亮样式
  td .cell {
    &:not(:empty) {
      position: relative;
      
      &:hover {
        transform: scale(1.05);
        transition: transform 0.2s;
      }
    }
  }
  
  // hover效果
  tbody tr:hover td {
    background-color: rgba(24, 144, 255, 0.03);
  }
  
  // 校园招聘渠道样式
  tr td[class*="campus_"] .cell:not(:empty) {
    color: #1890ff;
    font-weight: 500;
  }
  
  // 内部转岗渠道样式
  tr td[class*="internal_"] .cell:not(:empty) {
    color: #52c41a;
    font-weight: 500;
  }
  
  // 社会招聘渠道样式
  tr td[class*="od_"] .cell:not(:empty) {
    color: #722ed1;
    font-weight: 500;
  }
  
  // 博士后渠道样式
  tr td[class*="postDoc_"] .cell:not(:empty) {
    color: #fa8c16;
    font-weight: 500;
  }
  
  // 招聘中状态样式
  tr td[class*="_招聘中"] .cell:not(:empty) {
    position: relative;
    
    &::before {
      content: '';
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: #1890ff;
      margin-right: 4px;
      position: relative;
      top: -1px;
    }
  }
  
  // 已入职状态样式
  tr td[class*="_已入职"] .cell:not(:empty) {
    font-weight: 600;
    color: #13c2c2;
  }
  
  // 放弃状态样式
  tr td[class*="_放弃"] .cell:not(:empty) {
    color: #f5222d;
  }
}
</style> 