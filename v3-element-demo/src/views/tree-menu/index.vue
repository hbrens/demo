<template>
  <div class="tree-menu-container">
    <!-- 左侧菜单区域 -->
    <div class="left-menu">
      <div class="menu-header">
        <h3>系统菜单</h3>
      </div>
      <el-tree
        :data="menuData"
        :props="treeProps"
        node-key="id"
        :default-expand-all="false"
        :expand-on-click-node="false"
        @node-click="handleNodeClick"
        class="menu-tree"
      >
        <template #default="{ node, data }">
          <div class="tree-node">
            <el-icon v-if="data.icon" class="node-icon">
              <component :is="data.icon" />
            </el-icon>
            <span class="node-label">{{ data.label }}</span>
          </div>
        </template>
      </el-tree>
    </div>

    <!-- 右侧内容区域 -->
    <div class="right-content">
      <div class="content-header">
        <h2>{{ currentMenuTitle }}</h2>
        <p>{{ currentMenuDescription }}</p>
      </div>
      <div class="content-body">
        <div v-if="!currentMenuTitle" class="welcome-content">
          <el-empty description="请选择左侧菜单项查看内容" />
        </div>
        <div v-else class="menu-content">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>{{ currentMenuTitle }}</span>
                <el-tag type="info">{{ currentMenuLevel }}</el-tag>
              </div>
            </template>
            <div class="content-details">
              <p><strong>菜单ID:</strong> {{ currentMenuId }}</p>
              <p><strong>菜单路径:</strong> {{ currentMenuPath }}</p>
              <p><strong>菜单描述:</strong> {{ currentMenuDescription }}</p>
              <div v-if="currentMenuChildren && currentMenuChildren.length > 0" class="children-info">
                <p><strong>子菜单数量:</strong> {{ currentMenuChildren.length }}</p>
                <el-tag 
                  v-for="child in currentMenuChildren" 
                  :key="child.id" 
                  class="child-tag"
                  @click="handleChildClick(child)"
                >
                  {{ child.label }}
                </el-tag>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { 
  Document, 
  Folder, 
  FolderOpened, 
  Setting, 
  User, 
  DataAnalysis,
  Monitor,
  Tools,
  DocumentAdd,
  Edit,
  Delete,
  View,
  Search,
  Download,
  Upload
} from '@element-plus/icons-vue'

// 树形菜单配置
const treeProps = {
  children: 'children',
  label: 'label'
}

// 当前选中的菜单信息
const currentMenuTitle = ref('')
const currentMenuDescription = ref('')
const currentMenuId = ref('')
const currentMenuPath = ref('')
const currentMenuLevel = ref('')
const currentMenuChildren = ref([])

// Mock 菜单数据 - 包含两级和三级菜单
const menuData = ref([
  {
    id: '1',
    label: '系统管理',
    icon: 'Setting',
    description: '系统管理相关功能模块',
    path: '/system',
    level: '一级菜单',
    children: [
      {
        id: '1-1',
        label: '用户管理',
        icon: 'User',
        description: '管理系统用户信息',
        path: '/system/user',
        level: '二级菜单',
        children: [
          {
            id: '1-1-1',
            label: '用户列表',
            icon: 'Document',
            description: '查看和管理用户列表',
            path: '/system/user/list',
            level: '三级菜单'
          },
          {
            id: '1-1-2',
            label: '添加用户',
            icon: 'DocumentAdd',
            description: '添加新用户',
            path: '/system/user/add',
            level: '三级菜单'
          },
          {
            id: '1-1-3',
            label: '用户权限',
            icon: 'Tools',
            description: '管理用户权限设置',
            path: '/system/user/permission',
            level: '三级菜单'
          }
        ]
      },
      {
        id: '1-2',
        label: '角色管理',
        icon: 'Tools',
        description: '管理系统角色和权限',
        path: '/system/role',
        level: '二级菜单',
        children: [
          {
            id: '1-2-1',
            label: '角色列表',
            icon: 'Document',
            description: '查看和管理角色列表',
            path: '/system/role/list',
            level: '三级菜单'
          },
          {
            id: '1-2-2',
            label: '权限配置',
            icon: 'Setting',
            description: '配置角色权限',
            path: '/system/role/permission',
            level: '三级菜单'
          }
        ]
      },
      {
        id: '1-3',
        label: '系统设置',
        icon: 'Setting',
        description: '系统基础配置',
        path: '/system/config',
        level: '二级菜单'
      }
    ]
  },
  {
    id: '2',
    label: '数据管理',
    icon: 'DataAnalysis',
    description: '数据管理和分析功能',
    path: '/data',
    level: '一级菜单',
    children: [
      {
        id: '2-1',
        label: '数据导入',
        icon: 'Upload',
        description: '导入外部数据',
        path: '/data/import',
        level: '二级菜单',
        children: [
          {
            id: '2-1-1',
            label: 'Excel导入',
            icon: 'Document',
            description: '从Excel文件导入数据',
            path: '/data/import/excel',
            level: '三级菜单'
          },
          {
            id: '2-1-2',
            label: 'CSV导入',
            icon: 'Document',
            description: '从CSV文件导入数据',
            path: '/data/import/csv',
            level: '三级菜单'
          }
        ]
      },
      {
        id: '2-2',
        label: '数据导出',
        icon: 'Download',
        description: '导出数据到外部文件',
        path: '/data/export',
        level: '二级菜单'
      },
      {
        id: '2-3',
        label: '数据统计',
        icon: 'DataAnalysis',
        description: '数据统计和分析报表',
        path: '/data/statistics',
        level: '二级菜单'
      }
    ]
  },
  {
    id: '3',
    label: '监控中心',
    icon: 'Monitor',
    description: '系统监控和日志管理',
    path: '/monitor',
    level: '一级菜单',
    children: [
      {
        id: '3-1',
        label: '系统监控',
        icon: 'Monitor',
        description: '实时监控系统状态',
        path: '/monitor/system',
        level: '二级菜单'
      },
      {
        id: '3-2',
        label: '日志管理',
        icon: 'Document',
        description: '查看和管理系统日志',
        path: '/monitor/logs',
        level: '二级菜单',
        children: [
          {
            id: '3-2-1',
            label: '操作日志',
            icon: 'Document',
            description: '查看用户操作日志',
            path: '/monitor/logs/operation',
            level: '三级菜单'
          },
          {
            id: '3-2-2',
            label: '错误日志',
            icon: 'Document',
            description: '查看系统错误日志',
            path: '/monitor/logs/error',
            level: '三级菜单'
          }
        ]
      }
    ]
  },
  {
    id: '4',
    label: '帮助中心',
    icon: 'Document',
    description: '系统帮助和文档',
    path: '/help',
    level: '一级菜单',
    children: [
      {
        id: '4-1',
        label: '使用手册',
        icon: 'Document',
        description: '系统使用说明文档',
        path: '/help/manual',
        level: '二级菜单'
      },
      {
        id: '4-2',
        label: '常见问题',
        icon: 'Search',
        description: '常见问题解答',
        path: '/help/faq',
        level: '二级菜单'
      }
    ]
  }
])

// 处理菜单节点点击事件
const handleNodeClick = (data, node) => {
  currentMenuTitle.value = data.label
  currentMenuDescription.value = data.description || ''
  currentMenuId.value = data.id
  currentMenuPath.value = data.path || ''
  currentMenuLevel.value = data.level || ''
  currentMenuChildren.value = data.children || []
}

// 处理子菜单点击事件
const handleChildClick = (child) => {
  handleNodeClick(child)
}
</script>

<style scoped>
.tree-menu-container {
  display: flex;
  height: 100vh;
  background-color: #f5f5f5;
}

.left-menu {
  width: 300px;
  background-color: #fff;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.menu-header {
  padding: 20px;
  border-bottom: 1px solid #e4e7ed;
  background-color: #fafafa;
}

.menu-header h3 {
  margin: 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.menu-tree {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
}

.tree-node {
  display: flex;
  align-items: center;
  padding: 5px 0;
}

.node-icon {
  margin-right: 8px;
  color: #606266;
  font-size: 16px;
}

.node-label {
  color: #303133;
  font-size: 14px;
}

.right-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  margin: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.content-header {
  padding: 20px;
  border-bottom: 1px solid #e4e7ed;
  background-color: #fafafa;
  border-radius: 8px 8px 0 0;
}

.content-header h2 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.content-header p {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.content-body {
  flex: 1;
  padding: 20px;
}

.welcome-content {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.menu-content {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content-details p {
  margin: 10px 0;
  color: #606266;
  font-size: 14px;
}

.children-info {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.child-tag {
  margin: 5px 10px 5px 0;
  cursor: pointer;
  transition: all 0.3s;
}

.child-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* 树形菜单样式优化 */
:deep(.el-tree-node__content) {
  height: 40px;
  line-height: 40px;
  border-radius: 4px;
  margin: 2px 0;
  transition: all 0.3s;
}

:deep(.el-tree-node__content:hover) {
  background-color: #f0f9ff;
  color: #409eff;
}

:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background-color: #e6f7ff;
  color: #409eff;
  font-weight: 600;
}

:deep(.el-tree-node__expand-icon) {
  color: #606266;
  font-size: 14px;
}

:deep(.el-tree-node__expand-icon.is-leaf) {
  color: transparent;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tree-menu-container {
    flex-direction: column;
  }
  
  .left-menu {
    width: 100%;
    height: 200px;
  }
  
  .right-content {
    margin: 10px;
  }
}
</style>
