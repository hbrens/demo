import React from 'react'
import cn from 'classnames'
import styles from './Resizer.module.less'

interface ResizerProps {
  className?: string
  onResize: (deltaX: number) => void
  direction?: 'horizontal' | 'vertical'
}

const Resizer: React.FC<ResizerProps> = ({ 
  className, 
  onResize, 
  direction = 'horizontal' 
}) => {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    
    const startX = e.clientX
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX
      onResize(deltaX)
    }
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div 
      className={cn(styles.resizer, styles[direction], className)}
      onMouseDown={handleMouseDown}
    >
      <div className={styles.handle} />
    </div>
  )
}

export default Resizer 