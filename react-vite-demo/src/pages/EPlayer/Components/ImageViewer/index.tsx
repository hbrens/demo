import React, { useRef, useState, useEffect, useCallback } from 'react';
import useImage from 'use-image';
import SyncCanvas from '../../../KonvaDemo/SyncCanvas';
import { useImageViewerStore } from '../../../../stores/eplayer/imageViewer';

interface Transform {
  x: number;
  y: number;
  scale: number;
}

interface CanvasMethods {
  applyExternalTransform: (transform: Transform) => void;
  getCurrentTransform: () => Transform;
}

const getGridStyle = (count: number) => {
  if (count === 1) {
    return { gridTemplateColumns: '1fr', gridTemplateRows: '1fr' };
  } else if (count === 2) {
    return { gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr' };
  } else if (count === 3) {
    return { gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: '1fr' };
  } else {
    return { gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr' };
  }
};

const ImageViewer = () => {
  const { imageUrls, removeImageUrl } = useImageViewerStore();
  const [image1] = useImage(imageUrls[0] || '');
  const [image2] = useImage(imageUrls[1] || '');
  const [image3] = useImage(imageUrls[2] || '');
  const [image4] = useImage(imageUrls[3] || '');
  const images = [image1, image2, image3, image4];

  const containerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const canvasRefs = useRef<(CanvasMethods | null)[]>([]);
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const lastPositionRef = useRef<Transform[]>([
    { x: 0, y: 0, scale: 1 },
    { x: 0, y: 0, scale: 1 },
    { x: 0, y: 0, scale: 1 },
    { x: 0, y: 0, scale: 1 },
  ]);

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
      const last = lastPositionRef.current[sourceIndex];
      const delta = {
        x: transform.x - last.x,
        y: transform.y - last.y,
        scale: transform.scale / last.scale,
      };
      canvasRefs.current.forEach((canvas, index) => {
        if (index !== sourceIndex && canvas) {
          const theirLast = lastPositionRef.current[index];
          const newTransform = {
            x: theirLast.x + delta.x,
            y: theirLast.y + delta.y,
            scale: theirLast.scale * delta.scale,
          };
          canvas.applyExternalTransform(newTransform);
          lastPositionRef.current[index] = newTransform;
        }
      });
      lastPositionRef.current[sourceIndex] = transform;
    }
  }, []);

  const setContainerRef = (index: number) => (el: HTMLDivElement | null) => {
    containerRefs.current[index] = el;
  };
  const setCanvasRef = (index: number) => (el: CanvasMethods | null) => {
    canvasRefs.current[index] = el;
  };

  const gridStyle = getGridStyle(imageUrls.length);

  return (
    <div
      style={{
        display: 'grid',
        ...gridStyle,
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        background: '#fafbfc',
      }}
      tabIndex={0}
    >
      {imageUrls.map((url, index) => {
        // 四窗口时，下方两个窗口工具栏放底部
        const isFour = imageUrls.length === 4;
        const isBottomBar = isFour && (index === 2 || index === 3);
        return (
          <div
            key={index}
            ref={setContainerRef(index)}
            style={{
              border: '1px solid #ccc',
              overflow: 'hidden',
              position: 'relative',
              display: 'flex',
              flexDirection: isBottomBar ? 'column-reverse' : 'column',
            }}
          >
            {/* 工具栏 */}
            <div style={{ height: 40, background: '#f5f5f5', borderBottom: isBottomBar ? undefined : '1px solid #ddd', borderTop: isBottomBar ? '1px solid #ddd' : undefined, display: 'flex', alignItems: 'center', padding: '0 16px', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 'bold' }}>{`窗口${index + 1}`}</span>
              <button onClick={() => removeImageUrl(index)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 18, color: '#888' }} title="关闭">✖</button>
            </div>
            {/* 图片区域 */}
            <div style={{ height: 'calc(100% - 40px)', position: 'relative', overflow: 'hidden' }}>
              <SyncCanvas
                ref={setCanvasRef(index)}
                image={images[index] ?? null}
                containerRef={{ current: containerRefs.current[index] } as any}
                onTransformChange={(transform, shouldSync) =>
                  handleTransformChange(transform, shouldSync, index)
                }
                onDragStart={() => {
                  setIsDragging(true);
                  const canvas = canvasRefs.current[index];
                  if (canvas) {
                    lastPositionRef.current[index] = canvas.getCurrentTransform();
                  }
                }}
                onDragEnd={() => {
                  setIsDragging(false);
                  const canvas = canvasRefs.current[index];
                  if (canvas) {
                    lastPositionRef.current[index] = canvas.getCurrentTransform();
                  }
                }}
                syncEnabled={syncEnabled}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ImageViewer;
