<template>
  <div class="online-chat">
    <!-- 左侧会话历史 -->
    <SessionSidebar
      ref="sidebarRef"
      :active-session-id="currentSessionId"
      @new-chat="onNewChat"
      @select="onSelectSession"
      @deleted="onSessionDeleted"
    />
    <!-- 拖拽手柄 -->
    <div
      class="resize-handle"
      :class="{ active: resizing }"
      @mousedown="onResizeStart"
    />
    <!-- 右侧聊天主区 -->
    <div class="chat-main">
      <!-- 配置栏 -->
      <ConfigBar
        ref="configBarRef"
        :disabled="configLocked"
        @change="onConfigChange"
      />
      <!-- 消息流 -->
      <ChatMessages
        ref="messagesRef"
        :messages="displayMessages"
        :streaming="isStreaming"
        :streaming-content="streamingContent"
        @retry="retryLastMessage"
        @drop-files="onDropFiles"
      />
      <!-- 输入区 -->
      <ChatInput
        ref="inputRef"
        :disabled="!canSend"
        @send="onSend"
      />
    </div>
  </div>
</template>

<script setup lang="ts" name="OnlineChat">
import { ref, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import SessionSidebar from "./SessionSidebar.vue";
import ConfigBar from "./ConfigBar.vue";
import ChatMessages, { type DisplayMessage } from "./ChatMessages.vue";
import ChatInput, { type Attachment } from "./ChatInput.vue";
import {
  createSession,
  getSessionMessages,
  saveMessage as saveMessageApi,
  streamChat,
  type ChatSession,
} from "@/api/thirdPartyApi";

const sidebarRef = ref<InstanceType<typeof SessionSidebar>>();
const configBarRef = ref<InstanceType<typeof ConfigBar>>();
const messagesRef = ref<InstanceType<typeof ChatMessages>>();
const inputRef = ref<InstanceType<typeof ChatInput>>();

const currentSessionId = ref<number | null>(null);
const chatHistory = ref<Array<{ role: string; content: any }>>([]);
const displayMessages = ref<DisplayMessage[]>([]);
const isStreaming = ref(false);
const streamingContent = ref("");
const configLocked = ref(false);
const resizing = ref(false);

// 当前配置
const currentConfig = ref<{ requestId: number | null; model: string }>({
  requestId: null,
  model: "",
});

const canSend = computed(() => {
  return !isStreaming.value && currentConfig.value.requestId !== null && !!currentConfig.value.model;
});

function onConfigChange(config: { requestId: number | null; model: string }) {
  currentConfig.value = config;
}

// ── 会话管理 ──────────────────────────────────────────────
function onNewChat() {
  currentSessionId.value = null;
  chatHistory.value = [];
  displayMessages.value = [];
  configLocked.value = false;
  configBarRef.value?.loadApprovedConfigs();
  inputRef.value?.focus();
}

async function onSelectSession(session: ChatSession) {
  try {
    currentSessionId.value = session.id;
    chatHistory.value = [];
    displayMessages.value = [];

    const data = await getSessionMessages(session.id);
    const messages = data.messages || data;

    for (const m of messages) {
      if (m.role === "system") continue;

      let parsed: any[] | null = null;
      try {
        const p = typeof m.content === "string" ? JSON.parse(m.content) : m.content;
        if (Array.isArray(p)) parsed = p;
      } catch {
        // not JSON
      }

      displayMessages.value.push({
        role: m.role as "user" | "assistant",
        content: m.content,
        model: m.role === "assistant" ? m.model : undefined,
        parsed: parsed || undefined,
      });

      let content: any = m.content;
      try {
        const p = JSON.parse(content);
        if (Array.isArray(p)) content = p;
      } catch {}

      chatHistory.value.push({ role: m.role, content });
    }

    // 恢复配置栏
    const sess = data.session || session;
    configBarRef.value?.loadSessionConfig(sess.config_id, sess.model);
    configLocked.value = true;
  } catch (err: any) {
    ElMessage.error("加载会话失败");
  }
}

function onSessionDeleted(sessionId: number) {
  if (currentSessionId.value === sessionId) {
    onNewChat();
  }
}

// ── 发送消息 ──────────────────────────────────────────────
async function onSend(text: string, attachments: Attachment[]) {
  if (!currentConfig.value.requestId) {
    ElMessage.warning("请先选择 API 配置");
    return;
  }
  if (!currentConfig.value.model) {
    ElMessage.warning("请先选择模型");
    return;
  }

  // 构建消息内容
  let content: any;
  if (attachments.length === 0) {
    content = text;
  } else {
    content = [];
    if (text) content.push({ type: "text", text });
    for (const att of attachments) {
      if (att.mimeType.startsWith("image/")) {
        content.push({
          type: "image",
          source: { type: "base64", media_type: att.mimeType, data: att.base64 },
        });
      } else if (att.mimeType === "application/pdf") {
        content.push({
          type: "document",
          source: { type: "base64", media_type: "application/pdf", data: att.base64 },
        });
      } else {
        content.push({
          type: "document",
          source: { type: "text", media_type: "text/plain", data: atob(att.base64) },
        });
      }
    }
  }

  // 显示用户消息
  const userMsg: DisplayMessage = {
    role: "user",
    content: typeof content === "string" ? content : JSON.stringify(content),
    parsed: Array.isArray(content) ? content : undefined,
  };
  displayMessages.value.push(userMsg);
  chatHistory.value.push({ role: "user", content });

  // 确保会话已创建
  await ensureSession(text || "图片对话");
  saveMessage("user", typeof content === "string" ? content : JSON.stringify(content));

  // 流式请求
  isStreaming.value = true;
  streamingContent.value = "";

  await streamChat(
    {
      messages: chatHistory.value,
      model: currentConfig.value.model,
      system: "",
      request_id: currentConfig.value.requestId,
      user_token: localStorage.getItem("thirdPartyToken") || null,
    },
    {
      onToken(chunk) {
        streamingContent.value += chunk;
      },
      onDone() {
        const finalContent = streamingContent.value;
        displayMessages.value.push({
          role: "assistant",
          content: finalContent,
          model: currentConfig.value.model,
        });
        chatHistory.value.push({ role: "assistant", content: finalContent });
        saveMessage("assistant", finalContent, currentConfig.value.model);
        isStreaming.value = false;
        streamingContent.value = "";
        inputRef.value?.focus();
        sidebarRef.value?.loadSessions();
      },
      onError(err) {
        displayMessages.value.push({
          role: "error",
          content: err,
          retryable: true,
        });
        saveMessage("assistant", `[错误] ${err}`);
        isStreaming.value = false;
        streamingContent.value = "";
      },
    }
  );
}

async function retryLastMessage() {
  // 移除最后一条错误消息
  const lastIdx = displayMessages.value.length - 1;
  if (lastIdx >= 0 && displayMessages.value[lastIdx].role === "error") {
    displayMessages.value.splice(lastIdx, 1);
  }
  // 重新发送最后一条用户消息
  if (chatHistory.value.length && chatHistory.value[chatHistory.value.length - 1].role === "user") {
    const lastUserMsg = chatHistory.value[chatHistory.value.length - 1];
    isStreaming.value = true;
    streamingContent.value = "";

    await streamChat(
      {
        messages: chatHistory.value,
        model: currentConfig.value.model,
        system: "",
        request_id: currentConfig.value.requestId,
        user_token: localStorage.getItem("thirdPartyToken") || null,
      },
      {
        onToken(chunk) {
          streamingContent.value += chunk;
        },
        onDone() {
          const finalContent = streamingContent.value;
          displayMessages.value.push({
            role: "assistant",
            content: finalContent,
            model: currentConfig.value.model,
          });
          chatHistory.value.push({ role: "assistant", content: finalContent });
          saveMessage("assistant", finalContent, currentConfig.value.model);
          isStreaming.value = false;
          streamingContent.value = "";
          inputRef.value?.focus();
          sidebarRef.value?.loadSessions();
        },
        onError(err) {
          displayMessages.value.push({
            role: "error",
            content: err,
            retryable: true,
          });
          isStreaming.value = false;
          streamingContent.value = "";
        },
      }
    );
  }
}

// ── 会话持久化 ──────────────────────────────────────────────
async function ensureSession(firstMessageText: string) {
  if (currentSessionId.value) return;
  try {
    const { data } = await createSession({
      config_id: currentConfig.value.requestId,
      model: currentConfig.value.model,
      title: firstMessageText.slice(0, 50),
    });
    currentSessionId.value = data.session_id;
    configLocked.value = true;
    sidebarRef.value?.loadSessions();
  } catch {
    // ignore
  }
}

function saveMessage(role: string, content: string, model = "") {
  if (!currentSessionId.value) return;
  saveMessageApi({
    session_id: currentSessionId.value,
    role,
    content,
    model,
  }).catch(() => {});
}

// ── 拖拽上传 ──────────────────────────────────────────────
function onDropFiles(files: FileList) {
  inputRef.value?.addFiles(files);
}

// ── 侧边栏拖拽调整宽度 ────────────────────────────────────
let resizeStartX = 0;
let resizeStartW = 0;

function onResizeStart(e: MouseEvent) {
  e.preventDefault();
  resizing.value = true;
  resizeStartX = e.clientX;
  const sidebar = document.querySelector(".session-sidebar") as HTMLElement;
  resizeStartW = sidebar?.offsetWidth || 240;
  document.addEventListener("mousemove", onResizeMove);
  document.addEventListener("mouseup", onResizeEnd);
}

function onResizeMove(e: MouseEvent) {
  const sidebar = document.querySelector(".session-sidebar") as HTMLElement;
  if (sidebar) {
    const w = Math.max(180, Math.min(500, resizeStartW + e.clientX - resizeStartX));
    sidebar.style.width = w + "px";
  }
}

function onResizeEnd() {
  resizing.value = false;
  document.removeEventListener("mousemove", onResizeMove);
  document.removeEventListener("mouseup", onResizeEnd);
}
</script>

<style lang="scss" scoped>
.online-chat {
  display: flex;
  height: calc(100vh - 200px);
  min-height: 400px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  overflow: hidden;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.resize-handle {
  width: 4px;
  cursor: col-resize;
  background: transparent;
  flex-shrink: 0;
  position: relative;
  z-index: 10;
  transition: background 0.15s;

  &:hover,
  &.active {
    background: var(--el-color-primary);
  }
}
</style>
