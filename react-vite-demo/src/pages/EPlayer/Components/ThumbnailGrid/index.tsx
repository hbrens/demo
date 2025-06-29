import React from 'react'
import cn from 'classnames'
import styles from './ThumbnailGrid.module.less'

interface ThumbnailGridProps {
  className?: string
}

const ThumbnailGrid: React.FC<ThumbnailGridProps> = ({ className }) => {
  // 模拟缩略图数据
  const thumbnails = Array.from({ length: 12 }, (_, index) => ({
    id: index + 1,
    name: `图片${index + 1}.jpg`,
    url: `https://picsum.photos/150/150?random=${index + 1}`
  }))

  return (
    <div className={cn(styles.thumbnailGrid, className)}>
      <h3 className={styles.title}>缩略图</h3>
      <div className={styles.gridContainer}>
        {thumbnails.map((thumbnail) => (
          <div key={thumbnail.id} className={styles.thumbnailItem}>
            <img 
              src={thumbnail.url} 
              alt={thumbnail.name}
              className={styles.thumbnailImage}
            />
            <div className={styles.thumbnailName}>{thumbnail.name}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ThumbnailGrid 