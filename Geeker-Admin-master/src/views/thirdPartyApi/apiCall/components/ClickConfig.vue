<template>
  <div class="click-config">
    <!-- 左侧配置 -->
    <div class="click-left">
      <!-- 任务名称 -->
      <div class="section-title">任务名称</div>
      <el-input
        v-model="taskName"
        placeholder="例如 2026-05-18_产品评论分析（留空则自动生成）"
        clearable
      />

      <!-- 数据来源 -->
      <div class="section-title">数据来源</div>
      <el-radio-group v-model="sourceMode" class="source-toggle">
        <el-radio-button value="file">上传文件</el-radio-button>
        <el-radio-button value="dataset">已有数据集</el-radio-button>
      </el-radio-group>

      <!-- 文件上传 -->
      <div v-if="sourceMode === 'file'" class="source-area">
        <el-upload
          ref="uploadRef"
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleFileChange"
          accept=".csv,.xlsx,.xls,.json,.parquet"
          :before-upload="beforeUploadConfirm"
        >
          <template #trigger>
            <el-button type="primary" plain>选择文件</el-button>
          </template>
          <template #tip>
            <div class="el-upload__tip">支持 CSV / Excel / JSON / Parquet</div>
          </template>
        </el-upload>
        <div v-if="fileInfo" class="file-info">{{ fileInfo }}</div>
      </div>

      <!-- 数据集选择 -->
      <div v-else class="source-area">
        <el-select
          v-model="selectedDatasetId"
          placeholder="请选择数据集"
          filterable
          @change="handleDatasetChange"
          style="width: 100%"
        >
          <el-option
            v-for="ds in datasets"
            :key="ds.dataset_id"
            :label="`${ds.name} · ${ds.row_count} 行`"
            :value="ds.dataset_id"
          />
        </el-select>
        <div v-if="datasetInfo" class="dataset-info">{{ datasetInfo }}</div>
      </div>

      <!-- 数据预览 -->
      <div v-if="previewData.length > 0" class="preview-area">
        <el-table :data="previewData" border size="small" max-height="200" stripe>
          <el-table-column
            v-for="col in previewHeaders"
            :key="col"
            :prop="col"
            :label="col"
            min-width="100"
            show-overflow-tooltip
          />
        </el-table>
        <div class="preview-tip">预览前 5 行，共 {{ totalRows }} 行</div>
      </div>

      <!-- 字段选择 -->
      <div class="section-title">选择字段</div>
      <div class="field-hint">选择要作为 AI 输入的字段（可多选）：</div>
      <div class="field-chips">
        <el-tag
          v-for="field in availableFields"
          :key="field"
          :type="selectedFields.includes(field) ? 'success' : 'info'"
          :effect="selectedFields.includes(field) ? 'dark' : 'plain'"
          class="field-chip"
          @click="toggleField(field)"
        >
          {{ field }}
        </el-tag>
      </div>

      <!-- API 配置 -->
      <div class="section-title">API 配置</div>
      <el-row :gutter="12">
        <el-col :span="8">
          <div class="config-label">供应商</div>
          <el-select
            v-model="selectedProvider"
            placeholder="请选择"
            @change="handleProviderChange"
            style="width: 100%"
          >
            <el-option
              v-for="p in providers"
              :key="p"
              :label="p"
              :value="p"
            />
          </el-select>
        </el-col>
        <el-col :span="8">
          <div class="config-label">API名称</div>
          <el-select
            v-model="selectedRequestId"
            placeholder="请选择"
            @change="handleConfigChange"
            style="width: 100%"
          >
            <el-option
              v-for="c in filteredConfigs"
              :key="c.request_id"
              :label="c.api_name || c.sub_account_name || c.project_name || String(c.request_id)"
              :value="c.request_id"
            />
          </el-select>
        </el-col>
        <el-col :span="8">
          <div class="config-label">模型</div>
          <el-select
            v-model="selectedModel"
            placeholder="请选择"
            style="width: 100%"
          >
            <el-option
              v-for="m in availableModels"
              :key="m"
              :label="m"
              :value="m"
            />
          </el-select>
        </el-col>
      </el-row>

      <!-- Prompt 模板 -->
      <div class="section-title">Prompt 模板</div>
      <el-input
        v-model="promptTemplate"
        type="textarea"
        :rows="4"
        placeholder="使用 {字段名} 引用字段，例如：&#10;请分析以下评论的情感倾向：{评论内容}&#10;产品名称：{产品名}"
      />
      <div class="template-help">
        可用字段：
        <span v-if="selectedFields.length">
          <code v-for="f in selectedFields" :key="f">{`{${f}}`}</code>
        </span>
        <span v-else>—</span>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button
          type="primary"
          :disabled="!canStart"
          :loading="running"
          @click="startBatch"
        >
          开始批跑
        </el-button>
        <el-button v-if="running" type="warning" @click="pauseBatch">
          暂停
        </el-button>
        <el-button v-if="results.length > 0" type="success" @click="exportCSV">
          导出 CSV
        </el-button>
      </div>
    </div>

    <!-- 右侧日志/结果 -->
    <div class="click-right">
      <el-tabs v-model="rightTab" class="right-tabs">
        <!-- 运行日志 -->
        <el-tab-pane label="运行日志" name="log">
          <!-- 进度条 -->
          <div v-if="running || progressText" class="progress-card">
            <div class="progress-header">
              <span class="progress-text">{{ progressText }}</span>
              <span class="progress-detail">{{ progressDetail }}</span>
            </div>
            <el-progress
              :percentage="progressPercent"
              :stroke-width="10"
              :show-text="false"
            />
          </div>
          <div ref="logContainer" class="log-content">
            <span v-if="!logEntries.length" class="log-hint">
              点击「开始批跑」后输出将显示在这里
            </span>
            <div
              v-for="(entry, idx) in logEntries"
              :key="idx"
              :class="['log-entry', `log-${entry.type}`]"
            >
              {{ entry.text }}
            </div>
          </div>
        </el-tab-pane>

        <!-- 结果表格 -->
        <el-tab-pane label="结果表格" name="result">
          <el-table
            v-if="results.length > 0"
            :data="results"
            border
            size="small"
            max-height="100%"
            stripe
          >
            <el-table-column type="index" label="#" width="50" />
            <el-table-column
              v-for="field in selectedFields"
              :key="field"
              :prop="field"
              :label="field"
              min-width="120"
              show-overflow-tooltip
            />
            <el-table-column prop="AI结果" label="AI 结果" min-width="200" show-overflow-tooltip />
            <el-table-column prop="状态" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row['状态'] === '完成' ? 'success' : 'danger'" size="small">
                  {{ row['状态'] }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-else description="暂无结果" :image-size="60" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts" name="ClickConfig">
import { ref, computed, nextTick, onMounted, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { UploadFile } from "element-plus";
import {
  uploadBatchFile,
  getDatasets,
  getDatasetRows,
  getApprovedConfigs,
  runBatchTask,
  pauseBatchJob,
  type ApprovedConfig,
  type BatchSSEEvent,
  type ClickConfigJson,
} from "@/api/thirdPartyApi";

// ==================== 数据状态 ====================

// 任务名称
const taskName = ref("");

// 数据来源
const sourceMode = ref<"file" | "dataset">("file");
const currentFileId = ref("");
const selectedDatasetId = ref("");
const fileInfo = ref("");
const datasetInfo = ref("");

// 数据预览
const previewData = ref<Record<string, any>[]>([]);
const previewHeaders = ref<string[]>([]);
const totalRows = ref(0);

// 字段选择
const availableFields = ref<string[]>([]);
const selectedFields = ref<string[]>([]);

// API 配置
const configs = ref<ApprovedConfig[]>([]);
const selectedProvider = ref("");
const selectedRequestId = ref<string | number>("");
const selectedModel = ref("");
const datasets = ref<Array<{ dataset_id: string; name: string; row_count: number; created_at: string }>>([]);

// Prompt 模板
const promptTemplate = ref("");

// 运行状态
const running = ref(false);
const currentJobId = ref<number | null>(null);
const progressText = ref("");
const progressDetail = ref("");
const progressPercent = ref(0);
const rightTab = ref("log");

// 日志
const logEntries = ref<Array<{ type: string; text: string }>>([]);
const logContainer = ref<HTMLElement>();

// 结果
const results = ref<Array<Record<string, any>>>([]);

// 上传确认
const uploadConfirmed = ref(false);

// ==================== 计算属性 ====================

const providers = computed(() => {
  return [...new Set(configs.value.map((c) => c.provider))];
});

const filteredConfigs = computed(() => {
  if (!selectedProvider.value) return [];
  return configs.value.filter((c) => c.provider === selectedProvider.value);
});

const availableModels = computed(() => {
  if (!selectedRequestId.value) return [];
  const entry = configs.value.find(
    (c) => String(c.request_id) === String(selectedRequestId.value)
  );
  if (!entry?.available_models) return [];
  return entry.available_models
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);
});

const canStart = computed(() => {
  return (
    totalRows.value > 0 &&
    selectedFields.value.length > 0 &&
    !!selectedRequestId.value &&
    !!selectedModel.value &&
    !!promptTemplate.value.trim() &&
    !running.value
  );
});

// ==================== 初始化 ====================

onMounted(async () => {
  await loadConfigs();
  await loadDatasets();
});

async function loadConfigs() {
  try {
    configs.value = await getApprovedConfigs();
  } catch {
    configs.value = [];
  }
}

async function loadDatasets() {
  try {
    datasets.value = await getDatasets();
  } catch {
    datasets.value = [];
  }
}

// ==================== 上传确认 ====================

function beforeUploadConfirm() {
  if (uploadConfirmed.value) return true;
  return new Promise<boolean>((resolve) => {
    ElMessageBox.confirm("请确认上传数据不属于公司保密资产。", "上传前请确认", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning",
    })
      .then(() => {
        uploadConfirmed.value = true;
        resolve(true);
      })
      .catch(() => resolve(false));
  });
}

// ==================== 文件处理 ====================

async function handleFileChange(file: UploadFile) {
  if (!file.raw) return;

  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  const isParquet = ext === "parquet";

  try {
    // 本地解析预览（parquet 不解析）
    if (!isParquet) {
      if (ext === "csv") {
        const rows = await parseCsv(file.raw);
        previewData.value = rows.slice(0, 5);
        previewHeaders.value = rows.length > 0 ? Object.keys(rows[0]) : [];
        totalRows.value = rows.length;
        availableFields.value = previewHeaders.value;
      } else if (ext === "json") {
        const rows = await parseJson(file.raw);
        previewData.value = rows.slice(0, 5);
        previewHeaders.value = rows.length > 0 ? Object.keys(rows[0]) : [];
        totalRows.value = rows.length;
        availableFields.value = previewHeaders.value;
      } else if (["xlsx", "xls"].includes(ext)) {
        const rows = await parseExcel(file.raw);
        previewData.value = rows.slice(0, 5);
        previewHeaders.value = rows.length > 0 ? Object.keys(rows[0]) : [];
        totalRows.value = rows.length;
        availableFields.value = previewHeaders.value;
      }

      fileInfo.value = `已解析 ${totalRows.value} 行，${availableFields.value.length} 列：${availableFields.value.join("、")}`;
    } else {
      fileInfo.value = "上传中…(parquet 由服务器解析列结构)";
    }

    // 上传到服务器
    const result = await uploadBatchFile(file.raw);
    currentFileId.value = result.file_id;

    if (isParquet) {
      availableFields.value = result.col_names || [];
      totalRows.value = result.rows || 0;
      previewHeaders.value = [];
      previewData.value = [];
      fileInfo.value = `parquet 已上传：${totalRows.value} 行，${availableFields.value.length} 列：${availableFields.value.join("、")}`;
    }

    selectedFields.value = [];
    selectedDatasetId.value = "";
  } catch (e: any) {
    fileInfo.value = `解析失败：${e.message}`;
  }
}

function parseCsv(file: File): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const lines = (e.target?.result as string).split("\n").filter((l) => l.trim());
      if (!lines.length) {
        resolve([]);
        return;
      }
      const heads = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
      const data = lines.slice(1).map((line) => {
        const vals = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
        return Object.fromEntries(heads.map((h, i) => [h, vals[i] || ""]));
      });
      resolve(data);
    };
    reader.onerror = reject;
    reader.readAsText(file, "utf-8");
  });
}

function parseJson(file: File): Promise<Record<string, any>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const d = JSON.parse(e.target?.result as string);
        resolve(Array.isArray(d) ? d : [d]);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file, "utf-8");
  });
}

async function parseExcel(file: File): Promise<Record<string, any>[]> {
  // 动态加载 xlsx 库
  const XLSX = await loadXlsx();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target?.result, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        resolve(XLSX.utils.sheet_to_json(ws));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

let xlsxPromise: Promise<any> | null = null;
function loadXlsx(): Promise<any> {
  if (xlsxPromise) return xlsxPromise;
  xlsxPromise = new Promise((resolve, reject) => {
    if ((window as any).XLSX) {
      resolve((window as any).XLSX);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js";
    script.onload = () => resolve((window as any).XLSX);
    script.onerror = () => reject(new Error("xlsx 加载失败"));
    document.head.appendChild(script);
  });
  return xlsxPromise;
}

// ==================== 数据集处理 ====================

async function handleDatasetChange(datasetId: string) {
  if (!datasetId) {
    selectedDatasetId.value = "";
    datasetInfo.value = "";
    previewData.value = [];
    previewHeaders.value = [];
    availableFields.value = [];
    selectedFields.value = [];
    totalRows.value = 0;
    currentFileId.value = "";
    return;
  }

  datasetInfo.value = "加载中…";
  try {
    const rows = await getDatasetRows(datasetId);
    previewData.value = rows.slice(0, 5);
    previewHeaders.value = rows.length > 0 ? Object.keys(rows[0]) : [];
    availableFields.value = previewHeaders.value;
    totalRows.value = rows.length;
    currentFileId.value = "";
    datasetInfo.value = `已加载 ${rows.length} 行 · ${previewHeaders.value.length} 列：${previewHeaders.value.join("、")}`;
    selectedFields.value = [];
  } catch (e: any) {
    datasetInfo.value = `加载失败：${e.message}`;
  }
}

// ==================== 字段选择 ====================

function toggleField(field: string) {
  const idx = selectedFields.value.indexOf(field);
  if (idx >= 0) {
    selectedFields.value.splice(idx, 1);
  } else {
    selectedFields.value.push(field);
  }
}

// ==================== API 配置联动 ====================

function handleProviderChange() {
  selectedRequestId.value = "";
  selectedModel.value = "";
}

function handleConfigChange() {
  selectedModel.value = "";
}

// ==================== 批跑执行 ====================

async function startBatch() {
  if (!canStart.value) return;

  running.value = true;
  currentJobId.value = null;
  results.value = [];
  logEntries.value = [];
  progressText.value = "运行中…";
  progressDetail.value = "";
  progressPercent.value = 0;
  rightTab.value = "log";

  appendLog("info", "▶ 开始批跑…\n");

  const requestId = selectedRequestId.value ? Number(selectedRequestId.value) : null;
  const configJson: ClickConfigJson = {
    source: sourceMode.value,
    input_file: sourceMode.value === "file" ? currentFileId.value : "",
    dataset_id: sourceMode.value === "dataset" ? selectedDatasetId.value : "",
    selected_fields: selectedFields.value,
    prompt_template: promptTemplate.value,
    provider: selectedProvider.value,
    request_id: requestId,
    config_label: "",
    model: selectedModel.value,
  };

  let doneCount = 0;
  let failCount = 0;
  let ranOk = false;

  try {
    await runBatchTask(
      {
        source_type: "click",
        task_name: taskName.value.trim(),
        config_json: JSON.stringify(configJson),
        request_id: requestId,
        model: selectedModel.value,
      },
      {
        onEvent: (ev: BatchSSEEvent) => {
          if (ev.type === "task_started") {
            currentJobId.value = ev.job_id || null;
            appendLog("info", `任务已创建 (job_id=${ev.job_id})\n`);
          } else if (ev.type === "row") {
            const row: Record<string, any> = {};
            for (const f of selectedFields.value) {
              row[f] = ev.input?.[f] ?? "";
            }
            row["AI结果"] = ev.output || "";
            row["状态"] = ev.success ? "完成" : "失败";
            results.value.push(row);

            if (ev.success) doneCount++;
            else failCount++;

            const processed = doneCount + failCount;
            const pct = totalRows.value > 0 ? Math.round((processed / totalRows.value) * 100) : 0;
            progressPercent.value = pct;
            progressText.value = `进度：${processed}${totalRows.value ? " / " + totalRows.value : ""}`;
            progressDetail.value = `完成 ${doneCount}　失败 ${failCount}`;

            if (ev.success) {
              const preview = String(ev.output ?? "").replace(/\s+/g, " ").slice(0, 120);
              appendLog("stdout", `[行 ${(ev.idx ?? 0) + 1}] ✓ ${preview}\n`);
            } else {
              appendLog("error", `[行 ${(ev.idx ?? 0) + 1}] ✗ ${ev.error || "(无错误信息)"}\n`);
            }
          } else if (ev.type === "stdout") {
            if (/已加载 (\d+) 行/.test(ev.text || "")) {
              // 可以在这里更新总数
            }
            appendLog("stdout", ev.text || "");
          } else if (ev.type === "stderr") {
            appendLog("stderr", ev.text || "");
          } else if (ev.type === "error") {
            appendLog("error", ev.text || "");
          }
        },
        onError: (error: string) => {
          appendLog("error", `\n❌ 启动失败：${error}\n`);
        },
      }
    );
    ranOk = true;
  } catch (e: any) {
    appendLog("error", `\n❌ 启动失败：${e.message}\n`);
  }

  running.value = false;
  if (ranOk) {
    progressText.value = `批跑完成：共 ${results.value.length} 行`;
    appendLog("info", `\n✅ 批跑完成，共 ${results.value.length} 行\n`);
  }
}

// ==================== 暂停 ====================

async function pauseBatch() {
  if (!currentJobId.value) return;
  try {
    await ElMessageBox.confirm("确定暂停当前运行？已完成的行会保留，续跑时跳过。", "确认暂停", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
    await pauseBatchJob(currentJobId.value);
    appendLog("info", "暂停请求已发送…\n");
  } catch {
    // 用户取消
  }
}

// ==================== 导出 ====================

function exportCSV() {
  if (!results.value.length) return;
  const keys = Object.keys(results.value[0]);
  const csv = [
    keys.join(","),
    ...results.value.map((r) =>
      keys.map((k) => `"${String(r[k] ?? "").replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `批跑结果_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
}

// ==================== 日志 ====================

function appendLog(type: string, text: string) {
  logEntries.value.push({ type, text });
  nextTick(() => {
    if (logContainer.value) {
      logContainer.value.scrollTop = logContainer.value.scrollHeight;
    }
  });
}

// ==================== 配置回填 ====================

async function fillFromConfig(config: ClickConfigJson, name: string) {
  taskName.value = name || "";
  promptTemplate.value = config.prompt_template || "";
  selectedFields.value = config.selected_fields || [];
  sourceMode.value = config.source || "file";

  if (config.source === "dataset" && config.dataset_id) {
    selectedDatasetId.value = config.dataset_id;
    await handleDatasetChange(config.dataset_id);
  } else if (config.input_file) {
    currentFileId.value = config.input_file;
    fileInfo.value = `(沿用历史文件: ${config.input_file.split("/").pop()})`;
  }

  if (config.provider) {
    selectedProvider.value = config.provider;
    await nextTick();
  }
  if (config.request_id) {
    selectedRequestId.value = config.request_id;
    await nextTick();
  }
  if (config.model) {
    selectedModel.value = config.model;
  }
}

// 暴露方法供父组件调用
defineExpose({
  fillFromConfig,
});
</script>

<style lang="scss" scoped>
.click-config {
  display: flex;
  height: 100%;
  min-height: 400px;
}

.click-left {
  width: 50%;
  min-width: 320px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--el-border-color-light);
  padding: 16px;
  gap: 12px;
  overflow-y: auto;
}

.click-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 8px 0 4px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--el-border-color-lighter);

  &:first-child {
    margin-top: 0;
  }
}

.source-toggle {
  margin-bottom: 8px;
}

.source-area {
  margin-bottom: 8px;
}

.file-info,
.dataset-info {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-top: 8px;
}

.preview-area {
  margin-bottom: 8px;
}

.preview-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 6px;
}

.field-hint {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.field-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.field-chip {
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
  }
}

.config-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}

.template-help {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 6px;

  code {
    background: var(--el-fill-color-light);
    padding: 1px 5px;
    border-radius: 3px;
    font-size: 12px;
    margin-right: 4px;
  }
}

.action-buttons {
  margin-top: 16px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.right-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;

  :deep(.el-tabs__content) {
    flex: 1;
    overflow: hidden;
  }

  :deep(.el-tab-pane) {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
}

.progress-card {
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-blank);
  flex-shrink: 0;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-text {
  font-size: 14px;
  font-weight: 500;
}

.progress-detail {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.log-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
  font-family: monospace;
  font-size: 13px;
  line-height: 1.6;
  background: var(--el-fill-color-lighter);
  white-space: pre-wrap;
  word-break: break-word;
}

.log-hint {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.log-entry {
  &.log-stdout {
    color: var(--el-text-color-regular);
  }

  &.log-stderr {
    color: var(--el-color-danger);
  }

  &.log-error {
    color: var(--el-color-error);
  }

  &.log-info {
    color: var(--el-text-color-secondary);
    font-style: italic;
  }
}
</style>
