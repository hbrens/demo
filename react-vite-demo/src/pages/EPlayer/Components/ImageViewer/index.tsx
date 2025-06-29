import React, { useEffect } from 'react'
import cn from 'classnames'
import { useImageViewerStore, useEPlayerStore } from '../../../../stores'
import styles from './ImageViewer.module.less'

interface ImageViewerProps {
  className?: string
}

const ImageViewer: React.FC<ImageViewerProps> = ({ className }) => {
  const {
    currentImage,
    isFullscreen,
    zoom,
    rotation,
    brightness,
    contrast,
    setZoom,
    resetZoom,
    zoomIn,
    zoomOut,
    setRotation,
    rotateLeft,
    rotateRight,
    setBrightness,
    setContrast,
    resetAdjustments,
    toggleFullscreen
  } = useImageViewerStore()

  const { currentView, handleKeyboardShortcut } = useEPlayerStore()

  // 键盘事件处理
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (currentView === 'viewer') {
        handleKeyboardShortcut(event.key, event.ctrlKey, event.shiftKey)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentView, handleKeyboardShortcut])

  if (!currentImage) {
    return (
      <div className={cn(styles.imageViewer, className)}>
        <div className={styles.emptyState}>
          <h3>请选择一张图片进行查看</h3>
          <p>在缩略图网格中点击图片即可查看</p>
        </div>
      </div>
    )
  }

  const imageStyle = {
    transform: `scale(${zoom}) rotate(${rotation}deg)`,
    filter: `brightness(${brightness}%) contrast(${contrast}%)`
  }

  return (
    <div className={cn(styles.imageViewer, className, { [styles.fullscreen]: isFullscreen })}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <h3 className={styles.title}>{currentImage.name}</h3>
          <span className={styles.imageInfo}>
            {currentImage.metadata?.width} x {currentImage.metadata?.height} | 
            {(currentImage.size / 1024 / 1024).toFixed(1)}MB | 
            {currentImage.extension.toUpperCase()}
          </span>
        </div>
        
        <div className={styles.toolbarRight}>
          <button onClick={zoomOut} title="缩小 (Ctrl + -)">-</button>
          <span>{Math.round(zoom * 100)}%</span>
          <button onClick={zoomIn} title="放大 (Ctrl + +)">+</button>
          <button onClick={resetZoom} title="重置缩放">100%</button>
          
          <button onClick={rotateLeft} title="向左旋转">↶</button>
          <button onClick={rotateRight} title="向右旋转">↷</button>
          
          <button onClick={resetAdjustments} title="重置调整">重置</button>
          <button onClick={toggleFullscreen} title="全屏 (F)">全屏</button>
        </div>
      </div>

      <div className={styles.viewerContainer}>
        <div className={styles.imageContainer}>
          <img 
            src={currentImage.thumbnail || `https://picsum.photos/600/400?random=${currentImage.id}`}
            alt={currentImage.name}
            className={styles.mainImage}
            style={imageStyle}
          />
        </div>
      </div>

      <div className={styles.adjustmentPanel}>
        <div className={styles.adjustmentItem}>
          <label>亮度</label>
          <input
            type="range"
            min="0"
            max="200"
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
          />
          <span>{brightness}%</span>
        </div>
        
        <div className={styles.adjustmentItem}>
          <label>对比度</label>
          <input
            type="range"
            min="0"
            max="200"
            value={contrast}
            onChange={(e) => setContrast(Number(e.target.value))}
          />
          <span>{contrast}%</span>
        </div>
      </div>
    </div>
  )
}

export default ImageViewer 