import thirdPartyApi from "./config";

// ==================== 类型定义 ====================

/** 会话信息 */
export interface ChatSession {
  id: number;
  user_id: number;
  config_id: number | null;
  model: string;
  title: string;
  pinned: boolean;
  msg_count: number;
  created_at: string;
  updated_at: string;
}

/** 会话消息 */
export interface ChatMessage {
  id: number;
  session_id: number;
  role: "user" | "assistant" | "system";
  content: string;
  model: string;
  created_at: string;
}

/** 会话详情（含消息列表） */
export interface ChatSessionDetail {
  session: ChatSession;
  messages: ChatMessage[];
}

/** 创建会话参数 */
export interface CreateSessionParams {
  config_id?: number | null;
  model?: string;
  title?: string;
}

/** 保存消息参数 */
export interface SaveMessageParams {
  session_id: number;
  role: string;
  content: string;
  model?: string;
}

/** 聊天请求参数 */
export interface ChatRequestParams {
  messages: Array<{ role: string; content: any }>;
  model: string;
  system?: string;
  config_id?: number | null;
  request_id?: number | null;
  user_token?: string | null;
}

/** SSE 流式回调 */
export interface ChatStreamCallbacks {
  onToken: (text: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}

// ==================== 会话管理 API ====================

/** 获取当前用户的会话列表 */
export const getMySessions = async () => {
  const data = (await thirdPartyApi.get("/history/my")) as ChatSession[];
  return { data };
};

/** 获取会话详情（含消息） */
export const getSessionMessages = async (sessionId: number) => {
  const data = (await thirdPartyApi.get(
    `/history/${sessionId}`
  )) as ChatSessionDetail;
  return data;
};

/** 创建新会话 */
export const createSession = async (params: CreateSessionParams) => {
  const data = (await thirdPartyApi.post(
    "/sessions",
    params
  )) as { session_id: number };
  return { data };
};

/** 更新会话标题 */
export const updateSessionTitle = (sessionId: number, title: string) => {
  return thirdPartyApi.put(`/sessions/${sessionId}/title`, { title });
};

/** 切换会话置顶状态 */
export const toggleSessionPin = (sessionId: number) => {
  return thirdPartyApi.put(`/sessions/${sessionId}/pin`);
};

/** 删除会话 */
export const deleteSession = (sessionId: number) => {
  return thirdPartyApi.delete(`/sessions/${sessionId}`);
};

/** 保存消息 */
export const saveMessage = (params: SaveMessageParams) => {
  return thirdPartyApi.post("/sessions/messages", params);
};

// ==================== 聊天流式 API ====================

/**
 * SSE 流式聊天（使用 fetch + ReadableStream，不走 axios）
 * 因为 axios 不原生支持流式读取
 */
export const streamChat = async (
  params: ChatRequestParams,
  callbacks: ChatStreamCallbacks
): Promise<void> => {
  const { onToken, onDone, onError } = callbacks;

  let res: Response;
  try {
    res = await fetch("/third-party-api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Token": localStorage.getItem("thirdPartyToken") || "",
      },
      body: JSON.stringify(params),
    });
  } catch {
    onError("无法连接到代理服务，请检查网络连接");
    return;
  }

  if (!res.ok) {
    onError(`服务器错误 ${res.status}`);
    return;
  }

  const reader = res.body?.getReader();
  if (!reader) {
    onError("无法读取响应流");
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
        const raw = line.slice(6).trim();
        if (raw === "[DONE]") {
          onDone();
          return;
        }
        try {
          const msg = JSON.parse(raw);
          if (msg.error) {
            onError(msg.error);
            return;
          }
          if (msg.text) {
            onToken(msg.text);
          }
        } catch {
          // ignore malformed lines
        }
      }
    }
    onDone();
  } catch (err: any) {
    onError(err.message || "流式读取异常");
  }
};
