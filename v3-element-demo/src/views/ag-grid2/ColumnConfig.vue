<template>
  <div class="column-config">
    <el-drawer
      v-model="visible"
      title="表格列配置"
      direction="rtl"
      size="30%"
    >
      <div class="drawer-content">
        <div class="config-header">
          <div>
            <el-button type="primary" size="small" @click="applyChanges">应用更改</el-button>
            <el-button size="small" @click="resetChanges">重置当前</el-button>
          </div>
          <el-button type="danger" size="small" @click="resetAllConfigs">恢复默认设置</el-button>
        </div>
        
        <el-alert
          title="提示：拖拽列项可以调整顺序"
          type="info"
          :closable="false"
          show-icon
          style="margin: 10px 0;"
        />
        
        <el-scrollbar height="calc(100vh - 200px)">
          <draggable
            v-model="localColumnDefs"
            item-key="field"
            handle=".drag-handle"
            ghost-class="ghost"
            @end="onDragEnd"
          >
            <template #item="{ element }">
              <div class="column-item">
                <div class="drag-handle">
                  <el-icon><Operation /></el-icon>
                </div>
                <div class="column-info">
                  <el-checkbox
                    v-model="element.visible"
                    :label="element.headerName || element.field"
                  ></el-checkbox>
                </div>
                <div class="column-actions">
                  <el-select
                    v-model="element.pinned"
                    placeholder="固定位置"
                    size="small"
                    style="width: 100px;"
                  >
                    <el-option label="不固定" :value="null" />
                    <el-option label="左侧固定" value="left" />
                    <el-option label="右侧固定" value="right" />
                  </el-select>
                </div>
              </div>
            </template>
          </draggable>
        </el-scrollbar>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, defineProps, defineEmits } from 'vue';
import { ElDrawer, ElButton, ElCheckbox, ElSelect, ElOption, ElScrollbar, ElAlert, ElIcon, ElMessageBox } from 'element-plus';
import { Operation } from '@element-plus/icons-vue';
import draggable from 'vuedraggable';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  columnDefs: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'applyChanges', 'resetAll']);

// 计算属性：控制抽屉的显示与隐藏
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

// 本地列定义，用于在抽屉中编辑
const localColumnDefs = ref([]);

// 监听外部列定义变化
watch(() => props.columnDefs, (newColumnDefs) => {
  // 深拷贝列定义，避免直接修改props
  localColumnDefs.value = JSON.parse(JSON.stringify(newColumnDefs));
}, { immediate: true, deep: true });

// 拖拽结束事件
const onDragEnd = () => {
  // 拖拽结束后不做特殊处理，等用户点击应用按钮时再提交更改
  console.log('拖拽结束，列顺序已更新');
};

// 应用更改
const applyChanges = () => {
  console.log('发送更新事件，columns:', localColumnDefs.value);
  emit('applyChanges', localColumnDefs.value);
};

// 重置当前更改（只重置到打开抽屉时的状态）
const resetChanges = () => {
  // 深拷贝以确保不直接修改props
  console.log('重置列配置到打开抽屉时的状态');
  localColumnDefs.value = JSON.parse(JSON.stringify(props.columnDefs));
};

// 重置所有配置（恢复到默认设置，包括清除localStorage）
const resetAllConfigs = () => {
  ElMessageBox.confirm(
    '此操作将恢复所有列配置到系统默认值，包括顺序、宽度、可见性和固定位置。是否继续？',
    '恢复默认设置',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    console.log('发送恢复默认设置事件');
    emit('resetAll');
  }).catch(() => {
    console.log('用户取消了恢复默认设置');
  });
};

// 上移功能 - 只作为拖拽的备选实现
const moveUp = (index) => {
  if (index > 0) {
    const temp = localColumnDefs.value[index];
    localColumnDefs.value[index] = localColumnDefs.value[index - 1];
    localColumnDefs.value[index - 1] = temp;
  }
};

// 下移功能 - 只作为拖拽的备选实现 
const moveDown = (index) => {
  if (index < localColumnDefs.value.length - 1) {
    const temp = localColumnDefs.value[index];
    localColumnDefs.value[index] = localColumnDefs.value[index + 1];
    localColumnDefs.value[index + 1] = temp;
  }
};
</script>

<style lang="less" scoped>
.column-config {
  .drawer-content {
    padding: 10px;
  }

  .config-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 15px;
  }

  .column-item {
    display: flex;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid #ebeef5;
    background-color: #fff;

    &:hover {
      background-color: #f5f7fa;
    }
  }

  .drag-handle {
    cursor: move;
    padding: 0 10px;
    color: #909399;
  }

  .column-info {
    flex: 1;
    margin: 0 10px;
  }

  .column-actions {
    display: flex;
    align-items: center;
  }
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
</style> 