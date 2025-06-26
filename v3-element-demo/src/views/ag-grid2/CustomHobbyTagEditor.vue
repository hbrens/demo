<template>
  <div class="custom-tag-editor" @keyup.enter.stop>
    <div class="custom-tag-editor__preset-section">
      <div class="custom-tag-editor__section-title">
        <i class="el-icon-star-on"></i>
        常用标签
      </div>
      <div class="custom-tag-editor__preset-tags">
        <el-tag
          v-for="tag in presetTags"
          :key="tag"
          size="small"
          class="custom-tag-editor__preset-tag"
          @click="addPresetTag(tag)"
          :disable-transitions="true"
          type="info"
        >
          {{ tag }}
        </el-tag>
      </div>
    </div>
    
    <div class="custom-tag-editor__edit-section">
      <div class="custom-tag-editor__section-title">
        <i class="el-icon-edit"></i>
        已选中标签
      </div>
      <div class="custom-tag-editor__tag-list">
        <el-tag
          v-for="(tag, idx) in tags"
          :key="tag"
          closable
          @close="removeTag(idx)"
          class="custom-tag-editor__edit-tag"
          type="success"
        >
          {{ tag }}
        </el-tag>
        <el-input
          v-if="inputVisible"
          v-model="inputValue"
          size="small"
          class="custom-tag-editor__input-new-tag"
          @keyup.enter.stop="(event) => handleInputConfirm(event)"
          @keydown.enter.stop
          @blur="handleInputConfirm"
          ref="inputRef"
          placeholder="输入标签..."
        />
        <el-button v-else size="small" class="custom-tag-editor__add-btn" @click="showInput">
          <i class="el-icon-plus"></i>
          添加标签
        </el-button>
      </div>
    </div>

    <div class="custom-tag-editor__actions">
      <el-button size="small" @click="handleCancel" class="custom-tag-editor__cancel-btn">取消</el-button>
      <el-button size="small" type="primary" @click="handleConfirm" class="custom-tag-editor__confirm-btn">确定</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { ElTag, ElInput, ElButton } from 'element-plus'

const props = defineProps({
  params: Object
})

// 预制常用标签 - 控制在4-6个字
const presetTags = ['游泳阅读', '阅读', '音乐', '跑步']

// 当前标签
const tags = ref([])
const inputValue = ref('')
const inputVisible = ref(false)
const inputRef = ref(null)

// 初始化
onMounted(() => {
  // 支持字符串或数组
  let val = props.params.value
  if (typeof val === 'string') {
    tags.value = val ? val.split(',').map(s => s.trim()).filter(Boolean) : []
  } else if (Array.isArray(val)) {
    tags.value = [...val]
  } else {
    tags.value = []
  }
})

const addPresetTag = (tag) => {
  if (!tags.value.includes(tag)) {
    tags.value.push(tag)
  }
}

const removeTag = (idx) => {
  tags.value.splice(idx, 1)
}

const showInput = () => {
  inputVisible.value = true
  nextTick(() => {
    inputRef.value && inputRef.value.focus()
  })
}

const handleInputConfirm = (event) => {
  // 如果是enter键事件，阻止冒泡避免触发ag-grid的确认
  if (event && event.type === 'keyup') {
    event.stopPropagation()
    event.preventDefault()
  }
  
  const val = inputValue.value.trim()
  if (val && !tags.value.includes(val)) {
    tags.value.push(val)
  }
  inputVisible.value = false
  inputValue.value = ''
}

const handleConfirm = () => {
  // 触发确定事件
  if (props.params && props.params.api) {
    props.params.api.stopEditing()
  }
}

const handleCancel = () => {
  // 恢复原始值
  tags.value = []
  let val = props.params.value
  if (typeof val === 'string') {
    tags.value = val ? val.split(',').map(s => s.trim()).filter(Boolean) : []
  } else if (Array.isArray(val)) {
    tags.value = [...val]
  }
  
  // 停止编辑
  if (props.params && props.params.api) {
    props.params.api.stopEditing()
  }
}

// ag-grid要求的接口
const getValue = () => {
  return tags.value
}
const isPopup = () => true

// 暴露接口
// eslint-disable-next-line
// @ts-ignore
if (typeof defineExpose === 'function') {
  defineExpose({ getValue, isPopup })
}
</script>

<style lang="less">
.custom-tag-editor {
  min-width: 320px;
  max-width: 400px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  .custom-tag-editor__preset-section {
    padding: 16px;
    border-bottom: 1px solid #f1f5f9;
  }

  .custom-tag-editor__edit-section {
    padding: 16px;
  }

  .custom-tag-editor__actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px 16px;
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;
  }

  .custom-tag-editor__cancel-btn {
    font-size: 12px;
    padding: 4px 12px;
    border-radius: 4px;
  }

  .custom-tag-editor__confirm-btn {
    font-size: 12px;
    padding: 4px 12px;
    border-radius: 4px;
  }

  .custom-tag-editor__section-title {
    color: #1e293b;
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 6px;
    
    i {
      color: #64748b;
      font-size: 14px;
    }
  }

  .custom-tag-editor__preset-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .custom-tag-editor__preset-tag {
    background: #f0f9ff !important;
    color: #409eff !important;
    border: 1px solid #b3d8ff !important;
    cursor: pointer;
    font-size: 12px;
    padding: 4px 10px;
    transition: all 0.2s ease;
    font-weight: 500;
  }

  .custom-tag-editor__preset-tag:hover {
    background: #e6f7ff !important;
    color: #409eff !important;
    border-color: #409eff !important;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
  }

  .custom-tag-editor__tag-list {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-radius: 8px;
    padding: 12px;
    min-height: 50px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    border: 1px solid #e2e8f0;
    position: relative;
  }

  .custom-tag-editor__tag-list::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
    border-radius: 8px;
    pointer-events: none;
  }

  .custom-tag-editor__edit-tag {
    font-size: 12px;
    background: #f0f9ff !important;
    color: #409eff !important;
    border: 1px solid #b3d8ff !important;
    padding: 4px 10px;
    margin: 0;
    font-weight: 500;
    position: relative;
    z-index: 1;
    transition: all 0.2s ease;
  }

  .custom-tag-editor__edit-tag:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
  }

  .custom-tag-editor__edit-tag .el-tag__close {
    color: #409eff !important;
    margin-left: 4px;
    font-weight: bold;
    transition: all 0.2s ease;
  }

  .custom-tag-editor__edit-tag .el-tag__close:hover {
    color: #f56c6c !important;
    background-color: #fef0f0 !important;
    transform: scale(1.1);
  }

  .custom-tag-editor__input-new-tag {
    width: 110px;
    font-size: 12px;
    margin: 0;
    position: relative;
    z-index: 1;
  }

  .custom-tag-editor__input-new-tag .el-input__wrapper {
    background: white;
    border: 1px solid #cbd5e1;
    border-radius: 16px;
    padding: 4px 10px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;
  }

  .custom-tag-editor__input-new-tag .el-input__wrapper:hover {
    border-color: #93c5fd;
    box-shadow: 0 2px 6px rgba(59, 130, 246, 0.1);
  }

  .custom-tag-editor__input-new-tag .el-input__wrapper.is-focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }

  .custom-tag-editor__add-btn {
    background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
    color: #475569;
    border-radius: 16px;
    border: 1px solid #cbd5e1;
    font-size: 12px;
    padding: 4px 12px;
    margin: 0;
    font-weight: 500;
    transition: all 0.2s ease;
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .custom-tag-editor__add-btn:hover {
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
    color: #1d4ed8;
    border-color: #93c5fd;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
  }

  .custom-tag-editor__add-btn i {
    font-size: 12px;
  }
}
</style> 