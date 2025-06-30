import React, { useRef, useState, useEffect, useCallback } from 'react';
import useImage from 'use-image';
import SyncCanvas from './SyncCanvas';

interface Transform {
  x: number;
  y: number;
  scale: number;
}

interface CanvasMethods {
  applyExternalTransform: (transform: Transform) => void;
  getCurrentTransform: () => Transform;
}

const SyncCanvasViewer = () => {
  const imageUrls = [
    'http://127.0.0.1:8080/b67a7d25bacfb81a32e568696f9f694c.jpg',
    'http://127.0.0.1:8080/b67a7d25bacfb81a32e568696f9f694c.jpg',
    'http://127.0.0.1:8080/b67a7d25bacfb81a32e568696f9f694c.jpg',
    'http://127.0.0.1:8080/b67a7d25bacfb81a32e568696f9f694c.jpg',
  ];

  const [image1] = useImage(imageUrls[0]);
  const [image2] = useImage(imageUrls[1]);
  const [image3] = useImage(imageUrls[2]);
  const [image4] = useImage(imageUrls[3]);
  const images = [image1, image2, image3, image4];

  const containerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const canvasRefs = useRef<(CanvasMethods | null)[]>([]);
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const lastPositionRef = useRef<Transform>({ x: 0, y: 0, scale: 1 });

  // 处理键盘事件
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        setSyncEnabled(false);
      }
    };

    const handleKeyUp = () => {
      setSyncEnabled(true);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // 处理变换变化
  const handleTransformChange = useCallback((transform: Transform, shouldSync: boolean, sourceIndex: number) => {
    if (shouldSync) {
      canvasRefs.current.forEach((canvas, index) => {
        if (index !== sourceIndex && canvas) {
          canvas.applyExternalTransform(transform);
        }
      });
    }
  }, []);

  // 初始化容器ref
  const setContainerRef = (index: number) => (el: HTMLDivElement | null) => {
    containerRefs.current[index] = el;
  };

  // 初始化canvas ref
  const setCanvasRef = (index: number) => (el: CanvasMethods | null) => {
    canvasRefs.current[index] = el;
  };

  return (
    <div 
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: '10px',
        width: '100vw',
        height: '100vh',
        padding: '10px',
        boxSizing: 'border-box'
      }}
      tabIndex="0"
    >
      {images.map((img, index) => (
        <div 
          key={index} 
          ref={setContainerRef(index)}
          style={{ 
            border: '1px solid #ccc', 
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <SyncCanvas
            ref={setCanvasRef(index)}
            image={img}
            containerRef={{ current: containerRefs.current[index] }}
            onTransformChange={(transform, shouldSync) => 
              handleTransformChange(transform, shouldSync, index)
            }
            onDragStart={() => {
              setIsDragging(true);
              const canvas = canvasRefs.current[index];
              if (canvas) {
                lastPositionRef.current = canvas.getCurrentTransform();
              }
            }}
            onDragEnd={() => {
              setIsDragging(false);
              const canvas = canvasRefs.current[index];
              if (canvas) {
                lastPositionRef.current = canvas.getCurrentTransform();
              }
            }}
            syncEnabled={syncEnabled}
          />
        </div>
      ))}
    </div>
  );
};

export default SyncCanvasViewer;