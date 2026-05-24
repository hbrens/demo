# data-API-project-main 融合文档

## 一、项目概述

**data-API-project-main** 是一个「第三方 API 调用平台」，原项目为纯静态前端 + Python FastAPI 后端架构。

- **前端**：无框架，原生 HTML + ES Modules，浏览器直接打开
- **后端**：Python FastAPI，SQLite 数据库，代理 Anthropic/OpenAI 兼容 API
- **核心功能**：API 密钥管理、在线对话、批量调用、使用统计、申请审核

---

## 二、后端 API 接口清单

后端地址：`http://localhost:8000`

### 2.1 对话相关

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/chat` | SSE 流式对话（支持 Anthropic 原生 + OpenAI 兼容格式） |
| GET | `/models` | 获取可用模型列表 |
| GET | `/health` | 健康检查 |

### 2.2 会话管理

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/sessions` | 创建会话 |
| PUT | `/sessions/{id}/title` | 重命名会话 |
| PUT | `/sessions/{id}/pin` | 置顶/取消置顶 |
| DELETE | `/sessions/{id}` | 删除会话 |
| POST | `/sessions/messages` | 保存消息 |
| GET | `/history/my` | 我的会话列表 |
| GET | `/history/{session_id}` | 获取会话消息 |

### 2.3 账号管理（三层结构：accounts → sub_accounts → api_keys）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/admin/accounts` | 供应商账号列表 |
| POST | `/admin/accounts` | 新增供应商 |
| PUT | `/admin/accounts/{id}` | 更新供应商 |
| DELETE | `/admin/accounts/{id}` | 删除供应商 |
| GET | `/admin/accounts/options` | 供应商下拉选项 |
| GET | `/admin/accounts/{id}/fetch-models` | 拉取供应商模型列表 |

### 2.4 子账号管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/admin/accounts/{id}/sub-accounts` | 子账号列表 |
| POST | `/admin/accounts/{id}/sub-accounts` | 新增子账号 |
| PUT | `/admin/sub-accounts/{id}` | 更新子账号 |
| DELETE | `/admin/sub-accounts/{id}` | 删除子账号 |

### 2.5 API Key 管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/admin/sub-accounts/{id}/api-keys` | Key 列表 |
| POST | `/admin/sub-accounts/{id}/api-keys` | 新增 Key |
| PUT | `/admin/api-keys/{id}` | 更新 Key |
| DELETE | `/admin/api-keys/{id}` | 删除 Key |
| POST | `/admin/sub-accounts/{id}/api-keys/import-excel` | Excel 批量导入 Key |
| GET | `/admin/api-keys/template.xlsx` | 下载导入模板 |
| GET | `/admin/accounts/quota-all` | 批量查询所有 Key 余额 |

### 2.6 额度查询

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/admin/providers` | 供应商列表 |
| GET | `/admin/teams` | 团队列表 |

### 2.7 申请审核

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api-requests/cascade-options` | 级联选项（account × 管理员） |
| POST | `/api-requests` | 提交 API 使用申请 |
| GET | `/api-requests/my` | 我的申请列表 |
| GET | `/api-requests/approved` | 我已通过的申请 |
| GET | `/admin/api-requests` | 管理员：待审核列表 |
| PUT | `/admin/api-requests/{id}` | 审核申请（批准/拒绝） |
| GET | `/admin/api-requests/{id}/candidate-keys` | 候选可用 Key |

### 2.8 用户管理

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/auth/register` | 注册 |
| POST | `/auth/login` | 登录（返回 token） |
| POST | `/auth/logout` | 登出 |
| GET | `/auth/me` | 当前用户信息 |
| GET | `/admin/users` | 用户列表 |
| PUT | `/admin/users/{id}/role` | 修改角色 |
| PUT | `/admin/users/{id}/password` | 重置密码 |
| DELETE | `/admin/users/{id}` | 删除用户 |

### 2.9 使用统计

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/admin/stats` | 按配置统计 |
| GET | `/admin/stats/by-user` | 按用户统计 |
| GET | `/admin/stats/{config_id}/daily` | 每日趋势 |
| GET | `/admin/stats/platform/overview` | 平台总览 |
| GET | `/admin/stats/platform/trends` | 平台趋势 |
| GET | `/admin/stats/platform/ranking` | 排行榜 |
| GET | `/admin/stats/platform/models` | 模型统计 |
| GET | `/admin/stats/platform/anomalies` | 异常检测 |
| GET | `/me/stats/today` | 个人今日统计 |
| GET | `/me/stats/by-model` | 个人按模型统计 |
| GET | `/me/stats/keys-balance` | 个人 Key 余额 |

### 2.10 批量处理

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/batch2/run` | 启动批量任务（SSE 流） |
| POST | `/batch2/jobs` | 创建批次 Job |
| POST | `/batch2/rows` | 保存批次行结果 |
| PUT | `/batch2/jobs/{id}/finish` | 结束批次 |
| PUT | `/batch2/jobs/{id}/rename` | 重命名批次 |
| GET | `/batch2/jobs/{id}/export` | 导出结果 Excel |
| GET | `/batch2/local-image` | 本地图片预览 |
| POST | `/batch2/lint` | 脚本语法检查 |

---

## 三、数据库表结构

### 核心表

| 表名 | 说明 |
|------|------|
| `users` | 用户表（id, username, password, role, created_at） |
| `user_tokens` | 登录 token |
| `accounts` | 供应商账号（provider, base_url, manager_user_id, team, models） |
| `sub_accounts` | 子账号（account_id, name, description） |
| `api_keys` | API 密钥（sub_account_id, name, api_key, is_active, exhausted, last_total, last_balance） |
| `api_configs` | 旧版配置（兼容保留） |
| `api_requests` | API 使用申请（user_id, account_id, reviewer_id, status, api_key_id） |
| `usage_stats` | 调用记录（config_id, user_id, model, input_tokens, output_tokens, cost, duration_ms） |
| `chat_sessions` | 对话会话 |
| `chat_messages` | 对话消息 |
| `batch_jobs` | 批次任务 |
| `batch_job_rows` | 批次行结果 |
| `tasks` | 任务容器（配置+脚本） |

### 三层密钥结构

```
accounts (供应商)
  └── sub_accounts (子账号)
        └── api_keys (密钥)
```

---

## 四、前端页面清单

| 文件 | 功能 |
|------|------|
| `index.html` | 首页导航 |
| `pages/claude.html` | 在线对话（左侧历史 + 右侧聊天） |
| `pages/keys.html` | 密钥管理（供应商/子账号/Key 三级） |
| `pages/apply.html` | API 管理（申请 + 审核） |
| `pages/stats.html` | 使用统计（平台看板 + 个人看板） |
| `pages/batch.html` | 批量处理（文件/数据集 → 脚本 → 批跑） |
| `pages/history.html` | 对话历史 |
| `pages/users.html` | 用户管理 |
| `pages/admin.html` | 管理员面板 |
| `pages/admin-new.html` | 新版管理员面板 |
| `pages/login.html` | 登录页 |

---

## 五、前端公共模块

| 文件 | 功能 |
|------|------|
| `assets/js/request.js` | 通用 fetch 封装（非流式） |
| `assets/js/stream.js` | SSE 流式读取封装（`streamChat`, `fetchModels`） |
| `assets/js/sidebar.js` | 侧边栏 + 顶栏动态注入 |
| `assets/js/auth.js` | 认证相关 |
| `assets/js/admin.js` | 管理员逻辑 |
| `assets/js/stats-page.js` | 统计页逻辑 |
| `assets/css/base.css` | 全局暗色主题（CSS 变量） |
| `assets/css/platform.css` | 平台样式 |
| `config/api.config.js` | API 配置（集中管理 key 和 base URL） |

---

## 六、融合到 Geeker-Admin 的方案建议

### 6.1 Geeker-Admin 技术栈

- Vue 3 + TypeScript + Vite
- Element Plus UI
- Pinia 状态管理
- Vue Router
- 目录结构：`src/views/` 放页面，`src/api/` 放接口，`src/routers/modules/` 放路由

### 6.2 建议模块划分

在 `src/views/` 下新建 `dataApi/` 目录：

```
src/views/dataApi/
  ├── chat/           # 在线对话（对应 claude.html）
  ├── keys/           # 密钥管理（对应 keys.html）
  ├── apply/          # API 申请管理（对应 apply.html）
  ├── stats/          # 使用统计（对应 stats.html）
  ├── batch/          # 批量处理（对应 batch.html）
  └── users/          # 用户管理（对应 users.html）
```

在 `src/api/` 下新建 `dataApi/` 目录：

```
src/api/dataApi/
  ├── chat.ts         # /chat, /sessions, /history
  ├── accounts.ts     # /admin/accounts, sub-accounts, api-keys
  ├── requests.ts     # /api-requests
  ├── stats.ts        # /admin/stats, /me/stats
  ├── batch.ts        # /batch2/*
  └── auth.ts         # /auth/*
```

在 `src/routers/modules/` 下新建 `dataApi.ts` 路由文件。

### 6.3 关键对接点

1. **流式对话**：`stream.js` 的 `streamChat()` 需改为在 Vue 组件中用 `fetch` + `ReadableStream` 实现，或封装为 composable
2. **认证**：原项目用 `x-token` Header，需对接 Geeker-Admin 的 token 管理（Pinia store）
3. **后端地址**：`stream.js` 中硬编码 `http://localhost:8000`，需改为环境变量配置
4. **样式**：原项目用自定义 CSS 变量暗色主题，需适配 Element Plus 主题体系
5. **侧边栏**：原项目 `sidebar.js` 动态注入，Geeker-Admin 有自己的布局系统，不需要迁移

### 6.4 后端依赖

后端 `server.py` 需独立运行（FastAPI + SQLite），前端通过 HTTP API 调用。后端不需改动，只需在 Geeker-Admin 的 `.env` 中配置后端地址。
