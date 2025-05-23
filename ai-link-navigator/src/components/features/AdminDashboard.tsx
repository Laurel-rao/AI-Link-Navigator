'use client'

import { useState, useEffect } from 'react'
import { LinksManagement } from './LinksManagement'
import { UsersManagement } from './UsersManagement'
import { SettingsManagement } from './SettingsManagement'
import { SiteSettings } from '@/types'

type TabType = 'links' | 'users' | 'settings'

// 客户端获取设置的函数
async function getSettings(): Promise<SiteSettings> {
  try {
    const response = await fetch('/api/settings')
    const data = await response.json()
    return data.data || {}
  } catch (error) {
    console.error('Failed to fetch settings:', error)
    return {}
  }
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('links')
  const [searchQuery, setSearchQuery] = useState('')
  const [settings, setSettings] = useState<SiteSettings>({})

  // 在客户端加载设置
  useEffect(() => {
    getSettings().then(setSettings)
  }, [])

  const tabs = [
    { id: 'links' as TabType, label: '链接管理' },
    { id: 'users' as TabType, label: '用户管理' },
    { id: 'settings' as TabType, label: '网站文字设置' },
  ]

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">
            {settings.admin_title || 'AI导航管理后台'}
          </h1>
          <div className="flex items-center space-x-4">
            <a
              href="/"
              className="text-blue-400 hover:text-blue-300 flex items-center"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              {settings.admin_preview_button || '预览网站'}
            </a>
            <a
              href="/api/auth/signout"
              className="text-red-400 hover:text-red-300 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
              {settings.admin_logout_button || '退出登录'}
            </a>
          </div>
        </div>
        
        <div className="mb-6">
          <input
            type="text"
            placeholder="在当前标签页内搜索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-slate-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 mr-2 rounded-t-md transition-colors ${
              activeTab === tab.id
                ? 'bg-slate-800 text-white border-b-2 border-blue-500'
                : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <main className="bg-slate-800 rounded-xl p-6">
        {activeTab === 'links' && <LinksManagement searchQuery={searchQuery} />}
        {activeTab === 'users' && <UsersManagement searchQuery={searchQuery} />}
        {activeTab === 'settings' && <SettingsManagement searchQuery={searchQuery} />}
      </main>
    </div>
  )
} 