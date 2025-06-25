<template>
  <div class="country-autocomplete-editor">
    <el-autocomplete
      v-model="input"
      :fetch-suggestions="querySearch"
      :placeholder="params?.colDef?.headerName || '请输入'"
      style="width: 100%"
      @select="onSelect"
      @keydown.enter.stop
      @blur="onBlur"
      :trigger-on-focus="true"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps(['params']);
const input = ref(props.params.value);
const options = ref(props.params?.colDef?.cellEditorParams?.values || []);

// 自动补全建议
const querySearch = (queryString, cb) => {
  const results = options.value
    .filter(item => item.toLowerCase().includes(queryString.toLowerCase()))
    .map(item => ({ value: item }));
  cb(results);
};

const onSelect = (item) => {
  input.value = item.value;
};

// 失焦时直接保存当前输入
const onBlur = () => {
  // ag-Grid 会自动调用 getValue
};

defineExpose({
  getValue: () => input.value,
  isPopup: () => false,
});
</script>

<style scoped>
.country-autocomplete-editor {
  width: 100%;
}
</style> 