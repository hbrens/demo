import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Stage, Layer, Image, Group, Rect } from 'react-konva'
import cn from 'classnames'
import { useImageViewerStore, useEPlayerStore } from '../../../../stores'
import styles from './ImageViewer.module.less'

interface ImageViewerProps {
  className?: string
}

interface ImageWindowProps {
  window: any
  isActive: boolean
  onActivate: () => void
  onClose: () => void
  onZoom: (delta: number) => void
  onRotate: (delta: number) => void
  onReset: () => void
  onDrag: (dx: number, dy: number) => void
}

// 自定义 hook 处理 Konva Stage 的响应式尺寸
const useKonvaStage = (containerRef: React.RefObject<HTMLDivElement | null>) => {
  const [size, setSize] = useState({ width: 0, height: 0 })
  const stageRef = useRef<any>(null)

  const updateSize = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const newSize = { width: rect.width, height: rect.height }
      
      if (newSize.width !== size.width || newSize.height !== size.height) {
        setSize(newSize)
        
        // 直接设置 Stage 尺寸
        if (stageRef.current) {
          stageRef.current.width(newSize.width)
          stageRef.current.height(newSize.height)
          stageRef.current.batchDraw()
        }
      }
    }
  }, [containerRef, size.width, size.height])

  useEffect(() => {
    if (!containerRef.current) return

    // 初始设置
    const initTimer = setTimeout(updateSize, 50)

    // ResizeObserver
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(updateSize)
    })
    resizeObserver.observe(containerRef.current)

    // 窗口 resize
    const handleResize = () => {
      setTimeout(updateSize, 100)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      clearTimeout(initTimer)
      resizeObserver.disconnect()
      window.removeEventListener('resize', handleResize)
    }
  }, [updateSize])

  return { size, stageRef, updateSize }
}

const ImageWindow: React.FC<ImageWindowProps> = ({
  window: imgWindow,
  isActive,
  onActivate,
  onClose,
  onZoom,
  onRotate,
  onReset,
  onDrag
}) => {
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const { size, stageRef, updateSize } = useKonvaStage(contentRef)

  useEffect(() => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      setImageElement(img)
      // 图片加载完成后更新尺寸
      setTimeout(updateSize, 10)
    }
    img.src = imgWindow.image.thumbnail || `https://picsum.photos/600/400?random=${imgWindow.image.id}`
  }, [imgWindow.image, updateSize])

  // 确保在组件挂载后立即更新尺寸
  useEffect(() => {
    const timer = setTimeout(updateSize, 100)
    return () => clearTimeout(timer)
  }, [updateSize])

  const handleWheel = (e: any) => {
    e.evt.preventDefault()
    const delta = e.evt.deltaY > 0 ? -0.1 : 0.1
    onZoom(delta)
  }

  const handleDragEnd = (e: any) => {
    const dx = e.target.x() - imgWindow.x
    const dy = e.target.y() - imgWindow.y
    onDrag(dx, dy)
  }

  if (!imageElement) {
    return (
      <div className={cn(styles.windowContainer, { [styles.active]: isActive })} onClick={onActivate}>
        <div className={styles.windowToolbar}>
          <span className={styles.windowTitle}>{imgWindow.image.name}</span>
          <button onClick={(e) => { e.stopPropagation(); onClose(); }} className={styles.closeBtn}>×</button>
        </div>
        <div className={styles.loadingState}>
          <p>加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(styles.windowContainer, { [styles.active]: isActive })} onClick={onActivate}>
      {/* 窗口工具栏 */}
      <div className={styles.windowToolbar}>
        <span className={styles.windowTitle}>{imgWindow.image.name}</span>
        <div className={styles.windowControls}>
          <button onClick={(e) => { e.stopPropagation(); onRotate(-90); }} title="向左旋转">↶</button>
          <button onClick={(e) => { e.stopPropagation(); onRotate(90); }} title="向右旋转">↷</button>
          <button onClick={(e) => { e.stopPropagation(); onZoom(0.2); }} title="放大">+</button>
          <button onClick={(e) => { e.stopPropagation(); onZoom(-0.2); }} title="缩小">-</button>
          <button onClick={(e) => { e.stopPropagation(); onReset(); }} title="重置">重置</button>
          <button onClick={(e) => { e.stopPropagation(); onClose(); }} className={styles.closeBtn}>×</button>
        </div>
      </div>
      {/* 图片显示区域 */}
      <div className={styles.windowContent} ref={contentRef}>
        {size.width > 0 && size.height > 0 && (
          <Stage
            ref={stageRef}
            width={size.width}
            height={size.height}
            onWheel={handleWheel}
          >
            <Layer>
              <Group
                x={imgWindow.x}
                y={imgWindow.y}
                scaleX={imgWindow.scale}
                scaleY={imgWindow.scale}
                rotation={imgWindow.rotation}
                draggable
                onDragEnd={handleDragEnd}
              >
                <Image
                  image={imageElement}
                  width={imageElement.width}
                  height={imageElement.height}
                  filters={[
                    {
                      brightness: (imgWindow.brightness - 100) / 100,
                      contrast: (imgWindow.contrast - 100) / 100
                    } as any
                  ]}
                />
                {isActive && (
                  <Rect
                    x={-2}
                    y={-2}
                    width={imageElement.width + 4}
                    height={imageElement.height + 4}
                    stroke="#1890ff"
                    strokeWidth={2}
                    dash={[5, 5]}
                  />
                )}
              </Group>
            </Layer>
          </Stage>
        )}
      </div>
    </div>
  )
}

const ImageViewer: React.FC<ImageViewerProps> = ({ className }) => {
  const {
    windows,
    activeWindowId,
    isFullscreen,
    setActiveWindow,
    zoomWindow,
    zoomAllWindows,
    moveWindow,
    rotateWindow,
    rotateAllWindows,
    resetWindow,
    resetAllWindows,
    toggleFullscreen,
    clearWindows,
    removeWindow
  } = useImageViewerStore()

  const { currentView, handleKeyboardShortcut } = useEPlayerStore()

  // 键盘事件处理
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (currentView === 'viewer') {
        handleKeyboardShortcut(event.key, event.ctrlKey)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentView, handleKeyboardShortcut])

  if (windows.length === 0) {
    return (
      <div className={cn(styles.imageViewer, className)}>
        <div className={styles.emptyState}>
          <h3>请选择图片进行查看</h3>
          <p>在缩略图网格中点击图片即可查看</p>
        </div>
      </div>
    )
  }

  // 根据窗口数量确定布局
  const getLayoutClass = () => {
    switch (windows.length) {
      case 1: return styles.layout1
      case 2: return styles.layout2
      case 3: return styles.layout3
      case 4: return styles.layout4
      default: return styles.layout4
    }
  }

  return (
    <div className={cn(styles.imageViewer, className, { [styles.fullscreen]: isFullscreen })}>
      {/* 多窗口容器 */}
      <div className={cn(styles.windowsContainer, getLayoutClass())}>
        {windows.map((window: any) => (
          <ImageWindow
            key={window.id}
            window={window}
            isActive={window.id === activeWindowId}
            onActivate={() => setActiveWindow(window.id)}
            onClose={() => removeWindow(window.id)}
            onZoom={(delta) => zoomWindow(window.id, delta)}
            onRotate={(delta) => rotateWindow(window.id, delta)}
            onReset={() => resetWindow(window.id)}
            onDrag={(dx, dy) => moveWindow(window.id, dx, dy)}
          />
        ))}
      </div>
    </div>
  )
}

export default ImageViewer 