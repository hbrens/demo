<template>
  <el-dialog
    v-model="dialogVisible"
    title="编辑运动员信息"
    width="30%"
    :before-close="onCancel"
  >
    <el-form :model="form">
      <el-form-item label="运动员名称">
        <el-input v-model="form.athlete" placeholder="请输入运动员名称"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="onCancel">取消</el-button>
        <el-button type="primary" @click="onConfirm">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  value: String
});

const dialogVisible = ref(false);
const form = ref({
  athlete: ''
});

let resolvePromise = null;
let rejectPromise = null;

const init = (params) => {
  form.value.athlete = params.value;
  dialogVisible.value = true;
  return new Promise((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });
};

const onConfirm = () => {
  dialogVisible.value = false;
  resolvePromise(form.value.athlete);
};

const onCancel = () => {
  dialogVisible.value = false;
  rejectPromise();
};

defineExpose({
  init
});
</script> 