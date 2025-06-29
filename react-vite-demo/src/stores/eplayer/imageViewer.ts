import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { FileNode, ImageViewerState } from './types'

interface ImageViewerStore extends ImageViewerState {
  // Actions
  setCurrentImage: (image: FileNode | null) => void
  toggleFullscreen: () => void
  setZoom: (zoom: number) => void
  resetZoom: () => void
  zoomIn: () => void
  zoomOut: () => void
  setRotation: (rotation: number) => void
  rotateLeft: () => void
  rotateRight: () => void
  setBrightness: (brightness: number) => void
  setContrast: (contrast: number) => void
  resetAdjustments: () => void
  nextImage: () => void
  previousImage: () => void
}

export const useImageViewerStore = create<ImageViewerStore>()(
  devtools(
    (set, get) => ({
      // 初始状态
      currentImage: null,
      isFullscreen: false,
      zoom: 1,
      rotation: 0,
      brightness: 100,
      contrast: 100,

      // Actions
      setCurrentImage: (image) => set({ currentImage: image }),

      toggleFullscreen: () => {
        set((state) => ({ isFullscreen: !state.isFullscreen }))
      },

      setZoom: (zoom) => {
        const clampedZoom = Math.max(0.1, Math.min(5, zoom))
        set({ zoom: clampedZoom })
      },

      resetZoom: () => set({ zoom: 1 }),

      zoomIn: () => {
        const { zoom } = get()
        const newZoom = Math.min(5, zoom * 1.2)
        set({ zoom: newZoom })
      },

      zoomOut: () => {
        const { zoom } = get()
        const newZoom = Math.max(0.1, zoom / 1.2)
        set({ zoom: newZoom })
      },

      setRotation: (rotation) => {
        const normalizedRotation = ((rotation % 360) + 360) % 360
        set({ rotation: normalizedRotation })
      },

      rotateLeft: () => {
        const { rotation } = get()
        const newRotation = ((rotation - 90) % 360 + 360) % 360
        set({ rotation: newRotation })
      },

      rotateRight: () => {
        const { rotation } = get()
        const newRotation = ((rotation + 90) % 360 + 360) % 360
        set({ rotation: newRotation })
      },

      setBrightness: (brightness) => {
        const clampedBrightness = Math.max(0, Math.min(200, brightness))
        set({ brightness: clampedBrightness })
      },

      setContrast: (contrast) => {
        const clampedContrast = Math.max(0, Math.min(200, contrast))
        set({ contrast: clampedContrast })
      },

      resetAdjustments: () => {
        set({
          zoom: 1,
          rotation: 0,
          brightness: 100,
          contrast: 100
        })
      },

      nextImage: () => {
        // 这里需要从缩略图store获取当前选中的文件列表
        // 暂时为空实现，实际使用时需要联动
        console.log('Next image - 需要与缩略图store联动')
      },

      previousImage: () => {
        // 这里需要从缩略图store获取当前选中的文件列表
        // 暂时为空实现，实际使用时需要联动
        console.log('Previous image - 需要与缩略图store联动')
      }
    }),
    {
      name: 'image-viewer-store'
    }
  )
) 