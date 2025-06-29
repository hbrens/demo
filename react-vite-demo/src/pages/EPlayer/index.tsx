import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import EPLayerLayout from './Components/EPLayerLayout'
import { initializeMockData, initializeStoreConnections } from '../../stores'

function EPlayer() {
  // 初始化store和数据
  useEffect(() => {
    // 初始化store联动
    initializeStoreConnections()
    
    // 初始化模拟数据
    initializeMockData()
  }, [])

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 顶部导航 */}
      <div style={{ 
        padding: '12px 16px', 
        backgroundColor: '#fff', 
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '18px', color: '#333' }}>ePlayer - 图片管理器</h1>
        <nav>
          <Link to="/" style={{ marginRight: '1rem', color: '#1890ff', textDecoration: 'none' }}>
            首页
          </Link>
          <Link to="/eplayer" style={{ color: '#1890ff', textDecoration: 'none' }}>
            ePlayer
          </Link>
        </nav>
      </div>
      
      {/* 主布局 */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <EPLayerLayout />
      </div>
    </div>
  )
}

export default EPlayer 