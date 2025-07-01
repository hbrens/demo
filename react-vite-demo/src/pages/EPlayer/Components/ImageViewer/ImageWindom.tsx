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
    const delta = {
      x: e.evt.clientX - positionRef.current.x,
      y: e.evt.clientY - positionRef.current.y
    };
    imageRef.current.position({
      x: imageStartPosRef.current.x + delta.x,
      y: imageStartPosRef.current.y + delta.y
    });
    stageRef.current && stageRef.current.batchDraw();
  }

  function handleMouseUp(isDraggingRef: MutableRefObject<boolean>) {
    // isDraggingRef.current = false;
  }

  // 缩放相关
  function handleWheel(
    e: Konva.KonvaEventObject<WheelEvent>,
    stageRef: MutableRefObject<Konva.Stage | null>,
    scaleBy: number,
    index: number
  ) {
    e.evt.preventDefault();
    const oldScale = stageRef.current!.scaleX();
    const pointer = stageRef.current!.getPointerPosition();
    const direction = e.evt.deltaY > 0 ? -1 : 1;
    // 通知其他窗口，带上pointer
    eventBus.emit('imagewindow-scale', { index, direction, pointer });
    // 自己处理缩放
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    if (pointer) {
      const mousePointTo = {
        x: (pointer.x - stageRef.current!.x()) / oldScale,
        y: (pointer.y - stageRef.current!.y()) / oldScale,
      };
      stageRef.current!.scale({ x: newScale, y: newScale });
      const newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      };
      stageRef.current!.position(newPos);
      stageRef.current!.batchDraw();
    }
  }

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
      imageRef.current.position({
        x: imageStartPosRef.current.x + delta.x,
        y: imageStartPosRef.current.y + delta.y
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
      if (!stageRef.current || !pointer) return;
      const oldScale = stageRef.current.scaleX();
      const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
      // 用pointer作为缩放中心
      const mousePointTo = {
        x: (pointer.x - stageRef.current.x()) / oldScale,
        y: (pointer.y - stageRef.current.y()) / oldScale,
      };
      stageRef.current.scale({ x: newScale, y: newScale });
      const newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      };
      stageRef.current.position(newPos);
      stageRef.current.batchDraw();
    };
    eventBus.on('imagewindow-mousedown', onMouseDown);
    eventBus.on('imagewindow-mousemove', onMouseMove);
    eventBus.on('imagewindow-mouseup', onMouseUp);
    eventBus.on('imagewindow-scale', onScale);
    return () => {
      eventBus.off('imagewindow-mousedown', onMouseDown);
      eventBus.off('imagewindow-mousemove', onMouseMove);
      eventBus.off('imagewindow-mouseup', onMouseUp);
      eventBus.off('imagewindow-scale', onScale);
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

      stageRef.current.on('wheel', (e) => {
        handleWheel(e, stageRef, scaleBy, index);
      });

      stageRef.current.on('mousedown', (e) => {
        handleMouseDown(e, isDraggingRef, positionRef, imageRef, imageStartPosRef);
        // 保存图片初始位置
        if (imageRef.current) {
          imageStartPosRef.current = imageRef.current.position();
        }
        // 发出鼠标点击事件
        eventBus.emit('imagewindow-mousedown', { index });
      });

      stageRef.current.on('mousemove', (e) => {
        handleMouseMove(e, isDraggingRef, positionRef, imageRef, imageStartPosRef, layerRef, stageRef);
        // 只在拖拽时发出拖拽事件
        if (isDraggingRef.current) {
          const delta = {
            x: e.evt.clientX - positionRef.current.x,
            y: e.evt.clientY - positionRef.current.y
          };
          console.log(`发出的`, delta.x, delta.y);
          eventBus.emit('imagewindow-mousemove', { index, delta });
        }
      });

      stageRef.current.on('mouseup', () => {
        isDraggingRef.current = false;
        handleMouseUp(isDraggingRef);
        // 发出鼠标松开事件
        console.log(`发出的 mouse up`, index);
        eventBus.emit('imagewindow-mouseup', { index });
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
        <button onClick={() => removeImageUrl(index)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 18, color: '#888' }} title="关闭">✖</button>
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
