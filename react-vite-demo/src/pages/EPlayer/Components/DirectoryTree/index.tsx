import React from 'react'
import cn from 'classnames'
import styles from './DirectoryTree.module.less'

interface DirectoryTreeProps {
  className?: string
}

const DirectoryTree: React.FC<DirectoryTreeProps> = ({ className }) => {
  return (
    <div className={cn(styles.directoryTree, className)}>
      <h3 className={styles.title}>目录树</h3>
      <div className={styles.treeContent}>
        <div className={styles.treeItem}>
          <span className={styles.folderIcon}>📁</span>
          <span className={styles.folderName}>文件夹1</span>
        </div>
        <div className={styles.treeItem}>
          <span className={styles.folderIcon}>📁</span>
          <span className={styles.folderName}>文件夹2</span>
        </div>
        <div className={styles.treeItem}>
          <span className={styles.fileIcon}>📄</span>
          <span className={styles.fileName}>文件1.jpg</span>
        </div>
      </div>
    </div>
  )
}

export default DirectoryTree 