# 离屏通信 Demo 实现计划

## 需求概述

实现一个左右布局的 Demo：
- **左侧**：显示 JSON 数据和一些控制按钮
- **右侧**：表单区域
- **联动功能**：
  - 左侧按钮可以修改右侧表单的值
  - 右侧表单修改时，左侧 JSON 实时联动显示
- **离屏功能**：
  - 右侧表单可以拖到另一个屏幕显示
  - 离屏时左侧占满整个页面

## 技术方案

采用分层策略：
- **同屏时**：直接使用 Vue props/v-model 数据绑定
- **离屏时**：使用 `window.open()` + `postMessage` 进行跨窗口通信

## 文件结构

```
src/views/assembly/offScreenComm/
├── index.vue                  # 主页面（左右布局容器）
├── components/
│   ├── LeftPanel.vue          # 左侧面板（JSON显示 + 按钮）
│   └── RightForm.vue          # 右侧表单组件
├── OffScreenWindow.vue        # 离屏窗口页面（通过 URL 参数加载）
├── utils/
│   └── channelManager.ts      # postMessage 通信封装
└── index.scss                 # 样式文件
```

## 数据流设计

```mermaid
flowchart TD
    subgraph 同屏模式
        A[index.vue] <-- v-model --> B[RightForm]
        A <-- props --> C[LeftPanel]
    end

    subgraph 离屏模式
        D[index.vue] -- postMessage init --> E[OffScreenWindow]
        E -- postMessage update --> D
        D -- postMessage setValue --> E
    end

    A -- 切换离屏 --> D
    D -- 关闭离屏 --> A
```

## 通信协议

```typescript
// 消息类型
type MessageType = 'init' | 'update' | 'setValue' | 'close' | 'ping'

// 消息格式
interface Message {
  type: MessageType
  data?: any
  timestamp?: number
}
```

## 布局切换逻辑

```mermaid
flowchart TD
    A[开始] --> B{是否离屏?}
    B -->|否| C[左右布局<br/>左侧50% 右侧50%]
    B -->|是| D[左侧占满100%<br/>隐藏右侧]
    C --> E{用户操作?}
    D --> E
    E -->|点击离屏| F[window.open新窗口]
    E -->|关闭离屏| G[isOffScreen = false<br/>关闭窗口]
    E -->|表单修改| H[更新JSON显示<br/>同步到离屏窗口]
```

## 实现步骤

### 1. channelManager.ts - 通信工具
- `ChannelManager` 类封装 postMessage
- `postMessage(type, data)` - 发送消息
- `onMessage(callback)` - 监听消息
- `close()` - 关闭连接

### 2. RightForm.vue - 右侧表单组件
- 表单字段：用户名、邮箱、手机号、状态
- 支持 `v-model` 双向绑定
- 触发 `change` 事件通知父组件

### 3. LeftPanel.vue - 左侧面板
- JSON 显示区域（实时显示表单数据）
- 控制按钮：
  - "打开离屏窗口" - 打开新窗口
  - "关闭离屏窗口" - 关闭新窗口
  - "设置表单值" - 预设几个按钮修改表单

### 4. OffScreenWindow.vue - 离屏窗口
- 通过 URL 参数接收初始数据
- 表单修改时发送 `update` 消息给主窗口
- 接收主窗口发来的 `setValue` 消息更新表单

### 5. index.vue - 主页面
- 左右布局（flex）
- 状态管理：
  - `formData` - 表单数据
  - `isOffScreen` - 是否离屏状态
  - `offscreenWindow` - 离屏窗口引用
- 联动逻辑：
  - 左侧按钮 → 更新 formData → 同步到右侧/离屏窗口
  - 右侧表单 change → 更新 formData → 更新左侧 JSON

## 样式要点

- 主窗口：flex 布局
- 离屏窗口：正常宽度，最大宽度限制
- 响应式：无复杂花哨效果，简洁实用
