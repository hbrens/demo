import React, { useState, useCallback, useRef } from 'react'
import DirectoryTree from '../DirectoryTree'
import ThumbnailGrid from '../ThumbnailGrid'
import ImageViewer from '../ImageViewer'
import Resizer from '../Resizer'
import styles from './EPLayerLayout.module.less'

const EPLayerLayout: React.FC = () => {
  // 左侧面板宽度状态
  const [leftPanelWidth, setLeftPanelWidth] = useState(250)
  const [middlePanelWidth, setMiddlePanelWidth] = useState(400)
  
  // 拖拽状态
  const leftStartWidth = useRef(250)
  const middleStartWidth = useRef(400)
  const isDraggingLeft = useRef(false)
  const isDraggingMiddle = useRef(false)
  
  // 处理左侧分隔条拖拽
  const handleLeftResize = useCallback((deltaX: number) => {
    if (!isDraggingLeft.current) {
      isDraggingLeft.current = true
      leftStartWidth.current = leftPanelWidth
    }
    
    const newWidth = leftStartWidth.current + deltaX
    const clampedWidth = Math.max(150, Math.min(400, newWidth))
    setLeftPanelWidth(clampedWidth)
  }, [leftPanelWidth])
  
  // 处理中间分隔条拖拽
  const handleMiddleResize = useCallback((deltaX: number) => {
    if (!isDraggingMiddle.current) {
      isDraggingMiddle.current = true
      middleStartWidth.current = middlePanelWidth
    }
    
    const newWidth = middleStartWidth.current + deltaX
    const clampedWidth = Math.max(200, Math.min(600, newWidth))
    setMiddlePanelWidth(clampedWidth)
  }, [middlePanelWidth])
  
  // 拖拽结束处理
  const handleMouseUp = useCallback(() => {
    isDraggingLeft.current = false
    isDraggingMiddle.current = false
  }, [])
  
  React.useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseUp])

  return (
    <div className={styles.eplayerLayout}>
      {/* 左侧目录树 */}
      {/* <div 
        className={styles.leftPanel}
        style={{ width: `${leftPanelWidth}px` }}
      >
        <DirectoryTree />
      </div> */}
      
      {/* 左侧分隔条 */}
      {/* <Resizer onResize={handleLeftResize} /> */}
      
      {/* 中间缩略图 */}
      {/* <div 
        className={styles.middlePanel}
        style={{ width: `${middlePanelWidth}px` }}
      >
        <ThumbnailGrid />
      </div> */}
      
      {/* 中间分隔条 */}
      <Resizer onResize={handleMiddleResize} />
      
      {/* 右侧图片查看器 */}
      <div className={styles.rightPanel}>
        <ImageViewer />
      </div>
    </div>
  )
}

export default EPLayerLayout 