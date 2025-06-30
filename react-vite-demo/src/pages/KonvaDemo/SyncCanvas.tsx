import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { Stage, Layer, Image } from 'react-konva';

interface SyncCanvasProps {
  image: HTMLImageElement | null;
  containerRef: React.RefObject<HTMLDivElement> | null;
  onTransformChange?: (transform: Transform, shouldSync: boolean) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  syncEnabled?: boolean;
}

interface Transform {
  x: number;
  y: number;
  scale: number;
}

interface CanvasMethods {
  applyExternalTransform: (transform: Transform) => void;
  getCurrentTransform: () => Transform;
}

const SyncCanvas = forwardRef<CanvasMethods, SyncCanvasProps>(({
  image,
  containerRef,
  onTransformChange,
  onDragStart,
  onDragEnd,
  syncEnabled = true
}, ref) => {
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [initialScale, setInitialScale] = useState(1);
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, scale: 1 });
  const stageRef = useRef<any>(null);
  const isInitializedRef = useRef(false);
  const lastTransformRef = useRef<Transform>({ x: 0, y: 0, scale: 1 });

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    applyExternalTransform: (externalTransform) => {
      if (stageRef.current && syncEnabled) {
        setTransform(externalTransform);
        stageRef.current.position({ 
          x: externalTransform.x, 
          y: externalTransform.y 
        });
        stageRef.current.scale({ 
          x: externalTransform.scale, 
          y: externalTransform.scale 
        });
      }
    },
    getCurrentTransform: () => {
      return transform;
    }
  }));

  // 更新容器尺寸
  useEffect(() => {
    if (!containerRef?.current) return;

    const updateContainerSize = () => {
      const { clientWidth, clientHeight } = containerRef.current!;
      setContainerSize({ width: clientWidth, height: clientHeight });
    };

    const observer = new ResizeObserver(updateContainerSize);
    observer.observe(containerRef.current);
    updateContainerSize();

    return () => {
      observer.disconnect();
    };
  }, [containerRef]);

  // 更新图片尺寸
  useEffect(() => {
    if (!image) return;
    setImageSize({ width: image.width, height: image.height });
  }, [image]);

  // 计算初始缩放比例
  useEffect(() => {
    if (!image || !containerSize.width || !containerSize.height) return;

    const scaleX = containerSize.width / image.width;
    const scaleY = containerSize.height / image.height;
    const newInitialScale = Math.min(scaleX, scaleY);
    
    // 只有当初始缩放真正变化时才更新
    if (Math.abs(newInitialScale - initialScale) > 0.001) {
      setInitialScale(newInitialScale);
      const newTransform = { x: 0, y: 0, scale: newInitialScale };
      setTransform(newTransform);
      
      // 使用ref来避免重复触发
      if (onTransformChange && !isInitializedRef.current) {
        onTransformChange(newTransform, syncEnabled);
        isInitializedRef.current = true;
      }
    }
  }, [image, containerSize.width, containerSize.height, initialScale]);

  // 通知父组件变换变化
  useEffect(() => {
    if (onTransformChange && isInitializedRef.current) {
      // 只有当transform实际变化时才触发回调
      if (
        transform.x !== lastTransformRef.current.x ||
        transform.y !== lastTransformRef.current.y ||
        transform.scale !== lastTransformRef.current.scale
      ) {
        lastTransformRef.current = transform;
        onTransformChange(transform, syncEnabled);
      }
    }
  }, [transform.x, transform.y, transform.scale, syncEnabled]);

  // 计算图片位置使其居中
  const getImagePosition = () => {
    const scaledWidth = imageSize.width * transform.scale;
    const scaledHeight = imageSize.height * transform.scale;
    return {
      x: (containerSize.width - scaledWidth) / 2,
      y: (containerSize.height - scaledHeight) / 2
    };
  };

  return (
    <Stage
      ref={stageRef}
      width={containerSize.width}
      height={containerSize.height}
      draggable
      onDragStart={() => onDragStart?.()}
      onDragEnd={() => onDragEnd?.()}
      onDragMove={(e) => {
        const stage = e.target.getStage();
        const newTransform = {
          x: stage.x(),
          y: stage.y(),
          scale: transform.scale
        };
        setTransform(newTransform);
        if (onTransformChange) {
          onTransformChange(newTransform, syncEnabled);
        }
      }}
      onWheel={(e) => {
        e.evt.preventDefault();
        
        const isCtrlPressed = e.evt.ctrlKey || e.evt.metaKey;
        if (isCtrlPressed && !syncEnabled) return;
        
        const stage = e.target.getStage();
        const oldScale = transform.scale;
        const pointer = stage.getPointerPosition();
        
        const mousePointTo = {
          x: (pointer.x - stage.x()) / oldScale,
          y: (pointer.y - stage.y()) / oldScale,
        };

        const newScale = Math.max(0.1, Math.min(10, 
          e.evt.deltaY > 0 ? oldScale * 0.95 : oldScale * 1.05
        ));
        
        const newTransform = {
          x: pointer.x - mousePointTo.x * newScale,
          y: pointer.y - mousePointTo.y * newScale,
          scale: newScale
        };
        
        setTransform(newTransform);
      }}
      x={transform.x}
      y={transform.y}
      scaleX={transform.scale}
      scaleY={transform.scale}
    >
      <Layer>
        {image && (
          <Image 
            image={image} 
            width={imageSize.width}
            height={imageSize.height}
            {...getImagePosition()}
          />
        )}
      </Layer>
    </Stage>
  );
});

export default SyncCanvas;