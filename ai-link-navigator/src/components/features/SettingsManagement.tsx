'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { settingsApi } from '@/lib/utils/api'
import { SiteSettings } from '@/types'
import { HighlightText } from '@/components/ui/HighlightText'

interface SettingsManagementProps {
  searchQuery: string
}

export function SettingsManagement({ searchQuery }: SettingsManagementProps) {
  const [settings, setSettings] = useState<SiteSettings>({
    site_title: '',
    site_heading: '',
    site_subheading: ''
  })

  const queryClient = useQueryClient()

  const { data: currentSettings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await settingsApi.getSettings()
      return response.data.data as SiteSettings
    }
  })

  const updateMutation = useMutation({
    mutationFn: settingsApi.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    }
  })

  useEffect(() => {
    if (currentSettings) {
      setSettings({
        site_title: currentSettings.site_title || '',
        site_heading: currentSettings.site_heading || '',
        site_subheading: currentSettings.site_subheading || ''
      })
    }
  }, [currentSettings])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate(settings)
  }

  const handleInputChange = (key: keyof SiteSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  // 设置项配置
  const settingItems = [
    {
      key: 'site_title' as keyof SiteSettings,
      label: '网站标题',
      description: '显示在浏览器标签页的标题',
      placeholder: '例如：AI-Link-Navigator - 智能导航站'
    },
    {
      key: 'site_heading' as keyof SiteSettings,
      label: '网站主标题',
      description: '显示在网站首页的大标题',
      placeholder: '例如：AI资源导航'
    },
    {
      key: 'site_subheading' as keyof SiteSettings,
      label: '网站副标题',
      description: '显示在主标题下方的描述文字',
      placeholder: '例如：前沿AI工具与资源的精选集合'
    }
  ]

  // 过滤设置项 - 根据搜索查询
  const filteredItems = settingItems.filter(item => {
    if (!searchQuery) return true
    const searchLower = searchQuery.toLowerCase()
    return (
      item.label.toLowerCase().includes(searchLower) ||
      item.description.toLowerCase().includes(searchLower) ||
      (settings[item.key] && settings[item.key]!.toLowerCase().includes(searchLower))
    )
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">网站设置</h2>
        <p className="text-slate-400 text-base">
          配置网站的基本信息，这些设置会立即应用到网站上
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {filteredItems.map((item) => (
          <div key={item.key} className="p-4 bg-slate-700 rounded-lg">
            <div className="mb-3">
              <label className="block text-lg font-semibold text-white mb-1">
                <HighlightText 
                  text={item.label}
                  searchQuery={searchQuery}
                  className="text-lg font-semibold"
                />
              </label>
              <p className="text-slate-400 text-base">
                <HighlightText 
                  text={item.description}
                  searchQuery={searchQuery}
                  className="text-base"
                />
              </p>
            </div>
            <input
              type="text"
              value={settings[item.key] || ''}
              onChange={(e) => handleInputChange(item.key, e.target.value)}
              placeholder={item.placeholder}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white text-base placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            {settings[item.key] && (
              <div className="mt-2 p-3 bg-slate-600 rounded border-l-4 border-blue-500">
                <p className="text-slate-300 text-sm mb-1">当前值预览：</p>
                <p className="text-white text-base font-medium">
                  <HighlightText 
                    text={settings[item.key] || ''}
                    searchQuery={searchQuery}
                    className="text-base font-medium"
                  />
                </p>
              </div>
            )}
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-400 text-lg">
              未找到匹配 "
              <span className="bg-yellow-300 text-yellow-900 px-1 rounded font-semibold">
                {searchQuery}
              </span>
              " 的设置项。
            </p>
          </div>
        )}

        {filteredItems.length > 0 && (
          <div className="flex justify-between items-center pt-4 border-t border-slate-600">
            <div className="text-slate-400 text-sm">
              💡 提示：设置保存后会立即生效，刷新网站即可看到变化
            </div>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 px-6 py-3 rounded-lg text-white font-medium flex items-center"
            >
              {updateMutation.isPending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  保存中...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  保存设置
                </>
              )}
            </button>
          </div>
        )}

        {updateMutation.isSuccess && (
          <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-green-400 font-medium">设置已成功保存！</span>
            </div>
          </div>
        )}

        {updateMutation.error && (
          <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-red-400 font-medium">
                保存失败：{updateMutation.error.message}
              </span>
            </div>
          </div>
        )}
      </form>

      {/* 使用说明 */}
      <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/50 rounded-lg">
        <h3 className="text-blue-400 font-medium text-lg mb-2">使用说明</h3>
        <ul className="text-blue-300 text-sm space-y-1">
          <li>• <strong>网站标题</strong>：会显示在浏览器标签页上</li>
          <li>• <strong>网站主标题</strong>：会显示在首页的大标题位置</li>
          <li>• <strong>网站副标题</strong>：会显示在主标题下方作为描述</li>
          <li>• 修改后请刷新网站查看效果</li>
        </ul>
      </div>
    </div>
  )
} 