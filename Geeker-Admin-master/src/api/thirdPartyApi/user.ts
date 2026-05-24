import thirdPartyApi from "./config";

// 用户管理接口类型定义
export interface UserItem {
  id: number;
  username: string;
  role: "admin" | "user";
  created_at: string;
}

export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResult {
  token: string;
  user: {
    id: number;
    username: string;
    role: string;
  };
}

// 获取用户列表
export const getUsers = () => {
  return thirdPartyApi.get<UserItem[]>("/admin/users");
};

// 用户登录
export const login = (params: LoginParams) => {
  return thirdPartyApi.post<LoginResult>("/auth/login", params);
};

// 修改用户角色
export const updateUserRole = (userId: number, role: "admin" | "user") => {
  return thirdPartyApi.put(`/admin/users/${userId}/role`, { role });
};

// 重置用户密码
export const resetUserPassword = (userId: number, password: string) => {
  return thirdPartyApi.put(`/admin/users/${userId}/password`, { password });
};

// 删除用户
export const deleteUser = (userId: number) => {
  return thirdPartyApi.delete(`/admin/users/${userId}`);
};

// 获取当前用户信息
export const getCurrentUser = () => {
  return thirdPartyApi.get<UserItem>("/auth/me");
};
