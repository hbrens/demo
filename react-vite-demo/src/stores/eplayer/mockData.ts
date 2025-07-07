import type { DirectoryNode, FileNode } from './types'
import { useDirectoryTreeStore } from './directoryTree'
import { useEPlayerStore } from './eplayer'

// 生成随机ID
const generateId = () => Math.random().toString(36).substr(2, 9)

// 批量生成图片文件
const mockFiles: FileNode[] = Array.from({ length: 200 }).map((_, i) => {
  // 随机决定文件类型
  const rand = Math.random();
  if (rand < 0.002) { // 约20个json
    return {
      id: generateId(),
      name: `数据${i + 1}.json`,
      path: `/files/data${i + 1}.json`,
      size: 2048 + Math.floor(Math.random() * 2048),
      type: 'document',
      extension: 'json',
      lastModified: new Date(`2024-01-${(i % 28) + 1}`),
      thumbnail: '',
      metadata: {}
    }
  }
  if (rand < 0.04) { // 约20个txt
    return {
      id: generateId(),
      name: `说明${i + 1}.txt`,
      path: `/files/readme${i + 1}.txt`,
      size: 1024 + Math.floor(Math.random() * 1024),
      type: 'document',
      extension: 'txt',
      lastModified: new Date(`2024-01-${(i % 28) + 1}`),
      thumbnail: '',
      metadata: {}
    }
  }
  if (rand < 0.06) { // 约20个log
    return {
      id: generateId(),
      name: `日志${i + 1}.log`,
      path: `/files/logs${i + 1}.log`,
      size: 4096 + Math.floor(Math.random() * 4096),
      type: 'document',
      extension: 'log',
      lastModified: new Date(`2024-01-${(i % 28) + 1}`),
      thumbnail: '',
      metadata: {}
    }
  }
  if (rand < 0.08) { // 约20个未知类型
    return {
      id: generateId(),
      name: `未知类型${i + 1}.abc`,
      path: `/files/unknown${i + 1}.abc`,
      size: 512 + Math.floor(Math.random() * 512),
      type: 'document',
      extension: 'abc',
      lastModified: new Date(`2024-01-${(i % 28) + 1}`),
      thumbnail: '',
      metadata: {}
    }
  }
  // 其它为图片
  return {
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
  }
});

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