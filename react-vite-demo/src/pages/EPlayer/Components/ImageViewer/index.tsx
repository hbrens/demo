import React from 'react'
import cn from 'classnames'
import styles from './ImageViewer.module.less'

interface ImageViewerProps {
  className?: string
}

const ImageViewer: React.FC<ImageViewerProps> = ({ className }) => {
  return (
    <div className={cn(styles.imageViewer, className)}>
      <h3 className={styles.title}>图片查看器</h3>
      <div className={styles.viewerContainer}>
        <div className={styles.imageContainer}>
          <img 
            src="https://picsum.photos/600/400?random=1" 
            alt="查看的图片"
            className={styles.mainImage}
          />
        </div>
        <div className={styles.imageInfo}>
          <h4 className={styles.imageName}>图片1.jpg</h4>
          <p className={styles.imageDetails}>
            尺寸: 1920x1080 | 大小: 2.5MB | 格式: JPEG
          </p>
        </div>
      </div>
    </div>
  )
}

export default ImageViewer 