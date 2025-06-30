import { create } from 'zustand'
import type { FileNode } from './types'

// 预留空结构，方便后续重写
interface ImageViewerStore {
  // 这里可以添加你后续需要的状态和方法
}

export const useImageViewerStore = create<ImageViewerStore>(() => ({
  // 空实现
})) 