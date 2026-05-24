<template>
  <div class="config-bar">
    <el-select
      v-model="selectedProvider"
      placeholder="选择供应商"
      filterable
      allow-create
      clearable
      @change="onProviderChange"
      size="default"
    >
      <el-option
        v-for="p in providerOptions"
        :key="p"
        :label="p"
        :value="p"
      />
    </el-select>
    <el-select
      v-model="selectedConfigName"
      placeholder="选择 API 名称"
      filterable
      allow-create
      clearable
      :disabled="!selectedProvider"
      @change="onConfigChange"
      size="default"
    >
      <el-option
        v-for="c in filteredConfigs"
        :key="c.request_id"
        :label="c.api_name || '（未命名）'"
        :value="c.api_name"
      />
    </el-select>
    <el-select
      v-model="selectedModel"
      placeholder="选择模型"
      filterable
      allow-create
      clearable
      :disabled="!selectedConfigName"
      @change="onModelChange"
      size="default"
    >
      <el-option
        v-for="m in modelOptions"
        :key="m"
        :label="m"
        :value="m"
      />
    </el-select>
  </div>
</template>

<script setup lang="ts" name="ConfigBar">
import { ref, computed, watch, onMounted } from "vue";
import { getApprovedRequests, type ApprovedRequest } from "@/api/thirdPartyApi";

interface Props {
  disabled?: boolean;
}
const props = withDefaults(defineProps<Props>(), { disabled: false });

const emit = defineEmits<{
  change: [config: { requestId: number | null; model: string }];
}>();

const LS_PROV = "chat_last_provider";
const LS_CFG = "chat_last_config";
const LS_MDL = "chat_last_model";

const approvedList = ref<ApprovedRequest[]>([]);
const selectedProvider = ref("");
const selectedConfigName = ref("");
const selectedModel = ref("");
const currentRequestId = ref<number | null>(null);

const COMMON_MODELS = [
  "mimo-v2.5", "mimo-v2.5-pro",
  "claude-opus-4-20250514", "claude-sonnet-4-20250514",
  "claude-3-7-sonnet-20250219", "claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022",
  "gpt-4o", "gpt-4o-mini", "gpt-4-turbo",
  "deepseek-chat", "deepseek-reasoner",
  "gemini-2.5-pro", "gemini-2.5-flash",
];

const providerOptions = computed(() => {
  return [...new Set(approvedList.value.map((c) => c.provider))];
});

const filteredConfigs = computed(() => {
  if (!selectedProvider.value) return [];
  return approvedList.value.filter(
    (c) => c.provider === selectedProvider.value
  );
});

const modelOptions = computed(() => {
  const entry = approvedList.value.find(
    (c) =>
      c.provider === selectedProvider.value &&
      c.api_name === selectedConfigName.value
  );
  const configured = entry?.available_models
    ? entry.available_models
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean)
    : [];
  const all = [...configured];
  COMMON_MODELS.forEach((m) => {
    if (!all.includes(m)) all.push(m);
  });
  return all;
});

function onProviderChange(val: string) {
  localStorage.setItem(LS_PROV, val);
  selectedConfigName.value = "";
  selectedModel.value = "";
  currentRequestId.value = null;
  emitChange();
}

function onConfigChange(val: string) {
  localStorage.setItem(LS_CFG, val);
  const entry = approvedList.value.find(
    (c) => c.provider === selectedProvider.value && c.api_name === val
  );
  if (entry) {
    currentRequestId.value = entry.request_id;
    // 自动选第一个模型
    const models = entry.available_models
      ? entry.available_models
          .split(",")
          .map((m) => m.trim())
          .filter(Boolean)
      : [];
    if (models.length) {
      selectedModel.value = models[0];
      localStorage.setItem(LS_MDL, models[0]);
    }
  } else {
    currentRequestId.value = null;
    selectedModel.value = "";
  }
  emitChange();
}

function onModelChange(val: string) {
  localStorage.setItem(LS_MDL, val);
  emitChange();
}

function emitChange() {
  emit("change", {
    requestId: currentRequestId.value,
    model: selectedModel.value,
  });
}

/** 加载已通过的 API 配置 */
async function loadApprovedConfigs() {
  try {
    const { data } = await getApprovedRequests();
    approvedList.value = data;
    if (!data.length) return;
    // 恢复上次选择
    const lastProv = localStorage.getItem(LS_PROV);
    if (lastProv && providerOptions.value.includes(lastProv)) {
      selectedProvider.value = lastProv;
      const lastCfg = localStorage.getItem(LS_CFG);
      const match = filteredConfigs.value.find(
        (c) => c.api_name === lastCfg
      );
      if (match) {
        selectedConfigName.value = match.api_name;
        currentRequestId.value = match.request_id;
        const lastMdl = localStorage.getItem(LS_MDL);
        if (lastMdl && modelOptions.value.includes(lastMdl)) {
          selectedModel.value = lastMdl;
        } else if (modelOptions.value.length) {
          selectedModel.value = modelOptions.value[0];
        }
      }
    }
    emitChange();
  } catch {
    // ignore
  }
}

/** 加载指定会话的配置（用于恢复历史会话） */
function loadSessionConfig(configId: number | null, model: string) {
  if (!configId) return;
  const entry = approvedList.value.find(
    (c) => c.request_id === configId
  );
  if (entry) {
    selectedProvider.value = entry.provider;
    selectedConfigName.value = entry.api_name || "";
    currentRequestId.value = entry.request_id;
  }
  if (model) {
    selectedModel.value = model;
  }
  emitChange();
}

/** 获取当前选中的 request_id */
function getRequestId() {
  return currentRequestId.value;
}

onMounted(() => {
  loadApprovedConfigs();
});

defineExpose({ loadSessionConfig, getRequestId, loadApprovedConfigs });
</script>

<style lang="scss" scoped>
.config-bar {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: #fff;
}
</style>
