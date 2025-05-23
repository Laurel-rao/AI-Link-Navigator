import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma/client'
import { GroupsDisplay } from '@/components/features/GroupsDisplay'
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
      site_title: 'AI-Link-Navigator',
      site_heading: 'AI资源导航',
      site_subheading: '前沿AI工具与资源的精选集合'
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="max-w-7xl mx-auto p-6 md:p-12">
        <header className="mb-12 text-center">
          <div className="flex justify-end items-center mb-4 space-x-4">
            {session.user.role === 'ADMIN' && (
              <a
                href="/admin"
                className="glassmorphism px-4 py-2 rounded-lg text-slate-200 hover:text-white hover:bg-slate-700/50 transition duration-200 flex items-center text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                管理后台
              </a>
            )}
            <a
              href="/api/auth/signout"
              className="glassmorphism px-4 py-2 rounded-lg text-slate-200 hover:text-white hover:bg-slate-700/50 transition duration-200 flex items-center text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
              退出登录
            </a>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-4">
            {settings.site_heading || 'AI资源导航'}
          </h1>
          <p className="text-slate-300 text-lg md:text-xl max-w-3xl mx-auto">
            {settings.site_subheading || '前沿AI工具与资源的精选集合'}
          </p>
        </header>

        <main>
          <GroupsDisplay />
        </main>
      </div>
    </div>
  )
}
