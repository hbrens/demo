# OpenTiny webmcp-sdk 接入评估报告

> **项目**: Geeker-Admin (Vue3 后台管理系统)
> **评估对象**: @opentiny/next-sdk v0.2.10 + @opentiny/next-remoter v0.2.10 + web-agent v1.2.0
> **日期**: 2026-03-27

---

## 一、结论与风险

### 1.1 总体结论

**不建议用于生产环境。** 该 SDK 存在严重的设计缺陷和安全风险，仅适合做技术调研或短期演示。

### 1.2 核心风险

| 风险             | 严重程度 | 说明                                                                                                                        |
| ---------------- | -------- | --------------------------------------------------------------------------------------------------------------------------- |
| **默认外发数据** | 🔴 严重  | SDK 内置硬编码配置，默认将用户对话和 MCP 工具信息发送至 `https://agent.opentiny.design`，即使配置了本地 WebAgent 也无法阻止 |
| **API Key 暴露** | 🔴 严重  | 硬编码 `sk-trial` 作为默认 API Key，且 LLM 调用在前端发起，Key 明文暴露在浏览器                                             |
| **Bundle 体积**  | 🔴 严重  | @opentiny/next-remoter 打包后 14MB，Vite dev 模式加载 23MB JS，生产环境不可接受                                             |
| **工具注册成本** | 🔴 严重  | 需要为每个业务功能手动编写 `registerTool` 代码，页面改动则工具同步修改，开发维护成本极高，不适合规模化接入（详见 1.3）      |
| **命名误导**     | 🟡 中等  | WebAgent 名义上是「智能代理中枢」，实际只是一个 MCP 协议代理转发服务，不包含任何 AI 能力                                    |
| **项目成熟度**   | 🟡 中等  | web-agent 仅 5 stars、12 commits；next-sdk 31 stars，社区极小                                                               |
| **依赖膨胀**     | 🟡 中等  | next-remoter 依赖了整套 TinyVue + Vant + Vue（重复），导致包体积失控                                                        |

### 1.3 MCP 工具注册的开发成本

当前接入方式要求开发者**手动为每个业务功能编写 MCP 工具注册代码**：

```typescript
// 每个工具都要写这样一段代码
server.registerTool(
  "filter-by-username", // 工具名
  {
    title: "按用户名筛选",
    description: "根据用户名关键词筛选用户列表",
    inputSchema: {
      keyword: z.string().describe("用户名关键词"),
    },
  },
  async (params: { keyword: string }) => {
    proTable.value.searchParam.username = params.keyword;
    proTable.value.search();
    return { content: [{ type: "text", text: `已筛选用户名: ${params.keyword}` }] };
  },
);

// 还要写 filter-by-gender、filter-by-status、filter-by-idcard、
// clear-filters、get-filter-status ... 每个功能都是一段代码
```

**问题：**

| 问题             | 说明                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------ |
| **工作量巨大**   | 一个中等复杂度的后台系统有 50+ 个功能点，每个都要手写工具注册代码                    |
| **维护同步困难** | 页面功能改动（字段名、参数、逻辑变化），工具代码必须同步修改，否则 AI 调用会出错     |
| **描述容易过时** | `description` 和 `inputSchema` 是人工维护的字符串，代码改了忘记更新描述，AI 就会调错 |
| **无法规模化**   | 每个页面、每个组件、每个操作都要单独注册，100 个页面 = 100 个文件要改                |

**更好的方案（目前不存在）：**

理想情况下，应该有构建工具在编译阶段**自动扫描代码并注入 MCP 工具定义**：

```
开发者写业务代码（普通 Vue 组件 + API 调用）
  ↓
构建工具自动识别可暴露的功能（表单提交、列表查询、按钮点击...）
  ↓
自动生成 MCP 工具注册代码
  ↓
打包时注入，无需手动维护
```

但目前没有这样的工具。当前的 `registerTool` 手动方式，只适合 **2-3 个页面、5-10 个工具**的小范围演示，无法支撑真实业务的全面接入。

### 1.4 硬编码默认值（SDK 内部）

```
文件: node_modules/@opentiny/next-remoter/dist/next-remoter.es.js

第 12192 行: apiKey: "sk-trial"
第 12193 行: baseURL: "https://agent.opentiny.design/api/v1/ai/"
第 36424 行: agentRoot: "https://agent.opentiny.design/api/v1/webmcp-trial/"
第 36474 行: baseURL: "https://agent.opentiny.design/api/v1/ai/"
```

**即使你配置了本地 WebAgent，LLM 对话仍然默认走云端：** 实际需要修改前端代码配置llm

```
配置了 agent-root="http://localhost:3000/api/v1/webmcp/"
  ↓
只覆盖了 MCP 工具代理地址
  ↓
LLM 对话仍走 https://agent.opentiny.design/api/v1/ai/chat/completions
```

### 1.4 实际网络请求

```javascript
// 浏览器实际发出的请求
fetch("https://agent.opentiny.design/api/v1/ai/chat/completions", {
  headers: {
    "authorization": "Bearer sk-trial",  // 硬编码 Key
    "content-type": "application/json"
  },
  body: JSON.stringify({
    model: "deepseek-ai/DeepSeek-V3",
    tools: [
      {"name": "filter-by-username", ...},
      {"name": "filter-by-gender", ...},
      // 你的所有 MCP 工具定义全部外发
    ],
    messages: [
      {"role": "system", "content": "你是一个智能助手..."},
      {"role": "user", "content": "用户输入的内容"}
    ]
  })
})
```

**你的业务工具定义和用户对话内容全部经过 OpenTiny 云端。**

---

## 二、架构与工作流程

### 2.1 官方宣传 vs 实际架构

| 官方说法                      | 实际情况                                         |
| ----------------------------- | ------------------------------------------------ |
| WebAgent 是「智能代理中枢」   | 实际只是 MCP 协议代理转发，无 AI 能力            |
| 前端应用通过 WebAgent 接入 AI | AI 对话在前端直接调用 LLM，WebAgent 只管工具转发 |
| 私有化部署可完全自主可控      | SDK 内置硬编码默认值，必须显式覆盖才能脱离云端   |

### 2.2 实际工作流程

```
┌─────────────────────────────────────────────────────────────┐
│  浏览器                                                      │
│                                                             │
│  ┌─────────────┐                                            │
│  │ TinyRemoter │ ──► agent.opentiny.design/api/v1/ai/       │
│  │  (对话 UI)   │     (硬编码默认，LLM 对话)                   │
│  └──────┬──────┘                                            │
│         │                                                   │
│         │ 工具调用                                            │
│         ▼                                                   │
│  ┌─────────────┐                                            │
│  │ WebMcpClient│ ──► localhost:3000 (你配的 agent-root)      │
│  └──────┬──────┘     WebAgent (MCP 代理)                    │
│         │                                                   │
│         │ 转发                                              │
│         ▼                                                   │
│  ┌─────────────┐                                            │
│  │ WebMcpServer│                                            │
│  │ (业务页面)   │                                            │
│  └─────────────┘                                            │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 各组件真实职责

| 组件             | 宣传功能                     | 实际功能             | 是否含 AI       |
| ---------------- | ---------------------------- | -------------------- | --------------- |
| **WebAgent**     | 智能代理中枢、连接 AI 大模型 | MCP 协议代理转发     | ❌              |
| **TinyRemoter**  | AI 对话框组件                | 前端直接调用 LLM API | ❌ (只是调用者) |
| **WebMcpClient** | 连接 WebAgent                | 连接 MCP 代理        | ❌              |
| **WebMcpServer** | 注册前端工具                 | 暴露 MCP 工具接口    | ❌              |

**整个 SDK 不包含任何 AI 模型或推理能力，只是把前端工具暴露给外部 LLM 调用。**

---

## 三、接入过程与代码修改

### 3.1 安装依赖

```bash
pnpm add @opentiny/next-sdk @opentiny/next-remoter
```

**新增依赖：**

- @opentiny/next-sdk: +77 packages
- @opentiny/next-remoter: +330 packages (包含整套 TinyVue + Vant)

### 3.2 修改文件清单

| 文件                                       | 改动说明                                                        |
| ------------------------------------------ | --------------------------------------------------------------- |
| `src/App.vue`                              | 添加 WebMcpClient 初始化、TinyRemoter 组件、MessageChannel 通信 |
| `src/views/proTable/useProTable/index.vue` | 注册 6 个 MCP 筛选工具、添加演示面板按钮                        |

### 3.3 App.vue 改动

```vue
<template>
  <!-- 新增 TinyRemoter 对话面板 -->
  <TinyRemoter v-if="mcpSessionId" agent-root="http://localhost:3000/api/v1/webmcp/" :session-id="mcpSessionId" show />
</template>

<script setup>
// 新增导入
import { WebMcpClient, createMessageChannelPairTransport } from "@opentiny/next-sdk";
import { TinyRemoter } from "@opentiny/next-remoter";

// 新增 MCP 初始化
const mcpClient = new WebMcpClient({ name: "geeker-admin-client", version: "1.0.0" });
const mcpSessionId = ref("");

onMounted(async () => {
  // 创建 MessageChannel 通信通道
  const [serverTransport, clientTransport] = createMessageChannelPairTransport();
  provide("serverTransport", serverTransport);

  // 连接 MCP Client
  await mcpClient.connect(clientTransport);

  // 连接本地 WebAgent
  const { sessionId } = await mcpClient.connect({
    agent: true,
    url: "http://localhost:3000/api/v1/webmcp/mcp",
  });
  mcpSessionId.value = sessionId;
});
</script>
```

### 3.4 useProTable/index.vue 改动

```typescript
// 注册 6 个 MCP 筛选工具
server.registerTool("filter-by-username", { ... }, async (params) => {
  proTable.value.searchParam.username = params.keyword;
  proTable.value.search();
  return { content: [{ type: "text", text: `已筛选用户名: ${params.keyword}` }] };
});

server.registerTool("filter-by-gender", { ... }, ...);
server.registerTool("filter-by-status", { ... }, ...);
server.registerTool("filter-by-idcard", { ... }, ...);
server.registerTool("clear-filters", { ... }, ...);
server.registerTool("get-filter-status", { ... }, ...);
```

### 3.5 自建 WebAgent

```bash
# 克隆 web-agent 仓库
git clone https://github.com/opentiny/web-agent.git
cd web-agent

# 安装依赖
pnpm install

# 配置环境变量
# .env
AGENT_PORT=3000
CORS_ORIGIN=http://localhost:8848
NODE_ENV=development

# 启动
pnpm dev
```

**WebAgent 实际作用：**

- ✅ 接收 MCP 工具调用请求
- ✅ 转发到前端 WebMcpServer
- ❌ 不处理 AI 对话
- ❌ 不调用 LLM

---

## 四、Bundle 体积分析

### 4.1 @opentiny/next-remoter dist 文件

| 文件                       | 大小        | 说明                 |
| -------------------------- | ----------- | -------------------- |
| next-remoter-runtime.es.js | **14.2 MB** | 包含所有依赖的运行时 |
| next-remoter.es.js         | 1.2 MB      | 主入口               |
| next-remoter.css           | 670 KB      | 样式                 |
| style.css                  | 175 KB      | 额外样式             |

### 4.2 依赖分析

```json
{
  "@opentiny/vue": "^3.27.0",        // 整套 TinyVue 组件库
  "vant": "^4.9.21",                 // 整套 Vant 移动端 UI 库
  "vue": "^3.5.22",                  // 重复打包 Vue
  "@ai-sdk/openai": "^3.0.0",        // OpenAI SDK
  "@ai-sdk/deepseek": "1.0.30",      // DeepSeek SDK
  "ai": "^6.0.0",                    // Vercel AI SDK
  "html5-qrcode": "^2.3.8",          // 二维码扫描
  ...
}
```

**Vite dev 模式处理后：23MB JS 加载。**

---

## 五、建议

### 5.1 如果要用 MCP 能力

**不要用 @opentiny/next-remoter**，只用核心 SDK：

```bash
# 只装核心包
pnpm add @opentiny/next-sdk

# 不装对话组件
# pnpm add @opentiny/next-remoter  ← 不要装这个
```

自己写一个简单的 MCP 工具调用界面，避免 23MB 的体积和硬编码默认值。

### 5.2 如果要 AI 对话能力

自己实现，不依赖 TinyRemoter：

```typescript
// 直接调用你的 LLM API
const response = await fetch("https://your-llm-api.com/chat", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${YOUR_API_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    messages: [...],
    tools: mcpTools  // 从 WebMcpServer 获取工具列表
  })
});
```

### 5.3 生产环境方案

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  前端对话框   │ ───► │  你的后端    │ ───► │  LLM 服务    │
│  (自己写)    │      │  (API 代理)  │      │  (Key 在后端) │
└─────────────┘      └─────────────┘      └─────────────┘
                            │
                            │ 工具调用
                            ▼
                     ┌─────────────┐
                     │  WebAgent   │
                     │  (可选)     │
                     └─────────────┘
```

- LLM 调用走后端代理，Key 不暴露
- MCP 工具可选是否用 WebAgent
- 完全自主可控

### 5.4 前端直接配置 LLM（快速验证方案）

TinyRemoter 支持通过 `llmConfig` 属性在前端直接配置 LLM：

```vue
<TinyRemoter v-if="mcpSessionId" agent-root="http://localhost:3000/api/v1/webmcp/" :session-id="mcpSessionId" :llmConfig="llmConfig" show />
```

```typescript
// 前端配置 LLM
const llmConfig = {
  apiKey: "your-api-key", // 你的 API Key
  baseURL: "https://your-llm.com/v1", // LLM 服务地址
  providerType: "openai", // 支持 openai / deepseek / 自定义
  model: "your-model-name",
  maxSteps: 10,
};
```

**⚠️ 前端配置 LLM 的风险：**

| 风险             | 说明                                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------------------- |
| **API Key 暴露** | Key 明文写在前端代码中，F12 可直接查看，任何人可盗用                                                          |
| **无限流保护**   | 没有后端做请求限制，被刷 Key 会产生高额费用                                                                   |
| **CORS 限制**    | 部分 LLM 服务不允许浏览器直接调用，需要代理                                                                   |
| **调试误触外发** | 若 llmConfig 配置不正确或未生效，SDK 会 fallback 到硬编码默认值，将请求发送至 `https://agent.opentiny.design` |

**⚠️ 调试期间特别注意：**

```
场景 1：llmConfig 写错了（比如 baseURL 拼错）
  → SDK fallback 到默认值 → 请求外发到 OpenTiny 云端

场景 2：llmConfig 没传进去（比如变量名写错）
  → SDK 使用默认值 → 请求外发到 OpenTiny 云端

场景 3：网络问题导致自定义 LLM 不可达
  → SDK 行为不确定 → 可能 fallback 到默认值
```

**验证 llmConfig 是否生效的方法：**

打开 F12 → Network，确认请求发往你配置的地址，而非 `agent.opentiny.design`：

```
✅ 生效：请求发往 https://your-llm.com/v1/chat/completions
❌ 未生效：请求发往 https://agent.opentiny.design/api/v1/ai/chat/completions
```

**适用场景：**

- 短期 PoC
- 临时测试，用完即弃 Key
- 对安全无要求的开发环境

**不适用场景：**

- 生产环境
- 内网演示
- 对外服务
- API Key 有费用限制

---

## 六、总结

| 维度         | 评分      | 说明                                  |
| ------------ | --------- | ------------------------------------- |
| 功能完整性   | ⭐⭐⭐☆☆  | MCP 工具注册和调用能跑通              |
| 安全性       | ⭐☆☆☆☆    | 默认外发数据、Key 暴露、无隐私保护    |
| 体积控制     | ⭐☆☆☆☆    | 23MB JS 不可接受                      |
| 文档准确度   | ⭐⭐☆☆☆   | WebAgent 命名误导，实际能力与宣传不符 |
| 生产可用性   | ⭐☆☆☆☆    | 不可用于生产                          |
| 技术调研价值 | ⭐⭐⭐⭐☆ | MCP 协议实现有参考价值                |

**最终结论：该 SDK 从设计上就有问题，不值得花精力去适配。**

- 硬编码默认外发数据，即使配置了本地服务也无法完全阻止
- 23MB 的 bundle 体积，生产环境不可接受
- WebAgent 命名误导，实际只是 MCP 代理，不含 AI 能力
- 整个架构把 LLM 调用放在前端，违背安全最佳实践
- MCP 工具需要手动逐个注册，页面改动工具同步修改，开发维护成本极高，不适合规模化接入

**建议：弃用，不要尝试接入。等未来有构建工具能在编译阶段自动注入 MCP 工具定义时再考虑。**
