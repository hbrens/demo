import thirdPartyApi from "./config";

// ── 个人看板类型 ────────────────────────────────────────────
export interface TodayStats {
  total_calls: number;
  total_tokens: number;
  total_cost: number;
  success_rate: number;
}

export interface ModelStat {
  model: string;
  calls: number;
  in_tokens: number;
  out_tokens: number;
  tokens: number;
  cost: number;
  percent: number;
}

export interface KeyBalance {
  api_name: string;
  provider: string;
  sub_account_name: string;
  project_name: string;
  total: number | null;
  used: number | null;
  balance: number | null;
  exhausted: boolean;
}

// ── 平台看板类型 ────────────────────────────────────────────
export interface PlatformOverview {
  total_calls: number;
  total_tokens: number;
  total_cost: number;
  active_projects: string[];
  active_projects_count: number;
  active_users: number;
  success_rate: number;
  avg_duration_ms: number;
}

export interface DailyPoint {
  day: string;
  calls: number;
  cost: number;
}

export interface ModelDailyPoint {
  model: string;
  day: string;
  calls: number;
}

export interface TrendsData {
  daily: DailyPoint[];
  model_daily: ModelDailyPoint[];
  top_models: string[];
}

export interface RankItem {
  project?: string;
  username?: string;
  calls: number;
  tokens: number;
  cost: number;
}

export interface RankingData {
  projects: RankItem[];
  users: RankItem[];
}

export interface ModelGovItem {
  model: string;
  calls: number;
  tokens: number;
  cost: number;
  success_rate: number;
  avg_ms: number;
}

export interface ModelGovData {
  models: ModelGovItem[];
}

export interface AnomalyData {
  fail_rate: number;
  fail_count: number;
  slow_count: number;
  growth_pct: number;
  recent_fails: RecentFail[];
}

export interface RecentFail {
  time: string;
  user: string;
  model: string;
  error: string;
}

// ── 个人看板接口 ────────────────────────────────────────────

// 今日概览
export const getMeToday = () => {
  return thirdPartyApi.get<TodayStats>("/me/stats/today");
};

// 按模型统计
export const getMeByModel = () => {
  return thirdPartyApi.get<ModelStat[]>("/me/stats/by-model");
};

// API Key 余额
export const getMeKeysBalance = () => {
  return thirdPartyApi.get<KeyBalance[]>("/me/stats/keys-balance");
};

// ── 平台看板接口 ────────────────────────────────────────────

// 核心指标
export const getPlatformOverview = (days: number) => {
  return thirdPartyApi.get<PlatformOverview>(`/admin/stats/platform/overview?days=${days}`);
};

// 趋势数据
export const getPlatformTrends = (days: number, top = 5) => {
  return thirdPartyApi.get<TrendsData>(`/admin/stats/platform/trends?days=${days}&top=${top}`);
};

// 排行榜
export const getPlatformRanking = (days: number, limit = 10) => {
  return thirdPartyApi.get<RankingData>(`/admin/stats/platform/ranking?days=${days}&limit=${limit}`);
};

// 模型治理
export const getPlatformModels = (days: number) => {
  return thirdPartyApi.get<ModelGovData>(`/admin/stats/platform/models?days=${days}`);
};

// 异常监控
export const getPlatformAnomalies = () => {
  return thirdPartyApi.get<AnomalyData>("/admin/stats/platform/anomalies");
};
