import thirdPartyApi from "./config";

// ==================== 类型定义 ====================

/** 批量任务状态 */
export type BatchJobStatus =
  | "queued"
  | "running"
  | "paused"
  | "completed"
  | "failed"
  | "partial_failed";

/** 批量任务来源类型 */
export type BatchSourceType = "click" | "script";

/** 批量任务信息 */
export interface BatchJob {
  id: number;
  batch_id: string;
  user_id: number;
  task_name: string;
  source_type: BatchSourceType;
  model: string;
  config_json: string;
  script_code: string | null;
  status: BatchJobStatus;
  row_count: number;
  done_count: number;
  fail_count: number;
  created_at: string;
  updated_at: string;
  started_at: string | null;
  finished_at: string | null;
}

/** 批量任务行结果 */
export interface BatchJobRow {
  id: number;
  job_id: number;
  row_index: number;
  input_json: string;
  output_text: string;
  output_type: string | null;
  output_path: string | null;
  success: boolean;
  error_msg: string | null;
  started_at: string | null;
  finished_at: string | null;
}

/** 任务详情分页响应 */
export interface BatchJobRowsResponse {
  rows: BatchJobRow[];
  total: number;
}

/** 已通过的API配置（用于下拉选择） */
export interface ApprovedConfig {
  request_id: number;
  provider: string;
  api_name: string;
  sub_account_name: string;
  project_name: string;
  available_models: string;
  base_url: string;
}

/** 前端配置 JSON 结构 */
export interface ClickConfigJson {
  source: "file" | "dataset";
  input_file: string;
  dataset_id: string;
  selected_fields: string[];
  prompt_template: string;
  provider: string;
  request_id: number | null;
  config_label: string;
  model: string;
}

/** 脚本配置 JSON 结构 */
export interface ScriptConfigJson {
  provider: string;
  request_id: number | null;
  model: string;
  source: "file" | "dataset";
  input_file: string;
  dataset_id: string;
}

/** 运行批量任务参数 */
export interface RunBatchParams {
  source_type: BatchSourceType;
  task_name: string;
  config_json: string;
  script_code?: string;
  request_id: number | null;
  model: string;
}

/** SSE 事件类型 */
export interface BatchSSEEvent {
  type:
    | "task_started"
    | "row"
    | "stdout"
    | "stderr"
    | "error"
    | "done"
    | "info"
    | "image"
    | "video"
    | "file";
  job_id?: number;
  batch_id?: string;
  run_id?: string;
  idx?: number;
  input?: Record<string, any>;
  output?: string;
  success?: boolean;
  error?: string;
  text?: string;
  data?: string;
  name?: string;
  size?: number;
  filename?: string;
  elapsed?: number;
  file_count?: number;
}

/** SSE 流式回调 */
export interface BatchStreamCallbacks {
  onEvent: (event: BatchSSEEvent, ctx: Record<string, any>) => void;
  onError?: (error: string) => void;
}

// ==================== 文件上传 API ====================

/** 上传文件（CSV/Excel/JSON/Parquet） */
export const uploadBatchFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const data = (await thirdPartyApi.post("/script/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })) as unknown as {
    file_id: string;
    rows: number;
    columns: number;
    col_names: string[];
  };
  return data;
};

// ==================== 数据集 API ====================

/** 获取数据集列表 */
export const getDatasets = async () => {
  const data = (await thirdPartyApi.get("/datasets")) as unknown as Array<{
    dataset_id: string;
    name: string;
    row_count: number;
    created_at: string;
  }>;
  return data;
};

/** 获取数据集行数据 */
export const getDatasetRows = async (datasetId: string) => {
  const data = (await thirdPartyApi.get(
    `/datasets/${encodeURIComponent(datasetId)}/rows`
  )) as unknown as Array<Record<string, any>>;
  return data;
};

// ==================== API配置 API ====================

/** 获取已通过的API配置列表 */
export const getApprovedConfigs = async () => {
  const data = (await thirdPartyApi.get(
    "/api-requests/approved"
  )) as unknown as ApprovedConfig[];
  return data;
};

// ==================== 批量任务运行 API ====================

/**
 * 运行批量任务（SSE 流式）
 * 使用 fetch + ReadableStream，不走 axios
 */
export const runBatchTask = async (
  params: RunBatchParams,
  callbacks: BatchStreamCallbacks,
  ctx: Record<string, any> = {}
): Promise<void> => {
  const { onEvent, onError } = callbacks;

  let res: Response;
  try {
    res = await fetch("/third-party-api/batch2/run", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Token": localStorage.getItem("thirdPartyToken") || "",
      },
      body: JSON.stringify(params),
    });
  } catch {
    onError?.("无法连接到服务，请检查网络连接");
    return;
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    onError?.(`服务器错误 ${res.status}: ${text}`);
    return;
  }

  const reader = res.body?.getReader();
  if (!reader) {
    onError?.("无法读取响应流");
    return;
  }

  const decoder = new TextDecoder();
  let buf = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        try {
          const event = JSON.parse(line.slice(6)) as BatchSSEEvent;
          onEvent(event, ctx);
        } catch {
          // ignore malformed lines
        }
      }
    }
  } catch (err: any) {
    onError?.(err.message || "流式读取异常");
  }
};

/** 静默消费流（用于续跑/重跑，不阻塞 UI） */
export const consumeRunStream = async (res: Response): Promise<void> => {
  try {
    const reader = res.body?.getReader();
    if (!reader) return;
    while (true) {
      const { done } = await reader.read();
      if (done) break;
    }
  } catch {
    // ignore
  }
};

// ==================== 批量任务管理 API ====================

/** 获取批量任务列表 */
export const getBatchJobs = async () => {
  const data = (await thirdPartyApi.get(
    "/batch2/jobs"
  )) as unknown as BatchJob[];
  return data;
};

/** 获取批量任务行结果 */
export const getBatchJobRows = async (
  jobId: number,
  offset = 0,
  limit = 10000
) => {
  const data = (await thirdPartyApi.get(
    `/batch2/jobs/${jobId}/rows?offset=${offset}&limit=${limit}`
  )) as unknown as BatchJobRowsResponse;
  return data;
};

/** 暂停批量任务 */
export const pauseBatchJob = async (jobId: number) => {
  return thirdPartyApi.post(`/batch2/jobs/${jobId}/pause`);
};

/** 续跑批量任务 */
export const resumeBatchJob = async (jobId: number) => {
  const res = await fetch(`/third-party-api/batch2/jobs/${jobId}/resume`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Token": localStorage.getItem("thirdPartyToken") || "",
    },
    body: JSON.stringify({}),
  });
  return res;
};

/** 重跑批量任务 */
export const rerunBatchJob = async (jobId: number) => {
  const res = await fetch(`/third-party-api/batch2/jobs/${jobId}/rerun`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Token": localStorage.getItem("thirdPartyToken") || "",
    },
    body: JSON.stringify({}),
  });
  return res;
};

/** 导出批量任务结果 */
export const exportBatchJob = (jobId: number) => {
  const token = localStorage.getItem("thirdPartyToken") || "";
  window.location.href = `/third-party-api/batch2/jobs/${jobId}/export?token=${encodeURIComponent(token)}`;
};

/** 语法检查 */
export const lintScript = async (code: string) => {
  const data = (await thirdPartyApi.post("/batch2/lint", {
    code,
  })) as unknown as { ok: boolean; error?: string };
  return data;
};
