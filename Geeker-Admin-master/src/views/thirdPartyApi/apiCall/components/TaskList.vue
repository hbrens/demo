<template>
  <div class="task-list">
    <!-- 列表视图 -->
    <div v-if="!showDetail" class="list-view">
      <div class="list-header">
        <span v-if="autoRefreshHint" class="auto-hint">{{ autoRefreshHint }}</span>
        <el-button size="small" @click="loadJobs">刷新</el-button>
      </div>
      <el-table
        :data="filteredJobs"
        border
        size="small"
        max-height="calc(100vh - 340px)"
        stripe
        @sort-change="handleSortChange"
      >
        <el-table-column prop="batch_id" label="任务ID" width="100" sortable="custom">
          <template #default="{ row }">
            <span class="monospace">{{ row.batch_id || '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="task_name" label="任务名称" min-width="150" sortable="custom">
          <template #default="{ row }">
            <b>{{ row.task_name || 'NA' }}</b>
          </template>
        </el-table-column>
        <el-table-column prop="source_type" label="来源" width="100" sortable="custom">
          <template #default="{ row }">
            <el-tag
              :type="row.source_type === 'script' ? 'primary' : 'success'"
              size="small"
              effect="plain"
            >
              {{ row.source_type === 'script' ? '脚本' : '点击配置' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="model" label="模型" width="150" sortable="custom">
          <template #default="{ row }">
            <span class="monospace">{{ getModelName(row) || '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" sortable="custom">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small" effect="dark">
              {{ statusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="进度" min-width="200" sortable="custom">
          <template #default="{ row }">
            <div class="progress-cell">
              <el-progress
                :percentage="getProgressPercent(row)"
                :stroke-width="8"
                :show-text="false"
                style="width: 130px"
              />
              <span class="progress-text">
                {{ getProcessedCount(row) }}/{{ row.row_count || 0 }}
              </span>
            </div>
            <div class="progress-detail">
              <span class="success-count">✓ {{ row.done_count || 0 }}</span>
              <span class="fail-count">✗ {{ row.fail_count || 0 }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="170" sortable="custom">
          <template #default="{ row }">
            <span class="time-text">{{ formatTime(row.created_at) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <div class="action-cell">
              <el-button size="small" @click="fillConfig(row)">配置</el-button>
              <el-button size="small" @click="viewDetail(row)">结果</el-button>
              <el-button
                v-if="row.status === 'running'"
                size="small"
                type="warning"
                @click="pauseJob(row)"
              >
                暂停
              </el-button>
              <el-button
                v-if="row.status === 'paused' || row.status === 'partial_failed'"
                size="small"
                type="primary"
                @click="resumeJob(row)"
              >
                续跑
              </el-button>
              <el-button
                v-if="isFinished(row.status)"
                size="small"
                @click="rerunJob(row)"
              >
                重跑
              </el-button>
              <el-button
                size="small"
                type="primary"
                link
                :disabled="!canDownload(row)"
                @click="exportJob(row)"
              >
                下载
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 详情视图 -->
    <div v-else class="detail-view">
      <div class="detail-header">
        <el-button size="small" @click="backToList">返回列表</el-button>
        <el-button size="small" type="primary" @click="exportCurrentJob">下载结果</el-button>
      </div>
      <div class="detail-content">
        <div class="detail-toolbar">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索输入/输出内容…"
            size="small"
            clearable
            style="flex: 1; min-width: 200px"
          />
          <span class="row-count">
            共 {{ totalRows }} 行{{ filteredRows.length !== allRows.length ? `(筛选后 ${filteredRows.length})` : '' }}
            {{ filteredRows.length ? ` · 显示 ${pageStart + 1}-${pageEnd}` : '' }}
          </span>
        </div>
        <el-table
          :data="pageRows"
          border
          size="small"
          max-height="calc(100vh - 420px)"
          stripe
        >
          <el-table-column prop="row_index" label="行号" width="70" />
          <el-table-column
            v-for="col in detailColumns"
            :key="col.field"
            :prop="col.field"
            :label="col.header"
            min-width="140"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <template v-if="isImagePath(getInputField(row, col.field))">
                <div class="image-cell">
                  <img
                    :src="getImagePreviewUrl(getInputField(row, col.field))"
                    class="img-thumb"
                    @error="(e: any) => e.target.classList.add('broken')"
                    @click="previewImage(getInputField(row, col.field))"
                  />
                  <span class="img-name">{{ getFileName(getInputField(row, col.field)) }}</span>
                </div>
              </template>
              <template v-else>
                {{ getInputField(row, col.field) }}
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="output" label="识别结果" min-width="280">
            <template #default="{ row }">
              <template v-if="isImagePath(getOutputText(row))">
                <div class="image-cell">
                  <img
                    :src="getImagePreviewUrl(getOutputText(row))"
                    class="img-thumb"
                    @error="(e: any) => e.target.classList.add('broken')"
                    @click="previewImage(getOutputText(row))"
                  />
                  <span class="img-name">{{ getFileName(getOutputText(row)) }}</span>
                </div>
              </template>
              <template v-else>
                {{ getOutputText(row) }}
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="success" label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="row.success ? 'success' : 'danger'" size="small">
                {{ row.success ? '成功' : '失败' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="duration" label="耗时(s)" width="80">
            <template #default="{ row }">
              {{ formatDuration(row) }}
            </template>
          </el-table-column>
          <el-table-column prop="error_msg" label="错误信息" min-width="160" show-overflow-tooltip>
            <template #default="{ row }">
              <span class="error-text">{{ row.error_msg || '' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160" fixed="right">
            <template #default="{ row }">
              <el-button size="small" link @click="copyInput(row)">复制输入</el-button>
              <el-button size="small" link @click="copyOutput(row)">复制输出</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-bar">
          <span class="load-more-hint" v-if="hasMore">
            <el-button type="primary" link size="small" @click="loadMore">
              加载更多 (剩余 {{ totalRows - allRows.length }} 条)
            </el-button>
          </span>
          <span style="flex: 1"></span>
          <el-button size="small" :disabled="currentPage <= 1" @click="currentPage = 1">«</el-button>
          <el-button size="small" :disabled="currentPage <= 1" @click="currentPage--">‹</el-button>
          <span class="page-info">第 {{ currentPage }} / {{ totalPages }} 页</span>
          <el-button size="small" :disabled="currentPage >= totalPages" @click="currentPage++">›</el-button>
          <el-button size="small" :disabled="currentPage >= totalPages" @click="currentPage = totalPages">»</el-button>
          <span class="page-size-label">每页显示</span>
          <el-select v-model="pageSize" size="small" style="width: 70px">
            <el-option :value="25" label="25" />
            <el-option :value="50" label="50" />
            <el-option :value="100" label="100" />
          </el-select>
          <span class="page-size-label">行</span>
        </div>
      </div>
    </div>

    <!-- 图片预览弹窗 -->
    <el-dialog v-model="imagePreviewVisible" width="90vw" destroy-on-close>
      <img :src="imagePreviewUrl" style="max-width: 100%; max-height: 80vh; border-radius: 8px" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="TaskList">
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getBatchJobs,
  getBatchJobRows,
  pauseBatchJob,
  resumeBatchJob,
  rerunBatchJob,
  exportBatchJob,
  consumeRunStream,
  type BatchJob,
  type BatchJobRow,
} from "@/api/thirdPartyApi";

// ==================== 类型定义 ====================

interface DetailColumn {
  field: string;
  header: string;
  kind: "value" | "imgname" | "imgthumb";
}

// ==================== 数据状态 ====================

// 列表视图
const jobs = ref<BatchJob[]>([]);
const sortField = ref("created_at");
const sortDir = ref<"asc" | "desc">("desc");
const autoRefreshHint = ref("");
let autoRefreshTimer: ReturnType<typeof setInterval> | null = null;

// 详情视图
const showDetail = ref(false);
const currentJob = ref<BatchJob | null>(null);
const allRows = ref<BatchJobRow[]>([]);
const totalRows = ref(0);
const hasMore = ref(false);
const detailColumns = ref<DetailColumn[]>([]);
const searchKeyword = ref("");
const statusFilter = ref("");

// 分页
const currentPage = ref(1);
const pageSize = ref(25);

// 图片预览
const imagePreviewVisible = ref(false);
const imagePreviewUrl = ref("");

// ==================== 计算属性 ====================

const filteredJobs = computed(() => {
  let list = [...jobs.value];

  // 排序
  list.sort((a, b) => {
    let va: any, vb: any;
    if (sortField.value === "progress") {
      va = getProcessedCount(a);
      vb = getProcessedCount(b);
    } else if (sortField.value === "model") {
      va = getModelName(a);
      vb = getModelName(b);
    } else {
      va = (a as any)[sortField.value] ?? "";
      vb = (b as any)[sortField.value] ?? "";
    }
    const mult = sortDir.value === "asc" ? 1 : -1;
    if (typeof va === "number" && typeof vb === "number") return (va - vb) * mult;
    return String(va).localeCompare(String(vb), "zh") * mult;
  });

  return list;
});

const filteredRows = computed(() => {
  let list = [...allRows.value];

  // 状态筛选
  if (statusFilter.value === "ok") list = list.filter((r) => r.success);
  if (statusFilter.value === "err") list = list.filter((r) => !r.success);

  // 关键词搜索
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase();
    list = list.filter(
      (r) =>
        (r.input_json || "").toLowerCase().includes(kw) ||
        (r.output_text || "").toLowerCase().includes(kw)
    );
  }

  return list;
});

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredRows.value.length / pageSize.value));
});

const pageStart = computed(() => {
  return (currentPage.value - 1) * pageSize.value;
});

const pageEnd = computed(() => {
  return Math.min(pageStart.value + pageSize.value, filteredRows.value.length);
});

const pageRows = computed(() => {
  return filteredRows.value.slice(pageStart.value, pageEnd.value);
});

// ==================== 监听器 ====================

watch(searchKeyword, () => {
  currentPage.value = 1;
});

watch(statusFilter, () => {
  currentPage.value = 1;
});

watch(pageSize, () => {
  currentPage.value = 1;
});

// ==================== 初始化 ====================

onMounted(() => {
  loadJobs();
});

onBeforeUnmount(() => {
  stopAutoRefresh();
});

async function loadJobs() {
  try {
    jobs.value = await getBatchJobs();
    const anyRunning = jobs.value.some(
      (t) => t.status === "running" || t.status === "queued"
    );
    if (anyRunning) startAutoRefresh();
    else stopAutoRefresh();
  } catch (e: any) {
    ElMessage.error("加载任务列表失败：" + e.message);
  }
}

// ==================== 自动刷新 ====================

function startAutoRefresh() {
  if (autoRefreshTimer) return;
  autoRefreshHint.value = "运行中 · 自动刷新 (3s)";
  autoRefreshTimer = setInterval(() => {
    if (!showDetail.value) {
      loadJobs();
    }
  }, 3000);
}

function stopAutoRefresh() {
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer);
    autoRefreshTimer = null;
  }
  autoRefreshHint.value = "";
}

// ==================== 排序 ====================

function handleSortChange({ prop, order }: { prop: string; order: string | null }) {
  if (prop) {
    sortField.value = prop;
    sortDir.value = order === "ascending" ? "asc" : "desc";
  }
}

// ==================== 状态映射 ====================

function statusTagType(status: string): "success" | "warning" | "info" | "danger" {
  const map: Record<string, "success" | "warning" | "info" | "danger"> = {
    queued: "info",
    running: "warning",
    paused: "info",
    completed: "success",
    failed: "danger",
    partial_failed: "warning",
  };
  return map[status] || "info";
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    queued: "排队中",
    running: "运行中",
    paused: "已暂停",
    completed: "已完成",
    failed: "失败",
    partial_failed: "部分失败",
  };
  return map[status] || status || "—";
}

function isFinished(status: string): boolean {
  return ["completed", "failed", "partial_failed"].includes(status);
}

function getModelName(job: BatchJob): string {
  if (job.model) return job.model;
  try {
    const cfg = JSON.parse(job.config_json || "{}");
    return cfg.model || "";
  } catch {
    return "";
  }
}

function getProcessedCount(job: BatchJob): number {
  return (job.done_count || 0) + (job.fail_count || 0);
}

function getProgressPercent(job: BatchJob): number {
  const total = job.row_count || 0;
  if (total === 0) return job.status === "completed" ? 100 : 0;
  return Math.round((getProcessedCount(job) / total) * 100);
}

function canDownload(job: BatchJob): boolean {
  return job.status !== "queued" && getProcessedCount(job) > 0;
}

// ==================== 时间格式化 ====================

function formatTime(t: string | null): string {
  if (!t) return "";
  try {
    return new Date(t).toLocaleString("zh-CN", { hour12: false });
  } catch {
    return String(t);
  }
}

function formatDuration(row: BatchJobRow): string {
  if (!row.started_at || !row.finished_at) return "—";
  try {
    const ms = new Date(row.finished_at).getTime() - new Date(row.started_at).getTime();
    if (ms < 0) return "—";
    return (ms / 1000).toFixed(1);
  } catch {
    return "—";
  }
}

// ==================== 操作 ====================

async function pauseJob(job: BatchJob) {
  try {
    await ElMessageBox.confirm("确定暂停？已完成的行保留。", "确认暂停", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
    await pauseBatchJob(job.id);
    ElMessage.success("暂停请求已发送");
    loadJobs();
  } catch {
    // 用户取消
  }
}

async function resumeJob(job: BatchJob) {
  try {
    await ElMessageBox.confirm("从已完成行之后继续跑（沿用原配置）？", "确认续跑", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "info",
    });
    const res = await resumeBatchJob(job.id);
    if (!res.ok) throw new Error(await res.text());
    consumeRunStream(res);
    ElMessage.success("续跑请求已发送");
    setTimeout(() => loadJobs(), 500);
  } catch (e: any) {
    if (e !== "cancel") {
      ElMessage.error("续跑失败：" + e.message);
    }
  }
}

async function rerunJob(job: BatchJob) {
  try {
    await ElMessageBox.confirm("用相同配置重新跑一次（创建新批次）？", "确认重跑", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "info",
    });
    const res = await rerunBatchJob(job.id);
    if (!res.ok) throw new Error(await res.text());
    consumeRunStream(res);
    ElMessage.success("重跑请求已发送");
    setTimeout(() => loadJobs(), 500);
  } catch (e: any) {
    if (e !== "cancel") {
      ElMessage.error("重跑失败：" + e.message);
    }
  }
}

function exportJob(job: BatchJob) {
  exportBatchJob(job.id);
}

function exportCurrentJob() {
  if (currentJob.value) {
    exportBatchJob(currentJob.value.id);
  }
}

// ==================== 配置回填 ====================

const emit = defineEmits<{
  fillConfig: [job: BatchJob];
}>();

function fillConfig(job: BatchJob) {
  emit("fillConfig", job);
}

// ==================== 详情视图 ====================

async function viewDetail(job: BatchJob) {
  currentJob.value = job;
  showDetail.value = true;
  allRows.value = [];
  totalRows.value = 0;
  hasMore.value = false;
  currentPage.value = 1;
  searchKeyword.value = "";
  statusFilter.value = "";

  // 解析配置获取字段
  let cfg: any = {};
  try {
    cfg = JSON.parse(job.config_json || "{}");
  } catch {}

  const isScript = job.source_type === "script";
  const fields = isScript ? [] : (cfg.selected_fields || []);
  detailColumns.value = fields.map((f: string) => ({ field: f, header: f, kind: "value" }));

  await loadDetailRows(job.id);
}

async function loadDetailRows(jobId: number, reset = true) {
  if (reset) {
    allRows.value = [];
  }
  try {
    const offset = allRows.value.length;
    const data = await getBatchJobRows(jobId, offset, 10000);
    const newRows = data.rows || [];
    totalRows.value = data.total || (newRows.length + offset);
    allRows.value.push(...newRows);
    hasMore.value = allRows.value.length < totalRows.value;

    // 根据首行数据更新列结构（识别图片字段）
    if (reset && allRows.value.length > 0) {
      const firstInput = parseInputJson(allRows.value[0]);
      const fields = currentJob.value?.source_type === "script"
        ? Object.keys(firstInput).filter((k) => k !== "脚本")
        : detailColumns.value.map((c) => c.field);

      if (currentJob.value?.source_type === "script") {
        detailColumns.value = fields.map((f) => ({ field: f, header: f, kind: "value" }));
      }

      // 检测图片字段
      for (const col of detailColumns.value) {
        const val = firstInput[col.field];
        if (val != null && isImagePath(String(val))) {
          col.kind = "imgname";
        }
      }
    }
  } catch (e: any) {
    ElMessage.error("加载详情失败：" + e.message);
  }
}

async function loadMore() {
  if (currentJob.value) {
    await loadDetailRows(currentJob.value.id, false);
  }
}

function backToList() {
  showDetail.value = false;
  currentJob.value = null;
}

// ==================== 工具函数 ====================

function parseInputJson(row: BatchJobRow): Record<string, any> {
  try {
    return JSON.parse((row.input_json || "{}").replace(/\bNaN\b/g, "null").replace(/\b-?Infinity\b/g, "null"));
  } catch {
    return {};
  }
}

function getInputField(row: BatchJobRow, field: string): string {
  const input = parseInputJson(row);
  return input[field] != null ? String(input[field]) : "";
}

function getOutputText(row: BatchJobRow): string {
  const text = row.output_text || "";
  if (currentJob.value?.source_type !== "script") {
    try {
      const p = JSON.parse(text);
      if (p && "result" in p) return String(p.result ?? "");
    } catch {}
  }
  return text;
}

function isImagePath(s: string): boolean {
  return typeof s === "string" && /\.(jpe?g|png|gif|webp|bmp)\s*$/i.test(s.trim());
}

function getFileName(path: string): string {
  return path.split(/[\\/]/).pop() || path;
}

function getImagePreviewUrl(path: string): string {
  const token = localStorage.getItem("thirdPartyToken") || "";
  return `/third-party-api/batch2/local-image?path=${encodeURIComponent(path)}&token=${encodeURIComponent(token)}`;
}

function previewImage(path: string) {
  imagePreviewUrl.value = getImagePreviewUrl(path);
  imagePreviewVisible.value = true;
}

async function copyInput(row: BatchJobRow) {
  const input = parseInputJson(row);
  await navigator.clipboard.writeText(JSON.stringify(input, null, 2));
  ElMessage.success("已复制输入");
}

async function copyOutput(row: BatchJobRow) {
  await navigator.clipboard.writeText(getOutputText(row));
  ElMessage.success("已复制输出");
}
</script>

<style lang="scss" scoped>
.task-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.list-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.list-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.auto-hint {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.monospace {
  font-family: monospace;
  font-size: 12px;
}

.progress-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-text {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}

.progress-detail {
  font-size: 11px;
  margin-top: 4px;

  .success-count {
    color: var(--el-color-success);
    margin-right: 12px;
  }

  .fail-count {
    color: var(--el-color-danger);
  }
}

.time-text {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.action-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

// 详情视图
.detail-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.detail-header {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-bottom: 12px;
}

.detail-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
}

.detail-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-blank);
  flex-shrink: 0;
}

.row-count {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}

.image-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.img-thumb {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 4px;
  cursor: zoom-in;
  border: 1px solid var(--el-border-color-lighter);
  transition: transform 0.15s;

  &:hover {
    transform: scale(1.5);
    z-index: 10;
    position: relative;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  &.broken {
    background: repeating-linear-gradient(
      45deg,
      var(--el-fill-color-lighter),
      var(--el-fill-color-lighter) 6px,
      var(--el-fill-color) 6px,
      var(--el-fill-color) 12px
    );
    cursor: default;
  }
}

.img-name {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  word-break: break-all;
}

.error-text {
  font-size: 12px;
  color: var(--el-color-danger);
  white-space: pre-wrap;
  word-break: break-word;
}

.pagination-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-top: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-blank);
  flex-shrink: 0;
}

.load-more-hint {
  font-size: 12px;
}

.page-info {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  min-width: 96px;
  text-align: center;
}

.page-size-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
