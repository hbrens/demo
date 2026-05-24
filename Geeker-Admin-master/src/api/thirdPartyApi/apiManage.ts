import thirdPartyApi from "./config";

// ==================== 类型定义 ====================

/** API申请记录 */
export interface ApiRequestItem {
  id: number;
  user_id: number;
  config_id: number | null;
  account_id: number | null;
  project_name: string;
  purpose: string;
  lead: string;
  budget: string;
  sub_accounts: string;
  dept: string;
  cc_person: string;
  status: "pending" | "approved" | "rejected";
  review_note: string;
  api_key_id: number | null;
  reviewer_id: number | null;
  created_at: string;
  updated_at: string;
  // 关联查询字段
  username?: string;
  provider?: string;
  base_url?: string;
  manager?: string;
  manager_username?: string;
  reviewer_username?: string;
  api_key_name?: string;
  key_manager_username?: string;
  config_name?: string;
  config_provider?: string;
  config_manager?: string;
  team?: string;
}

/** 级联选项（供应商 x 管理员） */
export interface CascadeOption {
  id: number;
  provider: string;
  team: string;
  manager_username: string;
  manager_user_id: number;
}

/** 候选密钥 */
export interface CandidateKey {
  sub_account_id: number;
  sub_account_name: string;
  api_key_id: number;
  api_key_name: string;
  last_total: number;
  last_balance: number;
}

/** 已通过申请（密钥管理） */
export interface ApprovedRequest {
  request_id: number;
  project_name: string;
  created_at: string;
  status: string;
  provider: string;
  base_url: string;
  sub_account_name: string;
  api_name: string;
  available_models: string;
}

/** 提交申请参数 */
export interface SubmitRequestParams {
  account_id: number;
  reviewer_id: number;
  project_name: string;
  purpose: string;
  lead: string;
  budget: string;
  dept?: string;
  cc_person?: string;
}

/** 审核参数 */
export interface ReviewParams {
  status: "approved" | "rejected";
  review_note?: string;
  api_key_id?: number | null;
}

// ==================== API 函数 ====================

/** 获取级联选项（供应商 x 管理员） */
export const getCascadeOptions = () => {
  return thirdPartyApi.get<CascadeOption[]>("/api-requests/cascade-options");
};

/** 获取当前用户的申请列表 */
export const getMyRequests = async () => {
  const data = await thirdPartyApi.get<ApiRequestItem[]>("/api-requests/my");
  return { data };
};

/** 提交新的API申请 */
export const submitRequest = (params: SubmitRequestParams) => {
  return thirdPartyApi.post<{ id: number }>("/api-requests", params);
};

/** 获取待审核申请列表（管理员/审核人） */
export const getReviewRequests = async () => {
  const data = await thirdPartyApi.get<ApiRequestItem[]>("/admin/api-requests");
  return { data };
};

/** 获取候选密钥列表 */
export const getCandidateKeys = (requestId: number) => {
  return thirdPartyApi.get<CandidateKey[]>(`/admin/api-requests/${requestId}/candidate-keys`);
};

/** 审核申请（通过/拒绝） */
export const reviewRequest = (requestId: number, params: ReviewParams) => {
  return thirdPartyApi.put<{ ok: boolean }>(`/admin/api-requests/${requestId}`, params);
};

/** 获取当前用户已通过的申请（密钥管理） */
export const getApprovedRequests = async () => {
  const data = await thirdPartyApi.get<ApprovedRequest[]>("/api-requests/approved");
  return { data };
};
