<template>
  <div class="chat-input-area">
    <!-- 附件预览行 -->
    <div v-if="attachments.length" class="attachments-row">
      <div v-for="(att, idx) in attachments" :key="idx" class="attachment-item">
        <template v-if="att.mimeType.startsWith('image/')">
          <div class="thumb-wrap">
            <el-image
              :src="`data:${att.mimeType};base64,${att.base64}`"
              fit="cover"
              class="thumb-img"
            />
            <el-icon class="thumb-del" @click="removeAttachment(idx)"><CloseBold /></el-icon>
          </div>
        </template>
        <template v-else>
          <div class="file-tag">
            <el-icon><Document /></el-icon>
            <span>{{ att.name }}</span>
            <el-icon class="file-del" @click="removeAttachment(idx)"><CloseBold /></el-icon>
          </div>
        </template>
      </div>
    </div>
    <!-- 输入行 -->
    <div class="input-row">
      <el-input
        ref="inputRef"
        v-model="inputText"
        type="textarea"
        :rows="1"
        :autosize="{ minRows: 1, maxRows: 6 }"
        placeholder="输入消息… (Enter 发送，Shift+Enter 换行)"
        :disabled="disabled"
        resize="none"
        @keydown="onKeydown"
      />
      <input
        ref="fileInputRef"
        type="file"
        multiple
        accept="image/jpeg,image/png,image/gif,image/webp,application/pdf,text/plain,text/csv,text/markdown,.md"
        style="display: none"
        @change="onFileChange"
      />
      <el-button :disabled="disabled" @click="onAttachClick" title="附加文件">
        <el-icon><Paperclip /></el-icon>
      </el-button>
      <el-button type="primary" :disabled="disabled || (!inputText.trim() && !attachments.length)" @click="send">
        发送
      </el-button>
    </div>
    <!-- 上传确认弹窗 -->
    <el-dialog v-model="showUploadConfirm" title="上传前请确认" width="420px" :close-on-click-modal="false">
      <p style="font-size: 14px; color: var(--el-text-color-regular)">
        请确认上传数据不属于公司保密资产。
      </p>
      <template #footer>
        <el-button type="primary" @click="confirmUpload">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="ChatInput">
import { ref, nextTick } from "vue";
import { ElMessage } from "element-plus";
import { CloseBold, Document, Paperclip } from "@element-plus/icons-vue";

export interface Attachment {
  name: string;
  mimeType: string;
  base64: string;
}

interface Props {
  disabled?: boolean;
}
withDefaults(defineProps<Props>(), { disabled: false });

const emit = defineEmits<{
  send: [text: string, attachments: Attachment[]];
}>();

const inputRef = ref();
const fileInputRef = ref<HTMLInputElement>();
const inputText = ref("");
const attachments = ref<Attachment[]>([]);
const showUploadConfirm = ref(false);
let uploadConfirmed = false;

const ACCEPTED_TYPES: Record<string, string> = {
  "image/jpeg": "image",
  "image/png": "image",
  "image/gif": "image",
  "image/webp": "image",
  "application/pdf": "document",
  "text/plain": "document",
  "text/csv": "document",
  "text/markdown": "document",
};
const MAX_SIZE = 20 * 1024 * 1024;

function onKeydown(e: Event | KeyboardEvent) {
  if ((e as KeyboardEvent).key === "Enter" && !(e as KeyboardEvent).shiftKey) {
    e.preventDefault();
    send();
  }
}

function send() {
  const text = inputText.value.trim();
  if (!text && !attachments.value.length) return;
  emit("send", text, [...attachments.value]);
  inputText.value = "";
  attachments.value = [];
  nextTick(() => inputRef.value?.focus());
}

function onAttachClick() {
  if (uploadConfirmed) {
    fileInputRef.value?.click();
    return;
  }
  showUploadConfirm.value = true;
}

function confirmUpload() {
  uploadConfirmed = true;
  showUploadConfirm.value = false;
  fileInputRef.value?.click();
}

function onFileChange() {
  const files = fileInputRef.value?.files;
  if (files) processFiles(files);
  if (fileInputRef.value) fileInputRef.value.value = "";
}

async function processFiles(files: FileList) {
  for (const file of Array.from(files)) {
    if (file.type.startsWith("video/")) {
      ElMessage.warning("不支持视频文件");
      continue;
    }
    if (!ACCEPTED_TYPES[file.type]) {
      ElMessage.warning(`不支持的文件类型：${file.name}`);
      continue;
    }
    if (file.size > MAX_SIZE) {
      ElMessage.warning(`文件超过 20MB：${file.name}`);
      continue;
    }
    try {
      const base64 = await readFileAsBase64(file);
      attachments.value.push({ name: file.name, mimeType: file.type, base64 });
    } catch (err: any) {
      ElMessage.error(err.message || "文件读取失败");
    }
  }
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res((r.result as string).split(",")[1]);
    r.onerror = () => rej(new Error(`读取失败：${file.name}`));
    r.readAsDataURL(file);
  });
}

function removeAttachment(idx: number) {
  attachments.value.splice(idx, 1);
}

function focus() {
  nextTick(() => inputRef.value?.focus());
}

/** 外部拖拽文件调用 */
function addFiles(files: FileList) {
  processFiles(files);
}

defineExpose({ focus, addFiles });
</script>

<style lang="scss" scoped>
.chat-input-area {
  padding: 12px 16px;
  border-top: 1px solid var(--el-border-color-lighter);
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.attachments-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
  width: 100%;
  max-width: 900px;
}

.attachment-item {
  flex-shrink: 0;
}

.thumb-wrap {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--el-border-color-lighter);
}

.thumb-img {
  width: 100%;
  height: 100%;
}

.thumb-del {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #fff;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 12px;

  .file-del {
    cursor: pointer;
    color: var(--el-text-color-placeholder);
    &:hover {
      color: #f56c6c;
    }
  }
}

.input-row {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  width: 100%;
  max-width: 900px;
}

:deep(.el-textarea__inner) {
  resize: none;
}
</style>
