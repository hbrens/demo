import { createBrowserRouter, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Home from '@/pages/Home'
import EPlayer from '@/pages/EPlayer'
import KonvaDemo from '@/pages/KonvaDemo'

export interface RouteConfig {
  path: string
  element: React.ReactNode
  meta: {
    title: string
  }
}

// 路由标题映射
const routeTitles: Record<string, string> = {
  '/': '首页 - React Demo',
  '/eplayer': 'ePlayer - 视频播放器',
  '/konva-demo': 'Konva Demo - 四画布同步缩放'
}

// 自定义hook：设置页面标题
export function usePageTitle(title?: string) {
  useEffect(() => {
    if (title) {
      document.title = title
    }
  }, [title])
}

// 自动标题更新组件
function AutoTitleUpdater() {
  const location = useLocation()
  
  useEffect(() => {
    const title = routeTitles[location.pathname] || 'React Demo'
    document.title = title
  }, [location.pathname])
  
  return null
}

// 布局组件
function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AutoTitleUpdater />
      {children}
    </>
  )
}

export const routes: RouteConfig[] = [
  {
    path: '/',
    element: <Home />,
    meta: {
      title: '首页 - React Demo'
    }
  },
  {
    path: '/eplayer',
    element: <EPlayer />,
    meta: {
      title: 'ePlayer - 视频播放器'
    }
  },
  {
    path: '/konva-demo',
    element: <KonvaDemo />,
    meta: {
      title: 'Konva Demo - 四画布同步缩放'
    }
  }
]

// 基于 routes 自动生成 router
export const router = createBrowserRouter(
  routes.map(route => ({
    path: route.path,
    element: <Layout>{route.element}</Layout>
  }))
) 