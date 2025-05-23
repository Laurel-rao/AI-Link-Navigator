'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { settingsApi } from '@/lib/utils/api'
import { SiteSettings } from '@/types'

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

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await settingsApi.getSettings()
      return response.data.data as SiteSettings
    }
  })

  const updateSettingsMutation = useMutation({
    mutationFn: settingsApi.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    }
  })

  useEffect(() => {
    if (settingsData) {
      setSettings(settingsData)
    }
  }, [settingsData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateSettingsMutation.mutate(settings)
  }

  const settingFields = [
    {
      key: 'site_title' as keyof SiteSettings,
      label: '网站标题',
      description: '显示在浏览器标签页的标题',
      placeholder: '例如: AI导航站 - 智能工具集合'
    },
    {
      key: 'site_heading' as keyof SiteSettings,
      label: '网站主标题',
      description: '显示在页面顶部的主标题',
      placeholder: '例如: AI资源导航'
    },
    {
      key: 'site_subheading' as keyof SiteSettings,
      label: '网站副标题',
      description: '显示在主标题下方的副标题',
      placeholder: '例如: 前沿AI工具与资源的精选集合'
    }
  ]

  const filteredFields = searchQuery
    ? settingFields.filter(field =>
        field.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        field.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (settings[field.key] || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : settingFields

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">网站基本设置</h2>
        <div className="text-sm text-slate-400">
          最后更新: {settingsData ? new Date().toLocaleString() : '从未更新'}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {filteredFields.map((field) => (
          <div key={field.key} className="p-4 bg-slate-700 rounded-lg">
            <label className="block text-sm font-medium text-slate-200 mb-2">
              {field.label}
            </label>
            <input
              type="text"
              value={settings[field.key] || ''}
              onChange={(e) => setSettings({
                ...settings,
                [field.key]: e.target.value
              })}
              placeholder={field.placeholder}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150 ease-in-out"
            />
            <p className="text-slate-400 text-xs mt-1">{field.description}</p>
          </div>
        ))}

        {filteredFields.length === 0 && searchQuery && (
          <p className="text-slate-400 text-center py-4">
            未找到匹配的设置项。
          </p>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => setSettings(settingsData || {})}
            className="bg-gray-500 hover:bg-gray-600 px-6 py-2.5 rounded-lg text-white font-medium transition duration-150 ease-in-out"
          >
            重置
          </button>
          <button
            type="submit"
            disabled={updateSettingsMutation.isPending}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 px-6 py-2.5 rounded-lg text-white font-medium transition duration-150 ease-in-out flex items-center"
          >
            {updateSettingsMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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

        {updateSettingsMutation.isSuccess && (
          <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
            <p className="text-green-400 text-sm">设置已成功保存！</p>
          </div>
        )}

        {updateSettingsMutation.error && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm">
              保存失败：{updateSettingsMutation.error.message}
            </p>
          </div>
        )}
      </form>

      <div className="mt-8 p-4 bg-slate-700/50 rounded-lg">
        <h3 className="text-lg font-medium text-slate-200 mb-3">当前设置预览</h3>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-slate-400">浏览器标题:</span>{' '}
            <span className="text-white">{settings.site_title || '未设置'}</span>
          </div>
          <div>
            <span className="text-slate-400">页面主标题:</span>{' '}
            <span className="text-white">{settings.site_heading || '未设置'}</span>
          </div>
          <div>
            <span className="text-slate-400">页面副标题:</span>{' '}
            <span className="text-white">{settings.site_subheading || '未设置'}</span>
          </div>
        </div>
      </div>
    </div>
  )
} 