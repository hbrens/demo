<template>
  <div class="yaml-editor-container">
    <el-button type="primary" @click="openEditor">
      <el-icon><Edit /></el-icon>
      打开YAML编辑器
    </el-button>

    <el-dialog
      v-model="dialogVisible"
      title="YAML编辑器"
      width="80%"
      :before-close="handleClose"
      destroy-on-close
    >
      <div class="editor-toolbar">
        <el-button-group>
          <el-button @click="formatYaml" :disabled="!editor">
            <el-icon></el-icon>
            格式化
          </el-button>
          <el-button @click="validateYaml" :disabled="!editor">
            <el-icon><Check /></el-icon>
            验证
          </el-button>
          <el-button @click="clearContent" :disabled="!editor">
            <el-icon><Delete /></el-icon>
            清空
          </el-button>
        </el-button-group>
        
        <el-button-group>
          <el-button @click="loadExample" :disabled="!editor">
            <el-icon><Document /></el-icon>
            加载示例
          </el-button>
          <el-button @click="copyContent" :disabled="!editor">
            <el-icon><CopyDocument /></el-icon>
            复制
          </el-button>
        </el-button-group>
      </div>

      <div class="editor-wrapper">
        <div ref="editorContainer" class="codemirror-editor"></div>
      </div>

      <div v-if="errorMessage" class="error-message">
        <el-alert
          :title="errorMessage"
          type="error"
          :closable="false"
          show-icon
        />
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="handleSave" :loading="saving">
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Check, Delete, Document, CopyDocument } from '@element-plus/icons-vue'
import { EditorView, basicSetup } from 'codemirror'
import { yaml } from '@codemirror/lang-yaml'
import * as yamlParser from 'js-yaml'

// 响应式数据
const dialogVisible = ref(false)
const editor = ref(null)
const editorContainer = ref(null)
const errorMessage = ref('')
const saving = ref(false)

// 示例YAML内容
const exampleYaml = `# 示例YAML配置
database:
  host: localhost
  port: 5432
  username: admin
  password: secret
  ssl: true
  pool:
    min: 5
    max: 20
    idle: 30000

server:
  port: 3000
  host: 0.0.0.0
  cors:
    origin: "*"
    methods: ["GET", "POST", "PUT", "DELETE"]
    credentials: true

logging:
  level: info
  format: json
  outputs:
    - console
    - file
  file:
    path: ./logs/app.log
    maxSize: 10MB
    maxFiles: 5

features:
  - authentication
  - authorization
  - rate_limiting
  - caching
  - monitoring

environment: production
debug: false
version: "1.0.0"`

// 打开编辑器
const openEditor = () => {
  dialogVisible.value = true
  nextTick(() => {
    initEditor()
  })
}

// 初始化编辑器
const initEditor = () => {
  if (!editorContainer.value) return
  
  try {
    // 创建CodeMirror编辑器实例
    editor.value = new EditorView({
      doc: exampleYaml,
      extensions: [
        basicSetup,
        yaml(),
        EditorView.theme({
          "&": {
            height: "100%",
            backgroundColor: "#ffffff"
          },
          ".cm-content": {
            padding: "12px",
            fontSize: "14px",
            lineHeight: "1.5",
            color: "#333333"
          },
          ".cm-focused": {
            outline: "none"
          },
          ".cm-editor": {
            backgroundColor: "#ffffff"
          },
          ".cm-scroller": {
            fontFamily: '"Fira Code", "JetBrains Mono", "Consolas", monospace'
          },
          ".cm-gutters": {
            backgroundColor: "#f8f9fa",
            borderRight: "1px solid #e9ecef"
          },
          ".cm-lineNumbers": {
            color: "#6c757d"
          },
          ".cm-activeLine": {
            backgroundColor: "#f8f9fa"
          },
          ".cm-selectionBackground": {
            backgroundColor: "#b3d4fc"
          }
        }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            errorMessage.value = ''
          }
        })
      ],
      parent: editorContainer.value
    })

    // 监听窗口大小变化
    window.addEventListener('resize', handleResize)
  } catch (error) {
    console.error('初始化编辑器失败:', error)
    ElMessage.error('初始化编辑器失败')
  }
}

// 处理窗口大小变化
const handleResize = () => {
  if (editor.value) {
    editor.value.requestMeasure()
  }
}

// 格式化YAML
const formatYaml = () => {
  if (!editor.value) return
  
  try {
    const content = editor.value.state.doc.toString()
    if (!content.trim()) {
      ElMessage.warning('编辑器内容为空')
      return
    }

    // 解析并重新格式化YAML
    const parsed = yamlParser.load(content)
    const formatted = yamlParser.dump(parsed, {
      indent: 2,
      lineWidth: 120,
      noRefs: true,
      sortKeys: false
    })
    
    editor.value.dispatch({
      changes: {
        from: 0,
        to: editor.value.state.doc.length,
        insert: formatted
      }
    })
    ElMessage.success('格式化完成')
  } catch (error) {
    errorMessage.value = `YAML格式错误: ${error.message}`
    ElMessage.error('YAML格式错误，无法格式化')
  }
}

// 验证YAML
const validateYaml = () => {
  if (!editor.value) return
  
  try {
    const content = editor.value.state.doc.toString()
    if (!content.trim()) {
      ElMessage.warning('编辑器内容为空')
      return
    }

    yamlParser.load(content)
    errorMessage.value = ''
    ElMessage.success('YAML格式正确')
  } catch (error) {
    errorMessage.value = `YAML验证失败: ${error.message}`
    ElMessage.error('YAML格式错误')
  }
}

// 清空内容
const clearContent = () => {
  if (!editor.value) return
  
  ElMessageBox.confirm(
    '确定要清空编辑器内容吗？',
    '确认清空',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    editor.value.dispatch({
      changes: {
        from: 0,
        to: editor.value.state.doc.length,
        insert: ''
      }
    })
    errorMessage.value = ''
    ElMessage.success('内容已清空')
  }).catch(() => {
    // 用户取消
  })
}

// 加载示例
const loadExample = () => {
  if (!editor.value) return
  
  ElMessageBox.confirm(
    '确定要加载示例内容吗？当前内容将被覆盖。',
    '确认加载示例',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    editor.value.dispatch({
      changes: {
        from: 0,
        to: editor.value.state.doc.length,
        insert: exampleYaml
      }
    })
    errorMessage.value = ''
    ElMessage.success('示例内容已加载')
  }).catch(() => {
    // 用户取消
  })
}

// 复制内容
const copyContent = async () => {
  if (!editor.value) return
  
  try {
    const content = editor.value.state.doc.toString()
    await navigator.clipboard.writeText(content)
    ElMessage.success('内容已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 保存内容
const handleSave = () => {
  if (!editor.value) return
  
  saving.value = true
  
  try {
    const content = editor.value.state.doc.toString()
    
    // 验证YAML格式
    if (content.trim()) {
      yamlParser.load(content)
    }
    
    // 这里可以添加保存到服务器的逻辑
    console.log('保存的YAML内容:', content)
    
    setTimeout(() => {
      saving.value = false
      ElMessage.success('保存成功')
      dialogVisible.value = false
    }, 1000)
    
  } catch (error) {
    saving.value = false
    errorMessage.value = `保存失败: ${error.message}`
    ElMessage.error('YAML格式错误，无法保存')
  }
}

// 关闭对话框
const handleClose = () => {
  if (editor.value) {
    const content = editor.value.state.doc.toString()
    if (content.trim() && content !== exampleYaml) {
      ElMessageBox.confirm(
        '编辑器中有未保存的内容，确定要关闭吗？',
        '确认关闭',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        dialogVisible.value = false
      }).catch(() => {
        // 用户取消
      })
    } else {
      dialogVisible.value = false
    }
  } else {
    dialogVisible.value = false
  }
}

// 组件卸载时清理
onUnmounted(() => {
  if (editor.value) {
    editor.value.destroy()
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.yaml-editor-container {
  padding: 20px;
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 6px;
}

.editor-wrapper {
  height: 500px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.codemirror-editor {
  height: 100%;
  width: 100%;
}

.error-message {
  margin-top: 16px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-dialog__header) {
  padding: 20px 20px 10px;
}

:deep(.el-dialog__footer) {
  padding: 10px 20px 20px;
}
</style>