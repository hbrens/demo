import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { useDirectoryTreeStore } from './directoryTree'
import { useThumbnailStore } from './thumbnail'
import { useImageViewerStore } from './imageViewer'
import type { FileNode } from './types'

interface EPlayerState {
  // 全局状态
  isLoading: boolean
  error: string | null
  currentView: 'directory' | 'thumbnail' | 'viewer'
  
  // 联动状态
  currentDirectoryFiles: FileNode[]
  selectedImageIndex: number
}

interface EPlayerStore extends EPlayerState {
  // Actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setCurrentView: (view: 'directory' | 'thumbnail' | 'viewer') => void
  
  // 联动Actions
  openImage: (image: FileNode) => void
  openImages: (images: FileNode[]) => void
  openImageByIndex: (index: number) => void
  navigateToDirectory: (path: string) => void
  selectFilesInCurrentDirectory: (fileIds: string[]) => void
  refreshCurrentDirectory: () => void
  
  // 快捷键支持
  handleKeyboardShortcut: (key: string, ctrlKey?: boolean) => void
}

export const useEPlayerStore = create<EPlayerStore>()(
  devtools(
    (set, get) => ({
      // 初始状态
      isLoading: false,
      error: null,
      currentView: 'directory',
      currentDirectoryFiles: [],
      selectedImageIndex: -1,

      // Actions
      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      setCurrentView: (view) => set({ currentView: view }),

      // 联动Actions
      openImage: (image) => {
        const { currentDirectoryFiles } = get()
        const imageIndex = currentDirectoryFiles.findIndex(file => file.id === image.id)
        
        set({ selectedImageIndex: imageIndex })
        useImageViewerStore.getState().clearWindows()
        useImageViewerStore.getState().addWindow(image)
        set({ currentView: 'viewer' })
      },

      openImages: (images) => {
        if (images.length === 0) return
        
        const { currentDirectoryFiles } = get()
        const firstImageIndex = currentDirectoryFiles.findIndex(file => file.id === images[0].id)
        
        set({ selectedImageIndex: firstImageIndex })
        useImageViewerStore.getState().clearWindows()
        
        // 最多添加4张图片
        const imagesToShow = images.slice(0, 4)
        
        imagesToShow.forEach(image => {
          useImageViewerStore.getState().addWindow(image)
        })
        
        set({ currentView: 'viewer' })
      },

      openImageByIndex: (index) => {
        const { currentDirectoryFiles } = get()
        if (index >= 0 && index < currentDirectoryFiles.length) {
          const image = currentDirectoryFiles[index]
          set({ selectedImageIndex: index })
          useImageViewerStore.getState().clearWindows()
          useImageViewerStore.getState().addWindow(image)
          set({ currentView: 'viewer' })
        }
      },

      navigateToDirectory: (path) => {
        // 更新目录树store
        useDirectoryTreeStore.getState().setCurrentPath(path)
        
        // 获取当前目录的文件
        const files = useDirectoryTreeStore.getState().getCurrentDirectoryFiles()
        set({ currentDirectoryFiles: files })
        
        // 清空缩略图选择
        useThumbnailStore.getState().deselectAll()
        
        // 切换到缩略图视图
        set({ currentView: 'thumbnail' })
      },

      selectFilesInCurrentDirectory: (fileIds) => {
        useThumbnailStore.getState().setSelectedFiles(fileIds)
      },

      refreshCurrentDirectory: () => {
        const files = useDirectoryTreeStore.getState().getCurrentDirectoryFiles()
        set({ currentDirectoryFiles: files })
      },

      // 快捷键支持
      handleKeyboardShortcut: (key, ctrlKey = false) => {
        const { currentView, selectedImageIndex, currentDirectoryFiles } = get()
        
        switch (key) {
          case 'ArrowRight':
            if (currentView === 'viewer' && selectedImageIndex < currentDirectoryFiles.length - 1) {
              get().openImageByIndex(selectedImageIndex + 1)
            }
            break
            
          case 'ArrowLeft':
            if (currentView === 'viewer' && selectedImageIndex > 0) {
              get().openImageByIndex(selectedImageIndex - 1)
            }
            break
            
          case 'Escape':
            if (currentView === 'viewer') {
              set({ currentView: 'thumbnail' })
              useImageViewerStore.getState().clearWindows()
            }
            break
            
          case 'f':
            if (currentView === 'viewer') {
              useImageViewerStore.getState().toggleFullscreen()
            }
            break
            
          case 'r':
            if (currentView === 'viewer') {
              useImageViewerStore.getState().resetAllWindows()
            }
            break
            
          case 'a':
            if (ctrlKey && currentView === 'thumbnail') {
              const allFileIds = currentDirectoryFiles.map(file => file.id)
              useThumbnailStore.getState().setSelectedFiles(allFileIds)
            }
            break
            
          case 'd':
            if (ctrlKey && currentView === 'thumbnail') {
              useThumbnailStore.getState().deselectAll()
            }
            break
        }
      }
    }),
    {
      name: 'eplayer-store'
    }
  )
)

// 创建store之间的联动
export const initializeStoreConnections = () => {
  // 监听目录树变化，更新当前目录文件
  useDirectoryTreeStore.subscribe((state) => {
    if (state.currentPath) {
      const files = state.getCurrentDirectoryFiles()
      useEPlayerStore.setState({ currentDirectoryFiles: files })
    }
  })

  // 监听缩略图选择变化
  useThumbnailStore.subscribe(() => {
    // 可以在这里添加选择变化时的逻辑
  })

  // 监听图片查看器变化
  useImageViewerStore.subscribe(() => {
    // 可以在这里添加图片查看器状态变化时的逻辑
  })
} 