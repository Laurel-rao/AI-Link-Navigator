'use client'

import { useQuery } from '@tanstack/react-query'
import { groupApi } from '@/lib/utils/api'
import { GroupWithLinks } from '@/types'

export function GroupsDisplay() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const response = await groupApi.getGroups()
      return response.data.data as GroupWithLinks[]
    }
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-purple-500 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-12">
        <div className="glassmorphism-card rounded-2xl p-8 max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">加载失败</h3>
          <p className="text-slate-400">数据加载时出现错误，请刷新页面重试</p>
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center p-12">
        <div className="glassmorphism-card rounded-2xl p-8 max-w-md mx-auto">
          <div className="w-16 h-16 bg-slate-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">暂无数据</h3>
          <p className="text-slate-400">还没有添加任何分组和链接</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
      {data.map((group, index) => (
        <div
          key={group.id}
          className="glassmorphism-card glassmorphism-hover rounded-3xl p-8 cyber-border group relative overflow-hidden"
          style={{animationDelay: `${index * 0.1}s`}}
        >
          {/* 卡片头部 */}
          <div className="relative mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse"></div>
                <h2 className="text-2xl font-bold text-white group-hover:gradient-text-blue transition-all duration-300">
                  {group.title}
                </h2>
              </div>
              <div className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded-lg">
                {group.links.length} 项
              </div>
            </div>
            
            {group.description && (
              <p className="text-slate-400 text-sm leading-relaxed pl-6">
                {group.description}
              </p>
            )}
            
            {/* 分割线 */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent mt-4"></div>
          </div>
          
          {/* 链接列表 */}
          <div className="space-y-3">
            {group.links.map((link, linkIndex) => (
              <div key={link.id} className="tooltip-container-index">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/30 hover:bg-slate-700/50 transition-all duration-300 group/link border border-slate-700/50 hover:border-slate-600"
                  style={{animationDelay: `${(index * 0.1) + (linkIndex * 0.05)}s`}}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full group-hover/link:scale-150 transition-transform duration-300"></div>
                    <span className="text-slate-200 group-hover/link:text-white transition-colors duration-300 font-medium truncate">
                      {link.title}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-slate-500 group-hover/link:text-blue-400 group-hover/link:translate-x-1 transition-all duration-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </div>
                </a>
                
                {/* 改进的工具提示 */}
                {link.description && (
                  <div className="tooltip-text-index">
                    <div className="flex items-start space-x-2 mb-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      <strong className="text-blue-200 font-semibold">{link.title}</strong>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {link.description}
                    </p>
                    <div className="mt-3 pt-2 border-t border-slate-600/50">
                      <div className="flex items-center space-x-2 text-xs text-slate-400">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <span>点击访问</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* 卡片底部装饰 */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/50 to-purple-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      ))}
    </div>
  )
} 