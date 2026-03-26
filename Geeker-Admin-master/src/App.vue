<template>
  <el-config-provider :locale="locale" :size="assemblySize" :button="buttonConfig">
    <router-view></router-view>
  </el-config-provider>
  <!-- WebMCP AI 对话面板 -->
  <TinyRemoter v-if="mcpSessionId" agent-root="http://localhost:3000/api/v1/webmcp/" :session-id="mcpSessionId" show />
</template>

<script setup lang="ts">
import { onMounted, reactive, computed, provide, ref } from "vue";
import { useI18n } from "vue-i18n";
import { getBrowserLang } from "@/utils";
import { useTheme } from "@/hooks/useTheme";
import { ElConfigProvider } from "element-plus";
import { LanguageType } from "./stores/interface";
import { useGlobalStore } from "@/stores/modules/global";
import en from "element-plus/es/locale/lang/en";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import { WebMcpClient, createMessageChannelPairTransport } from "@opentiny/next-sdk";
import { TinyRemoter } from "@opentiny/next-remoter";
import "@opentiny/next-remoter/dist/style.css";

const globalStore = useGlobalStore();

// init theme
const { initTheme } = useTheme();
initTheme();

// init language
const i18n = useI18n();

// WebMCP 初始化
const mcpClient = new WebMcpClient({ name: "geeker-admin-client", version: "1.0.0" });
const mcpSessionId = ref("");
provide("mcpClient", mcpClient);

onMounted(async () => {
  const language = globalStore.language ?? getBrowserLang();
  i18n.locale.value = language;
  globalStore.setGlobalState("language", language as LanguageType);

  // 创建 MessageChannel 通信通道
  const [serverTransport, clientTransport] = createMessageChannelPairTransport();
  provide("serverTransport", serverTransport);

  // 连接 MCP Client
  await mcpClient.connect(clientTransport);

  // 连接 WebAgent 服务（获取 sessionId）
  try {
    const { sessionId } = await mcpClient.connect({
      agent: true,
      url: "http://localhost:3000/api/v1/webmcp/mcp",
    });
    mcpSessionId.value = sessionId;
    console.log("[WebMCP] 已连接 WebAgent，sessionId:", sessionId);
  } catch (err) {
    console.warn("[WebMCP] 连接 WebAgent 失败，对话面板不可用:", err);
  }
});

// element language
const locale = computed(() => {
  if (globalStore.language == "zh") return zhCn;
  if (globalStore.language == "en") return en;
  return getBrowserLang() == "zh" ? zhCn : en;
});

// element assemblySize
const assemblySize = computed(() => globalStore.assemblySize);

// element button config
const buttonConfig = reactive({ autoInsertSpace: false });
</script>
