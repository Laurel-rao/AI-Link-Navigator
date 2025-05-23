import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth/config'
import { LoginForm } from '@/components/features/LoginForm'
import { prisma } from '@/lib/prisma/client'
import { SiteSettings, Setting } from '@/types'

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
      login_title: 'AI导航系统',
      login_subtitle: '智能资源导航平台',
      login_dev_notice_title: '开发环境 - 测试账号',
      login_dev_admin_label: '管理员',
      login_dev_user_label: '用户',
      login_copyright: '© 2024 AI-Link-Navigator. 现代化智能导航平台'
    }
  }
}

export default async function LoginPage() {
  const session = await getServerSession(authOptions)
  
  if (session) {
    redirect('/')
  }

  const settings = await getSiteSettings()

  // 只在开发环境显示测试账号信息
  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* 背景装饰元素 */}
      <div className="absolute inset-0 tech-grid pointer-events-none"></div>
      <div className="absolute top-20 left-20 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl floating-animation"></div>
      <div className="absolute bottom-20 right-20 w-32 h-32 bg-purple-500/10 rounded-full blur-xl floating-animation" style={{animationDelay: '2s'}}></div>
      <div className="absolute top-1/2 left-10 w-24 h-24 bg-cyan-500/10 rounded-full blur-lg floating-animation" style={{animationDelay: '4s'}}></div>
      
      {/* 主要内容 */}
      <div className="relative z-10 w-full max-w-md">
        <div className="glassmorphism-card rounded-3xl p-10 cyber-border">
          {/* Logo区域 */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 glassmorphism-card rounded-2xl flex items-center justify-center mx-auto mb-6 pulse-glow">
              <svg className="w-10 h-10 gradient-text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold mb-2">
              <span className="gradient-text-blue soft-glow">
                {settings.login_title || 'AI导航系统'}
              </span>
            </h1>
            
            <p className="text-slate-400 text-sm">
              {settings.login_subtitle || '智能资源导航平台'}
            </p>
            
            {/* 装饰线 */}
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent mx-auto mt-4"></div>
          </div>
          
          {/* 登录表单 */}
          <LoginForm settings={settings} />
          
          {/* 开发环境测试账号提示 */}
          {isDevelopment && (
            <div className="mt-8 pt-6 border-t border-slate-700/50">
              <div className="text-center">
                <div className="flex items-center justify-center mb-3">
                  <svg className="w-4 h-4 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-xs text-yellow-400 font-medium">
                    {settings.login_dev_notice_title || '开发环境 - 测试账号'}
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <div className="glassmorphism rounded-lg p-2">
                    <span className="text-slate-400">
                      {settings.login_dev_admin_label || '管理员'}：
                    </span>
                    <span className="text-blue-400 font-mono">admin / admin123</span>
                  </div>
                  <div className="glassmorphism rounded-lg p-2">
                    <span className="text-slate-400">
                      {settings.login_dev_user_label || '用户'}：
                    </span>
                    <span className="text-purple-400 font-mono">user / user123</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* 版权信息 */}
        <div className="text-center mt-6">
          <p className="text-xs text-slate-500">
            {settings.login_copyright || '© 2024 AI-Link-Navigator. 现代化智能导航平台'}
          </p>
        </div>
      </div>
    </div>
  )
} 