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
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [settings, setSettings] = useState<SiteSettings>({
    // 基本站点信息
    site_title: '',
    site_heading: '',
    site_subheading: '',
    
    // 导航栏文字
    nav_welcome_text: '',
    nav_admin_button: '',
    nav_logout_button: '',
    
    // 登录页面文字
    login_title: '',
    login_subtitle: '',
    login_username_placeholder: '',
    login_password_placeholder: '',
    login_submit_button: '',
    login_error_invalid: '',
    login_error_network: '',
    login_dev_notice_title: '',
    login_dev_admin_label: '',
    login_dev_user_label: '',
    login_copyright: '',
    
    // 退出登录页面文字
    signout_title: '',
    signout_subtitle: '',
    signout_description: '',
    signout_confirm_button: '',
    signout_cancel_button: '',
    signout_warning: '',
    signout_loading_text: '',
    signout_copyright: '',
    
    // 主页文字
    home_section_title: '',
    
    // 管理后台文字
    admin_title: '',
    admin_preview_button: '',
    admin_logout_button: '',
    
    // 通用文字
    loading_text: '',
    error_text: '',
    success_text: '',
    cancel_text: '',
    confirm_text: '',
    save_text: '',
    edit_text: '',
    delete_text: '',
    add_text: ''
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
      setShowSuccessMessage(true)
      // 3秒后自动隐藏成功提示
      setTimeout(() => {
        setShowSuccessMessage(false)
      }, 3000)
    }
  })

  useEffect(() => {
    if (currentSettings) {
      setSettings({
        // 基本站点信息
        site_title: currentSettings.site_title || '',
        site_heading: currentSettings.site_heading || '',
        site_subheading: currentSettings.site_subheading || '',
        
        // 导航栏文字
        nav_welcome_text: currentSettings.nav_welcome_text || '',
        nav_admin_button: currentSettings.nav_admin_button || '',
        nav_logout_button: currentSettings.nav_logout_button || '',
        
        // 登录页面文字
        login_title: currentSettings.login_title || '',
        login_subtitle: currentSettings.login_subtitle || '',
        login_username_placeholder: currentSettings.login_username_placeholder || '',
        login_password_placeholder: currentSettings.login_password_placeholder || '',
        login_submit_button: currentSettings.login_submit_button || '',
        login_error_invalid: currentSettings.login_error_invalid || '',
        login_error_network: currentSettings.login_error_network || '',
        login_dev_notice_title: currentSettings.login_dev_notice_title || '',
        login_dev_admin_label: currentSettings.login_dev_admin_label || '',
        login_dev_user_label: currentSettings.login_dev_user_label || '',
        login_copyright: currentSettings.login_copyright || '',
        
        // 退出登录页面文字
        signout_title: currentSettings.signout_title || '',
        signout_subtitle: currentSettings.signout_subtitle || '',
        signout_description: currentSettings.signout_description || '',
        signout_confirm_button: currentSettings.signout_confirm_button || '',
        signout_cancel_button: currentSettings.signout_cancel_button || '',
        signout_warning: currentSettings.signout_warning || '',
        signout_loading_text: currentSettings.signout_loading_text || '',
        signout_copyright: currentSettings.signout_copyright || '',
        
        // 主页文字
        home_section_title: currentSettings.home_section_title || '',
        
        // 管理后台文字
        admin_title: currentSettings.admin_title || '',
        admin_preview_button: currentSettings.admin_preview_button || '',
        admin_logout_button: currentSettings.admin_logout_button || '',
        
        // 通用文字
        loading_text: currentSettings.loading_text || '',
        error_text: currentSettings.error_text || '',
        success_text: currentSettings.success_text || '',
        cancel_text: currentSettings.cancel_text || '',
        confirm_text: currentSettings.confirm_text || '',
        save_text: currentSettings.save_text || '',
        edit_text: currentSettings.edit_text || '',
        delete_text: currentSettings.delete_text || '',
        add_text: currentSettings.add_text || ''
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

  // 设置项配置 - 按分类组织
  const settingCategories = [
    {
      title: '基本站点信息',
      items: [
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
    },
    {
      title: '导航栏文字',
      items: [
        {
          key: 'nav_welcome_text' as keyof SiteSettings,
          label: '欢迎文字',
          description: '导航栏的欢迎用户文字',
          placeholder: '例如：欢迎回来'
        },
        {
          key: 'nav_admin_button' as keyof SiteSettings,
          label: '管理后台按钮',
          description: '管理后台按钮的文字',
          placeholder: '例如：管理后台'
        },
        {
          key: 'nav_logout_button' as keyof SiteSettings,
          label: '退出登录按钮',
          description: '退出登录按钮的文字',
          placeholder: '例如：退出登录'
        }
      ]
    },
    {
      title: '登录页面文字',
      items: [
        {
          key: 'login_title' as keyof SiteSettings,
          label: '登录页标题',
          description: '登录页面的主标题',
          placeholder: '例如：AI导航系统'
        },
        {
          key: 'login_subtitle' as keyof SiteSettings,
          label: '登录页副标题',
          description: '登录页面的副标题',
          placeholder: '例如：智能资源导航平台'
        },
        {
          key: 'login_username_placeholder' as keyof SiteSettings,
          label: '用户名输入框提示',
          description: '用户名输入框的占位符文字',
          placeholder: '例如：请输入用户名'
        },
        {
          key: 'login_password_placeholder' as keyof SiteSettings,
          label: '密码输入框提示',
          description: '密码输入框的占位符文字',
          placeholder: '例如：请输入密码'
        },
        {
          key: 'login_submit_button' as keyof SiteSettings,
          label: '登录按钮文字',
          description: '登录按钮的文字',
          placeholder: '例如：立即登录'
        },
        {
          key: 'login_error_invalid' as keyof SiteSettings,
          label: '登录错误提示',
          description: '用户名或密码错误时的提示',
          placeholder: '例如：用户名或密码错误'
        },
        {
          key: 'login_error_network' as keyof SiteSettings,
          label: '网络错误提示',
          description: '网络错误时的提示',
          placeholder: '例如：登录过程中发生错误，请稍后重试'
        },
        {
          key: 'login_dev_notice_title' as keyof SiteSettings,
          label: '开发环境提示标题',
          description: '开发环境测试账号提示的标题',
          placeholder: '例如：开发环境 - 测试账号'
        },
        {
          key: 'login_dev_admin_label' as keyof SiteSettings,
          label: '测试管理员账号标签',
          description: '测试管理员账号的标签',
          placeholder: '例如：管理员'
        },
        {
          key: 'login_dev_user_label' as keyof SiteSettings,
          label: '测试用户账号标签',
          description: '测试用户账号的标签',
          placeholder: '例如：用户'
        },
        {
          key: 'login_copyright' as keyof SiteSettings,
          label: '登录页版权信息',
          description: '登录页面底部的版权信息',
          placeholder: '例如：© 2024 AI-Link-Navigator. 现代化智能导航平台'
        }
      ]
    },
    {
      title: '退出登录页面文字',
      items: [
        {
          key: 'signout_title' as keyof SiteSettings,
          label: '退出确认标题',
          description: '退出登录确认页面的标题',
          placeholder: '例如：退出确认'
        },
        {
          key: 'signout_subtitle' as keyof SiteSettings,
          label: '退出确认副标题',
          description: '退出登录确认页面的副标题',
          placeholder: '例如：您确定要退出登录吗？'
        },
        {
          key: 'signout_description' as keyof SiteSettings,
          label: '退出说明文字',
          description: '退出登录的说明文字',
          placeholder: '例如：退出后您需要重新登录才能访问系统'
        },
        {
          key: 'signout_confirm_button' as keyof SiteSettings,
          label: '确认退出按钮',
          description: '确认退出按钮的文字',
          placeholder: '例如：确认退出'
        },
        {
          key: 'signout_cancel_button' as keyof SiteSettings,
          label: '取消退出按钮',
          description: '取消退出按钮的文字',
          placeholder: '例如：取消'
        },
        {
          key: 'signout_warning' as keyof SiteSettings,
          label: '退出警告信息',
          description: '退出时的警告信息',
          placeholder: '例如：退出后所有未保存的数据将丢失'
        },
        {
          key: 'signout_loading_text' as keyof SiteSettings,
          label: '退出中文字',
          description: '正在退出时显示的文字',
          placeholder: '例如：正在退出...'
        },
        {
          key: 'signout_copyright' as keyof SiteSettings,
          label: '退出页版权信息',
          description: '退出页面底部的版权信息',
          placeholder: '例如：© 2024 AI-Link-Navigator. 安全退出系统'
        }
      ]
    },
    {
      title: '主页文字',
      items: [
        {
          key: 'home_section_title' as keyof SiteSettings,
          label: '资源分类标题',
          description: '主页资源分类部分的标题',
          placeholder: '例如：资源分类'
        }
      ]
    },
    {
      title: '管理后台文字',
      items: [
        {
          key: 'admin_title' as keyof SiteSettings,
          label: '管理后台标题',
          description: '管理后台页面的标题',
          placeholder: '例如：AI导航管理后台'
        },
        {
          key: 'admin_preview_button' as keyof SiteSettings,
          label: '预览网站按钮',
          description: '预览网站按钮的文字',
          placeholder: '例如：预览网站'
        },
        {
          key: 'admin_logout_button' as keyof SiteSettings,
          label: '管理后台退出按钮',
          description: '管理后台退出登录按钮的文字',
          placeholder: '例如：退出登录'
        }
      ]
    },
    {
      title: '通用文字',
      items: [
        {
          key: 'loading_text' as keyof SiteSettings,
          label: '加载中文字',
          description: '页面加载时显示的文字',
          placeholder: '例如：加载中...'
        },
        {
          key: 'error_text' as keyof SiteSettings,
          label: '错误提示文字',
          description: '一般错误提示的文字',
          placeholder: '例如：发生错误'
        },
        {
          key: 'success_text' as keyof SiteSettings,
          label: '成功提示文字',
          description: '操作成功提示的文字',
          placeholder: '例如：操作成功'
        },
        {
          key: 'cancel_text' as keyof SiteSettings,
          label: '取消按钮文字',
          description: '取消按钮的文字',
          placeholder: '例如：取消'
        },
        {
          key: 'confirm_text' as keyof SiteSettings,
          label: '确认按钮文字',
          description: '确认按钮的文字',
          placeholder: '例如：确认'
        },
        {
          key: 'save_text' as keyof SiteSettings,
          label: '保存按钮文字',
          description: '保存按钮的文字',
          placeholder: '例如：保存'
        },
        {
          key: 'edit_text' as keyof SiteSettings,
          label: '编辑按钮文字',
          description: '编辑按钮的文字',
          placeholder: '例如：编辑'
        },
        {
          key: 'delete_text' as keyof SiteSettings,
          label: '删除按钮文字',
          description: '删除按钮的文字',
          placeholder: '例如：删除'
        },
        {
          key: 'add_text' as keyof SiteSettings,
          label: '添加按钮文字',
          description: '添加按钮的文字',
          placeholder: '例如：添加'
        }
      ]
    }
  ]

  // 过滤设置项 - 根据搜索查询
  const filteredCategories = settingCategories.map(category => ({
    ...category,
    items: category.items.filter(item => {
      if (!searchQuery) return true
      const searchLower = searchQuery.toLowerCase()
      return (
        item.label.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        (settings[item.key] && settings[item.key]!.toLowerCase().includes(searchLower))
      )
    })
  })).filter(category => category.items.length > 0)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">网站文字设置</h2>
        <p className="text-slate-400 text-base">
          配置网站各个页面的文字内容，这些设置会立即应用到对应页面上
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 pb-20">
        {filteredCategories.map((category) => (
          <div key={category.title} className="p-6 bg-slate-700 rounded-lg border border-slate-600">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <div className="w-1 h-5 bg-gradient-to-b from-blue-400 to-purple-500 rounded-full mr-3"></div>
              {category.title}
            </h3>
            
            <div className="space-y-4">
              {category.items.map((item) => (
                <div key={item.key} className="p-4 bg-slate-800 rounded-lg">
                  <div className="mb-3">
                    <label className="block text-base font-semibold text-white mb-1">
                      <HighlightText 
                        text={item.label}
                        searchQuery={searchQuery}
                        className="text-base font-semibold"
                      />
                    </label>
                    <p className="text-slate-400 text-sm">
                      <HighlightText 
                        text={item.description}
                        searchQuery={searchQuery}
                        className="text-sm"
                      />
                    </p>
                  </div>
                  <input
                    type="text"
                    value={settings[item.key] || ''}
                    onChange={(e) => handleInputChange(item.key, e.target.value)}
                    placeholder={item.placeholder}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  {settings[item.key] && (
                    <div className="mt-2 p-3 bg-slate-600 rounded border-l-4 border-blue-500">
                      <p className="text-slate-300 text-xs mb-1">当前值预览：</p>
                      <p className="text-white text-sm font-medium">
                        <HighlightText 
                          text={settings[item.key] || ''}
                          searchQuery={searchQuery}
                          className="text-sm font-medium"
                        />
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {filteredCategories.length === 0 && (
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

        {showSuccessMessage && (
          <div className="fixed top-4 right-4 z-50 p-4 bg-green-500 text-white rounded-lg shadow-lg flex items-center animate-fade-in">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">设置已成功保存！</span>
            <button 
              onClick={() => setShowSuccessMessage(false)}
              className="ml-4 text-white hover:text-green-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {updateMutation.isError && (
          <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-red-400 font-medium">保存失败，请稍后重试</span>
            </div>
          </div>
        )}
      </form>

      {/* 悬浮保存按钮 */}
      {filteredCategories.length > 0 && (
        <div className="fixed right-6 bottom-6 z-50">
          <button
            type="submit"
            form="settings-form"
            onClick={handleSubmit}
            disabled={updateMutation.isPending}
            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 px-6 py-4 rounded-full text-white font-medium flex items-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            {updateMutation.isPending ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                保存中...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                保存设置
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
} 