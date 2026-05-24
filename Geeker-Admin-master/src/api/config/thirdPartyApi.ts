import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { ElMessage } from "element-plus";

// 第三方 API 基础配置
const BASE_URL = "/third-party-api";

// 硬编码 token 用于调试（从 data-API-project 登录获取）
const ADMIN_TOKEN = "270c966e58a6b257eac12f714daa5f3091264ab9696f5d58d1e7e9ce573e9586";
const ADMIN_PASSWORD = "admin123";

// 创建独立的 axios 实例
const thirdPartyApi: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json"
  }
});

// 请求拦截器 - 添加鉴权 headers
thirdPartyApi.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // 添加 X-Token
    config.headers["X-Token"] = ADMIN_TOKEN;
    // 添加 X-Admin-Password（管理员操作需要）
    config.headers["X-Admin-Password"] = ADMIN_PASSWORD;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
thirdPartyApi.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.detail || error.message || "请求失败";
    ElMessage.error(message);
    return Promise.reject(error);
  }
);

export default thirdPartyApi;
