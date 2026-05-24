<template>
  <el-dialog v-model="visible" title="新增API申请" width="560px" destroy-on-close @close="handleClose">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px" label-position="right">
      <el-form-item label="审批人" prop="reviewer_id">
        <el-select
          v-model="formData.reviewer_id"
          placeholder="请选择审批人"
          filterable
          style="width: 100%"
          @change="handleReviewerChange"
        >
          <el-option
            v-for="user in userList"
            :key="user.id"
            :label="user.username"
            :value="user.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="供应商" prop="account_id">
        <el-select
          v-model="formData.account_id"
          placeholder="请先选择审批人"
          filterable
          :disabled="!formData.reviewer_id"
          style="width: 100%"
        >
          <el-option
            v-for="opt in filteredProviders"
            :key="opt.id"
            :label="`${opt.provider}（${opt.manager_username}）`"
            :value="opt.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item v-if="selectedProvider" label="账号预览">
        <el-text type="info" size="small">
          供应商：{{ selectedProvider.provider }}，管理员：{{ selectedProvider.manager_username }}
        </el-text>
      </el-form-item>

      <el-form-item label="项目名称" prop="project_name">
        <el-input v-model="formData.project_name" placeholder="请输入项目名称" />
      </el-form-item>

      <el-form-item label="需求详情" prop="purpose">
        <el-input v-model="formData.purpose" type="textarea" :rows="3" placeholder="请描述使用场景和需求" />
      </el-form-item>

      <el-form-item label="需求预算" prop="budget">
        <el-input v-model="formData.budget" placeholder="请输入预算" />
      </el-form-item>

      <el-form-item label="项目负责人" prop="lead">
        <el-input v-model="formData.lead" placeholder="请输入负责人姓名" />
      </el-form-item>

      <el-form-item label="抄送人">
        <el-input v-model="formData.cc_person" placeholder="请输入抄送人（选填）" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">提交申请</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="ApplyDialog">
import { ref, reactive, computed, watch } from "vue";
import { ElMessage } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { getCascadeOptions, submitRequest } from "@/api/thirdPartyApi/apiManage";
import { getUsers } from "@/api/thirdPartyApi/user";
import type { CascadeOption, SubmitRequestParams } from "@/api/thirdPartyApi/apiManage";
import type { UserItem } from "@/api/thirdPartyApi/user";

const visible = ref(false);
const submitting = ref(false);
const formRef = ref<FormInstance>();

const userList = ref<UserItem[]>([]);
const cascadeOptions = ref<CascadeOption[]>([]);

const formData = reactive<SubmitRequestParams>({
  account_id: 0,
  reviewer_id: 0,
  project_name: "",
  purpose: "",
  lead: "",
  budget: "",
  dept: "",
  cc_person: ""
});

const rules: FormRules = {
  reviewer_id: [{ required: true, message: "请选择审批人", trigger: "change" }],
  account_id: [{ required: true, message: "请选择供应商", trigger: "change" }],
  project_name: [{ required: true, message: "请输入项目名称", trigger: "blur" }],
  purpose: [{ required: true, message: "请输入需求详情", trigger: "blur" }],
  budget: [{ required: true, message: "请输入需求预算", trigger: "blur" }],
  lead: [{ required: true, message: "请输入项目负责人", trigger: "blur" }]
};

// 根据选中审批人过滤供应商列表
const filteredProviders = computed(() => {
  if (!formData.reviewer_id) return [];
  // 去重：同一 account 只显示一次
  const seen = new Set<number>();
  return cascadeOptions.value.filter(opt => {
    if (opt.manager_user_id !== formData.reviewer_id) return false;
    if (seen.has(opt.id)) return false;
    seen.add(opt.id);
    return true;
  });
});

const selectedProvider = computed(() => {
  if (!formData.account_id) return null;
  return cascadeOptions.value.find(opt => opt.id === formData.account_id) || null;
});

// 审批人变更时清空供应商选择
const handleReviewerChange = () => {
  formData.account_id = 0;
};

const emit = defineEmits<{
  success: [];
}>();

// 加载级联选项和用户列表
const loadData = async () => {
  try {
    const [options, users] = await Promise.all([
      getCascadeOptions(),
      getUsers()
    ]);
    cascadeOptions.value = options as unknown as CascadeOption[];
    userList.value = users as unknown as UserItem[];
  } catch (e: any) {
    ElMessage.error(e.message || "加载数据失败");
  }
};

// 打开弹窗
const open = () => {
  visible.value = true;
  loadData();
};

// 提交申请
const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    submitting.value = true;
    try {
      await submitRequest(formData);
      ElMessage.success("申请已提交");
      visible.value = false;
      emit("success");
    } catch (e: any) {
      ElMessage.error(e.message || "提交失败");
    } finally {
      submitting.value = false;
    }
  });
};

// 关闭时重置表单
const handleClose = () => {
  formRef.value?.resetFields();
  formData.account_id = 0;
  formData.reviewer_id = 0;
  formData.project_name = "";
  formData.purpose = "";
  formData.lead = "";
  formData.budget = "";
  formData.dept = "";
  formData.cc_person = "";
};

defineExpose({ open });
</script>
