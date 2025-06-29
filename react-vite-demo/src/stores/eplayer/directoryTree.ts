import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { DirectoryNode, FileNode, DirectoryTreeState } from './types'

interface DirectoryTreeStore extends DirectoryTreeState {
  // Actions
  setRootNode: (node: DirectoryNode) => void
  setCurrentPath: (path: string) => void
  toggleNodeExpansion: (nodeId: string) => void
  setSelectedNode: (nodeId: string | null) => void
  expandNode: (nodeId: string) => void
  collapseNode: (nodeId: string) => void
  expandAll: () => void
  collapseAll: () => void
  findNodeByPath: (path: string) => DirectoryNode | FileNode | null
  getCurrentDirectoryFiles: () => FileNode[]
}

export const useDirectoryTreeStore = create<DirectoryTreeStore>()(
  devtools(
    (set, get) => ({
      // 初始状态
      rootNode: null,
      currentPath: '',
      expandedNodes: [],
      selectedNode: null,

      // Actions
      setRootNode: (node) => set({ rootNode: node }),

      setCurrentPath: (path) => set({ currentPath: path }),

      toggleNodeExpansion: (nodeId) => {
        set((state) => {
          const isExpanded = state.expandedNodes.includes(nodeId)
          const newExpandedNodes = isExpanded
            ? state.expandedNodes.filter(id => id !== nodeId)
            : [...state.expandedNodes, nodeId]
          
          return { expandedNodes: newExpandedNodes }
        })
      },

      setSelectedNode: (nodeId) => set({ selectedNode: nodeId }),

      expandNode: (nodeId) => {
        set((state) => ({
          expandedNodes: state.expandedNodes.includes(nodeId)
            ? state.expandedNodes
            : [...state.expandedNodes, nodeId]
        }))
      },

      collapseNode: (nodeId) => {
        set((state) => ({
          expandedNodes: state.expandedNodes.filter(id => id !== nodeId)
        }))
      },

      expandAll: () => {
        const { rootNode } = get()
        if (!rootNode) return

        const getAllNodeIds = (node: DirectoryNode): string[] => {
          const ids = [node.id]
          node.children.forEach(child => {
            if ('children' in child) {
              ids.push(...getAllNodeIds(child))
            }
          })
          return ids
        }

        const allNodeIds = getAllNodeIds(rootNode)
        set({ expandedNodes: allNodeIds })
      },

      collapseAll: () => set({ expandedNodes: [] }),

      findNodeByPath: (path) => {
        const { rootNode } = get()
        if (!rootNode) return null

        const findNode = (node: DirectoryNode, targetPath: string): DirectoryNode | FileNode | null => {
          if (node.path === targetPath) return node
          
          for (const child of node.children) {
            if (child.path === targetPath) return child
            if ('children' in child) {
              const found = findNode(child, targetPath)
              if (found) return found
            }
          }
          return null
        }

        return findNode(rootNode, path)
      },

      getCurrentDirectoryFiles: () => {
        const { currentPath, rootNode } = get()
        if (!rootNode || !currentPath) return []

        const findDirectory = (node: DirectoryNode, targetPath: string): DirectoryNode | null => {
          if (node.path === targetPath) return node
          
          for (const child of node.children) {
            if ('children' in child) {
              const found = findDirectory(child, targetPath)
              if (found) return found
            }
          }
          return null
        }

        const currentDir = findDirectory(rootNode, currentPath)
        if (!currentDir) return []

        return currentDir.children.filter(child => !('children' in child)) as FileNode[]
      }
    }),
    {
      name: 'directory-tree-store'
    }
  )
) 