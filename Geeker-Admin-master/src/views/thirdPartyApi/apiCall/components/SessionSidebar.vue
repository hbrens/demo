<template>
  <div class="session-sidebar">
    <div class="sidebar-head">
      <el-button type="primary" class="new-chat-btn" @click="$emit('newChat')">
        <el-icon><Plus /></el-icon> 新对话
      </el-button>
    </div>
    <div class="session-list">
      <div
        v-for="session in sessions"
        :key="session.id"
        class="session-item"
        :class="{ active: session.id === activeSessionId }"
        @click="$emit('select', session)"
      >
        <el-icon v-if="session.pinned" class="pin-icon"><Top /></el-icon>
        <div class="session-body">
          <div class="session-title">{{ session.title || "（无标题）" }}</div>
          <div class="session-meta">
            {{ session.created_at.slice(0, 10) }} · {{ session.msg_count || 0 }}条
          </div>
        </div>
        <el-dropdown
          trigger="click"
          @command="(cmd: string) => handleCommand(cmd, session)"
          @click.stop
        >
          <el-icon class="more-btn"><MoreFilled /></el-icon>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="pin">
                <el-icon><Top /></el-icon>
                {{ session.pinned ? "取消置顶" : "置顶" }}
              </el-dropdown-item>
              <el-dropdown-item command="rename">
                <el-icon><Edit /></el-icon>
                重命名
              </el-dropdown-item>
              <el-dropdown-item command="delete" divided>
                <span style="color: #f56c6c">
                  <el-icon><Delete /></el-icon>
                  删除
                </span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <el-empty v-if="!sessions.length" description="暂无会话" :image-size="60" />
    </div>
  </div>
</template>

<script setup lang="ts" name="SessionSidebar">
import { ref, onMounted } from "vue";
import { ElMessageBox, ElMessage } from "element-plus";
import { Plus, Top, MoreFilled, Edit, Delete } from "@element-plus/icons-vue";
import {
  getMySessions,
  toggleSessionPin,
  deleteSession,
  updateSessionTitle,
  type ChatSession,
} from "@/api/thirdPartyApi";

defineProps<{
  activeSessionId: number | null;
}>();

const emit = defineEmits<{
  newChat: [];
  select: [session: ChatSession];
  deleted: [sessionId: number];
}>();

const sessions = ref<ChatSession[]>([]);

async function loadSessions() {
  try {
    const { data } = await getMySessions();
    sessions.value = data;
  } catch {
    // ignore
  }
}

async function handleCommand(cmd: string, session: ChatSession) {
  switch (cmd) {
    case "pin":
      await toggleSessionPin(session.id);
      loadSessions();
      break;
    case "rename":
      try {
        const { value } = await ElMessageBox.prompt("输入新标题", "重命名", {
          inputValue: session.title || "",
          confirmButtonText: "确定",
          cancelButtonText: "取消",
        });
        const newTitle = value.trim() || "（无标题）";
        await updateSessionTitle(session.id, newTitle);
        session.title = newTitle;
        loadSessions();
      } catch {
        // cancelled
      }
      break;
    case "delete":
      try {
        await ElMessageBox.confirm(
          `删除「${session.title || "无标题"}」？此操作不可撤销。`,
          "删除确认",
          { type: "warning" }
        );
        await deleteSession(session.id);
        ElMessage.success("已删除");
        emit("deleted", session.id);
        loadSessions();
      } catch {
        // cancelled
      }
      break;
  }
}

onMounted(() => {
  loadSessions();
});

defineExpose({ loadSessions });
</script>

<style lang="scss" scoped>
.session-sidebar {
  width: 240px;
  min-width: 180px;
  max-width: 360px;
  border-right: 1px solid var(--el-border-color-lighter);
  display: flex;
  flex-direction: column;
  background: #fafafa;
  flex-shrink: 0;
}

.sidebar-head {
  padding: 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.new-chat-btn {
  width: 100%;
}

.session-list {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
}

.session-item {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  padding: 10px 12px;
  cursor: pointer;
  font-size: 13px;
  color: var(--el-text-color-regular);
  transition: background 0.12s;
  position: relative;

  &:hover {
    background: var(--el-fill-color-light);
    .more-btn {
      display: flex;
    }
  }

  &.active {
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
    font-weight: 500;
  }
}

.pin-icon {
  flex-shrink: 0;
  margin-top: 2px;
  color: var(--el-color-primary);
  font-size: 12px;
}

.session-body {
  flex: 1;
  min-width: 0;
}

.session-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-meta {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  margin-top: 2px;
}

.more-btn {
  display: none;
  flex-shrink: 0;
  align-self: flex-start;
  cursor: pointer;
  padding: 2px;
  color: var(--el-text-color-placeholder);

  &:hover {
    color: var(--el-text-color-regular);
  }
}
</style>
