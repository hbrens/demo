<template>
  <div class="yaml-config-container">
    <!-- 头部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <h2>YAML配置文件编辑器</h2>
        <el-input
          v-model="filePath"
          placeholder="YAML文件路径"
          style="width: 300px; margin-left: 20px"
        />
      </div>
      <div class="toolbar-right">
        <el-button type="primary" @click="saveConfig">
          <el-icon><Check /></el-icon>
          保存配置
        </el-button>
        <el-button @click="exportYaml">
          <el-icon><Download /></el-icon>
          导出YAML
        </el-button>
        <el-button @click="simulateImport">
          <el-icon><Upload /></el-icon>
          模拟导入
        </el-button>
        <el-button @click="loadConfig">
          <el-icon><Upload /></el-icon>
          加载配置
        </el-button>
        <el-button @click="newConfig">
          <el-icon><Plus /></el-icon>
          新建配置
        </el-button>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 左侧配置项列表 -->
      <div class="left-panel">
        <div class="panel-header">
          <h3>配置项列表</h3>
          <el-button type="primary" size="small" @click="showAddDialog = true">
            <el-icon><Plus /></el-icon>
            添加配置项
          </el-button>
        </div>
        
        <div class="config-list">
          <div
            v-for="(item, index) in configItems"
            :key="index"
            class="config-item"
            :class="{ active: selectedIndex === index }"
            @click="selectConfigItem(index)"
          >
            <div class="item-key">{{ item.key }}</div>
            <div class="item-value">{{ formatValue(item.value, item.type) }}</div>
            <div class="item-type">{{ getTypeLabel(item.type) }}</div>
          </div>
        </div>
        
        <div class="list-summary">
          <span>{{ configItems.length }}个配置项</span>
          <span class="valid-count">{{ validCount }}有效</span>
        </div>
      </div>

      <!-- 右侧配置项详情 -->
      <div class="right-panel">
        <div class="panel-header">
          <h3>配置项详情</h3>
        </div>
        
        <div v-if="selectedItem" class="config-details">
          <div class="form-group">
            <label>配置项名称</label>
            <el-input v-model="selectedItem.key" placeholder="例如: max_retries" />
          </div>
          
          <div class="form-group">
            <label>配置项类型</label>
            <div class="type-buttons">
              <el-button
                v-for="type in configTypes"
                :key="type.value"
                :type="selectedItem.type === type.value ? 'primary' : ''"
                size="small"
                @click="selectedItem.type = type.value"
              >
                {{ type.label }}
              </el-button>
            </div>
          </div>
          
          <div class="form-group">
            <label>{{ getValueLabel(selectedItem.type) }}</label>
            <component
              v-if="selectedItem.type !== 'list'"
              :is="getValueComponent(selectedItem.type)"
              v-model="selectedItem.value"
              :placeholder="getValuePlaceholder(selectedItem.type)"
              @input="validateValue"
            />
            <div v-else class="list-checkbox-group">
              <el-checkbox-group 
                :model-value="Array.isArray(selectedItem.value) ? selectedItem.value : []" 
                @update:model-value="updateListValue"
              >
                <el-checkbox 
                  v-for="option in listOptions" 
                  :key="option" 
                  :label="option"
                  class="list-checkbox-item"
                >
                  {{ option }}
                </el-checkbox>
              </el-checkbox-group>
              
              <!-- 新增选项区域 -->
              <div class="add-option-section">
                <el-input 
                  v-model="newOption" 
                  placeholder="输入新选项"
                  size="small"
                  class="add-option-input"
                />
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="addNewOption"
                  :disabled="!newOption.trim()"
                >
                  添加
                </el-button>
              </div>
            </div>
            <div v-if="selectedItem.type === 'path'" class="path-preview">
              <el-tag :type="isPathValid ? 'success' : 'danger'" size="small">
                {{ isPathValid ? '路径有效' : '路径无效' }}
              </el-tag>
            </div>
          </div>
          
          <div class="form-group">
            <label>配置项描述</label>
            <el-input
              v-model="selectedItem.description"
              type="textarea"
              :rows="3"
              placeholder="描述此配置项的用途和作用"
            />
          </div>
          
          <div class="form-actions">
            <el-button type="danger" @click="deleteConfigItem">
              <el-icon><Delete /></el-icon>
              删除配置项
            </el-button>
            <el-button type="primary" @click="saveConfigItem">
              <el-icon><Check /></el-icon>
              保存配置项
            </el-button>
          </div>
        </div>
        
        <div v-else class="no-selection">
          <el-empty description="请选择一个配置项进行编辑" />
        </div>
      </div>
    </div>

    <!-- 底部YAML预览 -->
    <div class="bottom-panel">
      <div class="panel-header">
        <h3>YAML预览</h3>
        <el-button size="small" @click="refreshPreview">
          <el-icon><Refresh /></el-icon>
          刷新预览
        </el-button>
      </div>
      <div class="yaml-preview">
        <pre><code>{{ yamlContent }}</code></pre>
      </div>
    </div>

    <!-- 添加配置项对话框 -->
    <el-dialog
      v-model="showAddDialog"
      title="新建配置项"
      width="400px"
      @close="resetNewItem"
    >
      <div class="add-dialog-content">
        <div class="form-group">
          <label>配置项名称</label>
          <el-input v-model="newItem.key" placeholder="例如: max_retries" />
        </div>
        
        <div class="form-group">
          <label>配置项类型</label>
          <el-select v-model="newItem.type" placeholder="选择类型" style="width: 100%">
            <el-option
              v-for="type in configTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="addConfigItem">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as yaml from 'js-yaml'
import { 
  Check, 
  Download, 
  Upload, 
  Plus, 
  Delete, 
  Refresh 
} from '@element-plus/icons-vue'

// 响应式数据
const filePath = ref('/data/configs/data_pipeline.yaml')
const configItems = ref([])
const selectedIndex = ref(-1)
const showAddDialog = ref(false)
const newItem = ref({ key: '', type: 'string' })

// 配置项类型定义
const configTypes = [
  { value: 'string', label: '字符串' },
  { value: 'number', label: '数值' },
  { value: 'boolean', label: '布尔值' },
  { value: 'path', label: '路径' },
  { value: 'list', label: '列表' }
]

// 预定义的列表选项配置
const predefinedListOptions = {
  'target_systems': [
    'data_lake',
    'data_warehouse', 
    'kafka',
    'redis',
    'mysql',
    'postgresql',
    'mongodb',
    'elasticsearch'
  ],
  'file_formats': [
    'parquet',
    'csv',
    'json',
    'avro',
    'orc',
    'xlsx',
    'xml'
  ],
  'processing_stages': [
    'extraction',
    'transformation',
    'validation',
    'loading',
    'cleaning',
    'aggregation'
  ],
  'cors_origins': [
    'https://example.com',
    'https://app.example.com',
    'http://localhost:3000',
    'https://api.example.com'
  ]
}

// 动态计算列表选项
const listOptions = computed(() => {
  if (!selectedItem.value || selectedItem.value.type !== 'list') {
    return []
  }
  
  const key = selectedItem.value.key
  const predefined = predefinedListOptions[key]
  
  if (predefined) {
    return predefined
  }
  
  // 对于没有预定义选项的列表，根据当前值生成选项
  const currentValue = selectedItem.value.value
  if (Array.isArray(currentValue) && currentValue.length > 0) {
    // 如果当前有值，使用这些值作为选项
    return currentValue
  }
  
  // 否则提供默认选项
  return ['1', '2', '3', '4', '5']
})

// 新增选项输入
const newOption = ref('')

// 计算属性
const selectedItem = computed(() => {
  return selectedIndex.value >= 0 ? configItems.value[selectedIndex.value] : null
})

const validCount = computed(() => {
  return configItems.value.filter(item => item.key && item.value !== undefined).length
})

const yamlContent = computed(() => {
  if (configItems.value.length === 0) {
    return `# YAML配置文件预览
# 请添加配置项来生成YAML内容

# 示例配置项：
# source_path: /data/sources/raw_data
# target_systems:
#   - data_lake
#   - data_warehouse
# file_formats:
#   - parquet
#   - csv
#   - json
# enable_compression: true
# batch_size: 10000
# filters: \${DATE_RANGE}, \${DATA_QUALITY}`
  }
  
  try {
    const config = {}
    configItems.value.forEach(item => {
      if (item.key) {
        config[item.key] = parseValue(item.value, item.type)
      }
    })
    
    // 生成带注释的YAML
    let yamlStr = yaml.dump(config, { 
      indent: 2,
      lineWidth: 120,
      noRefs: true,
      sortKeys: false
    })
    
    // 为每个配置项添加描述注释
    configItems.value.forEach(item => {
      if (item.key && item.description) {
        const lines = yamlStr.split('\n')
        const keyLineIndex = lines.findIndex(line => line.trim().startsWith(item.key + ':'))
        if (keyLineIndex !== -1) {
          // 在键值对上方添加描述注释
          lines.splice(keyLineIndex, 0, `# ${item.description}`)
          yamlStr = lines.join('\n')
        }
      }
    })
    
    return yamlStr
  } catch (error) {
    return `# 生成YAML时出错: ${error.message}`
  }
})

const isPathValid = computed(() => {
  if (!selectedItem.value || selectedItem.value.type !== 'path') return true
  const path = selectedItem.value.value
  return path && path.startsWith('/') && path.length > 1
})

// 方法
const selectConfigItem = (index) => {
  selectedIndex.value = index
}

const updateListValue = (newValue) => {
  if (selectedItem.value) {
    selectedItem.value.value = newValue
    validateValue()
  }
}

const addNewOption = () => {
  const option = newOption.value.trim()
  if (!option) return
  
  const key = selectedItem.value?.key
  if (!key) return
  
  // 如果当前配置项有预定义选项，添加到预定义选项中
  if (predefinedListOptions[key]) {
    if (!predefinedListOptions[key].includes(option)) {
      predefinedListOptions[key].push(option)
    }
  } else {
    // 如果没有预定义选项，创建一个新的预定义选项列表
    predefinedListOptions[key] = [option]
  }
  
  newOption.value = ''
}

const formatValue = (value, type) => {
  if (value === undefined || value === null) return ''
  
  switch (type) {
    case 'list':
      return Array.isArray(value) ? value.join(', ') : value
    case 'boolean':
      return value ? 'true' : 'false'
    default:
      return String(value)
  }
}

const getTypeLabel = (type) => {
  const typeMap = {
    string: '字符串',
    number: '数值',
    boolean: '布尔值',
    path: '路径',
    list: '列表'
  }
  return typeMap[type] || type
}

const getValueLabel = (type) => {
  const labelMap = {
    string: '字符串值',
    number: '数值',
    boolean: '布尔值',
    path: '路径值',
    list: '列表值'
  }
  return labelMap[type] || '值'
}

const getValuePlaceholder = (type) => {
  const placeholderMap = {
    string: '请输入字符串',
    number: '请输入数值',
    path: '/path/to/directory',
    list: '选择列表项'
  }
  return placeholderMap[type] || '请输入值'
}

const getValueComponent = (type) => {
  switch (type) {
    case 'boolean':
      return 'el-switch'
    case 'list':
      return 'list-checkbox'
    case 'number':
      return 'el-input-number'
    default:
      return 'el-input'
  }
}

const parseValue = (value, type) => {
  if (value === undefined || value === null) return ''
  
  switch (type) {
    case 'number':
      return Number(value)
    case 'boolean':
      return Boolean(value)
    case 'list':
      return Array.isArray(value) ? value : []
    default:
      return String(value)
  }
}

const validateValue = () => {
  // 这里可以添加更复杂的验证逻辑
}

const addConfigItem = () => {
  if (!newItem.value.key) {
    ElMessage.error('请输入配置项名称')
    return
  }
  
  if (configItems.value.some(item => item.key === newItem.value.key)) {
    ElMessage.error('配置项名称已存在')
    return
  }
  
  const item = {
    key: newItem.value.key,
    type: newItem.value.type,
    value: getDefaultValue(newItem.value.type),
    description: ''
  }
  
  configItems.value.push(item)
  selectedIndex.value = configItems.value.length - 1
  showAddDialog.value = false
  resetNewItem()
  ElMessage.success('配置项添加成功')
}

const getDefaultValue = (type) => {
  switch (type) {
    case 'number':
      return 0
    case 'boolean':
      return false
    case 'list':
      return []
    case 'object':
      return {}
    default:
      return ''
  }
}

const resetNewItem = () => {
  newItem.value = { key: '', type: 'string' }
}

const saveConfigItem = () => {
  if (!selectedItem.value) return
  
  if (!selectedItem.value.key) {
    ElMessage.error('请输入配置项名称')
    return
  }
  
  ElMessage.success('配置项保存成功')
}

const deleteConfigItem = () => {
  if (selectedIndex.value < 0) return
  
  ElMessageBox.confirm('确定要删除这个配置项吗？', '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    configItems.value.splice(selectedIndex.value, 1)
    selectedIndex.value = -1
    ElMessage.success('配置项删除成功')
  }).catch(() => {
    // 用户取消
  })
}

const saveConfig = () => {
  ElMessage.success('配置保存成功')
}

const exportYaml = () => {
  if (configItems.value.length === 0) {
    ElMessage.warning('没有配置项可导出')
    return
  }
  
  const blob = new Blob([yamlContent.value], { type: 'text/yaml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `config-${new Date().getTime()}.yaml`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  ElMessage.success('YAML文件导出成功')
}

const simulateImport = () => {
  // 模拟YAML内容
  const mockYamlContent = `# 模拟导入的YAML配置
database:
  host: localhost
  port: 5432
  username: admin
  password: secret123

redis:
  host: redis-server
  port: 6379
  password: redis123

logging:
  level: info
  file: /var/log/app.log
  max_size: 100MB
  max_files: 5

features:
  enable_cache: true
  enable_metrics: false
  debug_mode: false

api:
  rate_limit: 1000
  timeout: 30s
  cors_origins:
    - "https://example.com"
    - "https://app.example.com"

# 路径配置示例
paths:
  data_directory: /data/raw
  output_directory: /data/processed
  temp_directory: /tmp/processing
  log_directory: /var/logs/application
  config_file: /etc/app/config.yaml

# 列表配置示例
target_systems:
  - data_lake
  - data_warehouse
  - kafka
  - redis

file_formats:
  - parquet
  - csv
  - json
  - avro

processing_stages:
  - extraction
  - transformation
  - validation
  - loading

# 混合类型配置
data_pipeline:
  source_path: /data/sources/raw_data
  output_path: /data/outputs/processed_data
  supported_formats:
    - parquet
    - csv
    - json
  enable_compression: true
  batch_size: 10000
  retry_attempts: 3
  timeout_seconds: 300`

  try {
    // 解析YAML内容
    const parsedData = yaml.load(mockYamlContent)
    
    // 清空现有配置
    configItems.value = []
    
    // 将解析的数据转换为配置项格式
    const convertToConfigItems = (obj, prefix = '') => {
      const items = []
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key
        
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          // 递归处理嵌套对象
          items.push(...convertToConfigItems(value, fullKey))
        } else {
          // 检测类型
          let detectedType = typeof value
          if (Array.isArray(value)) {
            detectedType = 'list'
          } else if (typeof value === 'string' && (
            value.startsWith('/') || 
            value.includes('\\') || 
            value.includes('.yaml') || 
            value.includes('.yml') ||
            value.includes('.json') ||
            value.includes('.csv') ||
            value.includes('.log')
          )) {
            detectedType = 'path'
          }
          
          // 创建配置项
          items.push({
            id: Date.now() + Math.random(),
            key: fullKey,
            value: Array.isArray(value) ? value : String(value),
            type: detectedType,
            description: `从YAML导入的配置项: ${fullKey}`,
            required: false,
            editable: true
          })
        }
      }
      return items
    }
    
    configItems.value = convertToConfigItems(parsedData)
    
    ElMessage.success(`成功导入 ${configItems.value.length} 个配置项`)
  } catch (error) {
    ElMessage.error(`YAML解析失败: ${error.message}`)
  }
}

const loadConfig = () => {
  ElMessage.info('加载配置功能待实现')
}

const newConfig = () => {
  ElMessageBox.confirm('确定要新建配置吗？当前配置将被清空。', '确认新建', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    configItems.value = []
    selectedIndex.value = -1
    ElMessage.success('已新建配置')
  }).catch(() => {
    // 用户取消
  })
}

const refreshPreview = () => {
  ElMessage.success('预览已刷新')
}

// 初始化示例数据
const initSampleData = () => {
  configItems.value = [
    {
      key: 'source_path',
      type: 'path',
      value: '/data/sources/raw_data',
      description: '数据源的原始数据路径，所有待处理的原始数据都存储在该目录下'
    },
    {
      key: 'target_systems',
      type: 'list',
      value: ['data_lake', 'data_warehouse'],
      description: '目标系统列表，数据将被发送到这些系统'
    },
    {
      key: 'file_formats',
      type: 'list',
      value: ['parquet', 'csv', 'json'],
      description: '支持的文件格式列表'
    },
    {
      key: 'enable_compression',
      type: 'boolean',
      value: true,
      description: '是否启用数据压缩'
    },
    {
      key: 'batch_size',
      type: 'number',
      value: 10000,
      description: '批处理大小'
    },
    {
      key: 'filters',
      type: 'variable',
      value: '${DATE_RANGE}, ${DATA_QUALITY}',
      description: '数据过滤条件变量'
    }
  ]
}

// 组件挂载时初始化
import { onMounted } from 'vue'
onMounted(() => {
  initSampleData()
})
</script>

<style scoped>
.yaml-config-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toolbar-left {
  display: flex;
  align-items: center;
}

.toolbar-left h2 {
  margin: 0;
  color: #303133;
  font-size: 20px;
  font-weight: 600;
}

.toolbar-right {
  display: flex;
  gap: 12px;
}

.main-content {
  flex: 1;
  display: flex;
  min-height: 0;
}

.left-panel, .right-panel {
  background: white;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.left-panel {
  width: 300px;
  min-width: 300px;
}

.right-panel {
  flex: 1;
  min-width: 400px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e4e7ed;
  background: #fafafa;
}

.panel-header h3 {
  margin: 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.config-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.config-item {
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.config-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.config-item.active {
  border-color: #409eff;
  background: #f0f9ff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.item-key {
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.item-value {
  color: #606266;
  font-size: 12px;
  margin-bottom: 4px;
  word-break: break-all;
}

.item-type {
  color: #909399;
  font-size: 11px;
}

.list-summary {
  padding: 12px 20px;
  border-top: 1px solid #e4e7ed;
  background: #fafafa;
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #606266;
}

.valid-count {
  color: #67c23a;
  font-weight: 600;
}

.config-details {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #303133;
  font-weight: 500;
}

.type-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.path-preview {
  margin-top: 8px;
}

.list-checkbox-group {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 12px;
  background: #fafafa;
}

.list-checkbox-item {
  display: inline-block;
  margin-right: 16px;
  margin-bottom: 8px;
  min-width: 120px;
}

.add-option-section {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  gap: 8px;
  align-items: center;
}

.add-option-input {
  flex: 1;
  max-width: 200px;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.no-selection {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bottom-panel {
  background: white;
  border-top: 1px solid #e4e7ed;
  height: 350px;
  display: flex;
  flex-direction: column;
}

.yaml-preview {
  flex: 1;
  padding: 20px;
  background: #f8f9fa;
  overflow: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  margin: 0 20px 20px 20px;
}

.yaml-preview pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.add-dialog-content {
  padding: 20px 0;
}

.add-dialog-content .form-group {
  margin-bottom: 20px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .left-panel {
    width: 250px;
    min-width: 250px;
  }
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }
  
  .left-panel, .right-panel {
    width: 100%;
    min-width: auto;
  }
  
  .left-panel {
    height: 200px;
  }
  
  .bottom-panel {
    height: 250px;
  }
  
  .toolbar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .toolbar-right {
    justify-content: center;
  }
}
</style>