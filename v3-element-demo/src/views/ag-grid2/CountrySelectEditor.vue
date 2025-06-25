<template>
  <div class="country-editor-wrapper">
    <el-select
      v-model="selected"
      filterable
      allow-create
      default-first-option
      :placeholder="params?.colDef?.headerName || '请选择'"
      style="width: 100%"
      @change="onChange"
      @visible-change="onVisibleChange"
      @keydown.enter.stop
    >
      <el-option
        v-for="item in options"
        :key="item"
        :label="item"
        :value="item"
      />
    </el-select>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// ag-Grid 会通过 props 传递 params
const props = defineProps(['params']);
const selected = ref(props.params.value);
const options = ref(props.params?.colDef?.cellEditorParams?.values || []);

const onChange = (val) => {
  selected.value = val;
};

const onVisibleChange = (visible) => {
  // 下拉打开时刷新 options（可选）
  if (visible && props.params?.colDef?.cellEditorParams?.values) {
    options.value = props.params.colDef.cellEditorParams.values;
  }
};

// ag-Grid cell editor 必须实现 getValue
// isPopup 返回 true 让编辑器以弹窗方式显示
// focus 方法可选，ag-Grid 会自动聚焦

defineExpose({
  getValue: () => selected.value,
  isPopup: () => false, // 直接嵌入单元格
});
</script>

<style scoped>
.country-editor-wrapper {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 4px;
}
.country-label {
  color: #888;
  font-size: 12px;
}
</style> 