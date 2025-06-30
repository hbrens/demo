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

const imageUrls = [
  'http://127.0.0.1:8080/b67a7d25bacfb81a32e568696f9f694c.jpg',
  'http://127.0.0.1:8080/b67a7d25bacfb81a32e568696f9f694c.jpg',
  'http://127.0.0.1:8080/b67a7d25bacfb81a32e568696f9f694c.jpg',
  'http://127.0.0.1:8080/b67a7d25bacfb81a32e568696f9f694c.jpg',
];

const ImageViewer = () => {
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

  const handleTransformChange = useCallback((transform: Transform, shouldSync: boolean, sourceIndex: number) => {
    if (shouldSync) {
      canvasRefs.current.forEach((canvas, index) => {
        if (index !== sourceIndex && canvas) {
          canvas.applyExternalTransform(transform);
        }
      });
    }
  }, []);

  const setContainerRef = (index: number) => (el: HTMLDivElement | null) => {
    containerRefs.current[index] = el;
  };
  const setCanvasRef = (index: number) => (el: CanvasMethods | null) => {
    canvasRefs.current[index] = el;
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        background: '#fafbfc',
      }}
      tabIndex={0}
    >
      {images.map((img, index) => (
        <div
          key={index}
          ref={setContainerRef(index)}
          style={{
            border: '1px solid #ccc',
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* 工具栏 */}
          <div style={{ height: 40, background: '#f5f5f5', borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center', padding: '0 16px' }}>
            <span style={{ fontWeight: 'bold' }}>{`窗口${index + 1}`}</span>
          </div>
          {/* 图片区域 */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <SyncCanvas
              ref={setCanvasRef(index)}
              image={img ?? null}
              containerRef={{ current: containerRefs.current[index] } as any}
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
        </div>
      ))}
    </div>
  );
};

export default ImageViewer;
