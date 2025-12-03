<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogProps.title || '权限申请'"
    width="800px"
    :destroy-on-close="true"
  >
    <!-- 顶部审批流程步骤条（仅展示，不可操作） -->
    <el-steps
      :active="dialogProps.steps?.length || 1"
      finish-status="success"
      align-center
      class="apply-steps"
    >
      <el-step
        v-for="(item, index) in dialogProps.steps"
        :key="index"
        :title="item.title"
        :description="item.description"
      />
    </el-steps>

    <!-- 中部双列布局表单 -->
    <el-form
      ref="ruleFormRef"
      :model="dialogProps.row"
      :rules="rules"
      label-width="110px"
      label-suffix="："
      :disabled="dialogProps.isView"
      :hide-required-asterisk="dialogProps.isView"
      class="apply-form"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="申请人" prop="applicant">
            <el-input
              v-model="dialogProps.row.applicant"
              placeholder="请输入申请人"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="所属部门" prop="department">
            <el-input
              v-model="dialogProps.row.department"
              placeholder="请输入所属部门"
              clearable
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="权限名称" prop="permissionName">
            <el-input
              v-model="dialogProps.row.permissionName"
              placeholder="请输入申请的权限名称"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="权限类型" prop="permissionType">
            <el-select
              v-model="dialogProps.row.permissionType"
              placeholder="请选择权限类型"
              clearable
            >
              <el-option label="菜单权限" value="menu" />
              <el-option label="数据权限" value="data" />
              <el-option label="按钮权限" value="button" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="起始日期" prop="startDate">
            <el-date-picker
              v-model="dialogProps.row.startDate"
              type="date"
              placeholder="请选择起始日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="截止日期" prop="endDate">
            <el-date-picker
              v-model="dialogProps.row.endDate"
              type="date"
              placeholder="请选择截止日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="紧急程度" prop="priority">
            <el-select
              v-model="dialogProps.row.priority"
              placeholder="请选择紧急程度"
              clearable
            >
              <el-option label="低" value="low" />
              <el-option label="中" value="medium" />
              <el-option label="高" value="high" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="关联单号" prop="relatedNo">
            <el-input
              v-model="dialogProps.row.relatedNo"
              placeholder="请输入关联单号（如工单号、需求号等）"
              clearable
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="申请原因" prop="reason">
            <el-input
              v-model="dialogProps.row.reason"
              type="textarea"
              :rows="3"
              placeholder="请详细说明申请该权限的原因"
              clearable
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button
          v-show="!dialogProps.isView"
          type="primary"
          @click="handleSubmit"
        >
          确 定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="PermissionApplyDialog">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";

interface StepItem {
  title: string;
  description?: string;
}

interface DialogRow {
  applicant?: string;
  department?: string;
  permissionName?: string;
  permissionType?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  priority?: string;
  relatedNo?: string;
  reason?: string;
  // 业务上还需要的字段可以继续在这里扩展
  [key: string]: any;
}

interface DialogProps {
  title?: string;
  isView: boolean;
  steps?: StepItem[];
  row: DialogRow;
  api?: (params: any) => Promise<any>;
  getTableList?: () => void;
}

// 校验规则（可以根据实际业务继续补充）
const rules = reactive({
  applicant: [{ required: true, message: "请输入申请人", trigger: "blur" }],
  department: [{ required: true, message: "请输入所属部门", trigger: "blur" }],
  permissionName: [{ required: true, message: "请输入权限名称", trigger: "blur" }],
  permissionType: [{ required: true, message: "请选择权限类型", trigger: "change" }],
  reason: [{ required: true, message: "请输入申请原因", trigger: "blur" }]
});

const dialogVisible = ref(true);
const ruleFormRef = ref<FormInstance>();

const dialogProps = ref<DialogProps>({
  isView: false,
  title: "权限申请",
  steps: [
    { title: "提交申请", description: "申请人填写并提交申请" },
    { title: "直属主管审批", description: "直属主管进行审批" },
    { title: "权限管理员审批", description: "权限管理员确认权限" },
    { title: "生效通知", description: "系统下发权限并通知申请人" }
  ],
  row: {}
});

// 接收父组件参数，通过暴露的 acceptParams 控制弹窗
const acceptParams = (params: Partial<DialogProps>) => {
  dialogProps.value = {
    ...dialogProps.value,
    ...params,
    row: {
      ...dialogProps.value.row,
      ...(params.row || {})
    },
    steps: params.steps || dialogProps.value.steps
  };

  if (!dialogProps.value.row) {
    dialogProps.value.row = {};
  }

  dialogVisible.value = true;
};

// 提交
const handleSubmit = () => {
  if (!ruleFormRef.value) return;
  ruleFormRef.value.validate(async valid => {
    if (!valid) return;
    try {
      if (dialogProps.value.api) {
        await dialogProps.value.api(dialogProps.value.row);
        ElMessage.success(`${dialogProps.value.title || "权限申请"}成功！`);
        dialogProps.value.getTableList && dialogProps.value.getTableList();
      } else {
        // 如果没有传 api，仅做本地提示与关闭
        ElMessage.success("提交成功！");
      }
      dialogVisible.value = false;
    } catch (error) {
      console.error(error);
    }
  });
};

defineExpose({
  acceptParams
});
</script>

<style scoped lang="scss">
.apply-steps {
  margin-bottom: 20px;
}

/* 覆盖步骤条样式：两端补线 + 中间改为小圆点 */
.apply-steps :deep(.el-step__head) {
  position: relative;
}

/* 让原有的连接线垂直居中、稍微细一点 */
.apply-steps :deep(.el-step__line) {
  top: 50%;
  height: 2px;
  transform: translateY(-50%);

  left: 0%;
  right: -100%
}


/* 中间图标改为小圆点 */
.apply-steps :deep(.el-step__icon) {
  width: 18px;
  height: 18px;
  border: 4px solid var(--el-color-primary);
  border-radius: 50%;
  display: inline-block;
}

/* 去掉内部数字/图标，只保留小圆点 */
.apply-steps :deep(.el-step__icon-inner) {
  display: none;
}

.apply-form {
  margin-top: 10px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>


