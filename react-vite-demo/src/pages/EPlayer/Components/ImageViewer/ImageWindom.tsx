import Konva from "konva";
import { useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction, MutableRefObject } from "react";
import './ImageWindom.less';
import eventBus from './eventBus';

interface ImageWindowProps {
  imageUrl: string;
  index: number;
  setContainerRef: (index: number) => (el: HTMLDivElement | null) => void;
  isBottomBar: boolean;
  removeImageUrl: (index: number) => void;
}

const ImageWindow = ({ imageUrl, index, setContainerRef, isBottomBar, removeImageUrl }: ImageWindowProps) => {
  const stageRef = useRef<Konva.Stage>(null);
  const layerRef = useRef<Konva.Layer>(null);
  const imageRef = useRef<Konva.Image>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const imageStartPosRef = useRef({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const positionRef = useRef({ x: 0, y: 0 });
  // 缩放因子
  const scaleBy = 1.05;
  // 新增：覆盖层和图片引用
  const overlayLayerRef = useRef<Konva.Layer>(null);
  const overlayImageRef = useRef<Konva.Image>(null);

  // 拖动相关
  function handleMouseDown(
    e: Konva.KonvaEventObject<MouseEvent>,
    isDraggingRef: MutableRefObject<boolean>,
    positionRef: MutableRefObject<{ x: number; y: number }>,
    imageRef: MutableRefObject<Konva.Image | null>,
    imageStartPosRef: MutableRefObject<{ x: number; y: number }>
  ) {
    e.evt.preventDefault();
    isDraggingRef.current = true;
    positionRef.current = {
      x: e.evt.clientX,
      y: e.evt.clientY
    };
    if (imageRef.current) {
      imageStartPosRef.current = imageRef.current.position();
    }
  }

  function handleMouseMove(
    e: Konva.KonvaEventObject<MouseEvent>,
    isDraggingRef: MutableRefObject<boolean>,
    positionRef: MutableRefObject<{ x: number; y: number }>,
    imageRef: MutableRefObject<Konva.Image | null>,
    imageStartPosRef: MutableRefObject<{ x: number; y: number }>,
    layerRef: MutableRefObject<Konva.Layer | null>,
    stageRef: MutableRefObject<Konva.Stage | null>
  ) {
    e.evt.preventDefault();
    if (!isDraggingRef.current || !imageRef.current) return;
    // 获取当前缩放比例（layer）
    const scale = layerRef.current ? layerRef.current.scaleX() : 1;
    // 鼠标移动距离要除以缩放比例
    const delta = {
      x: (e.evt.clientX - positionRef.current.x) / scale,
      y: (e.evt.clientY - positionRef.current.y) / scale
    };
    imageRef.current.position({
      x: imageStartPosRef.current.x + delta.x,
      y: imageStartPosRef.current.y + delta.y
    });
    stageRef.current && stageRef.current.batchDraw();
  }

  function handleMouseUp(isDraggingRef: MutableRefObject<boolean>) {
    isDraggingRef.current = false;
  }

  // 缩放相关
  function handleWheel(
    e: Konva.KonvaEventObject<WheelEvent>,
    stageRef: MutableRefObject<Konva.Stage | null>,
    layerRef: MutableRefObject<Konva.Layer | null>,
    scaleBy: number,
    index: number
  ) {
    e.evt.preventDefault();
    if (!layerRef.current || !stageRef.current) return;
    const oldScale = layerRef.current.scaleX();
    const pointer = stageRef.current.getPointerPosition();
    const direction = e.evt.deltaY > 0 ? -1 : 1;
    if (!e.evt.ctrlKey && pointer) {
      // 发送 pointer 信息
      eventBus.emit('imagewindow-scale', { index, direction, pointer });
    }

    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    if (pointer) {
      // pointer 是相对于 stage 的，需要转换为 layer 的本地坐标
      const layerPos = layerRef.current.position();
      const mousePointTo = {
        x: (pointer.x - layerPos.x) / oldScale,
        y: (pointer.y - layerPos.y) / oldScale,
      };
      layerRef.current.scale({ x: newScale, y: newScale });
      const newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      };
      layerRef.current.position(newPos);
      layerRef.current.batchDraw();
    }
  }

  // 工具栏按钮事件
  const handleOverlayShow = (direction: 'left' | 'right') => {
    // direction: left 表示显示对方窗口的图片在本窗口上
    // 这里假设只有两个窗口，index 0 和 1
    const targetIndex = direction === 'left' ? 0 : 1;
    const otherIndex = direction === 'left' ? 1 : 0;
    if (index !== targetIndex) return;
    // 发送事件，要求对方窗口把图片信息传过来
    eventBus.emit('request-overlay-image', { targetIndex: otherIndex, showOn: index });
  };
  const handleOverlayHide = () => {
    // 本地复原
    overlayImageRef.current && overlayImageRef.current.visible(false);
    overlayLayerRef.current && overlayLayerRef.current.visible(false);
    overlayLayerRef.current && overlayLayerRef.current.draw();
    if (imageRef.current) {
      imageRef.current.visible(true);
      layerRef.current && layerRef.current.draw();
    }
    // 通知对方窗口复原
    const otherIndex = index === 0 ? 1 : 0;
    eventBus.emit('hide-overlay-image', { targetIndex: otherIndex });
  };

  // 事件总线接收函数
  useEffect(() => {
    const onMouseDown = (payload: any) => {
      if (payload.index === index) return;
      isDraggingRef.current = true;
      if (imageRef.current) {
        imageStartPosRef.current = imageRef.current.position();
      }
      console.log(`[窗口${index}] 收到鼠标按下事件`, payload);
    };
    const onMouseMove = (payload: any) => {
      if (payload.index === index) return;
      if (!isDraggingRef.current || !imageRef.current) return;
      const { delta } = payload;
      // 获取当前缩放比例（layer）
      const scale = layerRef.current ? layerRef.current.scaleX() : 1;
      // delta 需要除以 scale
      imageRef.current.position({
        x: imageStartPosRef.current.x + delta.x / scale,
        y: imageStartPosRef.current.y + delta.y / scale
      });
      stageRef.current && stageRef.current.batchDraw();
      console.log(`[窗口${index}] 收到拖拽事件`, payload.delta);
    };
    const onMouseUp = (payload: any) => {
      if (payload.index === index) return;
      isDraggingRef.current = false;
      console.log(`[窗口${index}] 收到鼠标松开事件`, payload);
    };
    const onScale = (payload: any) => {
      if (payload.index === index) return;
      const { direction, pointer } = payload;
      if (!layerRef.current || !stageRef.current) return;
      const oldScale = layerRef.current.scaleX();
      const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
      if (pointer) {
        const layerPos = layerRef.current.position();
        const mousePointTo = {
          x: (pointer.x - layerPos.x) / oldScale,
          y: (pointer.y - layerPos.y) / oldScale,
        };
        layerRef.current.scale({ x: newScale, y: newScale });
        const newPos = {
          x: pointer.x - mousePointTo.x * newScale,
          y: pointer.y - mousePointTo.y * newScale,
        };
        layerRef.current.position(newPos);
        layerRef.current.batchDraw();
      }
    };
    const onRequestOverlayImage = (payload: any) => {
      // 如果是发给我的，发送自己的图片信息给对方
      if (payload.targetIndex !== index) return;
      // 发送 show-overlay-image 事件，带上图片、位置、缩放等
      if (!imageRef.current) return;
      const imageObj = imageRef.current.image();
      const position = imageRef.current.position();
      const size = { width: imageRef.current.width(), height: imageRef.current.height() };
      const scale = layerRef.current ? layerRef.current.scaleX() : 1;
      eventBus.emit('show-overlay-image', {
        targetIndex: payload.showOn,
        imageObj,
        position,
        size,
        scale,
      });
    };
    const onShowOverlayImage = (payload: any) => {
      if (payload.targetIndex !== index) return;
      // 设置 overlayImage
      if (!overlayImageRef.current) return;
      overlayImageRef.current.image(payload.imageObj);
      overlayImageRef.current.width(payload.size.width);
      overlayImageRef.current.height(payload.size.height);
      overlayImageRef.current.position(payload.position);
      overlayImageRef.current.opacity(1);
      overlayImageRef.current.visible(true);
      // 同步缩放
      if (overlayLayerRef.current) {
        overlayLayerRef.current.scale({ x: payload.scale, y: payload.scale });
        overlayLayerRef.current.visible(true);
        overlayLayerRef.current.draw();
      }
      // 新增：隐藏本窗口主图片
      if (imageRef.current) {
        imageRef.current.visible(false);
        layerRef.current && layerRef.current.draw();
      }
    };
    const onHideOverlayImage = (payload: any) => {
      if (payload.targetIndex !== index) return;
      overlayImageRef.current && overlayImageRef.current.visible(false);
      overlayLayerRef.current && overlayLayerRef.current.visible(false);
      overlayLayerRef.current && overlayLayerRef.current.draw();
      // 新增：恢复本窗口主图片显示
      if (imageRef.current) {
        imageRef.current.visible(true);
        layerRef.current && layerRef.current.draw();
      }
    };
    eventBus.on('imagewindow-mousedown', onMouseDown);
    eventBus.on('imagewindow-mousemove', onMouseMove);
    eventBus.on('imagewindow-mouseup', onMouseUp);
    eventBus.on('imagewindow-scale', onScale);
    eventBus.on('request-overlay-image', onRequestOverlayImage);
    eventBus.on('show-overlay-image', onShowOverlayImage);
    eventBus.on('hide-overlay-image', onHideOverlayImage);
    return () => {
      eventBus.off('imagewindow-mousedown', onMouseDown);
      eventBus.off('imagewindow-mousemove', onMouseMove);
      eventBus.off('imagewindow-mouseup', onMouseUp);
      eventBus.off('imagewindow-scale', onScale);
      eventBus.off('request-overlay-image', onRequestOverlayImage);
      eventBus.off('show-overlay-image', onShowOverlayImage);
      eventBus.off('hide-overlay-image', onHideOverlayImage);
    };
  }, [index]);

  useEffect(() => {
    if (drawerRef.current) {
      stageRef.current = new Konva.Stage({
        container: drawerRef.current,
        width: drawerRef.current.clientWidth,
        height: drawerRef.current.clientHeight,
      });
      layerRef.current = new Konva.Layer();
      stageRef.current.add(layerRef.current);
      // 新增：初始化 overlayLayer
      overlayLayerRef.current = new Konva.Layer();
      stageRef.current.add(overlayLayerRef.current);
      overlayLayerRef.current.zIndex(1); // 保证在主图层上方
      overlayLayerRef.current.visible(false); // 默认隐藏

      const image = new Image();
      image.src = imageUrl;
      image.onload = () => {
        if (!layerRef.current || !stageRef.current) return;
        // 创建Konva图片对象
        imageRef.current = new Konva.Image({
          image: image,
          draggable: false
        });
        // 计算图片缩放以适应容器
        const containerWidth = stageRef.current.width();
        const containerHeight = stageRef.current.height();
        const imageWidth = image.width;
        const imageHeight = image.height;
        const scaleX = containerWidth / imageWidth;
        const scaleY = containerHeight / imageHeight;
        const scale = Math.min(scaleX, scaleY);
        // 设置图片大小和位置
        imageRef.current.width(imageWidth * scale);
        imageRef.current.height(imageHeight * scale);
        imageRef.current.position({
          x: (containerWidth - imageWidth * scale) / 2,
          y: (containerHeight - imageHeight * scale) / 2
        });
        layerRef.current.destroyChildren();
        layerRef.current.add(imageRef.current);
        layerRef.current.draw();
      };
      // 新增：初始化 overlayImage
      overlayImageRef.current = new Konva.Image({
        image: undefined, // 必须传递 image 属性，初始为 undefined
        visible: false,
        opacity: 1, // 完全不透明，直接覆盖
        draggable: false
      });
      overlayLayerRef.current.add(overlayImageRef.current);
      overlayLayerRef.current.draw();

      stageRef.current.on('wheel', (e) => {
        handleWheel(e, stageRef, layerRef, scaleBy, index);
      });

      stageRef.current.on('mousedown', (e) => {
        handleMouseDown(e, isDraggingRef, positionRef, imageRef, imageStartPosRef);
        if (imageRef.current) {
          imageStartPosRef.current = imageRef.current.position();
        }
        if (!e.evt.ctrlKey) {
          eventBus.emit('imagewindow-mousedown', { index });
        }
      });

      stageRef.current.on('mousemove', (e) => {
        handleMouseMove(e, isDraggingRef, positionRef, imageRef, imageStartPosRef, layerRef, stageRef);
        if (isDraggingRef.current) {
          const delta = {
            x: e.evt.clientX - positionRef.current.x,
            y: e.evt.clientY - positionRef.current.y
          };
          if (!e.evt.ctrlKey) {
            eventBus.emit('imagewindow-mousemove', { index, delta });
          }
        }
      });

      stageRef.current.on('mouseup', (e) => {
        isDraggingRef.current = false;
        handleMouseUp(isDraggingRef);
        if (!e.evt.ctrlKey) {
          eventBus.emit('imagewindow-mouseup', { index });
        }
      });  
    }
  }, [])


  return(
    <div
      key={index}
      ref={setContainerRef(index)}
      className="image-window-container"
      style={{
        border: '1px solid #ccc',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: isBottomBar ? 'column-reverse' : 'column',
      }}
    >
      {/* 工具栏 */}
      <div className="image-window-toolbar" style={{ height: 40, background: '#f5f5f5', borderBottom: isBottomBar ? undefined : '1px solid #ddd', borderTop: isBottomBar ? '1px solid #ddd' : undefined, display: 'flex', alignItems: 'center', padding: '0 16px', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 'bold' }}>{`窗口${index + 1}`}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          {/* 左右按钮，分别在窗口1和窗口2显示 */}
          {index === 0 && (
            <button
              onMouseDown={() => handleOverlayShow('left')}
              onMouseUp={handleOverlayHide}
              onMouseLeave={handleOverlayHide}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 18, color: '#888' }}
              title="覆盖对比窗口2"
            >←</button>
          )}
          {index === 1 && (
            <button
              onMouseDown={() => handleOverlayShow('right')}
              onMouseUp={handleOverlayHide}
              onMouseLeave={handleOverlayHide}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 18, color: '#888' }}
              title="覆盖对比窗口1"
            >→</button>
          )}
          <button onClick={() => removeImageUrl(index)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 18, color: '#888' }} title="关闭">✖</button>
        </div>
      </div>
      {/* 图片区域 */}
      <div className="image-window-content" style={{ height: 'calc(100% - 40px)', position: 'relative', overflow: 'hidden' }}>
        <div className="image-drawer-container" ref={drawerRef}>

        </div>
      </div>
    </div>
  )
}


export default ImageWindow;
