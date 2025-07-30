<template>
  <el-dialog 
    v-model="dialogVisible" 
    :title="`${dialogProps.title}用户信息`"
    width="800px"
    :destroy-on-close="true"
  >
    <el-form
      ref="ruleFormRef"
      label-width="100px"
      label-suffix=" :"
      :rules="rules"
      :disabled="dialogProps.isView"
      :model="dialogProps.row"
      :hide-required-asterisk="dialogProps.isView"
    >
      <el-form-item label="用户姓名" prop="username">
        <el-input v-model="dialogProps.row!.username" placeholder="请填写用户姓名" clearable></el-input>
      </el-form-item>
      <el-form-item label="性别" prop="gender">
        <el-select v-model="dialogProps.row!.gender" placeholder="请选择性别" clearable>
          <el-option v-for="item in genderType" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="年龄" prop="age">
        <el-input-number v-model="dialogProps.row!.age" :min="1" :max="120" placeholder="请输入年龄"></el-input-number>
      </el-form-item>
      <el-form-item label="手机号码" prop="phone">
        <el-input v-model="dialogProps.row!.phone" placeholder="请填写手机号码" clearable></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="dialogProps.row!.email" placeholder="请填写邮箱" clearable></el-input>
      </el-form-item>
      <el-form-item label="身份证号" prop="idCard">
        <el-input v-model="dialogProps.row!.idCard" placeholder="请填写身份证号" clearable></el-input>
      </el-form-item>
      <el-form-item label="居住地址" prop="address">
        <el-input v-model="dialogProps.row!.address" placeholder="请填写居住地址" clearable></el-input>
      </el-form-item>
      <el-form-item label="个人简介" prop="description">
        <el-input 
          v-model="dialogProps.row!.description" 
          type="textarea" 
          :rows="3"
          placeholder="请填写个人简介" 
          clearable
        ></el-input>
      </el-form-item>
      
      <!-- 键值对列表 -->
      <el-form-item label="键值对列表" prop="keyValuePairs">
        <div class="key-value-container">
          <div 
            v-for="(pair, index) in (dialogProps.row!.keyValuePairs || [])" 
            :key="pair.id || index" 
            class="key-value-item"
          >
            <div class="key-value-content">
              <el-input 
                v-model="pair.key" 
                placeholder="请输入键名" 
                clearable
                class="key-input"
              />
              <span class="equals-sign">=</span>
              <el-input 
                v-model="pair.value" 
                placeholder="请输入值" 
                clearable
                class="value-input"
              />
              <el-button 
                type="danger" 
                :icon="Delete" 
                @click="removeKeyValuePair(index)"
                class="delete-btn"
                v-if="!dialogProps.isView"
                circle
              />
            </div>
          </div>
          
          <div class="key-value-footer" v-if="!dialogProps.isView">
            <el-button 
              type="primary" 
              :icon="Plus" 
              @click="addKeyValuePair"
            >
              添加键值对
            </el-button>
          </div>
        </div>
      </el-form-item>
      
      <!-- 学生信息 -->
      <el-form-item label="学生信息">
        <div class="students-container">
          <div class="students-header">
            <span>学生列表</span>
            <el-button 
              type="primary" 
              link 
              :icon="Plus" 
              @click="addStudent"
              v-if="!dialogProps.isView"
            >
              添加学生
            </el-button>
          </div>
          
          <div 
            v-for="(student, index) in (dialogProps.row!.students || [])" 
            :key="student.id || index" 
            class="student-item"
          >
            <div class="student-header">
              <span class="student-title">学生 {{ index + 1 }}</span>
              <div class="student-actions" v-if="!dialogProps.isView">
                <el-button 
                  type="danger" 
                  link 
                  :icon="Delete" 
                  @click="removeStudent(index)"
                >
                  删除
                </el-button>
              </div>
            </div>
            
            <div class="student-content">
              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item :label="`学生${index + 1}姓名`" :prop="`students.${index}.name`">
                    <el-input v-model="student.name" placeholder="请输入学生姓名" clearable />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item :label="`学生${index + 1}年龄`" :prop="`students.${index}.age`">
                    <el-input-number v-model="student.age" :min="1" :max="25" placeholder="请输入年龄" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item :label="`学生${index + 1}学校`" :prop="`students.${index}.school`">
                    <el-input v-model="student.school" placeholder="请输入学校名称" clearable />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item :label="`学生${index + 1}年级`" :prop="`students.${index}.grade`">
                    <el-select v-model="student.grade" placeholder="请选择年级" clearable>
                      <el-option label="一年级" value="一年级" />
                      <el-option label="二年级" value="二年级" />
                      <el-option label="三年级" value="三年级" />
                      <el-option label="四年级" value="四年级" />
                      <el-option label="五年级" value="五年级" />
                      <el-option label="六年级" value="六年级" />
                      <el-option label="初一" value="初一" />
                      <el-option label="初二" value="初二" />
                      <el-option label="初三" value="初三" />
                      <el-option label="高一" value="高一" />
                      <el-option label="高二" value="高二" />
                      <el-option label="高三" value="高三" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="16">
                <el-col :span="24">
                  <el-form-item :label="`学生${index + 1}备注`" :prop="`students.${index}.remark`">
                    <el-input 
                      v-model="student.remark" 
                      type="textarea" 
                      :rows="2"
                      placeholder="请输入备注信息" 
                      clearable
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </div>
          
          <div v-if="(dialogProps.row!.students || []).length === 0" class="empty-state">
            <el-empty description="暂无学生信息" />
          </div>
        </div>
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button v-show="!dialogProps.isView" type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="UserAddDialog">
import { ref, reactive } from "vue";
import { genderType } from "@/utils/dict";
import { ElMessage, FormInstance } from "element-plus";
import { Delete, Plus } from "@element-plus/icons-vue";

const rules = reactive({
  username: [{ required: true, message: "请填写用户姓名" }],
  gender: [{ required: true, message: "请选择性别" }],
  age: [{ required: true, message: "请输入年龄" }],
  phone: [{ required: true, message: "请填写手机号码" }],
  email: [{ required: true, message: "请填写邮箱" }],
  idCard: [{ required: true, message: "请填写身份证号" }],
  address: [{ required: true, message: "请填写居住地址" }],
  description: [{ required: false, message: "请填写个人简介" }],
  // 学生信息验证规则
  'students.*.name': [{ required: true, message: "请填写学生姓名" }],
  'students.*.age': [{ required: true, message: "请输入学生年龄" }],
  'students.*.school': [{ required: true, message: "请填写学校名称" }],
  'students.*.grade': [{ required: true, message: "请选择年级" }],
  'students.*.remark': [{ required: false, message: "请填写备注信息" }],
  // 键值对列表验证规则
  'keyValuePairs.*.key': [{ required: true, message: "请填写键名" }],
  'keyValuePairs.*.value': [{ required: true, message: "请填写值" }]
});

interface DialogProps {
  title: string;
  isView: boolean;
  row: {
    username?: string;
    gender?: number;
    age?: number;
    phone?: string;
    email?: string;
    idCard?: string;
    address?: string;
    description?: string;
    keyValuePairs?: Array<{
      id?: number;
      key?: string;
      value?: string;
    }>;
    students?: Array<{
      id?: number;
      name?: string;
      age?: number;
      school?: string;
      grade?: string;
      remark?: string;
    }>;
  };
  api?: (params: any) => Promise<any>;
  getTableList?: () => void;
}

const dialogVisible = ref(false);
const dialogProps = ref<DialogProps>({
  isView: false,
  title: "",
  row: {
    students: [],
    keyValuePairs: []
  }
});

// 接收父组件传过来的参数
const acceptParams = (params: DialogProps) => {
  dialogProps.value = params;
  // 确保students数组存在
  if (!dialogProps.value.row.students) {
    dialogProps.value.row.students = [];
  }
  // 确保keyValuePairs数组存在
  if (!dialogProps.value.row.keyValuePairs) {
    dialogProps.value.row.keyValuePairs = [];
  }
  dialogVisible.value = true;
};

// 添加学生
const addStudent = () => {
  if (!dialogProps.value.row.students) {
    dialogProps.value.row.students = [];
  }
  dialogProps.value.row.students.push({
    id: Date.now(),
    name: "",
    age: 1,
    school: "",
    grade: "",
    remark: ""
  });
};

// 删除学生
const removeStudent = (index: number) => {
  if (dialogProps.value.row.students) {
    dialogProps.value.row.students.splice(index, 1);
  }
};

// 添加键值对
const addKeyValuePair = () => {
  if (!dialogProps.value.row.keyValuePairs) {
    dialogProps.value.row.keyValuePairs = [];
  }
  dialogProps.value.row.keyValuePairs.push({
    id: Date.now(),
    key: "",
    value: ""
  });
};

// 删除键值对
const removeKeyValuePair = (index: number) => {
  if (dialogProps.value.row.keyValuePairs) {
    dialogProps.value.row.keyValuePairs.splice(index, 1);
  }
};

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    
    try {
      await dialogProps.value.api!(dialogProps.value.row);
      ElMessage.success({ message: `${dialogProps.value.title}用户信息成功！` });
      dialogProps.value.getTableList!();
      dialogVisible.value = false;
    } catch (error) {
      console.log(error);
    }
  });
};

defineExpose({
  acceptParams
});
</script>

<style scoped lang="scss">
.el-dialog {
  .el-form {
    padding: 20px;
  }
}

.key-value-container {
  background: var(--el-bg-color);
  
  .key-value-item {
    padding: 0;
    margin-bottom: 8px;
    
    .key-value-content {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .key-input, .value-input {
        flex: 1;
        min-width: 0;
      }
      
      .equals-sign {
        font-size: 18px;
        font-weight: bold;
        color: var(--el-text-color-secondary);
        margin: 0 8px;
        flex-shrink: 0;
      }
      
      .delete-btn {
        flex-shrink: 0;
        margin-left: 8px;
      }
    }
  }
  
  .key-value-footer {
    padding: 8px 0;
    text-align: left;
  }
}

.students-container {
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  margin-top: 16px;
  background: var(--el-bg-color);
  
  .students-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: var(--el-fill-color-light);
    border-bottom: 1px solid var(--el-border-color-light);
    border-radius: 6px 6px 0 0;
    
    .student-title {
      font-weight: 500;
      color: var(--el-text-color-primary);
    }
    
    .student-actions {
      display: flex;
      gap: 8px;
    }
  }
  
  .student-item {
    border-top: 1px solid var(--el-border-color-light);
    padding: 16px;
    
    .student-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--el-border-color-light);
      
      .student-title {
        font-weight: 500;
        color: var(--el-text-color-primary);
      }
      
      .student-actions {
        display: flex;
        gap: 8px;
      }
    }
    
    .student-content {
      .empty-state {
        padding: 20px;
        text-align: center;
      }
    }
  }
}
</style> 