<template>
  <ProTable
    ref="proTable"
    :columns="columns"
    :request-api="loadApprovedRequests"
    :pagination="false"
    :tool-button="['refresh']"
    row-key="request_id"
  >
    <!-- 状态列 -->
    <template #status="scope">
      <el-tag type="success" effect="plain" size="small">已通过</el-tag>
    </template>

    <!-- 可用模型列 -->
    <template #available_models="scope">
      <el-tag
        v-for="model in parseModels(scope.row.available_models)"
        :key="model"
        size="small"
        type="info"
        effect="plain"
        style="margin: 2px 4px 2px 0"
      >
        {{ model }}
      </el-tag>
      <span v-if="!scope.row.available_models" style="color: var(--el-text-color-secondary)">-</span>
    </template>
  </ProTable>
</template>

<script setup lang="tsx" name="KeyManagement">
import { ref, reactive } from "vue";
import ProTable from "@/components/ProTable/index.vue";
import { getApprovedRequests } from "@/api/thirdPartyApi/apiManage";
import type { ApprovedRequest } from "@/api/thirdPartyApi/apiManage";
import type { ColumnProps, ProTableInstance } from "@/components/ProTable/interface";

const proTable = ref<ProTableInstance>();

// 解析模型列表
const parseModels = (models: string | null): string[] => {
  if (!models) return [];
  try {
    const parsed = JSON.parse(models);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return models.split(",").map(m => m.trim()).filter(Boolean);
  }
};

// 表格列配置
const columns = reactive<ColumnProps<ApprovedRequest>[]>([
  { prop: "request_id", label: "申请ID", width: 80, align: "center" },
  { prop: "provider", label: "供应商", search: { el: "input" }, minWidth: 120 },
  { prop: "sub_account_name", label: "子账号", minWidth: 120 },
  { prop: "api_name", label: "密钥名称", minWidth: 120 },
  { prop: "project_name", label: "项目名称", search: { el: "input" }, minWidth: 150 },
  { prop: "status", label: "状态", width: 90, align: "center" },
  { prop: "created_at", label: "申请时间", width: 180 }
]);

// 加载数据（API已返回 { data } 格式，直接透传给 useTable）
const loadApprovedRequests = () => {
  return getApprovedRequests() as any;
};
</script>
