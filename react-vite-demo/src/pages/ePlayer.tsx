import { useState } from 'react'
import { Link } from 'react-router-dom'

function EPlayer() {
  return (
    <div className="eplayer-container">
      <h1>ePlayer</h1>
      <p>这是一个简单的 ePlayer 页面</p>
      
      {/* 导航链接 */}
      <nav style={{ marginTop: '2rem' }}>
        <Link to="/" style={{ marginRight: '1rem' }}>首页</Link>
        <Link to="/eplayer">ePlayer</Link>
      </nav>
    </div>
  )
}

export default EPlayer 