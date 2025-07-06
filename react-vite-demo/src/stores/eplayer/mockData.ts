import type { DirectoryNode, FileNode } from './types'
import { useDirectoryTreeStore } from './directoryTree'
import { useEPlayerStore } from './eplayer'

// 生成随机ID
const generateId = () => Math.random().toString(36).substr(2, 9)

// 批量生成图片文件
const mockFiles: FileNode[] = Array.from({ length: 20000 }).map((_, i) => ({
  id: generateId(),
  name: `图片${i + 1}.jpg`,
  path: `/images/landscape${i + 1}.jpg`,
  size: 1024 * 1024 * (1 + Math.random() * 4),
  type: 'image',
  extension: 'jpg',
  lastModified: new Date(`2024-01-${(i % 28) + 1}`),
  thumbnail: `http://127.0.0.1:8080/cae5548fb6c3bb761df999c543cd468c.jpg`,
  metadata: {
    width: 1200 + Math.floor(Math.random() * 800),
    height: 800 + Math.floor(Math.random() * 600)
  }
}))

// 模拟目录结构
export const mockDirectoryTree: DirectoryNode = {
  id: generateId(),
  name: '根目录',
  path: '/',
  isExpanded: true,
  lastModified: new Date('2024-01-01'),
  children: [
    {
      id: generateId(),
      name: '图片文件夹',
      path: '/images',
      isExpanded: true,
      lastModified: new Date('2024-01-10'),
      children: [
        {
          id: generateId(),
          name: '风景',
          path: '/images/landscape',
          isExpanded: true,
          lastModified: new Date('2024-01-12'),
          children: mockFiles
        }
      ]
    }
  ]
}

// 初始化store的辅助函数
export const initializeMockData = () => {
  useDirectoryTreeStore.getState().setRootNode(mockDirectoryTree)
  useEPlayerStore.getState().navigateToDirectory('/images/landscape')
}

export { mockFiles } 