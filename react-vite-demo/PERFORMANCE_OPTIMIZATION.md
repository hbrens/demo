# 图片查看器性能优化总结

## 问题分析

### 原始性能问题
1. **图片加载慢**
   - 每次组件重新渲染都重新创建 Image 对象
   - 没有图片缓存机制
   - 使用外部图片服务导致网络延迟

2. **拖拽移动卡顿**
   - `handleDragMove` 频繁调用 `moveAllWindows`
   - 每次拖拽都触发所有窗口重新渲染
   - 没有防抖或节流机制

3. **状态更新效率低**
   - 批量操作方法使用 `forEach` 循环多次更新状态
   - 依赖项过多导致不必要的重新计算

## 优化方案

### 1. 图片加载优化
- ✅ **添加图片缓存机制**: 使用 `Map` 缓存已加载的图片
- ✅ **图片预加载**: 在组件挂载时预加载所有窗口的图片
- ✅ **优化图片加载 Hook**: 使用 `useImageLoader` 统一管理图片加载状态
- ✅ **错误处理**: 添加图片加载失败的处理逻辑

### 2. 拖拽性能优化
- ✅ **防抖机制**: 使用 16ms 防抖（约60fps）优化拖拽移动
- ✅ **拖拽状态管理**: 添加 `isDragging` 状态避免不必要的更新
- ✅ **批量状态更新**: 优化 `moveAllWindows` 方法，一次性更新所有窗口

### 3. 状态管理优化
- ✅ **批量更新**: 将 `forEach` 循环改为 `map` 批量更新
- ✅ **减少状态变更**: 优化 `zoomAllWindows` 和 `rotateAllWindows` 方法
- ✅ **Memo 优化**: 使用 `useMemo` 优化滤镜计算

### 4. 性能监控
- ✅ **性能统计**: 添加缓存命中率、加载次数等统计信息
- ✅ **性能面板**: 按 `Ctrl+P` 显示性能统计面板
- ✅ **实时监控**: 监控图片缓存和预加载状态

## 性能提升效果

### 预期改进
1. **图片加载速度**: 缓存机制可提升 50-80% 的加载速度
2. **拖拽流畅度**: 防抖机制可减少 60-70% 的卡顿
3. **内存使用**: 缓存机制可减少重复加载，优化内存使用
4. **用户体验**: 预加载机制提供更流畅的切换体验

### 使用建议
1. **查看性能**: 按 `Ctrl+P` 查看实时性能统计
2. **缓存管理**: 图片缓存会自动管理，无需手动干预
3. **网络优化**: 建议使用本地图片或 CDN 加速图片加载

## 技术细节

### 关键优化点
```typescript
// 1. 图片缓存
const imageCache = new Map<string, HTMLImageElement>()

// 2. 防抖拖拽
const debouncedMoveAll = useMemo(
  () => debounce((dx: number, dy: number) => {
    useImageViewerStore.getState().moveAllWindows(dx, dy)
  }, 16), // 约60fps
  []
)

// 3. 批量状态更新
moveAllWindows: (dx: number, dy: number) => {
  const { windows } = get()
  if (windows.length === 0) return
  
  const updatedWindows = windows.map(w => ({
    ...w,
    x: w.x + dx,
    y: w.y + dy
  }))
  
  set({ windows: updatedWindows })
}
```

### 性能监控指标
- 缓存命中率
- 缓存大小
- 预加载队列大小
- 总加载次数
- 缓存命中/未命中次数 