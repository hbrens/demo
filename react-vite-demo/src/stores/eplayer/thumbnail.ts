import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { FileNode, ThumbnailGridState } from './types'

interface ThumbnailStore extends ThumbnailGridState {
  // Actions
  setSelectedFiles: (fileIds: string[]) => void
  toggleFileSelection: (fileId: string) => void
  selectAll: () => void
  deselectAll: () => void
  setViewMode: (mode: 'grid' | 'list') => void
  setSortBy: (sortBy: 'name' | 'date' | 'size' | 'type') => void
  setSortOrder: (order: 'asc' | 'desc') => void
  setThumbnailSize: (size: 'small' | 'medium' | 'large') => void
  sortFiles: (files: FileNode[]) => FileNode[]
  setHalfSelectedFiles: (fileIds: string[]) => void
}

export const useThumbnailStore = create<ThumbnailStore>()(
  devtools(
    (set, get) => ({
      // 初始状态
      selectedFiles: [],
      halfSelectedFiles: [],
      viewMode: 'grid',
      sortBy: 'name',
      sortOrder: 'asc',
      thumbnailSize: 'small',

      // Actions
      setSelectedFiles: (fileIds) => set({ selectedFiles: fileIds }),
      setHalfSelectedFiles: (fileIds) => set({ halfSelectedFiles: fileIds }),

      toggleFileSelection: (fileId) => {
        set((state) => {
          const isSelected = state.selectedFiles.includes(fileId)
          const newSelectedFiles = isSelected
            ? state.selectedFiles.filter(id => id !== fileId)
            : [...state.selectedFiles, fileId]
          
          return { selectedFiles: newSelectedFiles }
        })
      },

      selectAll: () => {
        // 这里需要从目录树store获取当前目录的文件
        // 暂时设置为空数组，实际使用时需要联动
        set({ selectedFiles: [] })
      },

      deselectAll: () => set({ selectedFiles: [] }),

      setViewMode: (mode) => set({ viewMode: mode }),

      setSortBy: (sortBy) => set({ sortBy }),

      setSortOrder: (order) => set({ sortOrder: order }),

      setThumbnailSize: (size) => set({ thumbnailSize: size }),

      sortFiles: (files) => {
        const { sortBy, sortOrder } = get()
        
        return [...files].sort((a, b) => {
          let comparison = 0
          
          switch (sortBy) {
            case 'name':
              comparison = a.name.localeCompare(b.name)
              break
            case 'date':
              comparison = a.lastModified.getTime() - b.lastModified.getTime()
              break
            case 'size':
              comparison = a.size - b.size
              break
            case 'type':
              comparison = a.extension.localeCompare(b.extension)
              break
          }
          
          return sortOrder === 'asc' ? comparison : -comparison
        })
      }
    }),
    {
      name: 'thumbnail-store'
    }
  )
) 