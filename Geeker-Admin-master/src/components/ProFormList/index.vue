<template>
  <div class="pro-form-list">
    <div class="form-list-header">
      <span class="list-title">{{ title }}</span>
      <el-button 
        type="primary" 
        link 
        :icon="Plus" 
        @click="addItem"
        v-if="!disabled"
      >
        添加{{ itemTitle }}
      </el-button>
    </div>
    
    <div class="form-list-content">
      <slot 
        name="content" 
        :list="listData" 
        :add-item="addItem"
        :remove-item="removeItem"
        :update-item="updateItem"
      />
      
      <div v-if="listData.length === 0" class="empty-state">
        <el-empty description="暂无数据" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="ProFormList">
import { ref, computed, watch } from "vue";
import { Plus, Delete } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

interface Props {
  modelValue?: any[];
  title?: string;
  itemTitle?: string;
  disabled?: boolean;
  maxCount?: number;
  minCount?: number;
}

interface Emits {
  (e: 'update:modelValue', value: any[]): void;
  (e: 'change', value: any[]): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  title: '列表',
  itemTitle: '项',
  disabled: false,
  maxCount: 10,
  minCount: 0
});

const emit = defineEmits<Emits>();

// 使用computed来处理数据同步，避免递归
const listData = computed({
  get: () => props.modelValue || [],
  set: (value) => {
    emit('update:modelValue', value);
    emit('change', value);
  }
});

// 添加项目
const addItem = () => {
  if (listData.value.length >= props.maxCount) {
    ElMessage.warning(`最多只能添加${props.maxCount}个${props.itemTitle}`);
    return;
  }
  
  const newItem = {
    id: Date.now()
  };
  
  const newList = [...listData.value, newItem];
  listData.value = newList;
};

// 删除项目
const removeItem = (index: number) => {
  if (listData.value.length <= props.minCount) {
    ElMessage.warning(`至少需要保留${props.minCount}个${props.itemTitle}`);
    return;
  }
  
  const newList = [...listData.value];
  newList.splice(index, 1);
  listData.value = newList;
};

// 更新项目数据
const updateItem = (index: number, data: any) => {
  const newList = [...listData.value];
  newList[index] = { ...newList[index], ...data };
  listData.value = newList;
};

// 暴露方法给父组件
defineExpose({
  addItem,
  removeItem,
  updateItem,
  getList: () => listData.value,
  setList: (list: any[]) => {
    listData.value = list;
  }
});
</script>

<style scoped lang="scss">
.pro-form-list {
  .form-list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 0 16px;
    
    .list-title {
      font-weight: 500;
      color: var(--el-text-color-primary);
    }
  }
  
  .form-list-content {
    .empty-state {
      text-align: center;
      padding: 40px 0;
      color: var(--el-text-color-secondary);
    }
  }
}
</style> 