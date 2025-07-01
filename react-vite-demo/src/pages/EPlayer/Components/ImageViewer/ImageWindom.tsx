import Konva from "konva";
import { useEffect, useRef, useState } from "react";
import './ImageWindom.less';

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
  const [isDragging, setIsDragging] = useState(false);
  const imageStartPosRef = useRef({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const positionRef = useRef({ x: 0, y: 0 });
  // 缩放因子
  const scaleBy = 1.05;

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
          draggable: true
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
        e.evt.preventDefault();

        // 获取当前缩放比例
        const oldScale = stageRef.current!.scaleX();
        // 鼠标指针在画布上的位置
        const pointer = stageRef.current!.getPointerPosition();
        // 判断滚轮方向
        const direction = e.evt.deltaY > 0 ? -1 : 1;
        // 计算新的缩放比例
        const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

        // 以鼠标为中心缩放
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
      });

      stageRef.current.on('mousedown', (e) => {
        e.evt.preventDefault();
        setIsDragging(true);
        positionRef.current = {
          x: e.evt.clientX,
          y: e.evt.clientY
        };
        if (imageRef.current) {
          imageStartPosRef.current = imageRef.current.position();
        }
      
      })

      stageRef.current.on('mousemove', (e) => {
        e.evt.preventDefault();
        if (!isDragging) return;
        const delta = {
          x: e.evt.clientX - positionRef.current.x,
          y: e.evt.clientY - positionRef.current.y
        };
        if (imageRef.current) {
          imageRef.current.position({
            x: imageStartPosRef.current.x + delta.x,
            y: imageStartPosRef.current.y + delta.y
          });
        }
        stageRef.current!.batchDraw();
      })

      stageRef.current.on('mouseup', () => {
        setIsDragging(false);
      })  
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
