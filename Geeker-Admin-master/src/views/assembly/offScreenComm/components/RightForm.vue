<template>
  <div class="right-form">
    <el-form :model="formData" label-width="80px">
      <el-form-item label="用户名">
        <el-input v-model="formData.username" placeholder="请输入用户名" @change="handleChange" />
      </el-form-item>
      <el-form-item label="邮箱">
        <el-input v-model="formData.email" placeholder="请输入邮箱" @change="handleChange" />
      </el-form-item>
      <el-form-item label="手机号">
        <el-input v-model="formData.phone" placeholder="请输入手机号" @change="handleChange" />
      </el-form-item>
      <el-form-item label="状态">
        <el-switch v-model="formData.status" @change="handleChange" />
        <span class="status-text">{{ formData.status ? "启用" : "禁用" }}</span>
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="formData.description" type="textarea" rows="3" placeholder="请输入描述" @change="handleChange" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts" name="RightForm">
import { reactive, watch } from "vue";

// 表单数据类型
export interface FormData {
  username: string;
  email: string;
  phone: string;
  status: boolean;
  description: string;
}

// 默认表单数据
const defaultFormData: FormData = {
  username: "",
  email: "",
  phone: "",
  status: true,
  description: "",
};

// 接收外部 v-model
const props = defineProps<{
  modelValue: FormData;
}>();

// 发送更新事件
const emit = defineEmits<{
  (e: "update:modelValue", value: FormData): void;
  (e: "change", value: FormData): void;
}>();

// 内部表单数据
const formData = reactive<FormData>({ ...defaultFormData });

// 监听外部数据变化
watch(
  () => props.modelValue,
  (newVal) => {
    Object.assign(formData, newVal);
  },
  { immediate: true, deep: true }
);

// 表单变化处理
const handleChange = () => {
  emit("update:modelValue", { ...formData });
  emit("change", { ...formData });
};
</script>

<style scoped lang="scss">
.right-form {
  padding: 20px;
  background: #fff;
  border-radius: 4px;
  height: 100%;
  overflow-y: auto;

  .status-text {
    margin-left: 10px;
    font-size: 14px;
    color: #666;
  }
}
</style>
