import React, { useRef } from 'react'
import cn from 'classnames'
import { useThumbnailStore, useEPlayerStore, type FileNode } from '../../../../stores'
import styles from './ThumbnailGrid.module.less'
import { AutoSizer, Grid } from 'react-virtualized'
import { AiFillFileText, AiFillFileUnknown } from 'react-icons/ai'
import { VscFile } from 'react-icons/vsc'
import { FaFileCode } from 'react-icons/fa'

interface ThumbnailGridProps {
  className?: string
}

const ThumbnailGrid: React.FC<ThumbnailGridProps> = ({ className }) => {
  const {
    selectedFiles,
    halfSelectedFiles,
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

  const gridRef = useRef<Grid>(null)
  const columnCountRef = useRef(1)

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

  const getFileIcon = (file: FileNode) => {
    const ext = file.extension?.toLowerCase()
    if (ext === 'json') return <FaFileCode size={48} color="#f4b400" />
    if (ext === 'txt' || ext === 'text') return <AiFillFileText size={48} color="#1890ff" />
    if (ext === 'log') return <VscFile size={48} color="#8e44ad" />
    return <AiFillFileUnknown size={48} color="#aaa" />
  }

  return (
    <div className={cn(styles.thumbnailGrid, className)}>
      <div className={styles.toolbar}>
        <h3 className={styles.title}>缩略图</h3>
        <button
          type="button"
          style={{ marginLeft: 12 }}
          onClick={() => {
            const columnCount = columnCountRef.current || 1
            const rowIndex = Math.floor(10333 / columnCount)
            if (gridRef.current) {
              gridRef.current.scrollToCell({
                columnIndex: 0,
                rowIndex,
              })
            }
          }}
        >
          跳转到10333
        </button>
        
        <div className={styles.controls}>
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
        <div style={{ flex: 1, minHeight: 0, height: 'calc(100vh - 120px)' }}>
          <AutoSizer>
            {({ width, height }: { width: number; height: number }) => {
              let thumbnailWidth = 150, thumbnailHeight = 200
              if (thumbnailSize === 'small') { thumbnailWidth = 100; thumbnailHeight = 130 }
              if (thumbnailSize === 'large') { thumbnailWidth = 200; thumbnailHeight = 260 }
              const gap = 8
              const cellWidth = thumbnailWidth + gap * 2
              const cellHeight = thumbnailHeight + gap * 2
              const columnCount = Math.max(1, Math.floor(width / cellWidth))
              const rowCount = Math.ceil(sortedFiles.length / columnCount)
              columnCountRef.current = columnCount
              return (
                <Grid
                  ref={gridRef}
                  columnCount={columnCount}
                  columnWidth={cellWidth}
                  height={height}
                  rowCount={rowCount}
                  rowHeight={cellHeight}
                  width={width}
                  cellRenderer={({ columnIndex, rowIndex, key, style }: { columnIndex: number; rowIndex: number; key: string; style: React.CSSProperties }) => {
                    const index = rowIndex * columnCount + columnIndex
                    if (index >= sortedFiles.length) return null
                    const file = sortedFiles[index]
                    return (
                      <div
                        key={key}
                        style={{
                          ...style,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <div
                          className={cn(
                            styles.thumbnailItem,
                            getThumbnailSizeClass(),
                            {
                              [styles.selected]: selectedFiles.includes(file.id),
                              [styles.halfSelected]: !selectedFiles.includes(file.id) && halfSelectedFiles?.includes(file.id),
                              [styles.clickable]: file.type === 'image'
                            }
                          )}
                          style={{
                            margin: gap,
                            width: thumbnailWidth,
                            height: thumbnailHeight,
                            boxSizing: 'border-box',
                          }}
                          onClick={(e) => handleImageClick(file, e)}
                        >
                          <div className={styles.thumbnailImageContainer}>
                            {file.type === 'image' ? (
                              <img
                                src={file.thumbnail || `https://picsum.photos/150/150?random=${file.id}`}
                                alt={file.name}
                                className={styles.thumbnailImage}
                              />
                            ) : file.type === 'video' ? (
                              <>
                                <img
                                  src={file.thumbnail || `https://picsum.photos/150/150?random=${file.id}`}
                                  alt={file.name}
                                  className={styles.thumbnailImage}
                                />
                                <div className={styles.videoIndicator}>▶</div>
                              </>
                            ) : (
                              getFileIcon(file)
                            )}
                          </div>
                          <div className={styles.thumbnailInfo}>
                            <div className={styles.thumbnailName}>{file.name}</div>
                            <div className={styles.thumbnailDetails}>
                              {(file.size / 1024 / 1024).toFixed(1)}MB | {file.extension.toUpperCase()}
                            </div>
                            {file.metadata?.width && file.metadata?.height && (
                              <div className={styles.thumbnailDimensions}>
                                {file.metadata.width} × {file.metadata.height} {index}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  }}
                />
              )
            }}
          </AutoSizer>
        </div>
      )}
    </div>
  )
}

export default ThumbnailGrid