# EPlayer Store 架构说明

## 概述

EPlayer 使用了 Zustand 作为状态管理库，采用了模块化的 store 设计，将不同功能的状态分离到独立的 store 中，同时通过主 store 进行协调。

## Store 结构

### 1. 目录树 Store (`directoryTree.ts`)
管理文件目录结构和导航功能。

**主要功能：**
- 管理目录树结构
- 处理目录展开/折叠
- 当前路径管理
- 文件查找功能

**核心方法：**
```typescript
setRootNode(node: DirectoryNode)           // 设置根目录
setCurrentPath(path: string)               // 设置当前路径
toggleNodeExpansion(nodeId: string)        // 切换节点展开状态
getCurrentDirectoryFiles(): FileNode[]     // 获取当前目录文件
```

### 2. 缩略图 Store (`thumbnail.ts`)
管理缩略图显示、选择和排序功能。

**主要功能：**
- 文件选择管理
- 视图模式切换（网格/列表）
- 排序和筛选
- 缩略图大小控制

**核心方法：**
```typescript
setSelectedFiles(fileIds: string[])        // 设置选中文件
toggleFileSelection(fileId: string)        // 切换文件选择
setViewMode(mode: 'grid' | 'list')         // 设置视图模式
sortFiles(files: FileNode[]): FileNode[]   // 排序文件
```

### 3. 图片查看器 Store (`imageViewer.ts`)
管理图片查看器的显示状态和操作。

**主要功能：**
- 当前图片管理
- 缩放、旋转、亮度、对比度调整
- 全屏模式
- 图片导航

**核心方法：**
```typescript
setCurrentImage(image: FileNode | null)    // 设置当前图片
setZoom(zoom: number)                      // 设置缩放
rotateLeft() / rotateRight()               // 旋转操作
setBrightness(brightness: number)          // 设置亮度
toggleFullscreen()                         // 切换全屏
```

### 4. 主 EPlayer Store (`eplayer.ts`)
协调各个子 store 的联动，提供全局状态管理。

**主要功能：**
- 全局状态管理（加载、错误、当前视图）
- store 之间的联动
- 快捷键处理
- 导航逻辑

**核心方法：**
```typescript
openImage(image: FileNode)                 // 打开图片
navigateToDirectory(path: string)          // 导航到目录
handleKeyboardShortcut(key, ctrl, shift)   // 处理快捷键
```

## 使用示例

### 在组件中使用 store

```typescript
import { useEPlayerStore, useImageViewerStore } from '../../stores'

const MyComponent = () => {
  // 使用主 store
  const { currentView, openImage } = useEPlayerStore()
  
  // 使用图片查看器 store
  const { currentImage, zoom, zoomIn } = useImageViewerStore()
  
  return (
    <div>
      <button onClick={() => openImage(someImage)}>打开图片</button>
      <button onClick={zoomIn}>放大</button>
    </div>
  )
}
```

### 初始化数据

```typescript
import { initializeMockData } from './stores/mockData'

// 在应用启动时初始化模拟数据
useEffect(() => {
  initializeMockData()
}, [])
```

## Store 联动机制

### 1. 目录导航联动
当用户点击目录树中的目录时：
1. `directoryTree` store 更新当前路径
2. `eplayer` store 监听到路径变化
3. 获取新目录的文件列表
4. 更新 `thumbnail` store 的选择状态
5. 切换到缩略图视图

### 2. 图片查看联动
当用户在缩略图中点击图片时：
1. `thumbnail` store 更新选择状态
2. `eplayer` store 的 `openImage` 方法被调用
3. 更新 `imageViewer` store 的当前图片
4. 重置图片调整参数
5. 切换到图片查看器视图

### 3. 快捷键联动
键盘事件通过 `eplayer` store 统一处理：
- 方向键：在图片查看器中切换图片
- F 键：切换全屏模式
- R 键：重置图片调整
- Ctrl+A：全选文件
- Ctrl+D：取消选择

## 类型定义

所有类型定义都在 `types.ts` 文件中：

```typescript
interface FileNode {
  id: string
  name: string
  path: string
  size: number
  type: 'image' | 'video' | 'document'
  extension: string
  lastModified: Date
  thumbnail?: string
  metadata?: {
    width?: number
    height?: number
    duration?: number
  }
}

interface DirectoryNode {
  id: string
  name: string
  path: string
  isExpanded: boolean
  children: (DirectoryNode | FileNode)[]
  lastModified: Date
}
```

## 开发建议

1. **状态分离**：每个 store 只管理自己相关的状态，避免状态重复
2. **联动处理**：通过主 store 处理 store 之间的联动，保持子 store 的独立性
3. **类型安全**：充分利用 TypeScript 类型系统，确保类型安全
4. **性能优化**：使用 Zustand 的选择器功能，避免不必要的重渲染
5. **调试支持**：使用 devtools 中间件，方便调试状态变化 