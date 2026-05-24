<template>
  <div ref="messagesRef" class="chat-messages" @dragover.prevent="onDragOver" @dragleave="onDragLeave" @drop.prevent="onDrop">
    <template v-if="messages.length">
      <div v-for="(msg, idx) in messages" :key="idx">
        <!-- 用户消息 -->
        <div v-if="msg.role === 'user'" class="bubble bubble-user">
          <template v-if="Array.isArray(msg.parsed)">
            <div v-if="getImages(msg.parsed).length" class="image-row">
              <el-image
                v-for="(img, i) in getImages(msg.parsed)"
                :key="i"
                :src="img.src"
                :preview-src-list="[img.src]"
                fit="cover"
                class="msg-image"
              />
            </div>
            <div v-if="getText(msg.parsed)">{{ getText(msg.parsed) }}</div>
          </template>
          <template v-else>{{ msg.content }}</template>
        </div>
        <!-- 助手消息 -->
        <div v-else-if="msg.role === 'assistant'" class="bubble bubble-assistant">
          <div v-html="renderMarkdown(msg.content)"></div>
        </div>
        <!-- 错误消息 -->
        <div v-else-if="msg.role === 'error'" class="bubble bubble-error">
          <span>{{ msg.content }}</span>
          <el-button
            v-if="msg.retryable"
            size="small"
            type="danger"
            plain
            class="retry-btn"
            @click="$emit('retry')"
          >
            重新生成
          </el-button>
        </div>
        <!-- 模型标签 -->
        <div v-if="msg.role === 'assistant' && msg.model" class="model-tag">
          ─ {{ msg.model }}
        </div>
      </div>
      <!-- 流式光标 -->
      <div v-if="streaming" class="bubble bubble-assistant">
        <div v-html="renderMarkdown(streamingContent)"></div>
        <span class="cursor">▋</span>
      </div>
    </template>
    <div v-else class="empty-hint">
      <el-empty description="发送消息开始对话" :image-size="80" />
    </div>
  </div>
</template>

<script setup lang="ts" name="ChatMessages">
import { ref, nextTick, watch } from "vue";
import { marked } from "marked";
import DOMPurify from "dompurify";

export interface DisplayMessage {
  role: "user" | "assistant" | "error";
  content: string;
  model?: string;
  retryable?: boolean;
  parsed?: any[];
}

interface Props {
  messages: DisplayMessage[];
  streaming?: boolean;
  streamingContent?: string;
}

const props = withDefaults(defineProps<Props>(), {
  streaming: false,
  streamingContent: "",
});

const emit = defineEmits<{
  retry: [];
  dropFiles: [files: FileList];
}>();

const messagesRef = ref<HTMLElement>();

// Markdown 渲染
marked.setOptions({ breaks: true, gfm: true } as any);

function renderMarkdown(raw: string): string {
  if (!raw) return "";
  try {
    const html = marked.parse(raw) as string;
    return DOMPurify.sanitize(html);
  } catch {
    return raw;
  }
}

// 解析 JSON 数组内容（图片+文字）
function getImages(parsed: any[]): Array<{ src: string }> {
  return parsed
    .filter((b) => b.type === "image" && b.source?.data)
    .map((b) => ({ src: `data:${b.source.media_type};base64,${b.source.data}` }));
}

function getText(parsed: any[]): string {
  return parsed
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}

// 自动滚动到底部
function scrollToBottom() {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight;
    }
  });
}

watch(
  () => props.messages.length,
  () => scrollToBottom()
);
watch(
  () => props.streamingContent,
  () => scrollToBottom()
);

// 拖拽上传
let dragCounter = 0;
function onDragOver() {
  messagesRef.value?.classList.add("drag-over");
}
function onDragLeave() {
  messagesRef.value?.classList.remove("drag-over");
}
function onDrop(e: DragEvent) {
  messagesRef.value?.classList.remove("drag-over");
  if (e.dataTransfer?.files.length) {
    emit("dropFiles", e.dataTransfer.files);
  }
}

defineExpose({ scrollToBottom });
</script>

<style lang="scss" scoped>
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #fff;
  align-items: center;

  & > * {
    width: 100%;
    max-width: 900px;
  }

  &.drag-over {
    outline: 2px dashed var(--el-color-primary);
    outline-offset: -4px;
  }
}

.bubble {
  max-width: 100%;
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 14px;
  line-height: 1.65;
  white-space: pre-wrap;
  word-break: break-word;
}

.bubble-user {
  background: #f2f2f2;
  color: var(--el-text-color-primary);
  align-self: flex-end;
  border-bottom-right-radius: 4px;
  margin-left: auto;
}

.bubble-assistant {
  background: #fff;
  border: 1px solid var(--el-border-color-lighter);
  align-self: flex-start;
  border-bottom-left-radius: 4px;
  margin-right: auto;
}

.bubble-error {
  background: #fef0f0;
  border: 1px solid #fde2e2;
  color: #f56c6c;
  align-self: flex-start;
  font-size: 13px;
}

.retry-btn {
  margin-top: 6px;
}

.model-tag {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  align-self: flex-start;
  padding-left: 2px;
  margin-top: -4px;
}

.cursor {
  animation: blink 0.7s step-end infinite;
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}

.image-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 6px;
}

.msg-image {
  width: 64px;
  height: 64px;
  border-radius: 6px;
}

.empty-hint {
  margin: auto;
}

:deep(.bubble-assistant) {
  pre {
    background: #1e1e1e;
    color: #e6e6e6;
    padding: 10px 12px;
    border-radius: 6px;
    overflow-x: auto;
    font-size: 13px;
    line-height: 1.5;
    margin: 6px 0;
  }

  code {
    background: rgba(0, 0, 0, 0.06);
    padding: 1px 5px;
    border-radius: 3px;
    font-family: Consolas, Monaco, monospace;
    font-size: 0.9em;
  }

  pre code {
    background: none;
    padding: 0;
    color: inherit;
  }

  img {
    max-height: 200px;
    max-width: 100%;
    border-radius: 6px;
    cursor: zoom-in;
    display: block;
    margin: 4px 0;
  }

  table {
    border-collapse: collapse;
    margin: 6px 0;
    font-size: 13px;
  }

  th, td {
    border: 1px solid var(--el-border-color-lighter);
    padding: 4px 8px;
    text-align: left;
  }

  th {
    background: var(--el-fill-color-light);
    font-weight: 600;
  }

  blockquote {
    margin: 6px 0;
    padding: 4px 10px;
    border-left: 3px solid var(--el-border-color);
    color: var(--el-text-color-placeholder);
  }

  a {
    color: var(--el-color-primary);
    text-decoration: underline;
  }

  p {
    margin: 0 0 8px;
    &:last-child {
      margin-bottom: 0;
    }
  }

  ul, ol {
    margin: 4px 0 8px;
    padding-left: 22px;
  }

  h1, h2, h3, h4 {
    margin: 10px 0 6px;
    font-weight: 600;
  }
}
</style>
