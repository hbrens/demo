<template>
  <div class="script-config">
    <!-- 左侧配置 -->
    <div class="script-left">
      <!-- 任务名称 -->
      <el-input
        v-model="taskName"
        placeholder="例如 2026-05-18_产品评论分析（留空则自动生成）"
        clearable
        size="small"
      />

      <!-- 数据来源 -->
      <el-radio-group v-model="sourceMode" size="small" class="source-toggle">
        <el-radio-button value="file">上传文件</el-radio-button>
        <el-radio-button value="dataset">已有数据集</el-radio-button>
      </el-radio-group>

      <!-- 文件上传 -->
      <div v-if="sourceMode === 'file'" class="source-area">
        <el-upload
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleFileChange"
          accept=".csv,.xlsx,.xls,.json,.parquet"
          :before-upload="beforeUploadConfirm"
        >
          <template #trigger>
            <el-button size="small" plain>选择文件</el-button>
          </template>
          <template #tip>
            <div class="el-upload__tip">支持 CSV、Excel、JSON、Parquet</div>
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
          size="small"
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

      <!-- API 配置 -->
      <el-row :gutter="8" class="api-config">
        <el-col :span="8">
          <div class="config-label">供应商</div>
          <el-select
            v-model="selectedProvider"
            placeholder="请选择"
            size="small"
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
            size="small"
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
            size="small"
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

      <!-- 代码编辑器 -->
      <div class="editor-container">
        <div ref="editorRef" class="monaco-editor"></div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button
          type="primary"
          size="small"
          :disabled="!canRun"
          :loading="running"
          @click="runScript"
        >
          ▶ 运行
        </el-button>
        <el-button
          v-if="running"
          type="warning"
          size="small"
          @click="stopScript"
        >
          ■ 停止
        </el-button>
        <el-button size="small" @click="lintCode">语法检查</el-button>
        <el-button size="small" @click="clearOutput">清空输出</el-button>
        <span v-if="timerText" class="timer-text">{{ timerText }}</span>
      </div>
    </div>

    <!-- 右侧日志/结果 -->
    <div class="script-right">
      <el-tabs v-model="rightTab" class="right-tabs">
        <!-- 运行日志 -->
        <el-tab-pane label="运行日志" name="log">
          <div ref="logContainer" class="log-content">
            <span v-if="!logEntries.length" class="log-hint">
              运行后输出将显示在这里
            </span>
            <div
              v-for="(entry, idx) in logEntries"
              :key="idx"
              :class="['log-entry', `log-${entry.type}`]"
            >
              <template v-if="entry.type === 'image'">
                <img :src="entry.text" class="log-image" />
              </template>
              <template v-else-if="entry.type === 'video'">
                <video :src="entry.text" controls class="log-video" />
              </template>
              <template v-else>
                {{ entry.text }}
              </template>
            </div>
          </div>
        </el-tab-pane>

        <!-- 结果文件 -->
        <el-tab-pane name="files">
          <template #label>
            结果文件
            <el-badge
              v-if="resultFiles.length > 0"
              :value="resultFiles.length"
              class="file-badge"
            />
          </template>
          <div class="files-content">
            <div v-if="resultFiles.length === 0" class="files-hint">
              暂无结果文件
            </div>
            <div
              v-for="(file, idx) in resultFiles"
              :key="idx"
              class="file-item"
            >
              <span class="file-name">📄 {{ file.name }}</span>
              <span class="file-size">{{ formatFileSize(file.size) }}</span>
              <el-button
                type="primary"
                size="small"
                link
                @click="downloadFile(file)"
              >
                ↓
              </el-button>
            </div>
            <div v-if="resultFiles.length > 0" class="download-all">
              <el-button type="primary" size="small" @click="downloadAll">
                ↓ 打包下载全部
              </el-button>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts" name="ScriptConfig">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { UploadFile } from "element-plus";
import {
  uploadBatchFile,
  getDatasets,
  getDatasetRows,
  getApprovedConfigs,
  runBatchTask,
  lintScript,
  type ApprovedConfig,
  type BatchSSEEvent,
  type ScriptConfigJson,
} from "@/api/thirdPartyApi";

// ==================== 类型定义 ====================

interface ResultFile {
  name: string;
  size: number;
  runId: string;
}

// ==================== 数据状态 ====================

// 任务名称
const taskName = ref("");

// 数据来源
const sourceMode = ref<"file" | "dataset">("file");
const currentFileId = ref("");
const selectedDatasetId = ref("");
const fileInfo = ref("");
const datasetInfo = ref("");

// API 配置
const configs = ref<ApprovedConfig[]>([]);
const selectedProvider = ref("");
const selectedRequestId = ref<string | number>("");
const selectedModel = ref("");
const datasets = ref<Array<{ dataset_id: string; name: string; row_count: number; created_at: string }>>([]);

// 代码编辑器
const editorRef = ref<HTMLElement>();
const editorCode = ref("");
let monacoEditor: any = null;

// 运行状态
const running = ref(false);
const timerText = ref("");
const rightTab = ref("log");
let timerInterval: ReturnType<typeof setInterval> | null = null;
let abortController: AbortController | null = null;

// 日志
const logEntries = ref<Array<{ type: string; text: string }>>([]);
const logContainer = ref<HTMLElement>();

// 结果文件
const resultFiles = ref<ResultFile[]>([]);
const currentRunId = ref("");

// 上传确认
const uploadConfirmed = ref(false);

// ==================== 代码模板 ====================

const CODE_TEMPLATE = `# 可用变量：
#   df        — 已加载的 DataFrame（parquet/json/csv/excel）
#   WORK_DIR  — 本次运行的独立工作目录
#   AI_MODEL  — 当前选中的模型名
#
# 可用函数：
#   chat(prompt, model=None)  → 调 AI，返回文本
#   show_image(path)          → 在日志区显示图片
#   show_chart(fig)           → 在日志区显示 matplotlib 图表
#   show_video(path)          → 在日志区显示视频
#   save_file(path)           → 加入结果文件列表

import os
import pandas as pd

print(f"数据形状: {df.shape}")
print(df.head())

# 示例：批量调 AI
# df["result"] = df["content"].apply(lambda x: chat(x))
# output_path = os.path.join(WORK_DIR, "output.csv")
# df.to_csv(output_path, index=False)
# save_file(output_path)
`;

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

const canRun = computed(() => {
  return (
    !!selectedRequestId.value &&
    !!selectedModel.value &&
    !!editorCode.value.trim() &&
    !running.value
  );
});

// ==================== 初始化 ====================

onMounted(async () => {
  await loadConfigs();
  await loadDatasets();
  await initMonacoEditor();
});

onBeforeUnmount(() => {
  if (timerInterval) clearInterval(timerInterval);
  if (monacoEditor) monacoEditor.dispose();
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

// ==================== Monaco Editor ====================

async function initMonacoEditor() {
  // 动态加载 Monaco Editor
  const monaco = await loadMonaco();
  if (!editorRef.value) return;

  monacoEditor = monaco.editor.create(editorRef.value, {
    value: CODE_TEMPLATE,
    language: "python",
    theme: "vs-dark",
    fontSize: 13,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 4,
    insertSpaces: true,
    wordWrap: "on",
  });

  editorCode.value = CODE_TEMPLATE;

  monacoEditor.onDidChangeModelContent(() => {
    editorCode.value = monacoEditor.getValue();
  });
}

let monacoPromise: Promise<any> | null = null;
function loadMonaco(): Promise<any> {
  if (monacoPromise) return monacoPromise;
  monacoPromise = new Promise((resolve, reject) => {
    if ((window as any).monaco) {
      resolve((window as any).monaco);
      return;
    }

    // 配置 require
    (window as any).require = {
      paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs" },
    };

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/loader.js";
    script.onload = () => {
      (window as any).require(["vs/editor/editor.main"], (monaco: any) => {
        resolve(monaco);
      });
    };
    script.onerror = () => reject(new Error("Monaco Editor 加载失败"));
    document.head.appendChild(script);
  });
  return monacoPromise;
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

  fileInfo.value = `上传中：${file.name}…`;
  try {
    const result = await uploadBatchFile(file.raw);
    currentFileId.value = result.file_id;
    const colPreview = (result.col_names || []).slice(0, 4).join(", ");
    fileInfo.value = `${file.name} · ${result.rows.toLocaleString()} 行 · ${result.columns} 列 (${colPreview}${result.columns > 4 ? "…" : ""})`;
    selectedDatasetId.value = "";
  } catch (e: any) {
    fileInfo.value = "上传失败：" + e.message;
  }
}

// ==================== 数据集处理 ====================

async function handleDatasetChange(datasetId: string) {
  if (!datasetId) {
    selectedDatasetId.value = "";
    datasetInfo.value = "";
    currentFileId.value = "";
    return;
  }

  datasetInfo.value = "加载中…";
  try {
    const rows = await getDatasetRows(datasetId);
    const heads = rows.length > 0 ? Object.keys(rows[0]) : [];
    datasetInfo.value = `已选 ${rows.length} 行 · ${heads.length} 列：${heads.join("、")}`;
    currentFileId.value = "";
  } catch (e: any) {
    datasetInfo.value = `加载失败：${e.message}`;
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

// ==================== 语法检查 ====================

async function lintCode() {
  try {
    const result = await lintScript(editorCode.value);
    if (result.ok) {
      appendLog("info", "\n✅ 语法检查通过\n");
    } else {
      appendLog("error", `\n❌ 语法错误：${result.error}\n`);
    }
  } catch (e: any) {
    ElMessage.error("语法检查失败：" + e.message);
  }
}

// ==================== 运行脚本 ====================

async function runScript() {
  if (!canRun.value) return;

  rightTab.value = "log";
  clearOutput();
  running.value = true;
  let elapsed = 0;
  timerText.value = "0s";
  timerInterval = setInterval(() => {
    elapsed++;
    timerText.value = elapsed + "s";
  }, 1000);

  abortController = new AbortController();

  const requestId = selectedRequestId.value ? Number(selectedRequestId.value) : null;
  const configJson: ScriptConfigJson = {
    provider: selectedProvider.value,
    request_id: requestId,
    model: selectedModel.value,
    source: sourceMode.value,
    input_file: sourceMode.value === "file" ? currentFileId.value : "",
    dataset_id: sourceMode.value === "dataset" ? selectedDatasetId.value : "",
  };

  try {
    await runBatchTask(
      {
        source_type: "script",
        task_name: taskName.value.trim(),
        config_json: JSON.stringify(configJson),
        script_code: editorCode.value,
        request_id: requestId,
        model: selectedModel.value,
      },
      {
        onEvent: handleScriptEvent,
        onError: (error: string) => {
          appendLog("error", `连接中断：${error}\n`);
        },
      }
    );
  } catch (e: any) {
    if (e.name !== "AbortError") {
      appendLog("error", "连接中断：" + e.message + "\n");
    } else {
      appendLog("info", "已手动停止\n");
    }
  } finally {
    if (timerInterval) clearInterval(timerInterval);
    running.value = false;
    timerText.value = "";
    abortController = null;
  }
}

function handleScriptEvent(ev: BatchSSEEvent) {
  switch (ev.type) {
    case "stdout":
      appendLog("stdout", ev.text || "");
      break;
    case "stderr":
      appendLog("stderr", ev.text || "");
      break;
    case "error":
      appendLog("error", ev.text || "");
      break;
    case "info":
      appendLog("info", ev.text || "");
      break;
    case "image":
      if (ev.data) {
        logEntries.value.push({ type: "image", text: ev.data });
        scrollToBottom();
      }
      break;
    case "video":
      if (ev.filename) {
        const url = `/third-party-api/script/result/${ev.run_id}/${ev.filename}`;
        logEntries.value.push({ type: "video", text: url });
        scrollToBottom();
      }
      break;
    case "file":
      if (ev.run_id) currentRunId.value = ev.run_id;
      if (ev.name) {
        resultFiles.value.push({
          name: ev.name,
          size: ev.size || 0,
          runId: ev.run_id || "",
        });
      }
      break;
    case "done":
      if (ev.run_id) currentRunId.value = ev.run_id;
      appendLog("info", `\n✅ 完成（${ev.elapsed}s，${ev.file_count} 个结果文件）\n`);
      break;
    case "row":
      appendLog(
        ev.success ? "stdout" : "error",
        `[行 ${ev.idx}] ${ev.success ? "✓" : "✗"} ${String(ev.output || ev.error || "").slice(0, 80)}\n`
      );
      break;
    case "task_started":
      appendLog("info", `▶ 已创建批次 ${ev.batch_id} (job_id=${ev.job_id})\n`);
      break;
  }
}

// ==================== 停止 ====================

function stopScript() {
  abortController?.abort();
}

// ==================== 清空输出 ====================

function clearOutput() {
  logEntries.value = [];
  resultFiles.value = [];
  currentRunId.value = "";
}

// ==================== 下载 ====================

function downloadFile(file: ResultFile) {
  const token = localStorage.getItem("thirdPartyToken") || "";
  window.location.href = `/third-party-api/script/result/${file.runId}/download?token=${encodeURIComponent(token)}`;
}

function downloadAll() {
  if (!currentRunId.value) return;
  const token = localStorage.getItem("thirdPartyToken") || "";
  window.location.href = `/third-party-api/script/result/${currentRunId.value}/download?token=${encodeURIComponent(token)}`;
}

// ==================== 工具函数 ====================

function appendLog(type: string, text: string) {
  logEntries.value.push({ type, text });
  scrollToBottom();
}

function scrollToBottom() {
  nextTick(() => {
    if (logContainer.value) {
      logContainer.value.scrollTop = logContainer.value.scrollHeight;
    }
  });
}

function formatFileSize(bytes: number): string {
  if (bytes > 1048576) return (bytes / 1048576).toFixed(1) + " MB";
  if (bytes > 1024) return (bytes / 1024).toFixed(1) + " KB";
  return bytes + " B";
}

// ==================== 配置回填 ====================

async function fillFromConfig(config: ScriptConfigJson, name: string, code?: string) {
  taskName.value = name || "";
  if (code && monacoEditor) {
    monacoEditor.setValue(code);
    editorCode.value = code;
  }
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
.script-config {
  display: flex;
  height: 100%;
  min-height: 400px;
}

.script-left {
  width: 50%;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--el-border-color-light);
  padding: 12px;
  gap: 10px;
  overflow: hidden;
}

.script-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.source-toggle {
  margin-bottom: 4px;
}

.source-area {
  margin-bottom: 4px;
}

.file-info,
.dataset-info {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-top: 6px;
}

.api-config {
  flex-shrink: 0;
}

.config-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}

.editor-container {
  flex: 1;
  min-height: 0;
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  overflow: hidden;
}

.monaco-editor {
  width: 100%;
  height: 100%;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  padding-top: 4px;
}

.timer-text {
  font-size: 13px;
  color: var(--el-text-color-secondary);
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

.file-badge {
  margin-left: 4px;
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

.log-image {
  max-width: 100%;
  border-radius: 6px;
  margin: 4px 0;
  cursor: zoom-in;
  display: block;
}

.log-video {
  max-width: 100%;
  border-radius: 6px;
  margin: 4px 0;
  display: block;
}

.files-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.files-hint {
  color: var(--el-text-color-secondary);
  font-size: 13px;
  padding: 16px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  font-size: 13px;
}

.file-name {
  flex: 1;
  font-family: monospace;
  word-break: break-all;
}

.file-size {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  flex-shrink: 0;
}

.download-all {
  padding: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
}
</style>
