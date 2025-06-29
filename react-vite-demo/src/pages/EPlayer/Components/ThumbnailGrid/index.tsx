import React from 'react'
import cn from 'classnames'
import { useThumbnailStore, useEPlayerStore, type FileNode } from '../../../../stores'
import styles from './ThumbnailGrid.module.less'

interface ThumbnailGridProps {
  className?: string
}

const ThumbnailGrid: React.FC<ThumbnailGridProps> = ({ className }) => {
  const {
    selectedFiles,
    viewMode,
    sortBy,
    sortOrder,
    thumbnailSize,
    toggleFileSelection,
    setViewMode,
    setSortBy,
    setSortOrder,
    setThumbnailSize,
    sortFiles
  } = useThumbnailStore()

  const { currentDirectoryFiles, openImage, openImages } = useEPlayerStore()

  // 处理图片点击
  const handleImageClick = (file: FileNode, event: React.MouseEvent) => {
    if (file.type === 'image') {
      if (event.ctrlKey || event.metaKey) {
        // Ctrl/Cmd + 点击，多选模式
        const newSelectedFiles = selectedFiles.includes(file.id)
          ? selectedFiles.filter((id: string) => id !== file.id)
          : [...selectedFiles, file.id]
        
        useThumbnailStore.getState().setSelectedFiles(newSelectedFiles)
        
        // 获取选中的图片文件（使用更新后的选择列表）
        const selectedImageFiles = currentDirectoryFiles.filter(f => 
          newSelectedFiles.includes(f.id) && f.type === 'image'
        )
        
        // 只有当有选中的图片时才打开查看器
        if (selectedImageFiles.length > 0) {
          openImages(selectedImageFiles)
        } else {
          // 如果没有选中的图片，清空查看器
          useEPlayerStore.getState().setCurrentView('thumbnail')
        }
      } else {
        // 普通点击，单选模式
        useThumbnailStore.getState().setSelectedFiles([file.id])
        openImage(file)
      }
    }
  }

  // 处理缩略图选择 - 移除重复逻辑，只保留基本的选择状态管理
  const handleThumbnailSelect = (fileId: string, event: React.MouseEvent) => {
    // 这个函数现在只处理选择状态的视觉反馈，不处理图片打开逻辑
    // 图片打开逻辑完全由 handleImageClick 处理
  }

  // 排序文件
  const sortedFiles = sortFiles(currentDirectoryFiles)

  // 根据缩略图大小设置样式类
  const getThumbnailSizeClass = () => {
    switch (thumbnailSize) {
      case 'small': return styles.small
      case 'large': return styles.large
      default: return styles.medium
    }
  }

  return (
    <div className={cn(styles.thumbnailGrid, className)}>
      <div className={styles.toolbar}>
        <h3 className={styles.title}>缩略图</h3>
        
        <div className={styles.controls}>
          <select 
            value={viewMode} 
            onChange={(e) => setViewMode(e.target.value as 'grid' | 'list')}
            className={styles.viewModeSelect}
          >
            <option value="grid">网格视图</option>
            <option value="list">列表视图</option>
          </select>

          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'size' | 'type')}
            className={styles.sortSelect}
          >
            <option value="name">按名称</option>
            <option value="date">按日期</option>
            <option value="size">按大小</option>
            <option value="type">按类型</option>
          </select>

          <button 
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className={styles.sortOrderBtn}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>

          <select 
            value={thumbnailSize} 
            onChange={(e) => setThumbnailSize(e.target.value as 'small' | 'medium' | 'large')}
            className={styles.sizeSelect}
          >
            <option value="small">小</option>
            <option value="medium">中</option>
            <option value="large">大</option>
          </select>
        </div>
      </div>

      {currentDirectoryFiles.length === 0 ? (
        <div className={styles.emptyState}>
          <p>当前目录没有文件</p>
        </div>
      ) : (
        <div className={cn(styles.gridContainer, { [styles.listView]: viewMode === 'list' })}>
          {sortedFiles.map((file: FileNode) => (
            <div 
              key={file.id} 
              className={cn(
                styles.thumbnailItem,
                getThumbnailSizeClass(),
                { 
                  [styles.selected]: selectedFiles.includes(file.id),
                  [styles.clickable]: file.type === 'image'
                }
              )}
              onClick={(e) => {
                handleImageClick(file, e)
              }}
            >
              <div className={styles.thumbnailImageContainer}>
                <img 
                  src={file.thumbnail || `https://picsum.photos/150/150?random=${file.id}`}
                  alt={file.name}
                  className={styles.thumbnailImage}
                />
                {file.type === 'video' && (
                  <div className={styles.videoIndicator}>▶</div>
                )}
              </div>
              <div className={styles.thumbnailInfo}>
                <div className={styles.thumbnailName}>{file.name}</div>
                <div className={styles.thumbnailDetails}>
                  {(file.size / 1024 / 1024).toFixed(1)}MB | {file.extension.toUpperCase()}
                </div>
                {file.metadata?.width && file.metadata?.height && (
                  <div className={styles.thumbnailDimensions}>
                    {file.metadata.width} × {file.metadata.height}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ThumbnailGrid