import React, { useRef, useState, useEffect, useCallback } from 'react';
import useImage from 'use-image';
import { useImageViewerStore } from '../../../../stores/eplayer/imageViewer';
import ImageWindow from './ImageWindom';

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


  const setContainerRef = (index: number) => (el: HTMLDivElement | null) => {
    containerRefs.current[index] = el;
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
          <ImageWindow
            key={index}
            imageUrl={url}
            index={index}
            setContainerRef={setContainerRef}
            isBottomBar={isBottomBar}
            removeImageUrl={removeImageUrl}
          />
        );
      })}
    </div>
  );
};

export default ImageViewer;
