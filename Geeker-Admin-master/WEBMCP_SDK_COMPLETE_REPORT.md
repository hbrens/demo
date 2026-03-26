# OpenTiny webmcp-sdk 初步评估报告

> **项目**: Geeker-Admin (Vue3 后台管理系统)
> **评估对象**: @opentiny/next-sdk v0.2.10 + @opentiny/next-remoter v0.2.10 + web-agent v1.2.0
> **日期**: 2026-03-27
> **生成工具**: OpenCode + MiMo V2 Pro Free 模型

---

## 一、结论

### 1.1 总体结论

**不建议直接接入使用。** @opentiny/next-remoter存在较多问题， 但官网@opentiny/next-sdk没有单独使用案例，

### 1.2 分包结论

| 包                       | 结论             | 风险等级 | 说明                                                                        |
| ------------------------ | ---------------- | -------- | --------------------------------------------------------------------------- |
| `@opentiny/next-sdk`     | **审慎评估**     | 🟡 中    | 核心 MCP 实现，功能可跑通，但项目成熟度低（31 stars），长期维护存在不确定性 |
| `@opentiny/next-remoter` | **不建议使用**   | 🔴 高    | 硬编码默认外发、23MB 体积、依赖膨胀，问题集中在这里                         |
| `web-agent`              | **仅限本地调试** | 🟡 中    | 只是 MCP 代理转发，不含 AI 能力，5 stars 极度不成熟                         |

---

## 二、架构与工作流程

### 2.1 官方宣传架构

```
前端应用 → WebAgent（智能代理中枢）→ AI 大模型 → 执行工具
```

### 2.2 实际架构

```
┌─────────────────────────────────────────────────────────────────┐
│  浏览器                                                          │
│                                                                 │
│  ┌───────────────┐                                              │
│  │  TinyRemoter  │ ──► agent.opentiny.design/api/v1/ai/         │
│  │  (对话 UI)     │     (硬编码默认，LLM 对话)                     │
│  └───────┬───────┘                                              │
│          │                                                      │
│          │ 工具调用                                                │
│          ▼                                                      │
│  ┌───────────────┐     ┌───────────────┐                        │
│  │  WebMcpClient │ ──► │   WebAgent    │                        │
│  │               │     │  (MCP 代理)    │                        │
│  └───────┬───────┘     └───────┬───────┘                        │
│          │                     │                                │
│          │                     │ 转发                           │
│          ▼                     ▼                                │
│  ┌───────────────────────────────────┐                          │
│  │         WebMcpServer              │                          │
│  │         (业务页面)                 │                          │
│  └───────────────────────────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 各组件真实职责

| 组件             | 宣传功能     | 实际功能             | 含 AI？          |
| ---------------- | ------------ | -------------------- | ---------------- |
| **WebAgent**     | 智能代理中枢 | MCP 协议代理转发     | ❌               |
| **TinyRemoter**  | AI 对话框    | 前端直接调用 LLM API | ❌（只是调用者） |
| **WebMcpClient** | 连接 Agent   | 连接 MCP 代理        | ❌               |
| **WebMcpServer** | 注册工具     | 暴露 MCP 工具接口    | ❌               |

**整个 SDK 不包含任何 AI 能力，只是把前端工具暴露给外部 LLM 调用。WebAgent 命名误导，实际只是 MCP 代理。**

### 2.4 完整调用流程

```
【阶段一】启动时：TinyRemoter 获取工具列表
  │
  TinyRemoter → GET http://localhost:3000/api/v1/webmcp/tools?sessionId=xxx
  ← WebAgent 返回已注册的工具列表（来自 MCP Server）
  ← [{ name: "filter-by-username", description: "...", parameters: {...} }, ...]
  │
【阶段二】用户发送消息
  │
  用户输入：「筛选状态为启用的用户」
  │
  ▼
【阶段三】TinyRemoter 把【消息 + 工具定义】一起发给 LLM
  │
  POST https://agent.opentiny.design/api/v1/ai/chat/completions
  Authorization: Bearer sk-trial
  Body: {
    model: "deepseek-ai/DeepSeek-V3",
    messages: [{ role: "user", content: "筛选状态为启用的用户" }],
    tools: [                        // 工具定义在请求中发送
      { type: "function", function: { name: "filter-by-username", ... } },
      { type: "function", function: { name: "filter-by-status", ... } },
      ...
    ]
  }
  │
  ▼
【阶段四】LLM 返回工具调用决策
  │
  {
    tool_calls: [{
      function: {
        name: "filter-by-status",
        arguments: "{ \"status\": 1 }"
      }
    }]
  }
  │
  ▼
【阶段五】TinyRemoter 执行工具调用
  │
  POST http://localhost:3000/api/v1/webmcp/mcp?sessionId=xxx
  Body: { method: "tools/call", params: { name: "filter-by-status", arguments: { status: 1 } } }
  │
  ▼
【阶段六】WebAgent 转发到 WebMcpServer
  │
  WebAgent → WebMcpClient (SSE/HTTP) → clientTransport → serverTransport → MCP Server
  │
  ▼
【阶段七】WebMcpServer 执行工具回调
  │
  proTable.value.searchParam.status = 1
  proTable.value.search()
  return { content: [{ type: "text", text: "已筛选状态: 启用" }] }
  │
  ▼
【阶段八】工具结果返回给 LLM
  │
  TinyRemoter 把工具执行结果发回 LLM
  POST https://agent.opentiny.design/api/v1/ai/chat/completions
  Body: {
    messages: [
      { role: "user", content: "筛选状态为启用的用户" },
      { role: "assistant", tool_calls: [...] },
      { role: "tool", content: "已筛选状态: 启用" }   // 工具执行结果
    ]
  }
  │
  ▼
【阶段九】LLM 生成最终回复
  │
  "好的，已为您筛选出状态为启用的用户。"
  │
  ▼
【阶段十】显示给用户
```

---

## 三、@opentiny/next-sdk 评估

### 3.1 功能

| 功能                              | 说明                               |
| --------------------------------- | ---------------------------------- |
| WebMcpServer                      | 注册 MCP 工具，定义输入输出 schema |
| WebMcpClient                      | 连接 MCP 代理，调用工具            |
| createMessageChannelPairTransport | 浏览器内本地通信通道               |
| z                                 | Zod schema 校验（re-export）       |

### 3.2 优点

| 优点             | 说明                                  |
| ---------------- | ------------------------------------- |
| MCP 协议实现完整 | 支持 tool 注册、调用、schema 校验     |
| 无硬编码外发     | 不包含默认 LLM 配置，不会自动外发数据 |
| TypeScript 支持  | 类型定义完整                          |

### 3.3 缺点与风险

| 缺点               | 严重程度 | 说明                                                          |
| ------------------ | -------- | ------------------------------------------------------------- |
| **无法单独使用**   | 🔴 严重  | 官方文档所有示例都搭配 next-remoter，没有单独使用的文档和示例 |
| **项目极度不成熟** | 🔴 严重  | 31 stars、社区极小、随时可能停止维护                          |
| **依赖 `ai` SDK**  | 🟡 中    | 包含 Vercel AI SDK，增加体积                                  |
| **工具注册成本高** | 🟡 中    | 需手动逐个 registerTool，页面改动工具同步修改，无法规模化     |
| **文档不足**       | 🟡 中    | API 文档有，但最佳实践、故障排查文档欠缺                      |
| **无测试覆盖数据** | 🟡 中    | 无法评估代码质量                                              |

### 3.4 结论

**next-sdk 无法绕开 next-remoter 单独使用。** 官方设计就是两个包配套使用，next-sdk 提供 MCP 协议，next-remoter 提供 UI 和 LLM 调用。想用 MCP 能力就必须接受 next-remoter 带来的所有风险（23MB 体积、硬编码外发、依赖膨胀）。

---

## 四、@opentiny/next-remoter 评估

### 4.1 功能

| 功能             | 说明                            |
| ---------------- | ------------------------------- |
| TinyRemoter 组件 | AI 对话浮动图标 + 侧边对话框    |
| 自动 LLM 调用    | 内置 LLM 连接，无需配置即可使用 |
| 自动工具调用     | 根据 LLM 返回自动调用 MCP 工具  |
| 移动端支持       | 二维码扫码遥控                  |

### 4.2 优点

| 优点         | 说明                                      |
| ------------ | ----------------------------------------- |
| 开箱即用     | 无需配置 LLM 即可对话（使用内置试用 Key） |
| UI 完整      | 提供完整的对话界面                        |
| 自动工具调用 | 不需要手动处理 LLM 响应和工具调用         |

### 4.3 缺点与风险

| 缺点                                | 严重程度 | 说明                                                                                                                            |
| ----------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **硬编码默认外发**                  | 🔴 严重  | 内置 `apiKey: "sk-trial"` 和 `baseURL: "https://agent.opentiny.design/api/v1/ai/"`，未配置 llmConfig 时自动外发到 OpenTiny 云端 |
| **Bundle 体积**                     | 🔴 严重  | dist 14MB，Vite dev 23MB，生产不可接受                                                                                          |
| **API Key 暴露**                    | 🔴 严重  | LLM 调用在前端发起，Key 明文在浏览器                                                                                            |
| **依赖膨胀**                        | 🔴 严重  | 包含整套 TinyVue + Vant + Vue（重复打包）                                                                                       |
| **llmConfig 不生效时静默 fallback** | 🔴 严重  | 配置错误时不会报错，直接使用硬编码默认值外发                                                                                    |

### 4.4 硬编码默认值

```
node_modules/@opentiny/next-remoter/dist/next-remoter.es.js

第 12192 行: apiKey: "sk-trial"
第 12193 行: baseURL: "https://agent.opentiny.design/api/v1/ai/"
第 36424 行: agentRoot: "https://agent.opentiny.design/api/v1/webmcp-trial/"
第 36474 行: baseURL: "https://agent.opentiny.design/api/v1/ai/"
```

### 4.5 agent-root 与 llmConfig 的关系

| 配置         | 控制什么               | 默认值                                               |
| ------------ | ---------------------- | ---------------------------------------------------- |
| `agent-root` | MCP 工具代理地址       | `https://agent.opentiny.design/api/v1/webmcp-trial/` |
| `llmConfig`  | LLM 对话地址 + API Key | 内置 `sk-trial` + `agent.opentiny.design`            |

**两者独立，只配 agent-root 不会覆盖 LLM 地址。**

### 4.6 结论

**不要使用。** 23MB 体积 + 硬编码外发 + 依赖膨胀，无论从安全还是性能角度都不应纳入生产项目。

---

## 五、web-agent 评估

### 5.1 功能

| 功能                  | 说明                        |
| --------------------- | --------------------------- |
| MCP 协议代理          | 接收 MCP 请求并转发到前端   |
| SSE / Streamable HTTP | 支持两种传输模式            |
| 会话管理              | 管理 Client 和 Remoter 会话 |
| 健康检查              | 提供系统状态监控            |

### 5.2 优点

| 优点        | 说明                       |
| ----------- | -------------------------- |
| 私有化部署  | 可本地运行，不依赖外部服务 |
| 部署简单    | Node.js 即可运行           |
| 无 LLM 依赖 | 不需要配置 API Key         |

### 5.3 缺点与风险

| 缺点              | 严重程度 | 说明                                            |
| ----------------- | -------- | ----------------------------------------------- |
| **极度不成熟**    | 🔴 严重  | 5 stars、12 commits、0 issues，几乎没有真实用户 |
| **只是 MCP 代理** | 🟡 中    | 名义上是「智能代理中枢」，实际不含 AI 能力      |
| **Node 22 要求**  | 🟡 中    | 很多环境还未升级到 Node 22                      |
| **无认证机制**    | 🟡 中    | 任何人都可连接，无安全防护                      |

### 5.4 结论

**仅限本地调试使用，不建议用于生产。** 5 stars 的项目，稳定性无法保证。

---

## 六、接入过程记录

### 6.1 安装依赖

```bash
pnpm add @opentiny/next-sdk @opentiny/next-remoter
# next-sdk: +77 packages
# next-remoter: +330 packages
```

### 6.2 修改文件

| 文件                                       | 改动                                       |
| ------------------------------------------ | ------------------------------------------ |
| `src/App.vue`                              | 添加 WebMcpClient 初始化、TinyRemoter 组件 |
| `src/views/proTable/useProTable/index.vue` | 注册 6 个 MCP 筛选工具                     |
| `web-agent/`                               | 克隆 web-agent 仓库，配置 .env，本地启动   |

### 6.3 App.vue 改动

```vue
<template>
  <TinyRemoter v-if="mcpSessionId" agent-root="http://localhost:3000/api/v1/webmcp/" :session-id="mcpSessionId" show />
</template>

<script setup>
import { WebMcpClient, createMessageChannelPairTransport } from "@opentiny/next-sdk";
import { TinyRemoter } from "@opentiny/next-remoter";
import "@opentiny/next-remoter/dist/style.css";

const mcpClient = new WebMcpClient({ name: "geeker-admin-client", version: "1.0.0" });
const mcpSessionId = ref("");

onMounted(async () => {
  const [serverTransport, clientTransport] = createMessageChannelPairTransport();
  provide("serverTransport", serverTransport);
  await mcpClient.connect(clientTransport);

  const { sessionId } = await mcpClient.connect({
    agent: true,
    url: "http://localhost:3000/api/v1/webmcp/mcp",
  });
  mcpSessionId.value = sessionId;
});
</script>
```

### 6.4 useProTable 改动

```typescript
import { WebMcpServer, z } from "@opentiny/next-sdk";

const server = new WebMcpServer({ name: "geeker-admin-protable", version: "1.0.0" });

server.registerTool(
  "filter-by-username",
  {
    title: "按用户名筛选",
    description: "根据用户名关键词筛选用户列表",
    inputSchema: { keyword: z.string().describe("用户名关键词") },
  },
  async (params) => {
    proTable.value.searchParam.username = params.keyword;
    proTable.value.search();
    return { content: [{ type: "text", text: `已筛选用户名: ${params.keyword}` }] };
  },
);

// 另外注册 filter-by-gender、filter-by-status、filter-by-idcard、clear-filters、get-filter-status
```

### 6.5 验证结果

| 验证项               | 结果                                        |
| -------------------- | ------------------------------------------- |
| MCP 工具注册         | ✅ 成功                                     |
| MCP 工具调用（按钮） | ✅ 成功                                     |
| TinyRemoter UI 显示  | ✅ 成功                                     |
| AI 对话              | ✅ 成功（但走云端 `agent.opentiny.design`） |
| 自建 WebAgent        | ✅ 成功（localhost:3000）                   |
| bundle 体积          | ❌ 23MB                                     |

---

## 七、风险汇总

| 风险              | 涉及包       | 严重程度 | 说明                                        |
| ----------------- | ------------ | -------- | ------------------------------------------- |
| 硬编码默认外发    | next-remoter | 🔴 严重  | 未配置 llmConfig 时自动外发到 OpenTiny 云端 |
| Bundle 体积 23MB  | next-remoter | 🔴 严重  | 包含整套 UI 库，生产不可接受                |
| API Key 暴露      | next-remoter | 🔴 严重  | LLM 调用在前端发起                          |
| 依赖膨胀          | next-remoter | 🔴 严重  | TinyVue + Vant + Vue 重复打包               |
| 项目不成熟        | 全部         | 🔴 严重  | next-sdk 31 stars，web-agent 5 stars        |
| 工具注册成本高    | next-sdk     | 🟡 中    | 手动逐个 registerTool，无法规模化           |
| WebAgent 命名误导 | web-agent    | 🟡 中    | 实际只是 MCP 代理，不含 AI                  |
| 无认证机制        | web-agent    | 🟡 中    | 任何人都可连接                              |

---

## 八、总结

| 维度       | next-sdk | next-remoter | web-agent |
| ---------- | -------- | ------------ | --------- |
| 功能完整性 | ⭐⭐⭐   | ⭐⭐⭐       | ⭐⭐⭐    |
| 安全性     | ⭐⭐     | ⭐           | ⭐⭐      |
| 体积控制   | ⭐⭐⭐   | ⭐           | ⭐⭐⭐⭐  |
| 项目成熟度 | ⭐⭐     | ⭐⭐         | ⭐        |
| 文档质量   | ⭐⭐⭐   | ⭐⭐⭐       | ⭐⭐⭐    |
| 生产可用性 | ⭐       | ⭐           | ⭐        |
| 推荐程度   | ⭐       | ⭐           | ⭐⭐      |

> **说明**：next-sdk 的评分已考虑「无法绕开 next-remoter 单独使用」这一事实。官方文档所有示例都要求同时安装两个包，next-sdk 本身的价值被 next-remoter 的问题拖累。

**最终结论：整个 SDK 生态（next-sdk + next-remoter + web-agent）不建议接入。**

核心问题：

1. `next-sdk` 无法绕开 `next-remoter` 单独使用，官方设计就是配套使用
2. `next-remoter` 硬编码默认外发，即使配置了本地服务也无法完全阻止
3. 23MB 的 bundle 体积，生产环境不可接受
4. WebAgent 命名误导，实际只是 MCP 代理
5. 整个架构把 LLM 调用放在前端，违背安全最佳实践
6. MCP 工具需要手动逐个注册，页面改动工具同步修改，开发维护成本极高
7. 项目极度不成熟（31 stars / 5 stars），长期维护存在不确定性

**建议：弃用，等待更成熟的 MCP 前端方案出现，或自行实现轻量级方案。**
