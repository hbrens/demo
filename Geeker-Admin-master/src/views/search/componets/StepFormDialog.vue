<template>
  <el-dialog 
    v-model="dialogVisible" 
    :title="`${dialogProps.title}`"
    width="800px"
    :destroy-on-close="true"
  >
    <el-steps :active="currentStep" finish-status="success" align-center>
      <el-step title="基本信息" description="填写基本信息" />
      <el-step title="详细信息" description="填写详细信息" />
      <el-step title="确认信息" description="确认所有信息" />
    </el-steps>
    
    <div class="step-content">
      <!-- 第一步：基本信息 -->
      <div v-show="currentStep === 0">
        <el-form
          ref="step1FormRef"
          label-width="100px"
          :model="dialogProps.row"
          :rules="step1Rules"
        >
          <el-form-item label="姓名" prop="name">
            <el-input v-model="dialogProps.row.name" placeholder="请输入姓名" />
          </el-form-item>
          <el-form-item label="性别" prop="gender">
            <el-select v-model="dialogProps.row.gender" placeholder="请选择性别">
              <el-option label="男" value="male" />
              <el-option label="女" value="female" />
            </el-select>
          </el-form-item>
          <el-form-item label="年龄" prop="age">
            <el-input-number v-model="dialogProps.row.age" :min="1" :max="120" placeholder="请输入年龄" />
          </el-form-item>
          <el-form-item label="手机号码" prop="phone">
            <el-input v-model="dialogProps.row.phone" placeholder="请输入手机号码" />
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 第二步：详细信息 -->
      <div v-show="currentStep === 1">
        <el-form
          ref="step2FormRef"
          label-width="100px"
          :model="dialogProps.row"
          :rules="step2Rules"
        >
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="dialogProps.row.email" placeholder="请输入邮箱" />
          </el-form-item>
          <el-form-item label="身份证号" prop="idCard">
            <el-input v-model="dialogProps.row.idCard" placeholder="请输入身份证号" />
          </el-form-item>
          <el-form-item label="居住地址" prop="address">
            <el-input v-model="dialogProps.row.address" placeholder="请输入居住地址" />
          </el-form-item>
          <el-form-item label="职业" prop="occupation">
            <el-select v-model="dialogProps.row.occupation" placeholder="请选择职业">
              <el-option label="学生" value="student" />
              <el-option label="教师" value="teacher" />
              <el-option label="工程师" value="engineer" />
              <el-option label="医生" value="doctor" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>
          <el-form-item label="个人简介" prop="description">
            <el-input 
              v-model="dialogProps.row.description" 
              type="textarea" 
              :rows="3"
              placeholder="请输入个人简介" 
            />
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 第三步：确认信息 -->
      <div v-show="currentStep === 2">
        <div class="confirm-info">
          <h3>请确认以下信息：</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="姓名">{{ dialogProps.row.name || '未填写' }}</el-descriptions-item>
            <el-descriptions-item label="性别">{{ getGenderText(dialogProps.row.gender) }}</el-descriptions-item>
            <el-descriptions-item label="年龄">{{ dialogProps.row.age || '未填写' }}</el-descriptions-item>
            <el-descriptions-item label="手机号码">{{ dialogProps.row.phone || '未填写' }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ dialogProps.row.email || '未填写' }}</el-descriptions-item>
            <el-descriptions-item label="身份证号">{{ dialogProps.row.idCard || '未填写' }}</el-descriptions-item>
            <el-descriptions-item label="居住地址">{{ dialogProps.row.address || '未填写' }}</el-descriptions-item>
            <el-descriptions-item label="职业">{{ getOccupationText(dialogProps.row.occupation) }}</el-descriptions-item>
            <el-descriptions-item label="个人简介" :span="2">{{ dialogProps.row.description || '未填写' }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button v-if="currentStep > 0" @click="prevStep">上一步</el-button>
        <el-button 
          v-if="currentStep < 2" 
          type="primary" 
          @click="nextStep"
        >
          下一步
        </el-button>
        <el-button 
          v-if="currentStep === 2" 
          type="primary" 
          @click="handleSubmit"
        >
          提交
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="StepFormDialog">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";

// 第一步验证规则
const step1Rules = reactive({
  name: [{ required: true, message: "请输入姓名", trigger: "blur" }],
  gender: [{ required: true, message: "请选择性别", trigger: "change" }],
  age: [{ required: true, message: "请输入年龄", trigger: "blur" }],
  phone: [{ required: true, message: "请输入手机号码", trigger: "blur" }]
});

// 第二步验证规则
const step2Rules = reactive({
  email: [{ required: true, message: "请输入邮箱", trigger: "blur" }],
  idCard: [{ required: true, message: "请输入身份证号", trigger: "blur" }],
  address: [{ required: true, message: "请输入居住地址", trigger: "blur" }],
  occupation: [{ required: true, message: "请选择职业", trigger: "change" }]
});

interface DialogProps {
  title: string;
  isView: boolean;
  row: {
    name?: string;
    gender?: string;
    age?: number;
    phone?: string;
    email?: string;
    idCard?: string;
    address?: string;
    occupation?: string;
    description?: string;
  };
  api?: (params: any) => Promise<any>;
  getTableList?: () => void;
}

const dialogVisible = ref(false);
const currentStep = ref(0);
const step1FormRef = ref<FormInstance>();
const step2FormRef = ref<FormInstance>();

const dialogProps = ref<DialogProps>({
  isView: false,
  title: "",
  row: {}
});

// 接收父组件传过来的参数
const acceptParams = (params: DialogProps) => {
  dialogProps.value = params;
  currentStep.value = 0;
  // 确保row对象存在
  if (!dialogProps.value.row) {
    dialogProps.value.row = {};
  }
  dialogVisible.value = true;
};

// 下一步
const nextStep = async () => {
  try {
    if (currentStep.value === 0) {
      // 验证第一步
      if (step1FormRef.value) {
        await step1FormRef.value.validate();
      }
    } else if (currentStep.value === 1) {
      // 验证第二步
      if (step2FormRef.value) {
        await step2FormRef.value.validate();
      }
    }
    
    if (currentStep.value < 2) {
      currentStep.value++;
    }
  } catch (error) {
    console.log('表单验证失败:', error);
    ElMessage.error('请检查表单信息是否填写完整');
  }
};

// 上一步
const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

// 获取性别文本
const getGenderText = (gender: string | undefined) => {
  if (gender === 'male') return '男';
  if (gender === 'female') return '女';
  return '未选择';
};

// 获取职业文本
const getOccupationText = (occupation: string | undefined) => {
  const occupationMap: Record<string, string> = {
    student: '学生',
    teacher: '教师',
    engineer: '工程师',
    doctor: '医生',
    other: '其他'
  };
  return occupationMap[occupation || ''] || '未选择';
};

// 提交数据
const handleSubmit = async () => {
  try {
    await dialogProps.value.api!(dialogProps.value.row);
    ElMessage.success({ message: `${dialogProps.value.title}成功！` });
    dialogProps.value.getTableList!();
    dialogVisible.value = false;
  } catch (error) {
    console.log(error);
  }
};

defineExpose({
  acceptParams
});
</script>

<style scoped lang="scss">
.step-content {
  margin-top: 20px;
  min-height: 300px;
}

.confirm-info {
  h3 {
    margin-bottom: 16px;
    color: var(--el-text-color-primary);
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 