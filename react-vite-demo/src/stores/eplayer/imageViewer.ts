import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { FileNode, ImageViewerState } from './types'

interface ImageWindow {
  id: string
  image: FileNode
  x: number
  y: number
  scale: number
  rotation: number
  brightness: number
  contrast: number
}

interface ImageViewerStore extends Omit<ImageViewerState, 'currentImage'> {
  // 多窗口状态
  windows: ImageWindow[]
  activeWindowId: string | null
  isMultiSelect: boolean
  
  // Actions
  setWindows: (windows: ImageWindow[]) => void
  addWindow: (image: FileNode) => void
  removeWindow: (windowId: string) => void
  clearWindows: () => void
  setActiveWindow: (windowId: string | null) => void
  setIsMultiSelect: (isMulti: boolean) => void
  
  // 窗口操作
  updateWindow: (windowId: string, updates: Partial<ImageWindow>) => void
  updateAllWindows: (updates: Partial<Omit<ImageWindow, 'id' | 'image'>>) => void
  
  // 缩放操作
  zoomWindow: (windowId: string, delta: number) => void
  zoomAllWindows: (delta: number) => void
  resetZoom: (windowId?: string) => void
  
  // 移动操作
  moveWindow: (windowId: string, dx: number, dy: number) => void
  moveAllWindows: (dx: number, dy: number) => void
  
  // 旋转操作
  rotateWindow: (windowId: string, delta: number) => void
  rotateAllWindows: (delta: number) => void
  
  // 调整操作
  setBrightness: (windowId: string, brightness: number) => void
  setContrast: (windowId: string, contrast: number) => void
  setBrightnessAll: (brightness: number) => void
  setContrastAll: (contrast: number) => void
  
  // 重置操作
  resetWindow: (windowId: string) => void
  resetAllWindows: () => void
  
  // 全屏
  toggleFullscreen: () => void
  isFullscreen: boolean
}

export const useImageViewerStore = create<ImageViewerStore>()(
  devtools(
    (set, get) => ({
      // 初始状态
      windows: [],
      activeWindowId: null,
      isMultiSelect: false,
      isFullscreen: false,
      zoom: 1,
      rotation: 0,
      brightness: 100,
      contrast: 100,

      // Actions
      setWindows: (windows) => set({ windows }),

      addWindow: (image) => {
        const { windows } = get()
        
        if (windows.length >= 4) {
          return // 最多4个窗口
        }
        
        const newWindow: ImageWindow = {
          id: `window-${Date.now()}-${Math.random()}`,
          image,
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0,
          brightness: 100,
          contrast: 100
        }
        
        set((state) => ({
          windows: [...state.windows, newWindow],
          activeWindowId: newWindow.id
        }))
      },

      removeWindow: (windowId) => {
        set((state) => ({
          windows: state.windows.filter(w => w.id !== windowId),
          activeWindowId: state.activeWindowId === windowId ? null : state.activeWindowId
        }))
      },

      clearWindows: () => set({ windows: [], activeWindowId: null }),

      setActiveWindow: (windowId) => set({ activeWindowId: windowId }),

      setIsMultiSelect: (isMulti) => set({ isMultiSelect: isMulti }),

      // 窗口操作
      updateWindow: (windowId, updates) => {
        set((state) => ({
          windows: state.windows.map(w => 
            w.id === windowId ? { ...w, ...updates } : w
          )
        }))
      },

      updateAllWindows: (updates) => {
        set((state) => ({
          windows: state.windows.map(w => ({ ...w, ...updates }))
        }))
      },

      // 缩放操作
      zoomWindow: (windowId, delta) => {
        const { windows } = get()
        const window = windows.find(w => w.id === windowId)
        if (!window) return
        
        const newScale = Math.max(0.1, Math.min(5, window.scale + delta))
        get().updateWindow(windowId, { scale: newScale })
      },

      zoomAllWindows: (delta) => {
        // 优化：批量更新所有窗口的缩放
        const { windows } = get()
        if (windows.length === 0) return
        
        const updatedWindows = windows.map(w => ({
          ...w,
          scale: Math.max(0.1, Math.min(5, w.scale + delta))
        }))
        
        set({ windows: updatedWindows })
      },

      resetZoom: (windowId) => {
        if (windowId) {
          get().updateWindow(windowId, { scale: 1 })
        } else {
          get().updateAllWindows({ scale: 1 })
        }
      },

      // 移动操作
      moveWindow: (windowId: string, dx: number, dy: number) => {
        const { windows } = get()
        const window = windows.find(w => w.id === windowId)
        if (!window) return
        
        get().updateWindow(windowId, {
          x: window.x + dx,
          y: window.y + dy
        })
      },

      moveAllWindows: (dx: number, dy: number) => {
        // 优化：直接批量更新所有窗口，避免多次状态变更
        const { windows } = get()
        if (windows.length === 0) return
        
        const updatedWindows = windows.map(w => ({
          ...w,
          x: w.x + dx,
          y: w.y + dy
        }))
        
        set({ windows: updatedWindows })
      },

      // 旋转操作
      rotateWindow: (windowId, delta) => {
        const { windows } = get()
        const window = windows.find(w => w.id === windowId)
        if (!window) return
        
        const newRotation = ((window.rotation + delta) % 360 + 360) % 360
        get().updateWindow(windowId, { rotation: newRotation })
      },

      rotateAllWindows: (delta) => {
        // 优化：批量更新所有窗口的旋转
        const { windows } = get()
        if (windows.length === 0) return
        
        const updatedWindows = windows.map(w => ({
          ...w,
          rotation: ((w.rotation + delta) % 360 + 360) % 360
        }))
        
        set({ windows: updatedWindows })
      },

      // 调整操作
      setBrightness: (windowId, brightness) => {
        const clampedBrightness = Math.max(0, Math.min(200, brightness))
        get().updateWindow(windowId, { brightness: clampedBrightness })
      },

      setContrast: (windowId, contrast) => {
        const clampedContrast = Math.max(0, Math.min(200, contrast))
        get().updateWindow(windowId, { contrast: clampedContrast })
      },

      setBrightnessAll: (brightness) => {
        const clampedBrightness = Math.max(0, Math.min(200, brightness))
        get().updateAllWindows({ brightness: clampedBrightness })
      },

      setContrastAll: (contrast) => {
        const clampedContrast = Math.max(0, Math.min(200, contrast))
        get().updateAllWindows({ contrast: clampedContrast })
      },

      // 重置操作
      resetWindow: (windowId) => {
        get().updateWindow(windowId, {
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0,
          brightness: 100,
          contrast: 100
        })
      },

      resetAllWindows: () => {
        get().updateAllWindows({
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0,
          brightness: 100,
          contrast: 100
        })
      },

      // 全屏
      toggleFullscreen: () => {
        set((state) => ({ isFullscreen: !state.isFullscreen }))
      },

      // 兼容旧接口
      setCurrentImage: (image: FileNode | null) => {
        if (image) {
          get().clearWindows()
          get().addWindow(image)
        } else {
          get().clearWindows()
        }
      },

      setZoom: (zoom: number) => {
        const clampedZoom = Math.max(0.1, Math.min(5, zoom))
        get().updateAllWindows({ scale: clampedZoom })
      },

      zoomIn: () => get().zoomAllWindows(0.2),

      zoomOut: () => get().zoomAllWindows(-0.2),

      setRotation: (rotation: number) => {
        const normalizedRotation = ((rotation % 360) + 360) % 360
        get().updateAllWindows({ rotation: normalizedRotation })
      },

      rotateLeft: () => get().rotateAllWindows(-90),

      rotateRight: () => get().rotateAllWindows(90),

      resetAdjustments: () => get().resetAllWindows(),

      nextImage: () => {
        console.log('Next image - 需要与缩略图store联动')
      },

      previousImage: () => {
        console.log('Previous image - 需要与缩略图store联动')
      }
    }),
    {
      name: 'image-viewer-store'
    }
  )
) 