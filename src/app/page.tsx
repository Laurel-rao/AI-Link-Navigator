import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma/client'
import { GroupsDisplay } from '@/components/features/GroupsDisplay'
import { SiteSettings, Setting } from '@/types'
import Link from 'next/link'

async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const settings = await prisma.setting.findMany()
    
    // 转换为键值对格式
    const settingsObject: SiteSettings = {}
    settings.forEach((setting: Setting) => {
      settingsObject[setting.key as keyof SiteSettings] = setting.value || undefined
    })

    return settingsObject
  } catch (error) {
    console.error('Error fetching site settings:', error)
    // 返回默认设置
    return {
      site_title: 'AI-Link-Navigator',
      site_heading: 'AI资源导航',
      site_subheading: '前沿AI工具与资源的精选集合',
      nav_welcome_text: '欢迎回来',
      nav_admin_button: '管理后台',
      nav_logout_button: '退出登录',
      home_section_title: '资源分类'
    }
  }
}

export default async function Home() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/login')
  }

  const settings = await getSiteSettings()

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 动态背景网格 */}
      <div className="absolute inset-0 tech-grid pointer-events-none"></div>
      
      {/* 浮动装饰元素 */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl floating-animation"></div>
      <div className="absolute top-40 right-20 w-24 h-24 bg-purple-500/10 rounded-full blur-lg floating-animation" style={{animationDelay: '2s'}}></div>
      <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-cyan-500/10 rounded-full blur-lg floating-animation" style={{animationDelay: '4s'}}></div>
      
      <div className="relative z-10 max-w-7xl mx-auto p-6 md:p-12">
        {/* 顶部导航栏 */}
        <nav className="mb-12">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 glassmorphism-card rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="text-sm text-slate-300">
                {settings.nav_welcome_text || '欢迎回来'}，<span className="gradient-text-blue font-semibold">{session.user.username}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {session.user.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="glassmorphism-card glassmorphism-hover px-4 py-2 rounded-xl text-slate-200 hover:text-white transition duration-300 flex items-center text-sm group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  {settings.nav_admin_button || '管理后台'}
                </Link>
              )}
              <Link
                href="/api/auth/signout"
                className="glassmorphism-card glassmorphism-hover px-4 py-2 rounded-xl text-slate-200 hover:text-white transition duration-300 flex items-center text-sm group"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                </svg>
                {settings.nav_logout_button || '退出登录'}
              </Link>
            </div>
          </div>
        </nav>

        {/* 主标题区域 */}
        <header className="mb-16 text-center relative">
          <div className="relative inline-block">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 relative">
              <span className="gradient-text-blue soft-glow">
                {settings.site_heading || 'AI资源导航'}
              </span>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-20 animate-pulse"></div>
            </h1>
          </div>
          
          {/* 调小副标题并去除外边框 */}
          <div className="relative max-w-2xl mx-auto">
            <div className="relative inline-block">
              <p className="text-slate-300 text-2xl leading-relaxed gradient-text-blue soft-glow relative">
                {settings.site_subheading || '前沿AI工具与资源的精选集合'}
              </p>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-lg blur opacity-40 animate-pulse"></div>
            </div>
          </div>
          
          {/* 装饰性元素 */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
          </div>
        </header>

        {/* 主要内容区域 */}
        <main className="relative">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-purple-500 rounded-full mr-3"></div>
              {settings.home_section_title || '资源分类'}
            </h2>
          </div>
          <GroupsDisplay />
        </main>
      </div>
    </div>
  )
}
