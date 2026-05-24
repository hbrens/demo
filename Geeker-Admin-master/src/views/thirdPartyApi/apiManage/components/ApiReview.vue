<template>
  <ProTable
    ref="proTable"
    :columns="columns"
    :request-api="loadReviewRequests"
    :pagination="false"
    :tool-button="['refresh']"
    row-key="id"
  >
    <!-- 状态列 -->
    <template #status="scope">
      <el-tag :type="statusTagType(scope.row.status)" effect="plain" size="small">
        {{ statusLabel(scope.row.status) }}
      </el-tag>
    </template>

    <!-- 操作列 -->
    <template #operation="scope">
      <el-button
        v-if="scope.row.status === 'pending'"
        type="primary"
        link
        :icon="Check"
        @click="handleReview(scope.row)"
      >
        审核
      </el-button>
      <el-button type="primary" link :icon="View" @click="handleViewDetail(scope.row)">
        详情
      </el-button>
    </template>
  </ProTable>

  <ReviewDialog ref="reviewDialogRef" @success="refreshTable" />

  <!-- 详情弹窗 -->
  <el-dialog v-model="detailVisible" title="申请详情" width="520px" destroy-on-close>
    <el-descriptions v-if="detailData" :column="2" border size="small">
      <el-descriptions-item label="申请ID">{{ detailData.id }}</el-descriptions-item>
      <el-descriptions-item label="申请人">{{ detailData.username }}</el-descriptions-item>
      <el-descriptions-item label="供应商">{{ detailData.provider || '-' }}</el-descriptions-item>
      <el-descriptions-item label="项目名称">{{ detailData.project_name }}</el-descriptions-item>
      <el-descriptions-item label="需求详情" :span="2">{{ detailData.purpose }}</el-descriptions-item>
      <el-descriptions-item label="预算">{{ detailData.budget }}</el-descriptions-item>
      <el-descriptions-item label="负责人">{{ detailData.lead }}</el-descriptions-item>
      <el-descriptions-item label="抄送人">{{ detailData.cc_person || '-' }}</el-descriptions-item>
      <el-descriptions-item label="审批人">{{ detailData.reviewer_username || '-' }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="statusTagType(detailData.status)" effect="plain" size="small">
          {{ statusLabel(detailData.status) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="审核备注">{{ detailData.review_note || '-' }}</el-descriptions-item>
      <el-descriptions-item label="分配密钥">{{ detailData.api_key_name || '-' }}</el-descriptions-item>
      <el-descriptions-item label="申请时间" :span="2">{{ detailData.created_at }}</el-descriptions-item>
    </el-descriptions>
  </el-dialog>
</template>

<script setup lang="tsx" name="ApiReview">
import { ref, reactive } from "vue";
import ProTable from "@/components/ProTable/index.vue";
import ReviewDialog from "./ReviewDialog.vue";
import { getReviewRequests } from "@/api/thirdPartyApi/apiManage";
import type { ApiRequestItem } from "@/api/thirdPartyApi/apiManage";
import type { ColumnProps, ProTableInstance } from "@/components/ProTable/interface";
import { Check, View } from "@element-plus/icons-vue";

const proTable = ref<ProTableInstance>();
const reviewDialogRef = ref<InstanceType<typeof ReviewDialog>>();

// 详情弹窗
const detailVisible = ref(false);
const detailData = ref<ApiRequestItem | null>(null);

// 状态映射
const statusTagType = (status: string) => {
  const map: Record<string, "success" | "warning" | "info" | "danger"> = {
    pending: "warning",
    approved: "success",
    rejected: "danger"
  };
  return map[status] || "info";
};

const statusLabel = (status: string) => {
  const map: Record<string, string> = {
    pending: "审核中",
    approved: "已通过",
    rejected: "已拒绝"
  };
  return map[status] || status;
};

// 表格列配置
const columns = reactive<ColumnProps<ApiRequestItem>[]>([
  { prop: "id", label: "ID", width: 70, align: "center" },
  { prop: "username", label: "申请人", width: 100 },
  { prop: "provider", label: "供应商", search: { el: "input" }, minWidth: 120 },
  { prop: "project_name", label: "项目名称", search: { el: "input" }, minWidth: 150 },
  { prop: "lead", label: "负责人", width: 100 },
  { prop: "budget", label: "预算", width: 100 },
  {
    prop: "status",
    label: "状态",
    width: 100,
    align: "center",
    search: {
      el: "select",
      props: { filterable: true }
    },
    enum: [
      { label: "审核中", value: "pending" },
      { label: "已通过", value: "approved" },
      { label: "已拒绝", value: "rejected" }
    ]
  },
  { prop: "reviewer_username", label: "审批人", width: 100 },
  { prop: "created_at", label: "申请时间", width: 180 },
  { prop: "operation", label: "操作", fixed: "right", width: 140 }
]);

// 加载数据（API已返回 { data } 格式，直接透传给 useTable）
const loadReviewRequests = () => {
  return getReviewRequests() as any;
};

// 刷新表格
const refreshTable = () => {
  proTable.value?.getTableList();
};

// 审核
const handleReview = (row: ApiRequestItem) => {
  reviewDialogRef.value?.open(row);
};

// 查看详情
const handleViewDetail = (row: ApiRequestItem) => {
  detailData.value = row;
  detailVisible.value = true;
};
</script>
