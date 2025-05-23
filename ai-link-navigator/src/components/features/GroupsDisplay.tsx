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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-400 p-8">
        <p>加载数据时出现错误</p>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center text-slate-400 p-8">
        <p>暂无数据</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      {data.map((group) => (
        <div
          key={group.id}
          className="glassmorphism rounded-2xl p-6 hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1"
        >
          <div className="mb-4 border-b border-slate-700 pb-3">
            <h2 className="text-2xl font-bold text-white">{group.title}</h2>
            {group.description && (
              <p className="text-slate-400 text-sm mt-1">{group.description}</p>
            )}
          </div>
          
          <ul className="space-y-2">
            {group.links.map((link) => (
              <li key={link.id}>
                <div className="tooltip-container-index">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-2 rounded-lg hover:bg-slate-700/50 transition duration-200 group"
                  >
                    <span className="text-slate-200 group-hover:text-white transition duration-200">
                      {link.title}
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-auto text-slate-400 group-hover:text-blue-400 transition duration-200"
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
                  </a>
                  {link.description && (
                    <div className="tooltip-text-index">
                      <strong>{link.title}</strong>
                      <br />
                      {link.description}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
} 