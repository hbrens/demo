<template>
  <div class="usage-stats">
    <!-- 标签页切换 -->
    <el-tabs v-model="activeTab" @tab-change="onTabChange">
      <el-tab-pane label="个人看板" name="personal" />
      <el-tab-pane v-if="isAdmin" label="平台看板" name="platform" />
    </el-tabs>

    <!-- ═══════════════ 个人看板 ═══════════════ -->
    <div v-show="activeTab === 'personal'">
      <!-- 今日概览 -->
      <div class="section">
        <h4 class="section-title">今日概览</h4>
        <el-row :gutter="16">
          <el-col :xs="12" :sm="6" v-for="card in meTodayCards" :key="card.label">
            <el-card shadow="never" class="stat-card">
              <div class="stat-value">{{ card.value }}</div>
              <div class="stat-label">{{ card.label }}</div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 按模型统计 -->
      <div class="section">
        <h4 class="section-title">按模型统计</h4>
        <el-table :data="meModelList" border stripe show-summary :summary-method="meModelSummary">
          <el-table-column prop="model" label="模型" min-width="160" show-overflow-tooltip />
          <el-table-column prop="calls" label="请求量" width="100" align="right">
            <template #default="{ row }">{{ fmt(row.calls) }}</template>
          </el-table-column>
          <el-table-column prop="in_tokens" label="输入 Token" width="120" align="right">
            <template #default="{ row }">{{ fmt(row.in_tokens) }}</template>
          </el-table-column>
          <el-table-column prop="out_tokens" label="输出 Token" width="120" align="right">
            <template #default="{ row }">{{ fmt(row.out_tokens) }}</template>
          </el-table-column>
          <el-table-column prop="tokens" label="总 Token" width="120" align="right">
            <template #default="{ row }">{{ fmt(row.tokens) }}</template>
          </el-table-column>
          <el-table-column prop="cost" label="费用(元)" width="110" align="right">
            <template #default="{ row }">¥{{ (row.cost || 0).toFixed(4) }}</template>
          </el-table-column>
          <el-table-column label="占比" width="180">
            <template #default="{ row }">
              <div class="pct-bar">
                <div class="pct-bar-fill" :style="{ width: (row.percent || 0) + '%' }" />
              </div>
              <span class="pct-text">{{ (row.percent || 0).toFixed(1) }}%</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- API Key 余额 -->
      <div class="section">
        <h4 class="section-title">API Key 余额</h4>
        <el-table :data="meKeysList" border stripe>
          <el-table-column prop="api_name" label="API 名称" min-width="140" show-overflow-tooltip />
          <el-table-column prop="provider" label="供应商" width="120" />
          <el-table-column prop="sub_account_name" label="子账户" width="120" show-overflow-tooltip />
          <el-table-column prop="project_name" label="项目" width="120" show-overflow-tooltip />
          <el-table-column prop="total" label="总额度" width="120" align="right">
            <template #default="{ row }">{{ fmtNum(row.total) }}</template>
          </el-table-column>
          <el-table-column prop="used" label="已使用" width="120" align="right">
            <template #default="{ row }">{{ fmtNum(row.used) }}</template>
          </el-table-column>
          <el-table-column prop="balance" label="余额" width="120" align="right">
            <template #default="{ row }">{{ fmtNum(row.balance) }}</template>
          </el-table-column>
          <el-table-column label="状态" width="90" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.exhausted" type="danger" size="small">已用尽</el-tag>
              <el-tag v-else-if="row.balance != null" type="success" size="small">正常</el-tag>
              <el-tag v-else type="info" size="small">未知</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- ═══════════════ 平台看板 ═══════════════ -->
    <div v-show="activeTab === 'platform'">
      <!-- 时间范围选择 -->
      <div class="time-bar">
        <el-radio-group v-model="currentDays" @change="loadPlatform">
          <el-radio-button :value="1">今日</el-radio-button>
          <el-radio-button :value="7">近 7 天</el-radio-button>
          <el-radio-button :value="30">近 30 天</el-radio-button>
          <el-radio-button :value="90">近 90 天</el-radio-button>
          <el-radio-button :value="0">总量</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 核心指标 -->
      <div class="section">
        <h4 class="section-title">核心指标（{{ periodLabel }}）</h4>
        <el-row :gutter="16">
          <el-col :xs="12" :sm="6" v-for="card in overviewCards" :key="card.label">
            <el-card shadow="never" class="stat-card">
              <div class="stat-value">{{ card.value }}</div>
              <div class="stat-label">{{ card.label }}</div>
              <div v-if="card.sub" class="stat-sub" :title="card.subTip">{{ card.sub }}</div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 趋势图 -->
      <div class="section">
        <h4 class="section-title">
          趋势
          <el-button text type="primary" size="small" @click="openModelTrendExpand">展开 Top 10</el-button>
        </h4>
        <el-row :gutter="16">
          <el-col :span="24" :lg="12">
            <el-card shadow="never" class="chart-card">
              <div class="chart-title">请求量趋势</div>
              <svg ref="chartCallsRef" viewBox="0 0 560 160" class="chart-svg" />
            </el-card>
          </el-col>
          <el-col :span="24" :lg="12">
            <el-card shadow="never" class="chart-card">
              <div class="chart-title">费用趋势</div>
              <svg ref="chartCostRef" viewBox="0 0 560 160" class="chart-svg" />
            </el-card>
          </el-col>
        </el-row>
        <el-card shadow="never" class="chart-card" style="margin-top: 16px">
          <div class="chart-title">模型使用趋势 (Top 5)</div>
          <svg ref="chartModelRef" viewBox="0 0 560 160" class="chart-svg" />
          <div ref="chartModelLegendRef" class="chart-legend" />
        </el-card>
      </div>

      <!-- 排行 -->
      <div class="section">
        <h4 class="section-title">排行</h4>
        <el-row :gutter="16">
          <el-col :span="24" :lg="12">
            <el-card shadow="never">
              <template #header>
                <div class="card-header">
                  <span>项目调用排行</span>
                  <el-button text type="primary" size="small" @click="openRankExpand('project')">查看全部</el-button>
                </div>
              </template>
              <el-table :data="rankProjects" size="small" stripe>
                <el-table-column prop="project" label="项目" show-overflow-tooltip />
                <el-table-column prop="calls" label="请求量" width="100" align="right">
                  <template #default="{ row }">{{ fmt(row.calls) }}</template>
                </el-table-column>
                <el-table-column prop="tokens" label="Token" width="100" align="right">
                  <template #default="{ row }">{{ fmt(row.tokens) }}</template>
                </el-table-column>
                <el-table-column prop="cost" label="成本(元)" width="110" align="right">
                  <template #default="{ row }">¥{{ (row.cost || 0).toFixed(4) }}</template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>
          <el-col :span="24" :lg="12">
            <el-card shadow="never">
              <template #header>
                <div class="card-header">
                  <span>用户调用排行</span>
                  <el-button text type="primary" size="small" @click="openRankExpand('user')">查看全部</el-button>
                </div>
              </template>
              <el-table :data="rankUsers" size="small" stripe>
                <el-table-column prop="username" label="用户" show-overflow-tooltip />
                <el-table-column prop="calls" label="请求量" width="100" align="right">
                  <template #default="{ row }">{{ fmt(row.calls) }}</template>
                </el-table-column>
                <el-table-column prop="tokens" label="Token" width="100" align="right">
                  <template #default="{ row }">{{ fmt(row.tokens) }}</template>
                </el-table-column>
                <el-table-column prop="cost" label="成本(元)" width="110" align="right">
                  <template #default="{ row }">¥{{ (row.cost || 0).toFixed(4) }}</template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 模型治理 -->
      <div class="section">
        <h4 class="section-title">
          模型治理
          <el-button text type="primary" size="small" @click="openModelExpand">查看全部</el-button>
        </h4>
        <el-table :data="modelGovList" border stripe size="small">
          <el-table-column prop="model" label="模型" min-width="160" show-overflow-tooltip />
          <el-table-column prop="calls" label="请求量" width="100" align="right">
            <template #default="{ row }">{{ fmt(row.calls) }}</template>
          </el-table-column>
          <el-table-column prop="tokens" label="Token" width="100" align="right">
            <template #default="{ row }">{{ fmt(row.tokens) }}</template>
          </el-table-column>
          <el-table-column prop="cost" label="成本(元)" width="110" align="right">
            <template #default="{ row }">¥{{ (row.cost || 0).toFixed(4) }}</template>
          </el-table-column>
          <el-table-column prop="success_rate" label="成功率" width="90" align="right">
            <template #default="{ row }">{{ (row.success_rate || 0).toFixed(1) }}%</template>
          </el-table-column>
          <el-table-column prop="avg_ms" label="平均延迟" width="100" align="right">
            <template #default="{ row }">{{ row.avg_ms || 0 }} ms</template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 异常监控 -->
      <div class="section">
        <h4 class="section-title">异常监控</h4>
        <el-row :gutter="16" style="margin-bottom: 16px">
          <el-col :xs="12" :sm="6" v-for="card in anomalyCards" :key="card.label">
            <el-card shadow="never" class="stat-card">
              <div class="stat-value" :class="card.class">{{ card.value }}</div>
              <div class="stat-label">{{ card.label }}</div>
            </el-card>
          </el-col>
        </el-row>
        <el-table :data="recentFails" border stripe size="small">
          <el-table-column prop="time" label="时间" width="170" />
          <el-table-column prop="user" label="用户" width="120" show-overflow-tooltip />
          <el-table-column prop="model" label="模型" width="160" show-overflow-tooltip />
          <el-table-column prop="error" label="错误信息" min-width="200" show-overflow-tooltip />
        </el-table>
      </div>
    </div>

    <!-- ═══════════════ 弹窗：排行/模型展开 ═══════════════ -->
    <el-dialog v-model="rankExpandVisible" :title="rankExpandTitle" width="760px" destroy-on-close>
      <div class="expand-hint">统计区间：{{ periodLabel }}</div>
      <el-table :data="rankExpandData" border stripe max-height="480">
        <el-table-column type="index" label="排名" width="70" align="center" />
        <el-table-column :prop="rankExpandKind === 'project' ? 'project' : 'username'" :label="rankExpandKind === 'project' ? '项目' : '用户'" min-width="160" show-overflow-tooltip />
        <el-table-column prop="calls" label="请求量" width="120" align="right">
          <template #default="{ row }">{{ fmt(row.calls) }}</template>
        </el-table-column>
        <el-table-column prop="tokens" label="Token" width="120" align="right">
          <template #default="{ row }">{{ fmt(row.tokens) }}</template>
        </el-table-column>
        <el-table-column prop="cost" label="成本(元)" width="120" align="right">
          <template #default="{ row }">¥{{ (row.cost || 0).toFixed(4) }}</template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <el-dialog v-model="modelExpandVisible" title="模型治理 — 全部" width="820px" destroy-on-close>
      <div class="expand-hint">统计区间：{{ periodLabel }}</div>
      <el-table :data="modelExpandData" border stripe max-height="480">
        <el-table-column type="index" label="排名" width="70" align="center" />
        <el-table-column prop="model" label="模型" min-width="160" show-overflow-tooltip />
        <el-table-column prop="calls" label="请求量" width="100" align="right">
          <template #default="{ row }">{{ fmt(row.calls) }}</template>
        </el-table-column>
        <el-table-column prop="tokens" label="Token" width="100" align="right">
          <template #default="{ row }">{{ fmt(row.tokens) }}</template>
        </el-table-column>
        <el-table-column prop="cost" label="成本(元)" width="110" align="right">
          <template #default="{ row }">¥{{ (row.cost || 0).toFixed(4) }}</template>
        </el-table-column>
        <el-table-column prop="success_rate" label="成功率" width="90" align="right">
          <template #default="{ row }">{{ (row.success_rate || 0).toFixed(1) }}%</template>
        </el-table-column>
        <el-table-column prop="avg_ms" label="平均延迟" width="100" align="right">
          <template #default="{ row }">{{ row.avg_ms || 0 }} ms</template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <el-dialog v-model="modelTrendExpandVisible" title="模型使用趋势 — Top 10" width="920px" destroy-on-close>
      <div class="expand-hint">统计区间：{{ periodLabel }} · Top 10</div>
      <svg ref="chartModelExpandRef" viewBox="0 0 880 320" class="chart-svg chart-svg-lg" />
      <div ref="chartModelExpandLegendRef" class="chart-legend" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="usageStats">
import { ref, computed, nextTick, onMounted } from "vue";
import type { TableColumnCtx } from "element-plus";
import {
  getMeToday,
  getMeByModel,
  getMeKeysBalance,
  getPlatformOverview,
  getPlatformTrends,
  getPlatformRanking,
  getPlatformModels,
  getPlatformAnomalies
} from "@/api/thirdPartyApi/stats";
import type {
  TodayStats,
  ModelStat,
  KeyBalance,
  PlatformOverview,
  DailyPoint,
  ModelDailyPoint,
  TrendsData,
  RankItem,
  ModelGovItem,
  AnomalyData,
  RecentFail
} from "@/api/thirdPartyApi/stats";

// ── 通用工具 ────────────────────────────────────────────────
const fmt = (v: number | undefined | null) => (v || 0).toLocaleString();
const fmtNum = (v: number | undefined | null) =>
  v == null ? "—" : typeof v === "number" ? v.toLocaleString(undefined, { maximumFractionDigits: 4 }) : String(v);

const MODEL_COLORS = [
  "#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6",
  "#14b8a6", "#ec4899", "#06b6d4", "#84cc16", "#f97316"
];

// ── 权限 & Tab ──────────────────────────────────────────────
const isAdmin = ref(true); // TODO: 从用户信息获取
const activeTab = ref<string>("personal");
let platformLoaded = false;

const onTabChange = (tab: string | number) => {
  if (tab === "platform" && !platformLoaded) {
    platformLoaded = true;
    loadPlatform();
  }
};

// ═══════════════════════════════════════════════════════════
// 个人看板
// ═══════════════════════════════════════════════════════════

const meToday = ref<TodayStats>({ total_calls: 0, total_tokens: 0, total_cost: 0, success_rate: 0 });
const meModelList = ref<ModelStat[]>([]);
const meKeysList = ref<KeyBalance[]>([]);

const meTodayCards = computed(() => [
  { label: "今日请求", value: fmt(meToday.value.total_calls) },
  { label: "今日 Token", value: fmt(meToday.value.total_tokens) },
  { label: "今日费用", value: "¥" + (meToday.value.total_cost || 0).toFixed(4) },
  { label: "成功率", value: (meToday.value.success_rate || 0).toFixed(1) + "%" }
]);

const meModelSummary = (param: { columns: TableColumnCtx<ModelStat>[]; data: ModelStat[] }) => {
  const { columns, data } = param;
  const sums: string[] = [];
  columns.forEach((col, idx) => {
    if (idx === 0) { sums[idx] = `合计 (${data.length})`; return; }
    const key = col.property as keyof ModelStat;
    if (["calls", "in_tokens", "out_tokens", "tokens"].includes(key)) {
      sums[idx] = fmt(data.reduce((s, r) => s + ((r[key] as number) || 0), 0));
    } else if (key === "cost") {
      sums[idx] = "¥" + data.reduce((s, r) => s + (r.cost || 0), 0).toFixed(4);
    } else if (key === "percent") {
      sums[idx] = "100%";
    } else {
      sums[idx] = "";
    }
  });
  return sums;
};

async function loadMeToday() {
  try {
    const d = await getMeToday();
    meToday.value = d as unknown as TodayStats;
  } catch { /* handled by interceptor */ }
}

async function loadMeByModel() {
  try {
    const d = await getMeByModel();
    meModelList.value = (d as unknown as ModelStat[]) || [];
  } catch { meModelList.value = []; }
}

async function loadMeKeysBalance() {
  try {
    const d = await getMeKeysBalance();
    meKeysList.value = (d as unknown as KeyBalance[]) || [];
  } catch { meKeysList.value = []; }
}

// ═══════════════════════════════════════════════════════════
// 平台看板
// ═══════════════════════════════════════════════════════════

const currentDays = ref(7);
const periodLabel = computed(() => {
  const d = currentDays.value;
  if (d === 0) return "总量";
  if (d === 1) return "今日";
  return `近 ${d} 天`;
});

// 核心指标
const overview = ref<PlatformOverview>({
  total_calls: 0, total_tokens: 0, total_cost: 0,
  active_projects: [], active_projects_count: 0,
  active_users: 0, success_rate: 0, avg_duration_ms: 0
});

const overviewCards = computed(() => {
  const d = overview.value;
  const projects = d.active_projects || [];
  const shown = projects.slice(0, 3).join("、");
  const more = projects.length > 3 ? ` 等${projects.length}个` : "";
  return [
    { label: "请求量", value: fmt(d.total_calls) },
    { label: "Token", value: fmt(d.total_tokens) },
    { label: "费用", value: "¥" + (d.total_cost || 0).toFixed(2) },
    {
      label: "活跃项目",
      value: String(d.active_projects_count ?? projects.length),
      sub: projects.length ? shown + more : "—",
      subTip: projects.join("\n")
    },
    { label: "活跃用户", value: String(d.active_users || 0) },
    { label: "成功率", value: (d.success_rate || 0).toFixed(1) + "%" },
    { label: "平均延迟", value: (d.avg_duration_ms || 0) + " ms" }
  ];
});

// 异常监控
const anomalyData = ref<AnomalyData>({ fail_rate: 0, fail_count: 0, slow_count: 0, growth_pct: 0, recent_fails: [] });
const recentFails = computed(() => anomalyData.value.recent_fails || []);

const anomalyCards = computed(() => {
  const d = anomalyData.value;
  return [
    { label: "今日失败率", value: (d.fail_rate || 0).toFixed(1) + "%", class: d.fail_rate > 5 ? "text-danger" : "" },
    { label: "失败次数", value: String(d.fail_count || 0), class: d.fail_count > 0 ? "text-danger" : "" },
    { label: "超时次数 (>10s)", value: String(d.slow_count || 0) },
    { label: "较昨日增长", value: (d.growth_pct || 0).toFixed(1) + "%", class: d.growth_pct > 0 ? "text-danger" : "text-success" }
  ];
});

// 排行
const rankProjects = ref<RankItem[]>([]);
const rankUsers = ref<RankItem[]>([]);

// 模型治理
const modelGovList = ref<ModelGovItem[]>([]);

// 图表 refs
const chartCallsRef = ref<SVGSVGElement>();
const chartCostRef = ref<SVGSVGElement>();
const chartModelRef = ref<SVGSVGElement>();
const chartModelLegendRef = ref<HTMLDivElement>();
const chartModelExpandRef = ref<SVGSVGElement>();
const chartModelExpandLegendRef = ref<HTMLDivElement>();

// 弹窗状态
const rankExpandVisible = ref(false);
const rankExpandTitle = ref("");
const rankExpandKind = ref<"project" | "user">("project");
const rankExpandData = ref<RankItem[]>([]);

const modelExpandVisible = ref(false);
const modelExpandData = ref<ModelGovItem[]>([]);

const modelTrendExpandVisible = ref(false);

// ── 数据加载 ────────────────────────────────────────────────

async function loadPlatform() {
  await Promise.all([loadOverview(), loadTrends(), loadRanking(), loadModels(), loadAnomalies()]);
}

async function loadOverview() {
  try {
    const d = await getPlatformOverview(currentDays.value);
    overview.value = d as unknown as PlatformOverview;
  } catch { /* handled */ }
}

async function loadAnomalies() {
  try {
    const d = await getPlatformAnomalies();
    anomalyData.value = d as unknown as AnomalyData;
  } catch { /* handled */ }
}

async function loadRanking() {
  try {
    const d = await getPlatformRanking(currentDays.value);
    const data = d as unknown as { projects?: RankItem[]; users?: RankItem[] };
    rankProjects.value = data.projects || [];
    rankUsers.value = data.users || [];
  } catch {
    rankProjects.value = [];
    rankUsers.value = [];
  }
}

async function loadModels() {
  try {
    const d = await getPlatformModels(currentDays.value);
    modelGovList.value = ((d as unknown as { models?: ModelGovItem[] }).models) || [];
  } catch { modelGovList.value = []; }
}

async function loadTrends() {
  try {
    const d = await getPlatformTrends(currentDays.value);
    const data = d as unknown as TrendsData;
    const days = fillDaysGrid(data.daily || [], currentDays.value);
    await nextTick();
    drawLineChart(chartCallsRef.value!, days, days.map(p => p.calls), v => v.toLocaleString());
    drawLineChart(chartCostRef.value!, days, days.map(p => p.cost), v => "¥" + v.toFixed(2));
    drawModelChart(chartModelRef.value!, chartModelLegendRef.value!, data.model_daily || [], data.top_models || [], currentDays.value);
  } catch {
    [chartCallsRef.value, chartCostRef.value, chartModelRef.value].forEach(svg => {
      if (svg) svg.innerHTML = '<text x="50%" y="50%" text-anchor="middle" fill="#dc2626" font-size="12">加载失败</text>';
    });
  }
}

// ── 展开弹窗 ────────────────────────────────────────────────

async function openRankExpand(kind: "project" | "user") {
  rankExpandKind.value = kind;
  rankExpandTitle.value = kind === "project" ? "项目调用排行 — 全部" : "用户调用排行 — 全部";
  rankExpandData.value = [];
  rankExpandVisible.value = true;
  try {
    const d = await getPlatformRanking(currentDays.value, 1000);
    const data = d as unknown as { projects?: RankItem[]; users?: RankItem[] };
    rankExpandData.value = kind === "project" ? (data.projects || []) : (data.users || []);
  } catch { /* handled */ }
}

async function openModelExpand() {
  modelExpandData.value = [];
  modelExpandVisible.value = true;
  try {
    const d = await getPlatformModels(currentDays.value);
    modelExpandData.value = ((d as unknown as { models?: ModelGovItem[] }).models) || [];
  } catch { /* handled */ }
}

async function openModelTrendExpand() {
  modelTrendExpandVisible.value = true;
  await nextTick();
  try {
    const d = await getPlatformTrends(currentDays.value, 10);
    const data = d as unknown as TrendsData;
    drawModelChart(
      chartModelExpandRef.value!, chartModelExpandLegendRef.value!,
      data.model_daily || [], data.top_models || [], currentDays.value,
      { W: 880, H: 320 }
    );
  } catch {
    if (chartModelExpandRef.value)
      chartModelExpandRef.value.innerHTML = '<text x="50%" y="50%" text-anchor="middle" fill="#dc2626" font-size="12">加载失败</text>';
  }
}

// ── SVG 图表绘制 ─────────────────────────────────────────────

function fillDaysGrid(rows: DailyPoint[], n: number): DailyPoint[] {
  const map = new Map<string, DailyPoint>();
  rows.forEach(r => map.set(r.day, r));
  const out: DailyPoint[] = [];
  if (n === 0) {
    if (!rows.length) {
      const today = new Date().toISOString().slice(0, 10);
      return [{ day: today, calls: 0, cost: 0 }];
    }
    const dates = rows.map(r => r.day).sort();
    const start = new Date(dates[0]);
    const end = new Date();
    for (const dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
      const key = dt.toISOString().slice(0, 10);
      const r = map.get(key);
      out.push({ day: key, calls: r?.calls || 0, cost: r?.cost || 0 });
    }
    return out;
  }
  for (let i = n - 1; i >= 0; i--) {
    const dt = new Date();
    dt.setDate(dt.getDate() - i);
    const key = dt.toISOString().slice(0, 10);
    const r = map.get(key);
    out.push({ day: key, calls: r?.calls || 0, cost: r?.cost || 0 });
  }
  return out;
}

function drawLineChart(svg: SVGSVGElement, points: DailyPoint[], values: number[], fmt: (v: number) => string) {
  if (!svg || !points.length) {
    if (svg) svg.innerHTML = '<text x="50%" y="50%" text-anchor="middle" fill="#9ca3af" font-size="12">暂无数据</text>';
    return;
  }
  const W = 560, H = 160, padL = 40, padR = 12, padT = 14, padB = 28;
  const max = Math.max(...values, 1);
  const xs = points.map((_, i) =>
    padL + (points.length === 1 ? (W - padL - padR) / 2 : i * ((W - padL - padR) / (points.length - 1))));
  const ys = values.map(v => H - padB - (v / max) * (H - padT - padB));
  const polyPts = xs.map((x, i) => `${x},${ys[i]}`).join(" ");
  const areaPts = `${xs[0]},${H - padB} ${polyPts} ${xs[xs.length - 1]},${H - padB}`;

  const gridLines = [0, 0.5, 1].map(t => {
    const y = H - padB - t * (H - padT - padB);
    return `<line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="#e5e7eb" stroke-width="1"/>
            <text x="${padL - 6}" y="${y + 3}" text-anchor="end" fill="#9ca3af" font-size="10">${fmt(max * t)}</text>`;
  }).join("");

  const step = Math.max(1, Math.ceil(points.length / 7));
  const xLabels = points.map((p, i) =>
    (i % step === 0 || i === points.length - 1)
      ? `<text x="${xs[i]}" y="${H - 8}" text-anchor="middle" fill="#9ca3af" font-size="10">${p.day.slice(5)}</text>`
      : "").join("");

  svg.innerHTML = `${gridLines}
    <polygon points="${areaPts}" fill="rgba(16,185,129,.10)"/>
    <polyline points="${polyPts}" fill="none" stroke="#10b981" stroke-width="2" stroke-linejoin="round"/>
    ${xs.map((x, i) => values[i] > 0 ? `<circle cx="${x}" cy="${ys[i]}" r="3" fill="#10b981"/>` : "").join("")}
    ${xLabels}`;
}

function drawModelChart(
  svg: SVGSVGElement, legend: HTMLDivElement,
  modelDaily: ModelDailyPoint[], topModels: string[], days: number,
  opts: { W?: number; H?: number } = {}
) {
  const W = opts.W ?? 560, H = opts.H ?? 160;
  const padL = 40, padR = 12, padT = 14, padB = 28;

  if (!svg || !topModels.length) {
    if (svg) svg.innerHTML = '<text x="50%" y="50%" text-anchor="middle" fill="#9ca3af" font-size="12">暂无数据</text>';
    if (legend) legend.innerHTML = "";
    return;
  }

  const map: Record<string, Record<string, number>> = {};
  topModels.forEach(m => { map[m] = {}; });
  modelDaily.forEach(r => { if (map[r.model]) map[r.model][r.day] = r.calls; });

  let grid: string[] = [];
  if (days === 0) {
    const allDates = modelDaily.map(r => r.day).sort();
    if (allDates.length) {
      const start = new Date(allDates[0]);
      const end = new Date();
      for (const dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
        grid.push(dt.toISOString().slice(0, 10));
      }
    } else {
      grid.push(new Date().toISOString().slice(0, 10));
    }
  } else {
    for (let i = days - 1; i >= 0; i--) {
      const dt = new Date();
      dt.setDate(dt.getDate() - i);
      grid.push(dt.toISOString().slice(0, 10));
    }
  }

  let max = 1;
  topModels.forEach(m => grid.forEach(d => { max = Math.max(max, map[m][d] || 0); }));

  const xs = grid.map((_, i) =>
    padL + (grid.length === 1 ? (W - padL - padR) / 2 : i * ((W - padL - padR) / (grid.length - 1))));

  const gridLines = [0, 0.5, 1].map(t => {
    const y = H - padB - t * (H - padT - padB);
    return `<line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="#e5e7eb" stroke-width="1"/>
            <text x="${padL - 6}" y="${y + 3}" text-anchor="end" fill="#9ca3af" font-size="10">${Math.round(max * t)}</text>`;
  }).join("");

  const lines = topModels.map((m, idx) => {
    const color = MODEL_COLORS[idx % MODEL_COLORS.length];
    const ys = grid.map(d => H - padB - ((map[m][d] || 0) / max) * (H - padT - padB));
    const pts = xs.map((x, i) => `${x},${ys[i]}`).join(" ");
    return `<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round"/>`;
  }).join("");

  const step = Math.max(1, Math.ceil(grid.length / 7));
  const xLabels = grid.map((d, i) =>
    (i % step === 0 || i === grid.length - 1)
      ? `<text x="${xs[i]}" y="${H - 8}" text-anchor="middle" fill="#9ca3af" font-size="10">${d.slice(5)}</text>`
      : "").join("");

  svg.innerHTML = gridLines + lines + xLabels;

  if (legend) {
    legend.innerHTML = topModels.map((m, idx) =>
      `<span class="legend-item"><span class="dot" style="background:${MODEL_COLORS[idx % MODEL_COLORS.length]}"></span>${m}</span>`
    ).join("");
  }
}

// ── 初始化 ──────────────────────────────────────────────────

onMounted(() => {
  loadMeToday();
  loadMeByModel();
  loadMeKeysBalance();
  // admin 默认进入平台看板
  if (isAdmin.value) {
    activeTab.value = "platform";
    platformLoaded = true;
    loadPlatform();
  }
});
</script>

<style lang="scss" scoped>
.usage-stats {
  padding: 4px 0;
}

.section {
  margin-bottom: 24px;
}

.section-title {
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-card {
  margin-bottom: 16px;
  text-align: center;

  .stat-value {
    font-size: 22px;
    font-weight: 700;
    color: var(--el-text-color-primary);
    line-height: 1.3;

    &.text-danger { color: #dc2626; }
    &.text-success { color: #10b981; }
  }

  .stat-label {
    margin-top: 4px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .stat-sub {
    margin-top: 4px;
    font-size: 11px;
    color: var(--el-text-color-placeholder);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.time-bar {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 16px;

  .chart-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin-bottom: 8px;
  }
}

.chart-svg {
  width: 100%;
  height: auto;
}

.chart-svg-lg {
  min-height: 200px;
}

.chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
  font-size: 12px;
  color: var(--el-text-color-regular);

  :deep(.legend-item) {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  :deep(.dot) {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }
}

.pct-bar {
  display: inline-block;
  width: 80px;
  height: 8px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
  overflow: hidden;
  vertical-align: middle;
  margin-right: 6px;
}

.pct-bar-fill {
  height: 100%;
  background: #10b981;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.pct-text {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.expand-hint {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 12px;
}
</style>
