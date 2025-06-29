import React, { useRef, useEffect, useState, useCallback } from 'react'
import './KnovaDemo.css'

interface CanvasState {
  scale: number
  offsetX: number
  offsetY: number
}

const KnovaDemo: React.FC = () => {
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([])
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map())
  const [canvasState, setCanvasState] = useState<CanvasState>({
    scale: 1,
    offsetX: 0,
    offsetY: 0
  })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imagesLoaded, setImagesLoaded] = useState(false)

  // 固定的图片地址
  const imageUrls = [
    'https://picsum.photos/400/300?random=1',
    'https://picsum.photos/400/300?random=2',
    'https://picsum.photos/400/300?random=3',
    'https://picsum.photos/400/300?random=4'
  ]

  // 加载图片（带缓存）
  const loadImage = useCallback((url: string): Promise<HTMLImageElement> => {
    // 如果缓存中已有，直接返回
    if (imageCache.current.has(url)) {
      return Promise.resolve(imageCache.current.get(url)!)
    }

    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        imageCache.current.set(url, img)
        resolve(img)
      }
      img.onerror = reject
      img.src = url
    })
  }, [])

  // 绘制 canvas（使用缓存的图片）
  const drawCanvas = useCallback(async (canvas: HTMLCanvasElement, imageUrl: string) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    try {
      const img = imageCache.current.get(imageUrl)
      if (!img) return

      const { scale, offsetX, offsetY } = canvasState

      // 清空 canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 保存当前状态
      ctx.save()

      // 应用变换
      ctx.translate(offsetX, offsetY)
      ctx.scale(scale, scale)

      // 计算图片居中位置
      const imgX = (canvas.width / scale - img.width) / 2
      const imgY = (canvas.height / scale - img.height) / 2

      // 绘制图片
      ctx.drawImage(img, imgX, imgY, img.width, img.height)

      // 恢复状态
      ctx.restore()
    } catch (error) {
      console.error('Failed to draw image:', error)
    }
  }, [canvasState])

  // 预加载所有图片
  const preloadImages = useCallback(async () => {
    try {
      const promises = imageUrls.map(url => loadImage(url))
      await Promise.all(promises)
      setImagesLoaded(true)
    } catch (error) {
      console.error('Failed to preload images:', error)
    }
  }, [imageUrls, loadImage])

  // 更新所有 canvas（只重绘，不重新加载图片）
  const updateAllCanvases = useCallback(async () => {
    if (!imagesLoaded) return
    
    const promises = canvasRefs.current.map((canvas, index) => {
      if (canvas && imageUrls[index]) {
        return drawCanvas(canvas, imageUrls[index])
      }
      return Promise.resolve()
    })
    await Promise.all(promises)
  }, [drawCanvas, imageUrls, imagesLoaded])

  // 初始化 canvas 和预加载图片
  useEffect(() => {
    canvasRefs.current.forEach((canvas, index) => {
      if (canvas) {
        canvas.width = 600
        canvas.height = 450
      }
    })
    preloadImages()
  }, [preloadImages])

  // 当 canvas 状态改变时重新绘制（图片已缓存）
  useEffect(() => {
    if (imagesLoaded) {
      updateAllCanvases()
    }
  }, [canvasState, updateAllCanvases, imagesLoaded])

  // 处理鼠标滚轮缩放
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newScale = Math.max(0.1, Math.min(5, canvasState.scale * delta))
    
    setCanvasState(prev => ({
      ...prev,
      scale: newScale
    }))
  }, [canvasState.scale])

  // 处理鼠标按下
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }, [])

  // 处理鼠标移动
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return

    const deltaX = e.clientX - dragStart.x
    const deltaY = e.clientY - dragStart.y

    setCanvasState(prev => ({
      ...prev,
      offsetX: prev.offsetX + deltaX,
      offsetY: prev.offsetY + deltaY
    }))

    setDragStart({ x: e.clientX, y: e.clientY })
  }, [isDragging, dragStart])

  // 处理鼠标松开
  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // 重置变换
  const handleReset = useCallback(() => {
    setCanvasState({
      scale: 1,
      offsetX: 0,
      offsetY: 0
    })
  }, [])

  return (
    <div className="knova-demo">
      <div className="demo-header">
        <h1>Knova Demo - 四画布同步缩放</h1>
        <button onClick={handleReset} className="reset-btn">
          重置
        </button>
      </div>
      
      <div className="canvas-container">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="canvas-wrapper">
            <h3>画布 {index + 1}</h3>
            <canvas
              ref={(el) => {
                canvasRefs.current[index] = el
              }}
              className="demo-canvas"
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            />
            {!imagesLoaded && (
              <div className="loading-overlay">加载中...</div>
            )}
          </div>
        ))}
      </div>

      <div className="demo-info">
        <p>缩放: {canvasState.scale.toFixed(2)}x</p>
        <p>偏移: X={canvasState.offsetX.toFixed(0)}, Y={canvasState.offsetY.toFixed(0)}</p>
        <p>操作说明: 鼠标滚轮缩放，鼠标拖拽移动</p>
        <p>状态: {imagesLoaded ? '图片已加载' : '图片加载中...'}</p>
      </div>
    </div>
  )
}

export default KnovaDemo 