'use client'

import { signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { SiteSettings } from '@/types'

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

export default function SignOutPage() {
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [settings, setSettings] = useState<SiteSettings>({})

  // 在客户端加载设置
  useEffect(() => {
    getSettings().then(setSettings)
  }, [])

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut({ 
        callbackUrl: '/auth/login',
        redirect: true 
      })
    } catch (error) {
      console.error('Sign out error:', error)
      setIsSigningOut(false)
    }
  }

  const handleCancel = () => {
    window.history.back()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* 动态背景网格 */}
      <div className="absolute inset-0 tech-grid pointer-events-none"></div>
      
      {/* 浮动装饰元素 */}
      <div className="absolute top-20 left-20 w-40 h-40 bg-red-500/10 rounded-full blur-2xl floating-animation"></div>
      <div className="absolute bottom-20 right-20 w-32 h-32 bg-orange-500/10 rounded-full blur-xl floating-animation" style={{animationDelay: '2s'}}></div>
      <div className="absolute top-1/2 left-10 w-24 h-24 bg-yellow-500/10 rounded-full blur-lg floating-animation" style={{animationDelay: '4s'}}></div>
      
      {/* 主要内容 */}
      <div className="relative z-10 w-full max-w-md">
        <div className="glassmorphism-card rounded-3xl p-10 cyber-border">
          {/* 图标区域 */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 glassmorphism-card rounded-2xl flex items-center justify-center mx-auto mb-6 pulse-glow">
              <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold mb-2">
              <span className="gradient-text-red soft-glow">
                {settings.signout_title || '退出确认'}
              </span>
            </h1>
            
            <p className="text-slate-400 text-base leading-relaxed">
              {settings.signout_subtitle || '您确定要退出登录吗？'}
            </p>
            
            {/* 装饰线 */}
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-red-400 to-transparent mx-auto mt-4"></div>
          </div>
          
          {/* 说明文字 */}
          <div className="mb-8 text-center">
            <p className="text-slate-500 text-sm">
              {settings.signout_description || '退出后您需要重新登录才能访问系统'}
            </p>
          </div>
          
          {/* 按钮组 */}
          <div className="flex flex-col space-y-4">
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full glassmorphism-card glassmorphism-hover px-6 py-4 rounded-xl text-white font-semibold transition duration-300 flex items-center justify-center group bg-gradient-to-r from-red-600/20 to-orange-600/20 border border-red-500/30 hover:border-red-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSigningOut ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  {settings.signout_loading_text || '正在退出...'}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-3 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {settings.signout_confirm_button || '确认退出'}
                </>
              )}
            </button>
            
            <button
              onClick={handleCancel}
              disabled={isSigningOut}
              className="w-full glassmorphism-card glassmorphism-hover px-6 py-4 rounded-xl text-slate-300 font-semibold transition duration-300 flex items-center justify-center group border border-slate-600/30 hover:border-slate-500/50 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {settings.signout_cancel_button || '取消'}
            </button>
          </div>
          
          {/* 提示信息 */}
          <div className="mt-8 pt-6 border-t border-slate-700/50">
            <div className="flex items-center justify-center text-slate-500 text-xs">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{settings.signout_warning || '退出后所有未保存的数据将丢失'}</span>
            </div>
          </div>
        </div>
        
        {/* 版权信息 */}
        <div className="text-center mt-6">
          <p className="text-xs text-slate-500">
            {settings.signout_copyright || '© 2024 AI-Link-Navigator. 安全退出系统'}
          </p>
        </div>
      </div>
    </div>
  )
} 