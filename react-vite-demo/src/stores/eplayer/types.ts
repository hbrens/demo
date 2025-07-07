// 文件节点类型
export interface FileNode {
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

// 目录节点类型
export interface DirectoryNode {
  id: string
  name: string
  path: string
  isExpanded: boolean
  children: (DirectoryNode | FileNode)[]
  lastModified: Date
}

// 图片查看器状态类型
export interface ImageViewerState {
  currentImage: FileNode | null
  isFullscreen: boolean
  zoom: number
  rotation: number
  brightness: number
  contrast: number
}

// 缩略图网格状态类型
export interface ThumbnailGridState {
  selectedFiles: string[]
  halfSelectedFiles: string[]
  viewMode: 'grid' | 'list'
  sortBy: 'name' | 'date' | 'size' | 'type'
  sortOrder: 'asc' | 'desc'
  thumbnailSize: 'small' | 'medium' | 'large'
}

// 目录树状态类型
export interface DirectoryTreeState {
  rootNode: DirectoryNode | null
  currentPath: string
  expandedNodes: string[]
  selectedNode: string | null
} 