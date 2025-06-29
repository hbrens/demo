import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import cn from 'classnames'
import { useImageViewerStore, useEPlayerStore } from '@/stores'
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
  isBottomWindow: boolean
}

// 图片缓存
const imageCache = new Map<string, HTMLImageElement>()

// 预加载队列
const preloadQueue = new Set<string>()

// 性能监控
const performanceStats = {
  cacheHits: 0,
  cacheMisses: 0,
  totalLoads: 0
}

// 获取性能统计
const getPerformanceStats = () => {
  return {
    ...performanceStats,
    cacheSize: imageCache.size,
    preloadQueueSize: preloadQueue.size,
    hitRate: performanceStats.totalLoads > 0 ? (performanceStats.cacheHits / performanceStats.totalLoads * 100).toFixed(1) : '0'
  }
}

// 预加载图片
const preloadImage = (url: string) => {
  if (imageCache.has(url) || preloadQueue.has(url)) return
  
  preloadQueue.add(url)
  const img = new window.Image()
  img.crossOrigin = 'anonymous'
  
  img.onload = () => {
    imageCache.set(url, img)
    preloadQueue.delete(url)
  }
  
  img.onerror = () => {
    preloadQueue.delete(url)
  }
  
  img.src = url
}

// 防抖函数
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// 图片加载 hook
const useImageLoader = (imageUrl: string) => {
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!imageUrl) {
      setError('图片URL为空')
      setIsLoading(false)
      return
    }

    performanceStats.totalLoads++

    // 检查缓存
    if (imageCache.has(imageUrl)) {
      performanceStats.cacheHits++
      setImageElement(imageCache.get(imageUrl)!)
      setIsLoading(false)
      return
    }

    performanceStats.cacheMisses++
    setIsLoading(true)
    setError(null)

    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    
    // 设置加载超时
    const timeoutId = setTimeout(() => {
      setError('图片加载超时')
      setIsLoading(false)
    }, 5000) // 5秒超时
    
    img.onload = () => {
      clearTimeout(timeoutId)
      // 缓存图片
      imageCache.set(imageUrl, img)
      setImageElement(img)
      setIsLoading(false)
    }
    
    img.onerror = () => {
      clearTimeout(timeoutId)
      setError('图片加载失败')
      setIsLoading(false)
      console.error('图片加载失败:', imageUrl)
    }
    
    img.src = imageUrl

    return () => {
      clearTimeout(timeoutId)
      img.onload = null
      img.onerror = null
    }
  }, [imageUrl])

  return { imageElement, isLoading, error }
}

// 生成更好的图片URL
const generateImageUrl = (image: any, size: 'thumbnail' | 'full' = 'full') => {
  // 如果有缩略图，优先使用
  if (image.thumbnail) {
    return image.thumbnail
  }
  
  // 如果有路径，尝试使用本地路径
  if (image.path) {
    return image.path
  }
  
  // 直接使用最稳定的图片服务
  const width = size === 'thumbnail' ? 150 : 800
  const height = size === 'thumbnail' ? 150 : 600
  
  // 使用 placeholder.com，最稳定
  return `https://via.placeholder.com/${width}x${height}/f0f0f0/666666?text=${encodeURIComponent(image.name || 'Image')}`
}

// 生成本地Canvas图片（更快）
const generateLocalImage = (image: any, size: 'thumbnail' | 'full' = 'full') => {
  const width = size === 'thumbnail' ? 150 : 800
  const height = size === 'thumbnail' ? 150 : 600
  
  // 创建Canvas
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  
  if (!ctx) return null
  
  // 绘制白色背景
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)
  
  // 绘制渐变背景
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#f8f9fa')
  gradient.addColorStop(0.5, '#e9ecef')
  gradient.addColorStop(1, '#dee2e6')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  
  // 绘制图片图标
  ctx.fillStyle = '#6c757d'
  ctx.font = `${Math.min(width, height) / 8}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  
  // 绘制图片名称
  const text = image.name || `图片 ${image.id}`
  const maxWidth = width * 0.8
  const fontSize = Math.min(width, height) / 10
  
  // 如果文字太长，截断
  let displayText = text
  if (ctx.measureText(text).width > maxWidth) {
    displayText = text.substring(0, Math.floor(maxWidth / fontSize * 2)) + '...'
  }
  
  ctx.font = `${fontSize}px Arial`
  ctx.fillText(displayText, width / 2, height / 2)
  
  // 绘制边框
  ctx.strokeStyle = '#adb5bd'
  ctx.lineWidth = 1
  ctx.strokeRect(0, 0, width, height)
  
  // 绘制内边框
  ctx.strokeStyle = '#ced4da'
  ctx.lineWidth = 1
  ctx.strokeRect(2, 2, width - 4, height - 4)
  
  return canvas.toDataURL('image/png', 0.9)
}

const ImageWindow: React.FC<ImageWindowProps> = ({
  window: imgWindow,
  isActive,
  onActivate,
  onClose,
  onZoom,
  onRotate,
  onReset,
  onDrag,
  isBottomWindow
}) => {
  const [isCtrlPressed, setIsCtrlPressed] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, windowX: 0, windowY: 0 })
  const [needsCentering, setNeedsCentering] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  
  // 使用优化的图片加载
  const imageUrl = generateImageUrl(imgWindow.image, 'full')
  const { imageElement, isLoading, error } = useImageLoader(imageUrl)

  // 监听Ctrl键状态
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Control') {
        setIsCtrlPressed(true)
      }
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Control') {
        setIsCtrlPressed(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // 图片初始居中逻辑
  useEffect(() => {
    if (imageElement && containerRef.current && needsCentering && imgWindow.x === 0 && imgWindow.y === 0 && imgWindow.scale === 1) {
      const container = containerRef.current
      const containerRect = container.getBoundingClientRect()
      const containerWidth = containerRect.width
      const containerHeight = containerRect.height
      
      // 计算图片在容器中的实际显示尺寸
      const imageWidth = imageElement.width
      const imageHeight = imageElement.height
      
      // 计算缩放比例，确保图片完全显示在容器内
      const scaleX = containerWidth / imageWidth
      const scaleY = containerHeight / imageHeight
      const scale = Math.min(scaleX, scaleY, 1) // 不超过原始大小
      
      // 计算居中位置
      const scaledWidth = imageWidth * scale
      const scaledHeight = imageHeight * scale
      const centerX = (containerWidth - scaledWidth) / 2
      const centerY = (containerHeight - scaledHeight) / 2
      
      // 设置初始位置和缩放
      if (centerX !== 0 || centerY !== 0) {
        onDrag(centerX, centerY)
      }
      if (scale !== 1) {
        onZoom(scale - 1)
      }
      
      setNeedsCentering(false)
    }
  }, [imageElement, needsCentering, imgWindow.x, imgWindow.y, imgWindow.scale, onDrag, onZoom])

  // 监听重置操作，重新触发居中
  useEffect(() => {
    if (imgWindow.x === 0 && imgWindow.y === 0 && imgWindow.scale === 1 && !needsCentering) {
      setNeedsCentering(true)
    }
  }, [imgWindow.x, imgWindow.y, imgWindow.scale, needsCentering])

  // 鼠标滚轮事件处理
  const handleWheel = useCallback((e: React.WheelEvent) => {
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    // 根据Ctrl键状态决定操作单窗口还是所有窗口
    if (isCtrlPressed) {
      onZoom(delta)
    } else {
      // 操作所有窗口
      useImageViewerStore.getState().zoomAllWindows(delta)
    }
  }, [isCtrlPressed, onZoom])

  // 鼠标按下事件
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return // 只处理左键
    
    setIsDragging(true)
    setDragStart({ 
      x: e.clientX, 
      y: e.clientY, 
      windowX: imgWindow.x, 
      windowY: imgWindow.y 
    })
  }, [imgWindow.x, imgWindow.y])

  // 鼠标移动事件
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return
    
    const dx = e.clientX - dragStart.x
    const dy = e.clientY - dragStart.y
    
    // 计算新的位置
    const newX = dragStart.windowX + dx
    const newY = dragStart.windowY + dy
    
    // 根据Ctrl键状态决定操作方式
    if (!isCtrlPressed) {
      // 同步操作所有窗口
      useImageViewerStore.getState().moveAllWindows(newX - imgWindow.x, newY - imgWindow.y)
    } else {
      // 单窗口操作
      const deltaX = newX - imgWindow.x
      const deltaY = newY - imgWindow.y
      onDrag(deltaX, deltaY)
    }
  }, [isDragging, dragStart, isCtrlPressed, imgWindow.x, imgWindow.y, onDrag])

  // 鼠标松开事件
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return
    
    setIsDragging(false)
  }, [isDragging])

  // 鼠标离开事件
  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
    }
  }, [isDragging])

  // 计算CSS transform样式
  const transformStyle = useMemo(() => {
    const transforms = []
    
    // 平移
    if (imgWindow.x !== 0 || imgWindow.y !== 0) {
      transforms.push(`translate(${imgWindow.x}px, ${imgWindow.y}px)`)
    }
    
    // 缩放
    if (imgWindow.scale !== 1) {
      transforms.push(`scale(${imgWindow.scale})`)
    }
    
    // 旋转
    if (imgWindow.rotation !== 0) {
      transforms.push(`rotate(${imgWindow.rotation}deg)`)
    }
    
    return transforms.length > 0 ? transforms.join(' ') : 'none'
  }, [imgWindow.x, imgWindow.y, imgWindow.scale, imgWindow.rotation])

  // 计算滤镜样式
  const filterStyle = useMemo(() => {
    const filters = []
    
    if (imgWindow.brightness !== undefined && imgWindow.brightness !== 100) {
      filters.push(`brightness(${imgWindow.brightness}%)`)
    }
    
    if (imgWindow.contrast !== undefined && imgWindow.contrast !== 100) {
      filters.push(`contrast(${imgWindow.contrast}%)`)
    }
    
    return filters.length > 0 ? filters.join(' ') : 'none'
  }, [imgWindow.brightness, imgWindow.contrast])

  if (isLoading) {
    return (
      <div className={cn(styles.windowContainer, { [styles.active]: isActive, [styles.bottomWindow]: isBottomWindow })} onClick={onActivate}>
        <div className={styles.windowToolbar}>
          <span className={styles.windowTitle}>{imgWindow.image.name}</span>
          <button onClick={(e) => { e.stopPropagation(); onClose(); }} className={styles.closeBtn}>×</button>
        </div>
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner}></div>
          <p>加载中...</p>
          <small style={{ color: '#999', fontSize: '10px' }}>
            {imageUrl.substring(0, 50)}...
          </small>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn(styles.windowContainer, { [styles.active]: isActive, [styles.bottomWindow]: isBottomWindow })} onClick={onActivate}>
        <div className={styles.windowToolbar}>
          <span className={styles.windowTitle}>{imgWindow.image.name}</span>
          <button onClick={(e) => { e.stopPropagation(); onClose(); }} className={styles.closeBtn}>×</button>
        </div>
        <div className={styles.loadingState}>
          <p style={{ color: '#ff4d4f' }}>❌ {error}</p>
          <small style={{ color: '#999', fontSize: '10px' }}>
            URL: {imageUrl.substring(0, 50)}...
          </small>
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              // 重新加载
              window.location.reload();
            }}
            style={{ 
              marginTop: '8px', 
              padding: '4px 8px', 
              background: '#1890ff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            重试
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(styles.windowContainer, { [styles.active]: isActive, [styles.bottomWindow]: isBottomWindow })} onClick={onActivate}>
      {/* 窗口工具栏 */}
      <div className={styles.windowToolbar}>
        <span className={styles.windowTitle}>{imgWindow.image.name}</span>
        <div className={styles.windowControls}>
          <button onClick={(e) => { 
            e.stopPropagation(); 
            if (isCtrlPressed) {
              onRotate(-90);
            } else {
              useImageViewerStore.getState().rotateAllWindows(-90);
            }
          }} title="向左旋转">↶</button>
          <button onClick={(e) => { 
            e.stopPropagation(); 
            if (isCtrlPressed) {
              onRotate(90);
            } else {
              useImageViewerStore.getState().rotateAllWindows(90);
            }
          }} title="向右旋转">↷</button>
          <button onClick={(e) => { 
            e.stopPropagation(); 
            if (isCtrlPressed) {
              onZoom(0.2);
            } else {
              useImageViewerStore.getState().zoomAllWindows(0.2);
            }
          }} title="放大">+</button>
          <button onClick={(e) => { 
            e.stopPropagation(); 
            if (isCtrlPressed) {
              onZoom(-0.2);
            } else {
              useImageViewerStore.getState().zoomAllWindows(-0.2);
            }
          }} title="缩小">-</button>
          <button onClick={(e) => { 
            e.stopPropagation(); 
            if (isCtrlPressed) {
              onReset();
            } else {
              useImageViewerStore.getState().resetAllWindows();
            }
          }} title="重置">重置</button>
          <button onClick={(e) => { e.stopPropagation(); onClose(); }} className={styles.closeBtn}>×</button>
        </div>
      </div>
      {/* 图片显示区域 */}
      <div 
        className={styles.windowContent} 
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{ 
          cursor: isDragging ? 'grabbing' : 'grab',
          position: 'relative',
          overflow: 'hidden',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none'
        }}
      >
        {imageElement ? (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            transform: transformStyle,
            transformOrigin: 'center center',
            transition: 'none'
          }}>
            <img
              ref={imgRef}
              src={imageUrl}
              alt={imgWindow.image.name}
              style={{
                display: 'block',
                maxWidth: '100%',
                maxHeight: '100%',
                filter: filterStyle,
                userSelect: 'none',
                pointerEvents: 'none'
              }}
              draggable={false}
            />
          </div>
        ) : (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%', 
            color: '#999',
            fontSize: '12px'
          }}>
            等待图片加载...
          </div>
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
  const [showPerformance, setShowPerformance] = useState(false)

  // 预加载所有窗口的图片
  useEffect(() => {
    windows.forEach((window: any) => {
      const imageUrl = generateImageUrl(window.image, 'full')
      preloadImage(imageUrl)
    })
  }, [windows])

  // 键盘事件处理
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (currentView === 'viewer') {
        handleKeyboardShortcut(event.key, event.ctrlKey)
        
        // 按 P 键切换性能显示
        if (event.key === 'p' && event.ctrlKey) {
          event.preventDefault()
          setShowPerformance(prev => !prev)
        }
        
        // 按 R 键强制刷新
        if (event.key === 'r' && event.ctrlKey) {
          event.preventDefault()
          imageCache.clear()
          preloadQueue.clear()
          performanceStats.cacheHits = 0
          performanceStats.cacheMisses = 0
          performanceStats.totalLoads = 0
          window.location.reload()
        }
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
      {/* 性能显示面板 */}
      {showPerformance && (
        <div className={styles.performancePanel}>
          <h4>性能统计</h4>
          <div className={styles.performanceStats}>
            {(() => {
              const stats = getPerformanceStats()
              return (
                <>
                  <div>缓存命中率: {stats.hitRate}%</div>
                  <div>缓存大小: {stats.cacheSize}</div>
                  <div>预加载队列: {stats.preloadQueueSize}</div>
                  <div>总加载次数: {stats.totalLoads}</div>
                  <div>缓存命中: {stats.cacheHits}</div>
                  <div>缓存未命中: {stats.cacheMisses}</div>
                  <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #444' }} />
                  <div>当前窗口数: {windows.length}</div>
                  {windows.map((window: any, index: number) => (
                    <div key={window.id} style={{ fontSize: '10px', marginTop: '4px' }}>
                      <div>窗口{index + 1}: {window.image.name}</div>
                      <div style={{ color: '#aaa' }}>
                        URL: {generateImageUrl(window.image, 'full').substring(0, 50)}...
                      </div>
                    </div>
                  ))}
                </>
              )
            })()}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setShowPerformance(false)}>关闭</button>
            <button 
              onClick={() => {
                // 清空缓存，重新加载
                imageCache.clear()
                preloadQueue.clear()
                performanceStats.cacheHits = 0
                performanceStats.cacheMisses = 0
                performanceStats.totalLoads = 0
                window.location.reload()
              }}
              style={{ background: '#ff4d4f' }}
            >
              清空缓存
            </button>
          </div>
        </div>
      )}
      
      {/* 多窗口容器 */}
      <div className={cn(styles.windowsContainer, getLayoutClass())}>
        {windows.map((window: any, index: number) => {
          // 为4张图片时的底部窗口添加特殊类
          const isBottomWindow = windows.length === 4 && (index === 2 || index === 3)
          
          return (
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
              isBottomWindow={isBottomWindow}
            />
          )
        })}
      </div>
    </div>
  )
}

export default ImageViewer 