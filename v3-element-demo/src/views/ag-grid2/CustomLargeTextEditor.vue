<template>
  <div class="custom-large-text-editor">
    <textarea
      ref="textareaRef"
      v-model="value"
      :rows="params.rows || 10"
      :cols="params.cols || 50"
      :maxlength="params.maxLength"
      @keydown="handleKeyDown"
      class="textarea"
    ></textarea>
    <div class="button-group">
      <button class="button cancel" @click="cancelEdit">取消</button>
      <button class="button confirm" @click="confirmEdit">确定</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';

const props = defineProps({
  params: Object
});

const textareaRef = ref(null);
const value = ref('\n' + (props.params.value || '')); // 在原有内容前添加换行符

// 在组件挂载后设置光标位置
onMounted(() => {
  // 确保 textarea 已经渲染
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.focus();
      textareaRef.value.setSelectionRange(0, 0); // 将光标设置到开头
    }
  });
});

// 处理键盘事件
const handleKeyDown = (event) => {
  // 如果是单独的 Enter 键，阻止默认行为（防止提交）
  if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey && !event.altKey) {
    event.stopPropagation(); // 阻止事件冒泡
  }
};

// ag-grid 编辑器必需的方法
const getValue = () => {
  return value.value.trim(); // 返回时去除可能的首尾空白字符
};

const isPopup = () => {
  return true;
};

const isCancelBeforeStart = () => {
  return false;
};

const isCancelAfterEnd = () => {
  return false;
};

// 确认编辑
const confirmEdit = () => {
  props.params.stopEditing();
};

// 取消编辑
const cancelEdit = () => {
  value.value = props.params.value;
  props.params.stopEditing(true); // true 表示取消编辑
};

// 暴露必需的方法
defineExpose({
  getValue,
  isPopup,
  isCancelBeforeStart,
  isCancelAfterEnd
});
</script>

<style>
.custom-large-text-editor {
  background: #ffffff;
  border: 1px solid #babfc7;
  border-radius: 3px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  padding: 6px;
  min-width: 200px;
}

.custom-large-text-editor .textarea {
  width: 100%;
  padding: 8px;
  margin-bottom: 6px;
  border: 1px solid #babfc7;
  border-radius: 3px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
  font-size: 13px;
  line-height: 1.4;
  resize: vertical;
  color: #181d1f;
  background: #ffffff;
  outline: none;
}

.custom-large-text-editor .textarea:focus {
  border-color: #2196f3;
  box-shadow: 0 0 0 1px #2196f3;
}

.custom-large-text-editor .button-group {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
}

.custom-large-text-editor .button {
  padding: 5px 10px;
  font-size: 13px;
  border-radius: 3px;
  border: 1px solid;
  cursor: pointer;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
  transition: all 0.2s;
}

.custom-large-text-editor .button.cancel {
  background-color: #ffffff;
  border-color: #babfc7;
  color: #181d1f;
}

.custom-large-text-editor .button.cancel:hover {
  background-color: #f5f5f5;
}

.custom-large-text-editor .button.confirm {
  background-color: #2196f3;
  border-color: #2196f3;
  color: #ffffff;
}

.custom-large-text-editor .button.confirm:hover {
  background-color: #1976d2;
  border-color: #1976d2;
}

.custom-large-text-editor .button:focus {
  outline: none;
  box-shadow: 0 0 0 1px #2196f3;
}
</style> 