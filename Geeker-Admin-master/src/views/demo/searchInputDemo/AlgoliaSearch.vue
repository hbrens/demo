<template>
  <div class="algolia-search">
    <el-input
      v-model="displayText"
      placeholder="搜索用户 (点击打开)"
      readonly
      clearable
      size="large"
      class="algolia-trigger"
      @click="openDialog"
    >
      <template #prefix>
        <el-icon class="algolia-trigger__icon"><Search /></el-icon>
      </template>
      <template #suffix>
        <span class="algolia-trigger__kbd">Ctrl K</span>
      </template>
    </el-input>

    <el-dialog
      v-model="visible"
      width="80%"
      :close-on-click-modal="true"
      :show-close="false"
      title="全局搜索"
      @closed="onClosed"
    >
      <div class="search-header">
        <el-input
          v-model.trim="keyword"
          placeholder="输入关键字过滤，例如：用户名/邮箱/地址"
          clearable
          autofocus
          :prefix-icon="Search"
          size="large"
        />
      </div>
      <div class="search-result">
        <ProTable
          ref="proTable"
          :columns="columns"
          :request-api="getTableList"
          :init-param="initParam"
          :data-callback="dataCallback"
          :tool-button="false"
          :border="true"
          :loading="loading"
          v-if="hasKeyword"
        />
        <div v-else class="empty-hint">请输入关键字开始搜索</div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="AlgoliaSearch">
import { ref, reactive, watch } from "vue";
import { Search } from "@element-plus/icons-vue";
import ProTable from "@/components/ProTable/index.vue";
import type { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { getUserList } from "@/api/modules/user";

const visible = ref(false);
const keyword = ref("");
const displayText = ref("");
const proTable = ref<ProTableInstance>();
const hasKeyword = ref(false);
const loading = ref(false);

// 传入 ProTable 的初始化参数（变化会自动触发表格刷新）
const initParam = reactive<{ keyword: string }>({ keyword: "" });

// 防抖刷新
let timer: number | undefined;
watch(
  () => keyword.value,
  (val) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      hasKeyword.value = !!val?.trim();
      initParam.keyword = val;
      if (hasKeyword.value) {
        proTable.value?.getTableList();
      }
    }, 250);
  }
);

const openDialog = () => {
  visible.value = true;
  // 打开时不自动请求，等待用户输入关键字
};

const onClosed = () => {
  displayText.value = keyword.value;
};

// 处理返回数据为 { list, total }
const dataCallback = (data: any) => {
  return {
    list: data.list,
    total: data.total
  };
};

// 表格列
interface RowItem {
  id: number | string;
  username: string;
  email?: string;
  address?: string;
  createTime?: string;
}

const columns = reactive<ColumnProps<RowItem>[]>([
  { type: "index", label: "#", width: 60 },
  { prop: "username", label: "用户姓名", minWidth: 140 },
  { prop: "email", label: "邮箱", minWidth: 180 },
  { prop: "address", label: "地址", minWidth: 200 },
  { prop: "createTime", label: "创建时间", minWidth: 160 }
]);

// 请求函数：把关键字映射到后端已存在的查询参数（示例使用 getUserList）
const getTableList = (params: Record<string, any>) => {
  const newParams = { ...params };
  // 将关键字映射多个字段以兼容后端查询（如用户名、邮箱等）
  if (newParams.keyword) {
    newParams.username = newParams.keyword;
    newParams.email = newParams.keyword;
    newParams.address = newParams.keyword;
  }
  delete newParams.keyword;
  loading.value = true;
  return getUserList(newParams as any).finally(() => {
    loading.value = false;
  });
};
</script>

<style scoped>
.algolia-search {
  width: 100%;
}
.algolia-trigger {
  --el-input-border-color: transparent;
  --el-input-hover-border-color: var(--el-color-primary-light-7);
  --el-input-focus-border-color: var(--el-color-primary);
  border-radius: 999px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}
.algolia-trigger__icon {
  color: var(--el-text-color-placeholder);
}
.algolia-trigger__kbd {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  padding: 0 6px;
  line-height: 18px;
}
.search-header {
  margin-bottom: 12px;
}
.search-result {
  /* 让表格在弹窗中尽量展示更多空间 */
  max-height: 60vh;
}
.empty-hint {
  color: var(--el-text-color-secondary);
  text-align: center;
  padding: 24px 0;
}
</style>


