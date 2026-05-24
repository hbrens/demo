<template>
  <el-dialog v-model="visible" title="审核申请" width="680px" destroy-on-close @close="handleClose">
    <div v-if="currentRequest" class="review-info">
      <el-descriptions :column="2" border size="small">
        <el-descriptions-item label="申请人">{{ currentRequest.username }}</el-descriptions-item>
        <el-descriptions-item label="供应商">{{ currentRequest.provider }}</el-descriptions-item>
        <el-descriptions-item label="项目名称">{{ currentRequest.project_name }}</el-descriptions-item>
        <el-descriptions-item label="负责人">{{ currentRequest.lead }}</el-descriptions-item>
        <el-descriptions-item label="预算">{{ currentRequest.budget }}</el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ currentRequest.created_at }}</el-descriptions-item>
        <el-descriptions-item label="需求详情" :span="2">{{ currentRequest.purpose }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <el-divider content-position="left">候选密钥</el-divider>

    <el-table
      ref="keyTableRef"
      :data="candidateKeys"
      border
      stripe
      highlight-current-row
      style="width: 100%"
      @current-change="handleKeySelect"
      v-loading="loadingKeys"
    >
      <el-table-column width="55" align="center">
        <template #default="{ row }">
          <el-radio v-model="selectedKeyId" :label="row.api_key_id">&nbsp;</el-radio>
        </template>
      </el-table-column>
      <el-table-column prop="sub_account_name" label="子账号" min-width="120" />
      <el-table-column prop="api_key_name" label="密钥名称" min-width="120" />
      <el-table-column prop="last_total" label="总额度" width="100" align="right" />
      <el-table-column prop="last_balance" label="余额" width="100" align="right">
        <template #default="{ row }">
          <el-text :type="row.last_balance < row.last_total * 0.2 ? 'danger' : 'success'">
            {{ row.last_balance }}
          </el-text>
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-if="!loadingKeys && candidateKeys.length === 0" description="暂无可用密钥" :image-size="80" />

    <el-form style="margin-top: 16px">
      <el-form-item label="审核备注">
        <el-input v-model="reviewNote" type="textarea" :rows="2" placeholder="请输入审核备注（选填）" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="danger" :loading="submitting" @click="handleReview('rejected')">拒绝</el-button>
      <el-button type="primary" :loading="submitting" :disabled="!selectedKeyId" @click="handleReview('approved')">
        通过
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="ReviewDialog">
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { getCandidateKeys, reviewRequest } from "@/api/thirdPartyApi/apiManage";
import type { ApiRequestItem, CandidateKey } from "@/api/thirdPartyApi/apiManage";

const visible = ref(false);
const submitting = ref(false);
const loadingKeys = ref(false);

const currentRequest = ref<ApiRequestItem | null>(null);
const candidateKeys = ref<CandidateKey[]>([]);
const selectedKeyId = ref<number>();
const reviewNote = ref("");

const emit = defineEmits<{
  success: [];
}>();

// 打开审核弹窗
const open = async (request: ApiRequestItem) => {
  visible.value = true;
  currentRequest.value = request;
  selectedKeyId.value = undefined;
  reviewNote.value = "";
  await loadCandidateKeys(request.id);
};

// 加载候选密钥
const loadCandidateKeys = async (requestId: number) => {
  loadingKeys.value = true;
  try {
    const data = await getCandidateKeys(requestId);
    candidateKeys.value = data as unknown as CandidateKey[];
  } catch (e: any) {
    ElMessage.error(e.message || "加载候选密钥失败");
    candidateKeys.value = [];
  } finally {
    loadingKeys.value = false;
  }
};

// 选择密钥
const handleKeySelect = (row: CandidateKey | null) => {
  if (row) {
    selectedKeyId.value = row.api_key_id;
  }
};

// 审核操作
const handleReview = async (status: "approved" | "rejected") => {
  if (!currentRequest.value) return;

  if (status === "approved" && !selectedKeyId.value) {
    ElMessage.warning("请先选择一个密钥");
    return;
  }

  submitting.value = true;
  try {
    await reviewRequest(currentRequest.value.id, {
      status,
      review_note: reviewNote.value,
      api_key_id: status === "approved" ? selectedKeyId.value : null
    });
    ElMessage.success(status === "approved" ? "已通过" : "已拒绝");
    visible.value = false;
    emit("success");
  } catch (e: any) {
    ElMessage.error(e.message || "审核失败");
  } finally {
    submitting.value = false;
  }
};

const handleClose = () => {
  currentRequest.value = null;
  candidateKeys.value = [];
  selectedKeyId.value = undefined;
  reviewNote.value = "";
};

defineExpose({ open });
</script>

<style lang="scss" scoped>
.review-info {
  margin-bottom: 16px;
}
</style>
